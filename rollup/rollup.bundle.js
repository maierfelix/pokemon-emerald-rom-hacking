const fs = require("fs");
const pkg = require("../package.json");

const rollup = require("rollup");
const json = require("rollup-plugin-json");
const buble = require("rollup-plugin-buble");
const resolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");

let config = {};
config.entry = "src/index.js";
config.moduleName = "poki";
config.useStrict = true;
config.format = "iife";
config.dest = pkg.browser;
config.external = [];
config.plugins = [
  json(),
  buble(),
  resolve({
    browser: true
  }),
  commonjs()
];

const outputOptions = {};

async function build() {

  const bundle = await rollup.rollup(config);

  const { code, map } = await bundle.generate(config);
  fs.writeFileSync("dist/bundle.js", code, "utf-8");

}

build();
