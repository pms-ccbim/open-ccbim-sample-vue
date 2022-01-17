<template>
  <div>
    <el-input
      type="textarea"
      :rows="2"
      placeholder="请输入获取的Access Token"
      v-model="accessToken"
      @change="setAccessToken"
    >
    </el-input>

    <el-button type="primary">
      <input
        id="upload_file"
        :style="{ display: 'none' }"
        type="file"
        multiple
        :accept="inputAcceptFormat"
        @change="uploadFile"
      />
      <label
        for="upload_file"
        :style="{ padding: '6px 12px', cursor: 'pointer' }"
      >
        上传文件
      </label>
    </el-button>

    <el-table :data="fileList" style="width: 100%" v-loading="loading">
      <el-table-column prop="format" label="格式"> </el-table-column>
      <el-table-column prop="name" label="名称"> </el-table-column>
      <el-table-column prop="size" label="大小"> </el-table-column>
      <el-table-column prop="progress" label="进度">
        <template slot-scope="scope">
          <div
            v-if="Number(scope.row.progress) < 100 && scope.row.failToUpload"
            :style="{ display: 'flex' }"
          >
            <el-progress
              type="circle"
              :percentage="Number(scope.row.progress)"
              :width="60"
            ></el-progress>
            <div @click="refreshItem(scope.row)">
              <i class="el-icon-refresh"></i>
            </div>
          </div>
          <div
            v-else-if="
              Number(scope.row.progress) < 100 && !scope.row.failToUpload
            "
            :style="{ display: 'flex' }"
          >
            <el-progress
              type="circle"
              :percentage="Number(scope.row.progress)"
              :width="60"
            ></el-progress>
            <div @click="removeItem(scope.row)">
              <i class="el-icon-delete"></i>
            </div>
          </div>
          <el-progress
            v-else
            type="circle"
            :percentage="Number(scope.row.progress)"
            :width="60"
          ></el-progress>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { inputAcceptFormat } from "@/library/inputAcceptFormat.js";

import { addFileApi } from "@/services/fileApi";

import { UploadFile } from "@/library/uploadFile.js";
const uploadFileObj = new UploadFile();

export default {
  data() {
    return {
      inputAcceptFormat: inputAcceptFormat,
      accessToken: "",
      fileList: [],
      loading: false,
    };
  },
  methods: {
    setAccessToken(value) {
      this.accessToken = value;
    },

    setFilesLoading(val) {
      this.loading = val;
    },

    setFileList(data) {
      this.fileList = data;
    },

    // 上传
    uploadFile(e) {
      this.setFilesLoading(true);

      let accessTokenHeader = "Bearer" + " " + this.accessToken;

      uploadFileObj
        .uploadFile(
          accessTokenHeader,
          e.target.files,
          this.uploadOnProgress,
          this.successCallBack
        )
        .then(() => {
          console.log("success");
          this.setFilesLoading(false);
        })
        .catch(() => {
          console.log("error");
          this.setFilesLoading(false);
        });
    },

    // 上传进度
    uploadOnProgress(filesData) {
      console.log(filesData);
      this.setFileList(filesData);
    },

    // 成功回调
    successCallBack(fileId) {
      console.log(fileId);

      let accessTokenHeader = "Bearer" + " " + this.accessToken;
      let data = {
        fileId: fileId,
      };

      // 添加文件节点
      addFileApi(accessTokenHeader, data).then(() => {});
    },

    // 删除当前上传文件
    removeItem(items) {
      uploadFileObj.cancelUpload(items, (filesData) => {
        this.setFileList(filesData);
      });
    },

    // 重传当前上传文件
    refreshItem(items) {
      uploadFileObj.resumeBreakpoint(
        items,
        this.uploadOnProgress,
        this.successCallBack
      );
    },
  },
};
</script>
