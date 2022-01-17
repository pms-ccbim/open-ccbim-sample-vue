import axios from "axios";

// 获取Access Token
export async function tokenApi(Authorization) {
  return axios({
    url: "/oauth/token?grant_type=client_credentials",
    headers: {
      Authorization: Authorization,
    },
    method: "post",
  });
}

// 模型图纸文件文件上传凭证
export async function uploadApi(Authorization, data) {
  return axios("/openapi/upload", {
    headers: {
      Authorization: Authorization,
    },
    method: "put",
    params: data,
  });
}

// 添加文件节点
export async function addFileApi(Authorization, data) {
  return axios("/openapi/addFile", {
    headers: {
      Authorization: Authorization,
    },
    method: "post",
    data,
  });
}

// 获取文件列表
export async function fileListApi(Authorization, data) {
  return axios("/openapi/fileList", {
    headers: {
      Authorization: Authorization,
    },
    method: "get",
    params: data,
  });
}

// 获取文件ViewToken
export async function viewTokenGetApi(Authorization, data) {
  return axios("/openapi/viewToken/get", {
    headers: {
      Authorization: Authorization,
    },
    method: "get",
    params: data,
  });
}
