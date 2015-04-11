/* global $ */

var util = require('./../modules/util'),
    storage = require('./../modules/storage'),

    whitelistNewItem = $('#whitelist-new-item'),
    whitelistAdd = $('#whitelist-add-button'),
    whitelistDelete = $('#whitelist-delete-button'),
    whitelist = $('#whitelist-list');

function updateWhitelist() {
    var whitelistItems;

    whitelistItems = storage.options.whitelist.items.map(function (item, index) {
        return {
            value: index,
            text: item.url
        };
    });

    util.setSelectOptions(whitelist, whitelistItems);

    whitelist.selecter('update');
}

module.exports = {
    init: function (callback) {
        var whitelistSelectedItems;

        whitelist.selecter(
            {
                callback: function (items)
                {
                    whitelistSelectedItems = items;

                    if (items.length > 0) {

                    }
                }
            }
        );
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
            // remove selected items from the whitelist
            for (var i = whitelistSelectedItems.length - 1; i >= 0; i--) {
                storage.options.whitelist.items.splice(whitelistSelectedItems[i], 1);
            }

            updateWhitelist();

            callback();
        });
    }
};