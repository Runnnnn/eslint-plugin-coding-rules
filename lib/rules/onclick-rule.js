const { statisticsStore } = require('../statistics-store');

module.exports = {
  meta: {
    messages: {
      onId: 'onxxx rule statistics: ' + statisticsStore.collectStatistics('onclickRule', 'on'),
      handleId: 'handlexxx rule statistics: ' + statisticsStore.collectStatistics('onclickRule', 'handle'),
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
        statisticsStore.count(file, 'onclickRule', 'on')
      }
      if (/^handle.+/.test(node.name)) {
        statisticsStore.count(file, 'onclickRule', 'handle')
      }
    },
  },
};
