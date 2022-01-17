import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/accessToken",
    name: "AccessToken",
    component: () =>
      import(/* webpackChunkName: "accessToken" */ "../views/AccessToken.vue"),
  },
  {
    path: "/upload",
    name: "Upload",
    component: () =>
      import(/* webpackChunkName: "upload" */ "../views/Upload.vue"),
  },
  {
    path: "/fileList",
    name: "FileList",
    component: () =>
      import(/* webpackChunkName: "fileList" */ "../views/FileList.vue"),
  },
  {
    path: "/viewToken",
    name: "ViewToken",
    component: () =>
      import(/* webpackChunkName: "viewToken" */ "../views/ViewToken.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
