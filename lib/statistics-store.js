const fs = require('fs');
const debounce = require('lodash/debounce');
const { relativePath } = require('./utils');

class StatisticsStore {
  constructor() {
    this.statisticstorePath = process.cwd() + '/statisticsstore.json';
    // watch 文件，使 vscode eslint 插件及时更新，你在初次 yarn lint 时输出的新文件内容
    if (process.env.VSCODE_PID) {
      fs.watchFile(this.statisticstorePath, () => {
        this.init();
      });
    }
    this.init();
  }

  init() {
    this._statisticsstore = {};
    try {
      this._statisticsstore =
        JSON.parse(fs.readFileSync(this.statisticstorePath).toString()) || {};
    } catch (error) {
      console.error(error);
      fs.writeFileSync(this.statisticstorePath, '');
    }
    this.debounceWriteStatisticsStore = debounce(
      this.writeStatisticsStore,
      1000
    );
  }

  writeStatisticsStore() {
    fs.writeFileSync(
      this.statisticstorePath,
      JSON.stringify(this.getStatisticsStore(), null, 2)
    );
  }

  updateStatisticsStorePartOfFile(file, data) {
    const relative = relativePath(file);
    this._statisticsstore[relative] = data;
    this.debounceWriteStatisticsStore();
  }

  getStatisticsStore() {
    return this._statisticsstore;
  }

  getStatisticsStorePartOfFile(file) {
    const relative = relativePath(file);
    return this._statisticsstore[relative] || {};
  }

  count(file, namespace, key) {
    const data = this.getStatisticsStorePartOfFile(file);
    if (!data[namespace]) {
      data[namespace] = {};
    }
    const total = data[namespace][key] || 0;
    data[namespace] = {
      ...data[namespace],
      [key]: total + 1,
    };

    this.updateStatisticsStorePartOfFile(file, data);
  }

  collectStatistics(namespace, key) {
    let total = 0;
    Object.keys(this._statisticsstore).forEach((file) => {
      console.log(file, namespace, key);
      if (this._statisticsstore[file][namespace][key]) {
        total += this._statisticsstore[file][namespace][key];
      }
    });
    return total;
  }

  reinitStorePartOfFile(file) {
    const relative = relativePath(file);
    if (this._statisticsstore[relative]) {
      this.updateStatisticsStorePartOfFile(file, {});
    }
  }
}

module.exports = {
  statisticsStore: new StatisticsStore(),
};
