const child_process = require('child_process');
const fs = require('fs');
const debounce = require('lodash/debounce');
const { statisticsStore } = require('./statistics-store');
const { relativePath } = require('./utils');

class FileStore {
  constructor() {
    this.init();
  }

  init() {
    this._filestore = {};
    this.filestorePath = process.cwd() + '/filestore.json';
    try {
      this._filestore =
        JSON.parse(fs.readFileSync(this.filestorePath).toString()) || {};
    } catch (error) {
      // console.error(error);
      fs.writeFileSync(this.filestorePath, '');
    }
    this.debounceWriteFileStore = debounce(this.writeFileStore, 1000);
  }

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
