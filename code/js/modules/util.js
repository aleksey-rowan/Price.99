/* global module, $, document */

module.exports = {
    testHook: function(document) {
        this.containsInDom = function (el) {
            return $.contains(document.documentElement, el);
        };
    },

    containsInDom: function(el) {
        return $.contains(document.documentElement, el);
    },
    
    getDigit: function (N, n) {
        return Math.floor(N / (Math.pow(10, n)) % 10);
    },

    removeFromArray: function (array, item) {
        // Find and remove item from an array
        var i = array.indexOf(item);

        if (i !== -1) {
            array.splice(i, 1);
        }
    }
};