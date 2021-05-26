const { statisticsStore } = require('../statistics-store');
const { IS_VSCODE } = require('../utils');

function getInfo() {
  const onCount = statisticsStore.collectStatistics('onclickRule', 'on');
  const handleCount = statisticsStore.collectStatistics(
    'onclickRule',
    'handle'
  );
  const onRate = Math.round((onCount / (onCount + handleCount)) * 100);
  const handleRate = Math.round((handleCount / (onCount + handleCount)) * 100);
  return { onCount, handleCount, onRate, handleRate };
}

const onReg = /^on[A-Z].+/;
const handleReg = /^handle[A-Z].+/;

module.exports = {
  meta: {
    messages: {},
  },
  create(context) {
    return {
      Identifier(node) {
        // 这里注意一下，非 vscode 插件的环境不要输出统计。所有 subrule 都需要配上
        if (!IS_VSCODE) return;

        if (onReg.test(node.name)) {
          const { onRate, handleRate, onCount } = getInfo();
          if (onRate >= 50) return;

          const message = `onxxx写法的次数统计: ${onCount}。onxxx占比: ${onRate}%, handlexxx占比: ${handleRate}%`;
          context.report({
            node,
            message,
            data: {
              name: 'on',
            },
          });
        }
        if (handleReg.test(node.name)) {
          const { onRate, handleRate, handleCount } = getInfo();
          if (handleRate >= 50) return;

          const message = `handlexxx写法的次数统计: ${handleCount}。onxxx占比: ${onRate}%, handlexxx占比: ${handleRate}%`;
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
      if (onReg.test(node.name)) {
        statisticsStore.count(file, 'onclickRule', 'on');
      }
      if (handleReg.test(node.name)) {
        statisticsStore.count(file, 'onclickRule', 'handle');
      }
    },
  },
};
