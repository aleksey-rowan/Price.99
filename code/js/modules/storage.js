/* global module, chrome */

var CONST = {
    optionsDefault: {
        roundRules: {
            cents: {
                value: 79,
                enabled: true
            },
            dollars: {
                value: 9,
                enabled: false
            },
            tens: {
                value: 9,
                enabled: false
            },
            hundreds: {
                value: 1,
                enabled: false
            }
        },
        otherRules: {
            hideAllCents: false,
            hideZeroCents: true
        }
    }
};

module.exports = {
    options: null
};

module.exports.getOptions = function (callback) {

    // retrieve options from local storage if any
    chrome.storage.sync.get({
        options: CONST.optionsDefault
    }, function (items) {
        console.log('Storage : Options loaded', items.options);
        module.exports.options = items.options;

        callback();
    });
};