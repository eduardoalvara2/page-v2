const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.(glb|gltf)$/,
          type: 'asset/resource'
        },
      ],
    },
    devtool: "source-map",
  }
});
