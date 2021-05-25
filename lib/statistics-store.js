const fs = require('fs');
const debounce = require('lodash/debounce');

class StatisticsStore {
  constructor() {
    this.init();
  }

  init() {
    this._statisticsstore = {};
    this.statisticstorePath = process.cwd() + '/statisticsstore.json';
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
      JSON.stringify(this.getStatisticsStore())
    );
  }

  updateStatisticsStorePartOfFile(file, data) {
    this._statisticsstore[file] = data;
    this.debounceWriteStatisticsStore();
  }

  getStatisticsStore() {
    return this._statisticsstore;
  }

  getStatisticsStorePartOfFile(file) {
    return this._statisticsstore[file] || {};
  }

  count(file, namespace, key) {
    const data = this.getStatisticsStorePartOfFile(file);
    if (!data[namespace]) {
      data[namespace] = {};
    }
    const total  = data[namespace][key] || 0;
    data[namespace] = {
      ...data[namespace],
      [key]: total + 1,
    };

    this.updateStatisticsStorePartOfFile(file, data);
  }

  collectStatistics(namespace, key) {
    let total = 0;
    Object.keys(this._statisticsstore).forEach(file => {
      if (this._statisticsstore[file][namespace][key]) {
        total += this._statisticsstore[file][namespace][key];
      }
    })
    return total;
  }

  reinitStorePartOfFile(file) {
    if (this._statisticsstore[file]) {
      this.updateStatisticsStorePartOfFile(file, {});
    }
  }
}

module.exports = {
  statisticsStore: new StatisticsStore(),
};
