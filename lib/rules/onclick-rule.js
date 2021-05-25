const { statisticsStore } = require('../statistics-store');

const onCount = statisticsStore.collectStatistics('onclickRule', 'on');
const handleCount = statisticsStore.collectStatistics('onclickRule', 'handle');
const onRate = Math.round((onCount / (onCount + handleCount)) * 100);
const handleRate = Math.round((handleCount / (onCount + handleCount)) * 100);

module.exports = {
  meta: {
    type: 'suggestion',
    messages: {
      onId: `onxxx写法的次数统计: ${onCount}。onxxx占比: ${onRate}%, handlexxx占比: ${handleRate}%`,
      handleId: `handlexxx写法的次数统计: ${handleCount}。onxxx占比: ${onRate}%, handlexxx占比: ${handleRate}%`,
    },
  },
  create(context) {
    return {
      Identifier(node) {
        if (/^on.+/.test(node.name)) {
          context.report({
            node,
            messageId: 'onId',
            data: {
              name: 'on',
            },
          });
        }
        if (/^handle.+/.test(node.name)) {
          context.report({
            node,
            messageId: 'handleId',
            data: {
              name: 'handle',
            },
          });
        }
      },
    };
  },
  statistics: {
    Identifier(node, context) {
      const file = context.getFilename();
      if (/^on.+/.test(node.name)) {
        statisticsStore.count(file, 'onclickRule', 'on');
      }
      if (/^handle.+/.test(node.name)) {
        statisticsStore.count(file, 'onclickRule', 'handle');
      }
    },
  },
};
