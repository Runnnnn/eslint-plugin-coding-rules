const { fileStore } = require('../file-store');
const onclickRule = require('./onclick-rule');

function visitorMerge({ statistics, visitor, context }) {
  Object.keys(statistics).forEach((key) => {
    if (!visitor[key]) {
      visitor[key] = function (node) {
        statistics[key](node, context);
      };
    } else {
      visitor[key] = function (node) {
        statistics[key](node, context);
        visitor[key](node, context);
      };
    }
  });
}

// 在此处新增 rule
const ruleList = [onclickRule];

module.exports = {
  meta: {
    messages: {
      codingrules: 'coding rules statistics',
    },
  },
  create(context) {
    const shouldUpdateFileStore = fileStore.checkFileCommitChange(
      context.getFilename()
    );
    if (shouldUpdateFileStore) {
      // console.log(context.getFilename());
      fileStore.updateFileStore(context.getFilename());

      const visitor = {};
      ruleList.forEach(rule => {
        visitorMerge({ statistics: rule.statistics, visitor, context });
      })

      return {
        ...visitor,
      };
    }
    return {};
  },
};
