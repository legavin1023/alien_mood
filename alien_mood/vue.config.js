const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: "0.0.0.0", // 외부 IP 허용
    port: 8080, // 원하는 포트
    allowedHosts: "all", // 모든 호스트 허용
  },
});
