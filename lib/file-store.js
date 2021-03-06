/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
const child_process = require('child_process');
const fs = require('fs');
const debounce = require('lodash/debounce');
const { statisticsStore } = require('./statistics-store');
const { relativePath, IS_VSCODE } = require('./utils');

class FileStore {
  constructor() {
    this.filestorePath = `${process.cwd()}/filestore.json`;
    // watch 文件，使 vscode eslint 插件及时更新，你在初次 yarn lint 时输出的新文件内容
    if (IS_VSCODE) {
      fs.watchFile(this.filestorePath, () => {
        this.init();
      });
    }
    this.init();
  }

  init() {
    this._filestore = {};
    try {
      this._filestore =
        JSON.parse(fs.readFileSync(this.filestorePath).toString()) || {};
    } catch (error) {
      // console.error(error);
      fs.writeFileSync(this.filestorePath, '{}');
    }
    this.debounceWriteFileStore = debounce(this.writeFileStore, 1000);
  }

  // 获取文件 commit hash
  getFileCommit(file) {
    const info = child_process.execSync(`git log ${file}`);
    const commit = info.toString().slice(7, 18);
    return commit;
  }

  writeFileStore() {
    fs.writeFileSync(
      this.filestorePath,
      JSON.stringify(this.getFileStore(), null, 2)
    );
  }

  // 文件 hash 变动更新文件 hash，同时重新初始化文件数据
  updateFileStore(file) {
    const commit = this.getFileCommit(file);
    const relative = relativePath(file);
    this._filestore[relative] = commit;
    this.debounceWriteFileStore();

    statisticsStore.reinitStorePartOfFile(file);
  }

  getFileStore() {
    return this._filestore;
  }

  // 检查文件是否变动
  checkFileCommitChange(file) {
    const currentCommit = this.getFileCommit(file);
    const relative = relativePath(file);
    const cacheCommit = this._filestore[relative] || '';
    // console.log(currentCommit, cacheCommit)
    return currentCommit !== cacheCommit;
  }
}

module.exports = {
  fileStore: new FileStore(),
};
