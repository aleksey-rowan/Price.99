﻿var assert = require('assert');
var p,
    pricepoint = require('./pricepoint'),
    //jquery = require('./../libs/jquery-1.11.1.min'),
    jsdom = require('jsdom'),
    window = jsdom.jsdom().parentWindow;


describe('pricepoint module', function () {

    it('should hook jquery to module without error', function (done) {
        jsdom.jQueryify(window, './../libs/jquery-1.11.1.min.js', function () {
            var $ = window.$;
            //$("body").prepend("<h1>The title</h1>");

            pricepoint.testHook($);

            done();
        });
    });

    it('should export create() function', function () {
        assert.strictEqual(pricepoint && typeof (pricepoint.create), 'function');
    });

    it('should create() pricepoint object with 11 commands', function () {
        p = pricepoint.create('$0.00', []);
        assert('object' === typeof (p));
        assert(11 === Object.keys(p).length);
        assert.deepEqual(['init', 'isChanged', 'newPrice', 'nodes', 'oldPrice', 'parts', 'recalculatePrice', 'reset', 'setPrice', 'synchronize', 'update'],
            Object.keys(p).sort());
    });

    /*it('should create() handler object with 3 commands', function () {
        h = handlers.create('test');
        assert('object' === typeof (h));
        assert(3 === Object.keys(h).length);
        assert.deepEqual(['echo','random','randomAsync'], Object.keys(h).sort());
    });
    
    it('should "return" random number 0 - 999', function () {
        h.random(function (i) {
            assert('number' === typeof (i));
            assert(0 <= i);
            assert(i <= 999);
        });
    });*/

});

