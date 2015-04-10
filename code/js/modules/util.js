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
    walk: function walk(node, func, ignoreTags) {
        var keepGoing;
        
        ignoreTags = ignoreTags || [];

        if (ignoreTags.indexOf(node.tagName) === -1) {
            keepGoing = func.call(this, node);
            node = node.firstChild;
            while (node) {
                if (!keepGoing) {
                    return false;
                }

                keepGoing = walk.call(this, node, func, ignoreTags);
                node = node.nextSibling;
            }
        } else {
            keepGoing = true;
        }
    
        return keepGoing;
    },

    deepCheck: function(o1, o2) {
        var k1, k2, key, _i, _len;
        
        k1 = Object.keys(o1).sort();
        k2 = Object.keys(o2).sort();
        
        if (k1.length !== k2.length) {
            return false;
        }
        
        for (_i = 0, _len = k1.length; _i < _len; _i++) {
            key = k1[_i];
            
            if (o1.hasOwnProperty(key) !== o2.hasOwnProperty(key)) {
                return false;
            } else if (typeof o1[key] !== typeof o2[key]) {
                return false;
            }
            
            if (typeof o1[key] === 'object') {
                return this.deepCheck(o1[key], o2[key]);
            } else {
                return o1[key] === o2[key];
            }
        }
    }
};