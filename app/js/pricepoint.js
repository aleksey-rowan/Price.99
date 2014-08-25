/* global $, chrome */

//Price.99

/*$(document).on("change", function () {
    console.log("I've changed!");
});*/

/*chrome.runtime.sendMessage({ greeting: "hello" }, function (response) {
    console.log('hello ->', response.farewell);
});

chrome.runtime.sendMessage({ greeting: 'getOptions' }, function (response) {
    console.log('getOptions ->', response.farewell);
});

  */

// package/lib is a dependency we require
define(["package/lib"], function (lib) {
    // behavior for our module
    function foo() {
        lib.log("hello world!");
    }

    // export (expose) foo to other modules as foobar
    return {
        foobar: foo
    }
});

(function () {
    "use strict";

    var buddy,
        CONST = {
            CURRENCY_SIGNS: '$£€￥₠₡₢₣₤₥₦₧₨₩₪₫₭₮₯₰₱₲₳₴₵₶₷₸₹₺'
        },
        event = {
            GET_OPTIONS: "getOptions",
            OPTIONS_UPDATED: "optionsUpdated",
            RESET: "reset"
        },
        options,
        pricePoint = {
            init: function (text, nodes) {
                $.extend(this, {
                    oldPrice: {
                        value: null,
                        valueString: null,
                        whole: null,
                        fraction: null,
                        decimalMarkIndex: null,
                    },
                    newPrice: {
                        value: null,
                        valueString: null,
                        whole: null,
                        fraction: null,
                        decimalMarkIndex: null,
                    },
                    parts: {
                        currencySign: null,
                        whole: [],
                        decimalMark: null,
                        fraction: []
                    },
                    nodes: []
                });

                // keep string and parsed price
                this.setPrice(this.oldPrice, text);

                this.nodes = nodes.splice(0, this.oldPrice.valueString.length + 1);

                this.parts.currencySign = this.nodes[0]; // count currency sign when slicing up the node array
                this.parts.whole = this.nodes.slice(1, this.oldPrice.decimalMarkIndex + 1);
                this.parts.decimalMark = this.nodes[this.oldPrice.decimalMarkIndex + 1];
                this.parts.fraction = this.nodes.slice(this.oldPrice.decimalMarkIndex + 2);

                return this;
            },

            setPrice: function (target, text) {
                target.valueString = text.replace(/[$£€￥₠₡₢₣₤₥₦₧₨₩₪₫₭₮₯₰₱₲₳₴₵₶₷₸₹₺]/, ""),
                target.value = parseFloat(target.valueString);
                target.whole = parseInt(target.valueString);
                target.fraction = parseFloat((target.value % 1).toFixed(2), 10);
                target.decimalMarkIndex =
                    target.valueString.indexOf(".") !== -1 ? target.valueString.indexOf(".") : target.valueString.length;
            },

            recalculatePrice: function () {
                var isRounded = false,
                    roundRules = options.roundRules,
                    roundedPrice = this.oldPrice.value,
                    temp;

                if (roundRules.cents.enabled
                    && parseFloat((roundedPrice % 1).toFixed(2), 10) >= roundRules.cents.value / 100) {
                    roundedPrice = Math.ceil(roundedPrice);
                    isRounded = true;
                }

                if (roundRules.dollars.enabled) {
                    temp = util.getDigit(roundedPrice, 0);

                    if (temp >= roundRules.dollars.value) {
                        roundedPrice = Math.floor(roundedPrice) + 10 - temp;
                        isRounded = true;
                    }
                }

                if (roundRules.tens.enabled) {
                    temp = util.getDigit(roundedPrice, 1);

                    if (temp >= roundRules.tens.value) {
                        roundedPrice = Math.floor(roundedPrice) + 100 - (temp * 10) - util.getDigit(roundedPrice, 0);
                        isRounded = true;
                    }
                }

                if (roundRules.hundreds.enabled) {
                    temp = util.getDigit(roundedPrice, 2);

                    if (temp >= roundRules.hundreds.value) {
                        roundedPrice = Math.floor(roundedPrice) + 1000 - (temp * 100) - (util.getDigit(roundedPrice, 1) * 10) - util.getDigit(roundedPrice, 0);
                        isRounded = true;
                    }
                }

                if (isRounded) {
                    this.setPrice(this.newPrice, parseInt(roundedPrice, 10).toFixed(2));
                    return true;
                } else {
                    return false;
                }

                /*if (this.oldPrice.fraction > 0.3) {
                    var ps = Math.ceil(this.oldPrice.value).toFixed(2);

                    this.setPrice(this.newPrice, ps);

                    return true;
                } else {
                    return false;
                }*/

                //return isRounded;
            },

            synchronize: function (targetPrice) {
                var node,
                    nodeClone,
                    i,
                    wholeString = targetPrice.valueString.substring(0, targetPrice.decimalMarkIndex),
                    fractionString = targetPrice.valueString.substring(targetPrice.decimalMarkIndex + 1);

                if (targetPrice.decimalMarkIndex > this.parts.whole.length) {
                    node = this.parts.whole[this.parts.whole.length - 1],
                    nodeClone = node.clone();

                    this.parts.whole.push(nodeClone);
                    node.after(nodeClone);
                } else if (targetPrice.decimalMarkIndex < this.parts.whole.length) {
                    this.parts.whole
                        .pop()
                        .remove();
                }

                for (i = 0; i < wholeString.length; i++) {
                    this.parts.whole[i]
                        .text(wholeString[i])
                        .attr({
                            title: "Old price: " + this.oldPrice.value
                        });
                }

                if (this.parts.decimalMark) {
                    this.parts.decimalMark
                        .attr({
                            title: "Old price: " + this.oldPrice.value,
                            class: 'ppnn-invisible'
                        });
                }

                if (this.parts.fraction.length > 0) {
                    for (i = 0; i < fractionString.length; i++) {
                        this.parts.fraction[i]
                            .text(fractionString[i])
                            .attr({
                                title: "Old price: " + this.oldPrice.value,
                                class: 'ppnn-invisible'
                            });
                    }
                }
            },

            update: function () {
                if (this.recalculatePrice()) {
                    this.synchronize(this.newPrice);
                    this.isChanged = true;
                }
            },

            reset: function () {
                this.setPrice(this.oldPrice);
                this.synchronize(this.newPrice);
                this.isChanged = false;
            },

            isChanged: false,

            oldPrice: null,
            newPrice: null,
            parts: null,
            nodes: null
        },
        pricePoints = [],
        garbage = [],
        nodes = $("body").children(":not('script, style')"), //$("body").children().not("script"),
        array = [],

        parser,
        util;

    parser = (function () {
        return {
        };
    }());

    util = (function () {
        return {
            getDigit: function (N, n) {
                return Math.floor(N / (Math.pow(10, n)) % 10);
            }
        };
    }());

    console.log("Price.99's here");

    return;

    chrome.runtime.sendMessage({ action: 'getOptions' });

    chrome.runtime.onMessage.addListener(
      function (request, sender, sendResponse) {
          console.log(sender.tab ?
                      "from a content script:" + sender.tab.url :
                      "from the extension", request);

          switch (request.action) {
              case "optionsChanged":
                  options = request.options;

                  console.log('Tab: new options received');

                  var count = 0;

                  pricePoints.forEach(function (pp) {
                      pp.update();
                      count += pp.isChanged ? 1 : 0;
                  });

                  chrome.runtime.sendMessage({
                      action: 'pricesChanged',
                      count: count
                  });

                  break;

              case "reset":
                  var count = 0;

                  pricePoints.forEach(function (pp) {
                      pp.reset();
                      count += pp.isChanged ? 1 : 0;
                  });

                  chrome.runtime.sendMessage({
                      action: 'pricesChanged',
                      count: count
                  });

              default:
                  break;
          }
      });

    nodes.highlightRegex(/[$£€￥₠₡₢₣₤₥₦₧₨₩₪₫₭₮₯₰₱₲₳₴₵₶₷₸₹₺.\d]/ig, {
        tagType: "ppnn"
    });

    $("ppnn").each(function (i, elm) {
        var t;
        elm = $(elm);

        if (elm.text() === "$") {
            array.push([elm]);
        } else if (array.length > 0) {
            t = array[array.length - 1];
            t.push(elm);
        } else {
            garbage.push(elm);
        }
    });

    unwrapNodes(garbage);

    array.forEach(function (elm) {
        var value = elm.map(function (e) { return e.text(); }).join(""),
            m = value.match(/^[$£€￥₠₡₢₣₤₥₦₧₨₩₪₫₭₮₯₰₱₲₳₴₵₶₷₸₹₺](\d+)((.|,)\d{2})?/ig),
            price,
            ps;

        if (m) {
            console.log("match", m[0], "->", (parseFloat(m[0].replace(/[$£€￥₠₡₢₣₤₥₦₧₨₩₪₫₭₮₯₰₱₲₳₴₵₶₷₸₹₺]/, "")) % 1).toFixed(2), "||", value);
            pricePoints.push(Object.create(pricePoint).init(m[0], elm));
        } else {
            console.log("garbage", value);
        }

        // release garbage nodes
        unwrapNodes(elm);
    });

    function unwrapNodes(nodes) {
        nodes.forEach(function (n) {
            n.contents().unwrap();
        });
    }

    // Mutation Observers
    /*
    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    var timeOutFlag;

    var observer = new MutationObserver(function (mutations, observer) {
        console.log(mutations, observer);

        if (timeOutFlag) {
            window.clearTimeout(timeOutFlag);
        }

        timeOutFlag = window.setTimeout(function () {
            console.log('Mutations finished');
        }, 200);
    });

    // define what element should be observed by the observer
    // and what types of mutations trigger the callback
    observer.observe(document, {
        subtree: true,
        childList: true
    });
    */
}());