/* global module, chrome:true */

var $ = require('./../libs/jquery-1.11.1.min'),
    CONST = {
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
            },
            whitelist: {
                enabled: true,
                defaultsEnabled: true,
                items: [
                    {
                        url: 'rbc.ca'
                    }
                ]
            }
        },
        whitelistDefault: {
            items: [
                {
                    url: 'rbc.ca'
                }
            ]
        },
        ignorelistDefault: {
            items: [
                {
                    name: 'Google images',
                    reg: /google\.([^\/]+)\/(ima?g|.*[?&]tbm=isch|.*[?&]site=images)/i
                }
            ]
        }
    };

module.exports = {
    options: null,
    defaults: CONST
};

module.exports.testHook = function (j) {
    var options;
        
    chrome = {
        storage: {
            sync: {

            }
        }
    };

    $ = j;

    // mock chrome storage functions
    chrome.storage.sync.get = function (arg, callback) {
        var items = {
            options : options || arg.options
        };
        
        callback.call(this, items);
    };

    chrome.storage.sync.set = function (arg, callback) {

        options = arg.options;

        callback.call(this);
    };
};

module.exports.getOptions = function (callback, force) {

    if (!module.exports.options || force) {

        // retrieve options from local storage if any
        chrome.storage.sync.get({
            options: CONST.optionsDefault
        }, function (items) {
            console.log('Storage : Options loaded', items.options);
            //module.exports.options = items.options;
            // push any additional default options that might be added with new versions into the stored options object
            module.exports.options = $.extend(true, {}, CONST.optionsDefault, items.options);

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