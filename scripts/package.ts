import shell from 'shelljs';
import path from 'path';
import fs from 'fs';

const projectDir = path.resolve(__dirname, "..");
const resolve = (projectPath) => path.resolve(projectDir, projectPath);
const files = {
  manifest: resolve("static/manifest.json"),
  pkg: resolve("package.json"),
};
const paths = {
  dist: resolve("./dist"),
  zip: resolve("./dist/extension"),
};
const now = new Date();
const date = `${now.getDate()}-${now.getMonth()}-${now.getFullYear()}`;

//////////////////////////////////////////////////////////////////////////

setProjectDir();
cleanupDist();
injectVersion();
buildExtension();
ensureZipFolder();

//////////////////////////////////////////////////////////////////////////

function setProjectDir() {
  shell.cd(projectDir);
}

function cleanupDist() {
  shell.exec("rm -rf ./dist");
}

function buildExtension() {
  shell.exec("yarn build:extension");
}

function injectVersion() {
  const manifest = require(files.manifest);
  const pkg = require(files.pkg);
  manifest.version = pkg.version;
  fs.writeFileSync(files.manifest, JSON.stringify(manifest, null, 2));
}

function ensureZipFolder() {
  shell.mkdir("-p", paths.zip);
}
