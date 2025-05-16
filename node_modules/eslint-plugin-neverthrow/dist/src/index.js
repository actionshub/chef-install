"use strict";
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
module.exports = {
    configs: {
        recommended: require('./configs/recommended'),
    },
    rules: {
        'must-use-result': require('./rules/must-use-result'),
    },
};
