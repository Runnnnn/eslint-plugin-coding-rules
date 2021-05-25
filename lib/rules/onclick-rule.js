const { statisticsStore } = require('../statistics-store');

module.exports = {
  meta: {
    messages: {},
  },
  create(context) {
    return {
      Identifier(node) {
        if (/^on.+/.test(node.name)) {
          const onCount = statisticsStore.collectStatistics('onclickRule', 'on');
          const handleCount = statisticsStore.collectStatistics('onclickRule', 'handle');
          const onRate = Math.round((onCount / (onCount + handleCount)) * 100);
          const handleRate = Math.round((handleCount / (onCount + handleCount)) * 100);
          const message = `onxxx写法的次数统计: ${onCount}。onxxx占比: ${onRate}%, handlexxx占比: ${handleRate}%`
          context.report({
            node,
            message,
            data: {
              name: 'on',
            },
          });
        }
        if (/^handle.+/.test(node.name)) {
          const onCount = statisticsStore.collectStatistics('onclickRule', 'on');
          const handleCount = statisticsStore.collectStatistics('onclickRule', 'handle');
          const onRate = Math.round((onCount / (onCount + handleCount)) * 100);
          const handleRate = Math.round((handleCount / (onCount + handleCount)) * 100);
          const message = `handlexxx写法的次数统计: ${handleCount}。onxxx占比: ${onRate}%, handlexxx占比: ${handleRate}%`
          context.report({
            node,
            message,
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
