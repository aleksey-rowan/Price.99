/* global before, require, it, describe */

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
            enabled: true,
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

function assertParts(currencySign, whole, decimalMark, fraction, centsHidden) {
    assert.strictEqual(currencySign, p.parts.currencySign.text());
    assert.strictEqual(whole, $(p.parts.whole).text());
    assert.strictEqual(decimalMark, p.parts.decimalMark.text());
    assert.strictEqual(fraction, $(p.parts.fraction).text());

    [].concat(p.parts.decimalMark, p.parts.fraction).forEach(function (n) {
        assert.strictEqual(centsHidden, n.hasClass('ppnn-invisible'));
    });
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

    it('should create() pricepoint object with 12 commands', function () {
        p = pricepoint.create('$0.00', []);
        assert('object' === typeof (p));
        assert(12 === Object.keys(p).length);
        assert.deepEqual(['hideCents', 'init', 'isChanged', 'newPrice', 'nodes', 'oldPrice', 'parts', 'recalculatePrice', 'reset', 'setPrice', 'synchronize', 'update'],
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
            assertParts('$', '1000', '.', '00', false);
        });

        it('should correctly round the price $9.99 -> $10.00', function () {
            var str = '$9.99', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(9.99, '9.99', 9, 0.99, 1);
            assertNewPrice(10, '10.00', 10, 0, 2);
            assertParts('$', '10', '.', '00', false);
        });

        it('should correctly round the price $0.99 -> $1.00', function () {
            var str = '$0.99', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(0.99, '0.99', 0, 0.99, 1);
            assertNewPrice(1, '1.00', 1, 0, 1);
            assertParts('$', '1', '.', '00', false);
        });

        it('should not round the price $9.50 -> $10.00', function () {
            var str = '$9.50', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(9.50, '9.50', 9, 0.50, 1);
            assertNewPrice(null, null, null, null, null);
            assertParts('$', '9', '.', '50', false);
        });

        it('should not round the price $0.00 -> $1.00', function () {
            var str = '$0.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(0.0, '0.00', 0, 0.0, 1);
            assertNewPrice(null, null, null, null, null);
            assertParts('$', '0', '.', '00', false);
        });

        it('should correctly reset the price $9.99 -> $10.00 -> $9.99', function () {
            var str = '$9.99', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();
            p.reset();

            assertOldPrice(9.99, '9.99', 9, 0.99, 1);
            assertNewPrice(null, null, null, null, null);
            assertParts('$', '9', '.', '99', false);
        });
    });

    describe('59 cents rule', function () {
        before(function () {
            storage.options = $.extend(true, {}, optionsDefault);
            storage.options.roundRules.cents = {
                value: 59,
                enabled: true
            };
        });

        it('should correctly round the price $0.7 -> $1.00', function () {
            var str = '$0.7', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(0.7, '0.7', 0, 0.7, 1);
            assertNewPrice(1, '1.00', 1, 0, 1);
            assertParts('$', '1', '.', '00', false);
        });

        it('should correctly reset the price $0.7 -> $1.00 -> $0.70', function () {
            var str = '$0.7', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();
            assertOldPrice(0.7, '0.7', 0, 0.7, 1);
            assertNewPrice(1, '1.00', 1, 0, 1);
            assertParts('$', '1', '.', '00', false);

            p.reset();

            assertOldPrice(0.7, '0.7', 0, 0.7, 1);
            assertNewPrice(null, null, null, null, null);
            assertParts('$', '0', '.', '70', false);
        });
    });

    describe('59 cents rule + hideZeroCents', function () {
        before(function () {
            storage.options = $.extend(true, {}, optionsDefault);
            storage.options.roundRules.cents = {
                value: 59,
                enabled: true
            };
            storage.options.otherRules.hideZeroCents = true;
        });

        it('should correctly round the price $0.7 -> $1.00', function () {
            var str = '$0.7', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(0.7, '0.7', 0, 0.7, 1);
            assertNewPrice(1, '1.00', 1, 0, 1);
            assertParts('$', '1', '.', '00', true);
            assert.strictEqual(true, p.isChanged);
        });

        it('should correctly reset the price $0.7 -> $1.00 -> $0.70', function () {
            var str = '$0.7', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(0.7, '0.7', 0, 0.7, 1);
            assertNewPrice(1, '1.00', 1, 0, 1);
            assertParts('$', '1', '.', '00', true);
            assert.strictEqual(true, p.isChanged);

            p.reset();

            assertOldPrice(0.7, '0.7', 0, 0.7, 1);
            assertNewPrice(null, null, null, null, null);
            assertParts('$', '0', '.', '70', false);

            assert.strictEqual(false, p.isChanged);
        });
    });

    describe.skip('0 cents rule', function () {
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
            assertParts('$', '1000', '.', '00', false);
        });

        it('should correctly round the price $9.99 -> $10.00', function () {
            var str = '$9.99', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(9.99, '9.99', 9, 0.99, 1);
            assertNewPrice(10, '10.00', 10, 0, 2);
            assertParts('$', '10', '.', '00', false);
        });

        it('should correctly round the price $0.99 -> $1.00', function () {
            var str = '$0.99', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(0.99, '0.99', 0, 0.99, 1);
            assertNewPrice(1, '1.00', 1, 0, 1);
            assertParts('$', '1', '.', '00', false);
        });

        it('should correctly round the price $0.00 -> $1.00', function () {
            var str = '$0.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(0.0, '0.00', 0, 0.0, 1);
            assertNewPrice(1, '1.00', 1, 0, 1);
            assertParts('$', '1', '.', '00', false);
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
            assertParts('$', '1000', '.', '00', false);
        });

        it('should correctly round the price $99.00 -> $100.00', function () {
            var str = '$99.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(99.0, '99.00', 99, 0.0, 2);
            assertNewPrice(100, '100.00', 100, 0, 3);
            assertParts('$', '100', '.', '00', false);
        });

        it('should correctly round the price $19.00 -> $20.00', function () {
            var str = '$19.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(19.0, '19.00', 19, 0.0, 2);
            assertNewPrice(20, '20.00', 20, 0, 2);
            assertParts('$', '20', '.', '00', false);
        });

        it('should correctly round the price $9.00 -> $10.00', function () {
            var str = '$9.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(9.0, '9.00', 9, 0.0, 1);
            assertNewPrice(10, '10.00', 10, 0, 2);
            assertParts('$', '10', '.', '00', false);
        });

        it('should correctly round the price $9 -> $10.00', function () {
            var str = '$9', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(9.0, '9', 9, 0.0, 1);
            assertNewPrice(10, '10.00', 10, 0, 2);
            assertParts('$', '10', '', '', false);
        });

        it('should not round the price $117.00 -> $120.00', function () {
            var str = '$117.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(117.0, '117.00', 117, 0.0, 3);
            assertNewPrice(null, null, null, null, null);
            assertParts('$', '117', '.', '00', false);
        });

        it('should not round the price $10.00 -> $20.00', function () {
            var str = '$10.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(10.0, '10.00', 10, 0.0, 2);
            assertNewPrice(null, null, null, null, null);
            assertParts('$', '10', '.', '00', false);
        });

        it('should not round the price $5.00 -> $10.00', function () {
            var str = '$5.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(5.00, '5.00', 5, 0.00, 1);
            assertNewPrice(null, null, null, null, null);
            assertParts('$', '5', '.', '00', false);
        });

        it('should not round the price $0.00 -> $10.00', function () {
            var str = '$0.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(0.0, '0.00', 0, 0.0, 1);
            assertNewPrice(null, null, null, null, null);
            assertParts('$', '0', '.', '00', false);
        });
    });

    describe.skip('0 dollars rule', function () {
        before(function () {
            storage.options = $.extend(true, {}, optionsDefault);
            storage.options.roundRules.dollars = {
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

        it('should correctly round the price $117.00 -> $120.00', function () {
            var str = '$117.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(117.0, '117.00', 117, 0.0, 3);
            assertNewPrice(120, '120.00', 120, 0, 3);
            assertParts('$', '120', '.', '00');
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
            assertNewPrice(20, '20.00', 20, 0, 2);
            assertParts('$', '20', '.', '00');
        });

        it('should correctly round the price $9.00 -> $10.00', function () {
            var str = '$9.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(9.0, '9.00', 9, 0.0, 1);
            assertNewPrice(10, '10.00', 10, 0, 2);
            assertParts('$', '10', '.', '00');
        });

        it('should correctly round the price $0.00 -> $10.00', function () {
            var str = '$0.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(0.0, '0.00', 0, 0.0, 1);
            assertNewPrice(10, '10.00', 10, 0, 2);
            assertParts('$', '10', '.', '00');
        });
    });

    describe('9 tens rule', function () {
        before(function () {
            storage.options = $.extend(true, {}, optionsDefault);
            storage.options.roundRules.tens = {
                value: 9,
                enabled: true
            };
        });

        it('should correctly round the price $1090.00 -> $1100.00', function () {
            var str = '$1090.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(1090.0, '1090.00', 1090, 0.0, 4);
            assertNewPrice(1100, '1100.00', 1100, 0, 4);
            assertParts('$', '1100', '.', '00', false);
        });

        it('should correctly round the price $990.00 -> $1000.00', function () {
            var str = '$990.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(990.0, '990.00', 990, 0.0, 3);
            assertNewPrice(1000, '1000.00', 1000, 0, 4);
            assertParts('$', '1000', '.', '00', false);
        });

        it('should correctly round the price $90.00 -> $100.00', function () {
            var str = '$90.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(90.0, '90.00', 90, 0.0, 2);
            assertNewPrice(100, '100.00', 100, 0, 3);
            assertParts('$', '100', '.', '00', false);
        });

        it('should not round the price $1000.00 -> $1100.00', function () {
            var str = '$1000.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(1000.0, '1000.00', 1000, 0.0, 4);
            assertNewPrice(null, null, null, null, null);
            assertParts('$', '1000', '.', '00', false);
        });

        it('should not round the price $100.00 -> $200.00', function () {
            var str = '$100.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(100.0, '100.00', 100, 0.0, 3);
            assertNewPrice(null, null, null, null, null);
            assertParts('$', '100', '.', '00', false);
        });

        it('should not round the price $10.00 -> $100.00', function () {
            var str = '$10.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(10.00, '10.00', 10, 0.00, 2);
            assertNewPrice(null, null, null, null, null);
            assertParts('$', '10', '.', '00', false);
        });

        it('should not round the price $9.00 -> $100.00', function () {
            var str = '$9.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(9.0, '9.00', 9, 0.0, 1);
            assertNewPrice(null, null, null, null, null);
            assertParts('$', '9', '.', '00', false);
        });

        it('should not round the price $0.00 -> $100.00', function () {
            var str = '$0.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(0.0, '0.00', 0, 0.0, 1);
            assertNewPrice(null, null, null, null, null);
            assertParts('$', '0', '.', '00', false);
        });
    });

    describe('9 hundreds rule', function () {
        before(function () {
            storage.options = $.extend(true, {}, optionsDefault);
            storage.options.roundRules.hundreds = {
                value: 9,
                enabled: true
            };
        });

        it('should correctly round the price $10900.00 -> $11000.00', function () {
            var str = '$10900.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(10900.0, '10900.00', 10900, 0.0, 5);
            assertNewPrice(11000, '11000.00', 11000, 0, 5);
            assertParts('$', '11000', '.', '00', false);
        });

        it('should correctly round the price $9900.00 -> $10000.00', function () {
            var str = '$9900.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(9900.0, '9900.00', 9900, 0.0, 4);
            assertNewPrice(10000, '10000.00', 10000, 0, 5);
            assertParts('$', '10000', '.', '00', false);
        });

        it('should correctly round the price $900.00 -> $1000.00', function () {
            var str = '$900.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(900.0, '900.00', 900, 0.0, 3);
            assertNewPrice(1000, '1000.00', 1000, 0, 4);
            assertParts('$', '1000', '.', '00', false);
        });

        it('should not round the price $9000.00 -> $10000.00', function () {
            var str = '$9000.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(9000.0, '9000.00', 9000, 0.0, 4);
            assertNewPrice(null, null, null, null, null);
            assertParts('$', '9000', '.', '00', false);
        });

        it('should not round the price $1000.00 -> $2000.00', function () {
            var str = '$1000.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(1000.0, '1000.00', 1000, 0.0, 4);
            assertNewPrice(null, null, null, null, null);
            assertParts('$', '1000', '.', '00', false);
        });

        it('should not round the price $100.00 -> $1000.00', function () {
            var str = '$100.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(100.0, '100.00', 100, 0.0, 3);
            assertNewPrice(null, null, null, null, null);
            assertParts('$', '100', '.', '00', false);
        });

        it('should not round the price $10.00 -> $100.00', function () {
            var str = '$10.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(10.00, '10.00', 10, 0.00, 2);
            assertNewPrice(null, null, null, null, null);
            assertParts('$', '10', '.', '00', false);
        });

        it('should not round the price $9.00 -> $100.00', function () {
            var str = '$9.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(9.0, '9.00', 9, 0.0, 1);
            assertNewPrice(null, null, null, null, null);
            assertParts('$', '9', '.', '00', false);
        });

        it('should not round the price $0.00 -> $100.00', function () {
            var str = '$0.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(0.0, '0.00', 0, 0.0, 1);
            assertNewPrice(null, null, null, null, null);
            assertParts('$', '0', '.', '00', false);
        });
    });

    describe('99 cents rule + 9 dollars rule', function () {
        before(function () {
            storage.options = $.extend(true, {}, optionsDefault);
            storage.options.roundRules.cents = {
                value: 99,
                enabled: true
            };
            storage.options.roundRules.dollars = {
                value: 9,
                enabled: true
            };
        });

        it('should correctly round the price $108.99 -> $110.00', function () {
            var str = '$108.99', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(108.99, '108.99', 108, 0.99, 3);
            assertNewPrice(110, '110.00', 110, 0, 3);
            assertParts('$', '110', '.', '00', false);
        });

        it('should correctly round the price $9.99 -> $10.00', function () {
            var str = '$9.99', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(9.99, '9.99', 9, 0.99, 1);
            assertNewPrice(10, '10.00', 10, 0, 2);
            assertParts('$', '10', '.', '00', false);
        });

        it('should correctly round the price $9.50 -> $10.00', function () {
            var str = '$9.50', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(9.50, '9.50', 9, 0.50, 1);
            assertNewPrice(10, '10.00', 10, 0, 2);
            assertParts('$', '10', '.', '00', false);
        });

        it('should correctly round the price $7.99 -> $8.00', function () {
            var str = '$7.99', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(7.99, '7.99', 7, 0.99, 1);
            assertNewPrice(8, '8.00', 8, 0, 1);
            assertParts('$', '8', '.', '00', false);
        });

        it('should correctly round the price $0.99 -> $1.00', function () {
            var str = '$0.99', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(0.99, '0.99', 0, 0.99, 1);
            assertNewPrice(1, '1.00', 1, 0, 1);
            assertParts('$', '1', '.', '00', false);
        });

        it('should not round the price $5.50', function () {
            var str = '$5.50', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(5.5, '5.50', 5, 0.5, 1);
            assertNewPrice(null, null, null, null, null);
            assertParts('$', '5', '.', '50', false);
        });

        it('should not round the price $0.00', function () {
            var str = '$0.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(0.0, '0.00', 0, 0.0, 1);
            assertNewPrice(null, null, null, null, null);
            assertParts('$', '0', '.', '00', false);
        });
    });

    describe('60 cents + 4 dollars + 1 tens: cascade', function () {
        before(function () {
            storage.options = $.extend(true, {}, optionsDefault);
            storage.options.roundRules.tens = {
                value: 1,
                enabled: true
            };
        });

        it('should correctly cascade the price $8.7 -> $100.00 -> $8.7', function () {
            var str = '$8.7', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(8.7, '8.7', 8, 0.7, 1);
            assertNewPrice(null, null, null, null, null);
            assertParts('$', '8', '.', '70', false);
            assert.strictEqual(false, p.isChanged);

            storage.options.roundRules.dollars = {
                value: 4,
                enabled: true
            };

            p.update();

            assertOldPrice(8.7, '8.7', 8, 0.7, 1);
            assertNewPrice(100, '100.00', 100, 0, 3);
            assertParts('$', '100', '.', '00', false);
            assert.strictEqual(true, p.isChanged);

            p.reset();

            assertOldPrice(8.7, '8.7', 8, 0.7, 1);
            assertNewPrice(null, null, null, null, null);
            assertParts('$', '8', '.', '70', false);
            assert.strictEqual(false, p.isChanged);
        });
    });

    describe('HideZeroCents rule', function () {
        before(function () {
            storage.options = $.extend(true, {}, optionsDefault);
            storage.options.roundRules.cents = {
                value: 59,
                enabled: true
            };
            storage.options.otherRules.hideZeroCents = true;
        });

        it('should correctly hide cents $7.00 -> $7', function () {
            var str = '$7.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(7.0, '7.00', 7, 0.0, 1);
            assertNewPrice(null, null, null, null, null);
            assertParts('$', '7', '.', '00', true);
        });

        it('should correctly hide cents $700.00 -> $700', function () {
            var str = '$700.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(700.0, '700.00', 700, 0.0, 3);
            assertNewPrice(null, null, null, null, null);
            assertParts('$', '700', '.', '00', true);
        });

        it('should correctly hide cents after reset $7.00 -> $7.00 -> $7.00', function () {
            var str = '$7.00', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();
            assertOldPrice(7.0, '7.00', 7, 0, 1);
            assertNewPrice(null, null, null, null, null);
            assertParts('$', '7', '.', '00', true);

            p.reset();

            assertOldPrice(7, '7.00', 7, 0, 1);
            assertNewPrice(null, null, null, null, null);
            assertParts('$', '7', '.', '00', true);
        });
    });

    describe('enabled rule', function () {
        before(function () {
            storage.options = $.extend(true, {}, optionsDefault);
            storage.options.roundRules.cents = {
                value: 59,
                enabled: true
            };
            storage.options.otherRules.enabled = false;

            //console.log(storage.options);
        });

        it('should not round the price $9.99 -> $10.00', function () {
            var str = '$9.99', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(9.99, '9.99', 9, 0.99, 1);
            assertNewPrice(null, null, null, null, null);
            assertParts('$', '9', '.', '99', false);
        });

        it('should not round the price $0.99 -> $1.00', function () {
            var str = '$0.99', ns = nodify(str);

            p = pricepoint.create(str, ns);
            p.update();

            assertOldPrice(0.99, '0.99', 0, 0.99, 1);
            assertNewPrice(null, null, null, null, null);
            assertParts('$', '0', '.', '99', false);
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