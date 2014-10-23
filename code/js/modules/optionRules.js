/* global*/

var $ = require('./../libs/jquery-1.11.1.min'),
    storage = require('./../modules/storage'),
    
    bitRules = [
        {
            container: $('#hide-zero-cents'),
            enabledControl: $('#hide-zero-cents input[type=checkbox]'),
            content: 'hideZeroCents'
        },
        {
            container: $('#global-rule'),
            enabledControl: $('#global-rule input[type=checkbox]'),
            content: 'enabled'
        }
    ];

module.exports.init = function (callback) {
    var otherRules = storage.options.otherRules;

    bitRules.forEach(function (rule) {
        rule.enabledControl
            .prop('checked', otherRules[rule.content])
            .picker({
                toggle: true,
                labels: {
                    on: 'on',
                    off: 'off'
                }
            })
            .change(function (e) {
                console.log(e);

                otherRules[rule.content] = e.currentTarget.checked;
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

};