/* global $ */

var storage = require('./../modules/storage'),
    util = require('./../modules/util.js'),

    bitRules = [],

    whitelistNewItem = $('#whitelist-new-item'),
    whitelistAdd = $('#whitelist-add-button'),
    whitelistDelete = $('#whitelist-delete-button'),
    whitelist = $('#whitelist-list');


function updateWhitelist() {
    var whitelistItems;

    whitelistItems = storage.options.whitelist.items.map(function (item) {
        return {
            value: item.url,
            text: item.url
        };
    });

    util.setSelectOptions(whitelist, whitelistItems);

    whitelist.selecter('update');
}

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

    whitelist.selecter();
    updateWhitelist();

    whitelistAdd.on('click', function () {
        storage.options.whitelist.items.push(
        {
            url: whitelistNewItem.val()
        });

        updateWhitelist();

        callback();

    });

    whitelistDelete.on('click', function () {
    });

};