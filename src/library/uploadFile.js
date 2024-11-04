import SparkMD5 from "spark-md5";
import OSS from "ali-oss";

import { uploadApi } from "@/services/fileApi";

class UploadFile {
  ossMap;
  fileMap;

  constructor() {
    this.ossMap = new Map();
    this.fileMap = new Map();
  }

  // 计算md5
  computeMD5(file) {
    return new Promise((resolve) => {
      const blobSlice = File.prototype.slice;
      const chunkSize = 2097152;
      const chunks = Math.ceil(file.size / chunkSize);
      let currentChunk = 0;

      const fileReader = new FileReader();
      const spark = new SparkMD5.ArrayBuffer();

      fileReader.onload = (e) => {
        spark.append(e.target.result); // Append array buffer
        currentChunk++;

        if (currentChunk < chunks) {
          // console.log(
          //   `第${currentChunk}分片解析完成, 开始第${
          //     currentChunk + 1
          //   } / ${chunks}分片解析`,
          // );
          loadNext();
        } else {
          let md5 = spark.end(); //得到md5
          // console.log(
          //   `MD5计算完成：${file.name} \nMD5：${md5} \n分片：${chunks} 大小:${file.size}`,
          // );
          spark.destroy(); //释放缓存
          resolve(md5);
        }
      };

      const loadNext = () => {
        let start = currentChunk * chunkSize,
          end = start + chunkSize >= file.size ? file.size : start + chunkSize;

        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
      };
      loadNext();
    });
  }

  // put上传(小文件上传)
  putUploadOSS(resultData, fileItem, onProgressCallback, successCallBack) {
    let callback = JSON.parse(
      decodeURIComponent(atob(resultData.policyVo.callbackBody))
    );

    const client = this.initOSS(resultData);

    try {
      client
        .put(resultData.fileKey, fileItem.file, {
          callback: callback,
        })
        .then(() => {
          let thisFile = this.fileMap.get(fileItem.md5);
          thisFile.progress = "100";
          onProgressCallback && onProgressCallback([...this.fileMap.values()]);

          this.ossMap.delete(fileItem.md5);
          successCallBack && successCallBack(resultData.fileId);
        })
        .catch((error) => {
          let thisFile = this.fileMap.get(fileItem.md5);
          if (thisFile) {
            thisFile.failToUpload = true;
          }
          onProgressCallback && onProgressCallback([...this.fileMap.values()]);
          console.log(error);
        });
    } catch (e) {
      console.log(e);
    }

    return client;
  }

  // // 计算分片大小
  // private calcPartSizeBySize(fileSize: number) {
  //   // 计算规则为：1.文件分块最小为1M，最大为10M，2.按100的进度划分
  //   let partSize = Math.floor(fileSize / 100); // 先按100等份计算
  //   if (partSize < 1024 * 1024) {
  //     // 小与100M
  //     return 1024 * 1024;
  //   }
  //   if (partSize > 10 * 1024 * 1024) {
  //     // 大于1G，按10M划分
  //     return 10 * 1024 * 1024;
  //   }
  //   return partSize; // 100M-1G之间的文件
  // }

  // 分片上传
  partUploadOSS(resultData, fileItem, onProgressCallback, successCallBack) {
    let callback = JSON.parse(
      decodeURIComponent(atob(resultData.policyVo.callbackBody))
    );

    const client = this.initOSS(resultData);

    try {
      client
        .multipartUpload(resultData.fileKey, fileItem.file, {
          progress: (p, checkpoint) => {
            let thisFile = this.fileMap.get(fileItem.md5);
            thisFile.progress = (p * 100).toFixed(0);
            thisFile.checkpoint = checkpoint;
            onProgressCallback &&
              onProgressCallback([...this.fileMap.values()]);
          },
          checkpoint: fileItem.checkpoint,
          timeout: 120000, //设置超时时间
          callback: callback,
        })
        .then(() => {
          this.ossMap.delete(fileItem.md5);
          successCallBack && successCallBack(resultData.fileId);
        })
        .catch((error) => {
          let thisFile = this.fileMap.get(fileItem.md5);
          if (thisFile) {
            thisFile.failToUpload = true;
          }
          onProgressCallback && onProgressCallback([...this.fileMap.values()]);
          console.log(error);
        });
    } catch (e) {
      console.log(e);
    }

    return client;
  }

  // 初始化OSS
  initOSS(resultData) {
    const { accessId, assessKey, securityToken, region, bucket } =
      resultData.policyVo;
    return new OSS({
      region: region,
      accessKeyId: accessId,
      accessKeySecret: assessKey,
      bucket,
      stsToken: securityToken,
      secure: true,
      timeout: 180000000,
    });
  }

  // 上传文件
  async uploadFile(
    accessTokenHeader,
    files,
    onProgressCallback,
    successCallBack
  ) {
    debugger;
    if (files.length === 0) {
      return;
    }

    // 遍历每个文件
    for (let j = 0; j < files.length; j++) {
      const itemIndex = files[j];

      const formatIndex = itemIndex.name.lastIndexOf(".");
      const format = itemIndex.name.substring(formatIndex);

      // 计算文件md5
      const md5 = await this.computeMD5(files[j]);

      // 获取上传凭证
      let apiData = await uploadApi(accessTokenHeader, {
        fileName: itemIndex.name,
        fileSize: itemIndex.size,
        fileMd5: md5,
      });

      const resultData = apiData.data.result;

      let fileObj = {
        format: format,
        name: itemIndex.name,
        size: itemIndex.size,
        md5: md5,
        progress: "0",
        filePolicyData: resultData,
        file: itemIndex,
      };

      this.fileMap.set(md5, fileObj);
    }

    // 遍历每个文件进行oss上传等
    for (let fileItem of this.fileMap.values()) {
      if (!this.ossMap.has(fileItem.md5) && fileItem.progress !== "100") {
        const resultData = fileItem.filePolicyData;
        const { fileKey, fileId, policyVo } = resultData;

        if (policyVo.ossType === 1) {
          // 通过OSS方式上传
          if (!fileKey) {
            // 创建一个fileKey
            resultData.fileKey = fileItem.fileId + fileItem.format;

            if (fileItem.size > 120 * 100) {
              // 大文件上传
              let clientOss = this.partUploadOSS(
                resultData,
                fileItem,
                onProgressCallback,
                successCallBack
              );
              this.ossMap.set(fileItem.md5, clientOss);
            } else {
              // 小文件上传
              let clientOss = this.putUploadOSS(
                resultData,
                fileItem,
                onProgressCallback,
                successCallBack
              );
              this.ossMap.set(fileItem.md5, clientOss);
            }
          } else {
            // 秒传
            let thisFile = this.fileMap.get(fileItem.md5);
            thisFile.progress = "100";
            onProgressCallback &&
              onProgressCallback([...this.fileMap.values()]);

            this.ossMap.delete(fileItem.md5);
            successCallBack && successCallBack(fileId);
          }
        } else if (policyVo.ossType === 3) {
          // 通过MINIO方式上传
          if (fileKey) {
            let thisFile = this.fileMap.get(fileItem.md5);
            thisFile.progress = "0";
            onProgressCallback &&
              onProgressCallback([...this.fileMap.values()]);

            fetch(policyVo.uploadUrl, {
              method: "PUT",
              body: fileItem.file,
            }).then(() => {
              let thisFile = this.fileMap.get(fileItem.md5);
              thisFile.progress = "100";
              onProgressCallback &&
                onProgressCallback([...this.fileMap.values()]);

              this.ossMap.delete(fileItem.md5);
              successCallBack && successCallBack(fileId);
            });
          } else {
            // 秒传
            let thisFile = this.fileMap.get(fileItem.md5);
            thisFile.progress = "100";
            onProgressCallback &&
              onProgressCallback([...this.fileMap.values()]);

            this.ossMap.delete(fileItem.md5);
            successCallBack && successCallBack(fileId);
          }
        }
      }
    }
  }

  // 取消上传
  cancelUpload(fileItem, successCallBack) {
    let clientOss = this.ossMap.get(fileItem.md5);
    if (clientOss) {
      clientOss.cancel();
    }

    this.fileMap.delete(fileItem.md5);

    this.ossMap.delete(fileItem.md5);
    successCallBack && successCallBack([...this.fileMap.values()]);
  }

  // 断点续传
  resumeBreakpoint(fileItem, onProgressCallback, successCallBack) {
    let fileObj = this.fileMap.get(fileItem.md5);
    this.partUploadOSS(
      fileObj.filePolicyData,
      fileItem,
      onProgressCallback,
      successCallBack
    );
  }
}

export { UploadFile };
