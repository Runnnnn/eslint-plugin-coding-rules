/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
const fs = require('fs');
const debounce = require('lodash/debounce');
const { relativePath, IS_VSCODE } = require('./utils');

class StatisticsStore {
  constructor() {
    this.statisticstorePath = `${process.cwd()}/statisticsstore.json`;
    // watch 文件，使 vscode eslint 插件及时更新，你在初次 yarn lint 时输出的新文件内容
    if (IS_VSCODE) {
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
      // console.error(error);
      fs.writeFileSync(this.statisticstorePath, '{}');
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

  // 更新部分文件的统计数据
  updateStatisticsStorePartOfFile(file, data) {
    const relative = relativePath(file);
    this._statisticsstore[relative] = data;
    this.debounceWriteStatisticsStore();
  }

  getStatisticsStore() {
    return this._statisticsstore;
  }

  // 获取部分文件的统计数据
  getStatisticsStorePartOfFile(file) {
    const relative = relativePath(file);
    return this._statisticsstore[relative] || {};
  }

  // 统计
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

  // 收集统计结果
  collectStatistics(namespace, key) {
    let total = 0;
    Object.keys(this._statisticsstore).forEach((file) => {
      try {
        const count = this._statisticsstore[file][namespace][key];
        if (count) {
          total += count;
        }
      } catch (error) {
        console.error(error);
      }
    });
    return total;
  }

  // 重新初始化部分文件的统计数据，文件 hash 变动后
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
