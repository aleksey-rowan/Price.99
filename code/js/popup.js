/* global require, chrome */

; (function () {
    "use strict";
    console.log('OPTIONS SCRIPT WORKS!');

    // here we use SHARED message handlers, so all the contexts support the same
    // commands. but this is NOT typical messaging system usage, since you usually
    // want each context to handle different commands. for this you don't need
    // handlers factory as used below. simply create individual `handlers` object
    // for each context and pass it to msg.init() call. in case you don't need the
    // context to support any commands, but want the context to cooperate with the
    // rest of the extension via messaging system (you want to know when new
    // instance of given context is created / destroyed, or you want to be able to
    // issue command requests from this context), you may simply omit the
    // `hadnlers` parameter for good when invoking msg.init()
    var $ = require('./libs/jquery-1.11.1.min'),
        handlers = require('./modules/handlers').create('popup'),
        storage = require('./modules/storage.js'),
        runner = require('./modules/runner'),
        msg = require('./modules/msg'),
        
        optionsButton = $('#options-button'),

        priceRules = require('./modules/priceRules.js');

    require('./libs/stepper/jquery.fs.stepper.min.js');
    require('./libs/picker/jquery.fs.picker.js');

    msg = msg.init('options', handlers);

    console.log(storage.options);
    storage.getOptions(function () {
        init(runner.go.bind(runner, msg));
    });

    function saveOptions(callback) {
        storage.saveOptions(function () {
            var res = {
                type: 'bg',
                cmd: 'optionsChanged',
                arg: storage.options//,
                //ctxs: ['ct', 'bg'],
                //tab: -1
            };

            callback(res);

            priceRules.updateRuleControls();
        });
    }

    function init(callback) {

        $('[i18n-content]').each(function () {
            var element = $(this);
            //element.text(chrome.i18n.getMessage(element.attr('i18n-content')));
            element.html(chrome.i18n.getMessage(element.attr('i18n-content')));
        });

        priceRules.init(function () {
            saveOptions(callback);
        });
        
        $('.option-item').hover(
            function () {
                var node = $(this);
                node.addClass('selected');
            },
            function () {
                var node = $(this);
                node.removeClass('selected');
            });

        optionsButton
            .click(function () {
                msg.bg('openOptionsPage',
                    function (res) {
                        console.log('Response to openOptionsPage command', res);
                    });
            });
    }
})();