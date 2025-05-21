const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: "/alien_mood/", // ← 저장소명으로 수정
  devServer: {
    host: "0.0.0.0", // 외부 IP 허용
    port: 8080, // 원하는 포트
    allowedHosts: "all", // 모든 호스트 허용
  },
});
