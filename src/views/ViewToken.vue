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

    <el-input
      v-model="fileId"
      placeholder="fileId"
      @change="setFileId"
      :style="{ width: '300px' }"
    ></el-input>

    <el-button type="primary" @click="getViewToken">
      通过fileId获取viewToken
    </el-button>

    <p>viewToken: {{ viewToken }}</p>

    <el-button type="primary" @click="runModel">
      通过viewToken加载模型
    </el-button>

    <div
      id="bimView"
      :style="{ position: 'relative', width: '1400px', height: '600px' }"
    ></div>
  </div>
</template>

<script>
import {
  CcbimSDKLoader,
  CcbimSDKLoaderConfig,
} from "../../public/ccbimSDK@2.0.0/ccbimSdkLoader.umd.js";

import { viewTokenGetApi } from "@/services/fileApi.js";

export default {
  data() {
    return {
      accessToken: "",
      fileId: "",
      viewToken: "",
    };
  },
  methods: {
    setAccessToken(value) {
      this.accessToken = value;
    },

    setFileId(data) {
      this.fileId = data;
    },

    getViewToken() {
      let accessTokenHeader = "Bearer" + " " + this.accessToken;

      let data = {
        fileId: this.fileId,
      };
      viewTokenGetApi(accessTokenHeader, data).then((res) => {
        this.viewToken = res.data.result.viewToken;
      });
    },

    runModel() {
      let modelApp = null;

      let loaderConfig = new CcbimSDKLoaderConfig();
      loaderConfig.staticHost = ""; // 默认不配置资源文件地址(在根目录)，实际可根据需要配置成sdk包在项目中的具体路径
      let loader = new CcbimSDKLoader();

      loader.load(loaderConfig).then(() => {
        // eslint-disable-next-line no-undef
        let modelAppConfig = new PMS.CCBIM.WebAppModelConfig();

        modelAppConfig.dom = document.getElementById("bimView");
        // modelAppConfig.urlIp = 'http://open-test.ccbim.com'; // urlIp 默认https://open.ccbim.com 可根据需求配置成其它地址
        modelAppConfig.viewToken = this.viewToken;

        // eslint-disable-next-line no-undef
        modelApp = new PMS.CCBIM.WebAppModel(modelAppConfig);
        modelApp.addView();
      });
    },
  },
};
</script>

