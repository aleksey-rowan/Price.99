/* global $ */

var util = require('./../modules/util'),
    storage = require('./../modules/storage'),

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

module.exports = {
    init: function (callback) {

        whitelist.selecter({ callback: function (i, e) { console.log(i, e); } });
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
    }
};