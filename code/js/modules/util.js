/* global module, $, document */

module.exports = {
    testHook: function(document) {
        this.containsInDom = function (el) {
            return $.contains(document.documentElement, el);
        };
    },

    /**
     * Returns true if the supplied element is in the dom.
     */
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
    },

    /**
     * Walks the dom and executes a specified function which takes a current node and returns true to continue or false to stop walking.
     */
    walk: function walk(node, func) {
        var keepGoing;
    
        keepGoing  = func.call(this, node);
        node = node.firstChild;
        while (node) {
            if (!keepGoing) {
                return false;
            }
        
            keepGoing = walk.call(this, node, func);
            node = node.nextSibling;
        }
    
        return keepGoing;
    }
};