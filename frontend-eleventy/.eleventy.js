const path = require("path");
const critical = require("critical");
const htmlmin = require("html-minifier");
const { EleventyRenderPlugin } = require("@11ty/eleventy");
const Image = require("@11ty/eleventy-img");
const glob = require("glob");

module.exports = function (config) {
  config.addShortcode("RiskIcon", function (riskLevel, size) {
    size = size || 20;

    switch (riskLevel) {
      case "low":
        return `<img width="${size}" height="${size}" src="/assets/img/icon-low.svg" />`;
        break;
      case "medium":
        return `<img width="${size}" height="${size}" src="/assets/img/icon-medium.svg" />`;
        break;
      case "high":
        return `<img width="${size}" height="${size}" src="/assets/img/icon-high.svg" />`;
        break;
    }
  });

  config.addShortcode("RiskName", function (riskLevel) {
    switch (riskLevel) {
      case "low":
        return "Low";
        break;
      case "medium":
        return "Medium";
        break;
      case "high":
        return "High";
        break;
    }
  });

  // Plugins
  config.addPlugin(EleventyRenderPlugin);

  // Filter
  config.addFilter("filterBy", (data, key, value) =>
    data.filter((block) => block[key] === value)
  );

  // Copy the `img`, `css`, `data` folders to the output
  config.addPassthroughCopy({ "src/_assets": "assets" });

  async function imageShortcode(src, alt, sizes) {
    let metadata = await Image(src, {
      widths: [120, 240, 360, 480, 600],
      formats: ["avif", "webp"],
      outputDir: "_site/assets/img/",
      urlPath: "/assets/img/",
      sharpAvifOptions: {
        quality: 70,
      },
    });

    let imageAttributes = {
      alt,
      sizes,
      loading: "lazy",
      decoding: "async",
    };

    return Image.generateHTML(metadata, imageAttributes);
  }

  config.addNunjucksAsyncShortcode("image", imageShortcode);

  // Generate critical CSS
  if (process.env.ELEVENTY_ENV === "production") {
    config.addTransform("critical-css", async function (content, outputPath) {
      if (outputPath && outputPath.endsWith(".html")) {
        const outputDir =
          (this._config && this._config.dir && this._config.dir.output) ||
          (config && config.dir && config.dir.output) ||
          path.dirname(outputPath);

        const { html } = await critical.generate({
          assetPaths: [path.dirname(outputPath)],
          base: outputDir,
          html: content,
          inline: true,
          rebase: ({ originalUrl }) => originalUrl,
        });

        return html;
      }

      return content;
    });
  }

  config.addTransform("htmlmin", function (content, outputPath) {
    // Eleventy 1.0+: use this.inputPath and this.outputPath instead
    if (outputPath && outputPath.endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
      return minified;
    }

    return content;
  });

  config.on("eleventy.after", async () => {
    glob("_site/assets/img/chart/*.svg", {}, function (er, files) {
      files.forEach((file) => {
        const retinaWidth = file.split("-")[3].split(".")[0] * 2;
        Image(file, {
          widths: [null, retinaWidth],
          formats: ["webp", "avif"],
          outputDir: "_site/assets/img/chart/",
          sharpAvifOptions: {
            quality: 85,
          },
          filenameFormat: function (id, src, width, format, options) {
            const isRetina = width === retinaWidth;
            const extension = path.extname(src);
            const name = path.basename(src, extension);
            return `${name}${isRetina ? "@2x" : ""}.${format}`;
          },
        });
      });
    });
  });

  // Refresh page after SCSS -> CSS
  config.setBrowserSyncConfig({
    files: "./_site/assets/css/**/*.css",
  });

  return {
    templateFormats: ["md", "njk", "html", "liquid", "11ty.js"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    pathPrefix: "/",
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
  };
};
