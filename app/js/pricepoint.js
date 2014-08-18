/* global $, chrome */

//Price.99

$(document).on("change", function () {
    console.log("I've changed!");
});

/*chrome.runtime.sendMessage({ greeting: "hello" }, function (response) {
    console.log('hello ->', response.farewell);
});

chrome.runtime.sendMessage({ greeting: 'getOptions' }, function (response) {
    console.log('getOptions ->', response.farewell);
});

  */
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

                /*this.oldPrice.valueString = text.replace(/[$£€￥₠₡₢₣₤₥₦₧₨₩₪₫₭₮₯₰₱₲₳₴₵₶₷₸₹₺]/, ""),
                this.oldPrice.value = parseFloat(this.oldPrice.valueString);
                this.oldPrice.whole = parseInt(this.oldPrice.valueString);
                this.oldPrice.fraction = parseFloat((this.oldPrice.value % 1).toFixed(2), 10);
                this.oldPrice.decimalMarkIndex = this.oldPrice.valueString.indexOf(".");*/

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
                if (this.oldPrice.fraction > 0.3) {
                    var ps = Math.ceil(this.oldPrice.value).toFixed(2);

                    this.setPrice(this.newPrice, ps);

                    return true;
                } else {
                    return false;
                }
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

                this.parts.decimalMark
                    .attr({
                        title: "Old price: " + this.oldPrice.value,
                        class: 'ppnn-invisible'
                    });

                for (i = 0; i < fractionString.length; i++) {
                    this.parts.fraction[i]
                        .text(fractionString[i])
                        .attr({
                            title: "Old price: " + this.oldPrice.value,
                            class: 'ppnn-invisible'
                        });
                }
            },

            update: function () {
                if (this.recalculatePrice()) {
                    this.synchronize(this.newPrice);
                    this.isChanged = true;
                }
            },

            reset: function () {
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
        array = [];

    console.log("Price.99's here");

    chrome.runtime.sendMessage({ action: 'getOptions' });

    chrome.runtime.onMessage.addListener(
      function (request, sender, sendResponse) {
          console.log(sender.tab ?
                      "from a content script:" + sender.tab.url :
                      "from the extension", request);

          switch (request.action) {
              case "optionsChanged":
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

              default:
                  break;
          }
      });

    nodes.highlightRegex(/[$£€￥₠₡₢₣₤₥₦₧₨₩₪₫₭₮₯₰₱₲₳₴₵₶₷₸₹₺.\d]/ig, {
        tagType: "ppnn"
    });

    /*nodes.highlightRegex(/[.]/ig, { //nodes.highlightRegex(/[.,]/ig, {
        tagType: "ppnn",
        className: "ppnn-decimal-mark"
    });*/

    /*nodes.highlightRegex(/[aeiouy]/ig, {
        tagType: "ppnn",
        className: "ppnn-vowel"
    });*/

    /*nodes.highlightRegex(/\d/ig, {
        tagType: "ppnn",
        className: "ppnn-digit"
    });*/

    /*$("body").highlightRegex(/(-)?(\d+)((.|,)\d{2})?/ig, {
        tagType: "price",
        className: "number"
    });*/

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

        return;

        //if (elm.hasClass("ppnn-currency-symbol")) {
        //    array.push([elm]);
        //} else if (array.length > 0) {
        //    t = array[array.length - 1];
        //    t.push(elm);
        //}
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

            /*price = {
                valueString: m[0].replace(/[$£€￥₠₡₢₣₤₥₦₧₨₩₪₫₭₮₯₰₱₲₳₴₵₶₷₸₹₺]/, ""),

                parts: {
                    currencySign: null,
                    whole: [],
                    decimalMark: null,
                    fraction: []
                }
            };

            price.value = parseFloat(price.valueString);

            //console.log("match", price, elm);

            // discard prices more than 99,999
            if (price.value <= 99999) {
                price.valueArray = price.valueString.split("");
                price.fraction = parseFloat((price.value % 1).toFixed(2), 10);
                price.nodes = elm.splice(0, price.valueString.length + 1);

                var decimalMarkIndex = price.valueArray.indexOf(".") + 1,
                    whole, fraction, i;

                price.parts.currencySign = price.nodes[0];
                price.parts.whole = price.nodes.slice(1, decimalMarkIndex);
                price.parts.decimalMark = price.nodes[decimalMarkIndex];
                price.parts.fraction = price.nodes.slice(decimalMarkIndex + 1);

                //console.log("match", price);

                if (price.fraction > 0.3) {
                    ps = Math.ceil(price.value).toFixed(2);
                    decimalMarkIndex = ps.indexOf(".");
                    price.newValue = parseFloat(ps, 10);

                    whole = ps.substring(0, decimalMarkIndex);
                    fraction = ps.substring(decimalMarkIndex + 1);

                    if (decimalMarkIndex > price.parts.whole.length) {
                        var x = price.parts.whole[price.parts.whole.length - 1],
                            xclone = x.clone();

                        price.parts.whole.push(xclone)
                        x.after(xclone);
                    }

                    for (i = 0; i < whole.length; i++) {
                        price.parts.whole[i]
                            .text(whole[i])
                            .attr("title", "Old price: " + price.value);
                            //.css("text-decoration", "underline");
                        //.css("background-color", "red");
                    }

                    price.parts.decimalMark
                        .attr("title", "Old price: " + price.value);
                        //.css("text-decoration", "underline");

                    for (i = 0; i < fraction.length; i++) {
                        price.parts.fraction[i]
                            .text(fraction[i])
                            .attr("title", "Old price: " + price.value);
                            //.css("text-decoration", "underline");
                            //.css("background-color", "blue");
                    }
                }

                // filter garbage nodes
                //elm = elm.splice(price.valueString.length);

                //console.log("match", m, "->", (m.replace(/[$£€￥₠₡₢₣₤₥₦₧₨₩₪₫₭₮₯₰₱₲₳₴₵₶₷₸₹₺]/, "") % 1).toFixed(2), "||", value);
            }
            */
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

    //"1324.42".match(/^(-)?(\d+)((.|,)\d{2})/ig)

    //$(".number").each(function (i, elm) { var num = parseFloat($(elm).text(), 10), trail = (num % 1).toFixed(2); if (trail >= .9) { console.log(num, Math.round(num)); $(elm).text(Math.round(num)); } })
}());