/* global before */

var assert = require('assert'),
    p,
    pricepoint = require('./pricepoint'),
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
            hideAllCents: false,
            hideZeroCents: false
        }
    };

//storage.options = $.extend(true, {}, optionsDefault);

function nodify(str) {
    return str.split("").map(function (e) { return $("<ppnn>" + e + "</ppnn>"); });
}

function assertOldPrice(value, valueString, whole, fraction, decimalMarkIndex) {
    assert.strictEqual(value, p.oldPrice.value);
    assert.strictEqual(valueString, p.oldPrice.valueString);
    assert.strictEqual(whole, p.oldPrice.whole);
    assert.strictEqual(fraction, p.oldPrice.fraction);
    assert.strictEqual(decimalMarkIndex, p.oldPrice.decimalMarkIndex);
}

function assertNewPrice(value, valueString, whole, fraction, decimalMarkIndex) {
    assert.strictEqual(value, p.newPrice.value);
    assert.strictEqual(valueString, p.newPrice.valueString);
    assert.strictEqual(whole, p.newPrice.whole);
    assert.strictEqual(fraction, p.newPrice.fraction);
    assert.strictEqual(decimalMarkIndex, p.newPrice.decimalMarkIndex);
}

function assertParts(currencySign, whole, decimalMark, fraction) {
    assert.strictEqual(currencySign, p.parts.currencySign.text());
    assert.strictEqual(whole, $(p.parts.whole).text());
    assert.strictEqual(decimalMark, p.parts.decimalMark.text());
    assert.strictEqual(fraction, $(p.parts.fraction).text());
}

describe('pricepoint module', function () {

    it('should hook jquery to module without error', function (done) {
        jsdom.jQueryify(window, './../libs/jquery-1.11.1.min.js', function () {
            $ = window.$;

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

    describe('99 cents rule', function () {
        before(function () {
            storage.options = $.extend(true, {}, optionsDefault);
            storage.options.roundRules.cents = {
                value: 99,
                enabled: true
            };
        });

        it('should correctly round the price $999.99 -> $1000.00', function () {
            var str = '$999.99', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(999.99, '999.99', 999, 0.99, 3);
            assertNewPrice(1000, '1000.00', 1000, 0, 4);
            assertParts('$', '1000', '.', '00');
        });

        it('should correctly round the price $9.99 -> $10.00', function () {
            var str = '$9.99', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(9.99, '9.99', 9, 0.99, 1);
            assertNewPrice(10, '10.00', 10, 0, 2);
            assertParts('$', '10', '.', '00');
        });

        it('should correctly round the price $0.99 -> $1.00', function () {
            var str = '$0.99', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(0.99, '0.99', 0, 0.99, 1);
            assertNewPrice(1, '1.00', 1, 0, 1);
            assertParts('$', '1', '.', '00');
        });

        it('should not round the price $9.50 -> $10.00', function () {
            var str = '$9.50', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(9.50, '9.50', 9, 0.50, 1);
            assert.strictEqual(null, p.newPrice);
            assertParts('$', '9', '.', '50');
        });

        it('should not round the price $0.00 -> $1.00', function () {
            var str = '$0.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(0.0, '0.00', 0, 0.0, 1);
            assert.strictEqual(null, p.newPrice);
            assertParts('$', '0', '.', '00');
        });
    });

    describe('0 cents rule', function () {
        before(function () {
            storage.options = $.extend(true, {}, optionsDefault);
            storage.options.roundRules.cents = {
                value: 0,
                enabled: true
            };
        });

        it('should correctly round the price $999.00 -> $1000.00', function () {
            var str = '$999.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(999.0, '999.00', 999, 0.0, 3);
            assertNewPrice(1000, '1000.00', 1000, 0, 4);
            assertParts('$', '1000', '.', '00');
        });

        it('should correctly round the price $9.99 -> $10.00', function () {
            var str = '$9.99', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(9.99, '9.99', 9, 0.99, 1);
            assertNewPrice(10, '10.00', 10, 0, 2);
            assertParts('$', '10', '.', '00');
        });

        it('should correctly round the price $0.99 -> $1.00', function () {
            var str = '$0.99', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(0.99, '0.99', 0, 0.99, 1);
            assertNewPrice(1, '1.00', 1, 0, 1);
            assertParts('$', '1', '.', '00');
        });

        it('should correctly round the price $0.00 -> $1.00', function () {
            var str = '$0.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(0.0, '0.00', 0, 0.0, 1);
            assertNewPrice(1, '1.00', 1, 0, 1);
            assertParts('$', '1', '.', '00');
        });

    });

    describe('9 dollars rule', function () {
        before(function () {
            storage.options = $.extend(true, {}, optionsDefault);
            storage.options.roundRules.dollars = {
                value: 9,
                enabled: true
            };
        });

        it('should correctly round the price $999.00 -> $1000.00', function () {
            var str = '$999.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(999.0, '999.00', 999, 0.0, 3);
            assertNewPrice(1000, '1000.00', 1000, 0, 4);
            assertParts('$', '1000', '.', '00');
        });

        it('should correctly round the price $99.00 -> $100.00', function () {
            var str = '$99.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(99.0, '99.00', 99, 0.0, 2);
            assertNewPrice(100, '100.00', 100, 0, 3);
            assertParts('$', '100', '.', '00');
        });

        it('should correctly round the price $19.00 -> $20.00', function () {
            var str = '$19.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(19.0, '19.00', 19, 0.0, 2);
            assertNewPrice(20, '20.00', 20, 0, 2);
            assertParts('$', '20', '.', '00');
        });
        
        it('should correctly round the price $10.00 -> $20.00', function () {
            var str = '$10.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(10.0, '10.00', 10, 0.0, 2);
            assert.strictEqual(null, p.newPrice);
            assertParts('$', '10', '.', '00');
        });

        it('should correctly round the price $9.00 -> $10.00', function () {
            var str = '$9.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(9.0, '9.00', 9, 0.0, 1);
            assertNewPrice(10, '10.00', 10, 0, 2);
            assertParts('$', '10', '.', '00');
        });

        it('should not round the price $117.00 -> $118.00', function () {
            var str = '$117.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(117.0, '117.00', 117, 0.0, 3);
            assert.strictEqual(null, p.newPrice);
            assertParts('$', '117', '.', '00');
        });

        it('should not round the price $5.00 -> $10.00', function () {
            var str = '$5.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(5.00, '5.00', 5, 0.00, 1);
            assert.strictEqual(null, p.newPrice);
            assertParts('$', '5', '.', '00');
        });

        it('should not round the price $0.00 -> $10.00', function () {
            var str = '$0.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(0.0, '0.00', 0, 0.0, 1);
            assert.strictEqual(null, p.newPrice);
            assertParts('$', '0', '.', '00');
        });
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

