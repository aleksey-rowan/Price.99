/* global before, require, it, describe */

var assert = require('assert'),
    util = require('./../modules/util'),
    storage = require('./../modules/storage'),
    jsdom = require('jsdom'),
    $,
    window = jsdom.jsdom().parentWindow;

describe('storage module', function () {
    it('should hook jquery to module without error', function (done) {
        jsdom.jQueryify(window, './../libs/jquery-1.11.1.min.js', function () {

            $ = window.$;

            $("body").append('<div class="testing">Hello World, It works.</div>');

            storage.testHook($);

            done();
        });
    });

    /*it('should export init() function', function () {
        assert.strictEqual(parser && typeof (parser.init), 'function');
    });*/

    describe('storage behaviour', function () {
        before(function () {
            /*storage.options = $.extend(true, {}, optionsDefault);
            storage.options.roundRules.cents = {
                value: 99,
                enabled: true
            };*/
        });

        it('should correctly return default options', function () {
            var isEqual;

            // no stored options - ext. just loaded
            storage.options = null;
            storage.getOptions();

            isEqual = util.deepCheck(storage.options, storage.defaults.optionsDefault);

            assert.strictEqual(isEqual, true);
        });

        it('should correctly merge new default option into ', function () {
            var isEqual;

            storage.saveOptions();

            // add a new default option
            storage.options = null;
            storage.defaults.optionsDefault.newOption = { one: 1 };

            storage.getOptions();
                        
            isEqual = util.deepCheck(storage.options, storage.defaults.optionsDefault);

            //console.log(storage.options);
            //console.log(storage.defaults.optionsDefault);

            assert.strictEqual(isEqual, true);
        });

        /*it('should correctly purge price that no longer exist', function () {
            var pps;

            $('body').empty();

            pps = parser
                .purge()
                .getPricePoints();

            assert(0 === pps.length);
        });*/
    });
});