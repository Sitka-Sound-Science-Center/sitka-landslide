const path = require("path");
module.exports = {
  entry: {
    index: "./src/_assets/js/index.js",
    home: "./src/_assets/js/home.js",
    detail: "./src/_assets/js/detail.js",
  },
  output: {
    path: path.resolve(__dirname, "_site/assets/js"),
    filename: "[name].js",
  },
};
