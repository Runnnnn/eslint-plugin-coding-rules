'use strict'

const codingrule = require('./rules/main-rule');
const onclickrule = require('./rules/onclick-rule');

module.exports = {
  rules: {
    'main': codingrule,
    'onclick-rule': onclickrule,
  },
};
