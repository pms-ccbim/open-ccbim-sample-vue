<template>
  <div>
    <el-input
      v-model="appkey"
      placeholder="AppKey"
      @change="setAppkey"
      :style="{ width: '300px' }"
    ></el-input>
    <el-input
      v-model="appSecret"
      placeholder="AppSecret"
      @change="setAppSecret"
      :style="{ width: '300px' }"
    ></el-input>

    <el-button type="primary" @click="getAccessToken">生成凭证</el-button>

    <div>
      AccessToken:
      <p>{{ accessToken }}</p>
    </div>
  </div>
</template>

<script>
import { tokenApi } from "@/services/fileApi.js";

export default {
  data() {
    return {
      appkey: "",
      appSecret: "",
      accessToken: "",
    };
  },
  methods: {
    setAppkey(value) {
      this.appkey = value;
    },

    setAppSecret(value) {
      this.appSecret = value;
    },

    getAccessToken() {
      let Authorization =
        "Basic" + " " + window.btoa(this.appkey + ":" + this.appSecret);

      debugger;

      tokenApi(Authorization).then((res) => {
        this.accessToken = res.data.value;
      });
    },
  },
};
</script>
