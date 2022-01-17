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

    <el-button type="primary" @click="getFileList"> 获取文件列表 </el-button>

    <el-table :data="fileList" style="width: 100%" v-loading="loading">
      <el-table-column prop="fileName" label="文件名称"> </el-table-column>
      <el-table-column prop="fileId" label="fileId"> </el-table-column>
      <el-table-column prop="fileSize" label="文件大小"> </el-table-column>
      <el-table-column prop="gmtCreate" label="上传时间"></el-table-column>
      <el-table-column
        prop="convertTime"
        label="开始转换时间"
      ></el-table-column>
      <el-table-column prop="convertStatus" label="模型状态"></el-table-column>
    </el-table>
  </div>
</template>

<script>
import { fileListApi } from "@/services/fileApi.js";

export default {
  data() {
    return {
      loading: false,
      accessToken: "",
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

    getFileList() {
      let accessTokenHeader = "Bearer" + " " + this.accessToken;

      this.setFilesLoading(true);

      let data = {
        pageSize: 100000,
        currentPage: 1,
      };
      fileListApi(accessTokenHeader, data).then((res) => {
        this.setFileList(res.data.result.list);
        this.setFilesLoading(false);
      });
    },
  },
};
</script>
