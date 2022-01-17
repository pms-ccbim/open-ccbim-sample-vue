<template>
  <div id="nav">
    <router-link target="_blank" to="/accessToken"
      >Access Token凭证获取</router-link
    >
    | <router-link target="_blank" to="/upload">上传示例页</router-link> |
    <router-link target="_blank" to="/fileList">文件列表页</router-link> |
    <router-link target="_blank" to="/viewToken">viewToken浏览模型</router-link>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: "Home",
  components: {
    // HelloWorld
  },
};
</script>
