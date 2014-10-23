/* global before, require, it, describe */

var assert = require('assert'),
    //p,
    parser = require('./parser.js'),
    //parser = require('./parser.js'),
    //pricepoint = require('./pricepoint'),
    storage = require('./../modules/storage'),
    jsdom = require('jsdom'),
    $,
    window = jsdom.jsdom().parentWindow,
    optionsDefault = {
        roundRules: {
            cents: {
                value: 99,
                enabled: false
            },
            dollars: {
                value: 9,
                enabled: false
            },
            tens: {
                value: 9,
                enabled: false
            },
            hundreds: {
                value: 1,
                enabled: false
            }
        },
        otherRules: {
            enabled: true,
            hideAllCents: false,
            hideZeroCents: false
        }
    };

describe('parser module', function () {
    it('should hook jquery to module without error', function (done) {
        jsdom.jQueryify(window, './../libs/jquery-1.11.1.min.js', function () {

            $ = window.$;

            $("body").append('<div class="testing">Hello World, It works.</div>');

            parser.testHook($, window.document);

            done();
        });
    });

    it('should export init() function', function () {
        assert.strictEqual(parser && typeof (parser.init), 'function');
    });

    describe('parser behaviour', function () {
        before(function () {
            storage.options = $.extend(true, {}, optionsDefault);
            storage.options.roundRules.cents = {
                value: 99,
                enabled: true
            };
        });

        it('should correctly detect a price', function () {
            var ns = $('body').empty().append("<span>price $45.56</span>"),
                pps;

            pps = parser
                .parse(ns)
                .getPricePoints();
            
            assert(1 === pps.length);
        });

        it('should correctly purge price that no longer exist', function () {
            var pps;

            $('body').empty();

            pps = parser
                .purge()
                .getPricePoints();

            assert(0 === pps.length);
        });
    });

    describe('parser enable/disable options', function () {
        before(function () {
            storage.options = $.extend(true, {}, optionsDefault);
            storage.options.roundRules.cents = {
                value: 99,
                enabled: true
            };

            storage.options.otherRules.enabled = false;
        });

        it.skip('should correctly not run and detect a price', function () {
            var ns = $('body').empty().append("<span>price $45.56</span>"),
                pps;

            pps = parser
                .parse(ns)
                .getPricePoints();

            assert(0 === pps.length);
        });

        it('should correctly not update prices when paused', function () {
            var pps, ppUpdated, ppUnchanged,
                ns = $('body').empty().append("<span>price $45.56</span>");

            storage.options.otherRules.enabled = true;

            pps = parser
                .parse(ns)
                .getPricePoints();

            storage.options.otherRules.enabled = false;

            pps = parser
                .updatePrices()
                .getPricePoints();

            pps = parser.getPricePoints();
            ppUpdated = pps.filter(function (pp) { return pp.isChanged; });
            ppUnchanged = pps.filter(function (pp) { return !pp.isChanged; });

            console.log(pps.length, ppUpdated.length, ppUnchanged.length);

            assert(pps.length === ppUnchanged.length);
        });
    });

    /*it('should create() pricepoint object with 12 commands', function () {
        p = pricepoint.create('$0.00', []);
        assert('object' === typeof (p));
        assert(12 === Object.keys(p).length);
        assert.deepEqual(['hideCents', 'init', 'isChanged', 'newPrice', 'nodes', 'oldPrice', 'parts', 'recalculatePrice', 'reset', 'setPrice', 'synchronize', 'update'],
            Object.keys(p).sort());
    });
    */
});