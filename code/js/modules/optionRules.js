/* global $ */

var storage = require('./../modules/storage'),
    whitelist = require('./../modules/whitelist'),
    bitRules = [];

module.exports.init = function (callback) {
    bitRules = [
        {
            container: $('#hide-zero-cents'),
            enabledControl: $('#hide-zero-cents input[type=checkbox]'),
            content: storage.options.otherRules,
            property: 'hideZeroCents'
        },
        {
            container: $('#global-rule'),
            enabledControl: $('#global-rule input[type=checkbox]'),
            content: storage.options.otherRules,
            property: 'enabled'
        },
        {
            container: $('#whitelist-enabled'),
            enabledControl: $('#whitelist-enabled input[type=checkbox]'),
            content: storage.options.whitelist,
            property: 'enabled'
        }
    ];

    bitRules.forEach(function (rule) {
        rule.enabledControl
            .prop('checked', rule.content[rule.property])
            .picker({
                toggle: true,
                labels: {
                    on: 'on',
                    off: 'off'
                }
            })
            .change(function (e) {
                console.log(e);

                rule.content[rule.property] = e.currentTarget.checked;
                callback();
            });

        rule.container
            .hover(
                function () {
                    bitRules.forEach(function (r) {
                        r.container.removeClass('selected');
                    });
                    rule.container.addClass('selected');
                },

                function () {
                    bitRules.forEach(function (r) {
                        r.container.removeClass('selected');
                    });
                }
            );
    });

    whitelist.init(callback);

};