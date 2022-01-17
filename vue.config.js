module.exports = {
  devServer: {
    proxy: {
      "/oauth": {
        target: "https://open.ccbim.com/",
        changeOrigin: true,
      },
      "/openapi": {
        target: "https://open.ccbim.com/",
        changeOrigin: true,
      },
    },
  },
};
