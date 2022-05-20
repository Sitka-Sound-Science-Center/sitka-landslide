const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const withMDX = require("@next/mdx")({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

module.exports = withMDX(
  withBundleAnalyzer({
    pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
    experimental: { optimizeCss: true },
    trailingSlash: true,
  })
);
