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
            enabled: true,
            hideAllCents: false,
            hideZeroCents: true
        }
    }
};

module.exports = {
    options: null
};

module.exports.getOptions = function (callback, force) {

    if (!module.exports.options || force) {

        // retrieve options from local storage if any
        chrome.storage.sync.get({
            options: CONST.optionsDefault
        }, function (items) {
            console.log('Storage : Options loaded', items.options);
            module.exports.options = items.options;

            if (callback) {
                callback();
            }
        });
    } else {
        if (callback) {
            callback();
        }
    }
};

module.exports.saveOptions = function (callback) {

    chrome.storage.sync.set({
        options: module.exports.options
    }, function () {
        console.log('Storage : Options Saved', module.exports.options);

        if (callback) {
            callback();
        }
    });
};