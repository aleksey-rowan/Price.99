/* global $ */

//Price.99    

$(document).on("change", function () {
    console.log("I've changed!");
});

//$(document).ready(function () {
    "use strict";
    console.log("hey!");

    var nodes = $("body").children(":not('script, style')"), //$("body").children().not("script");
        array = [];

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
        }

        return;


        if (elm.hasClass("ppnn-currency-symbol")) {
            array.push([elm]);
        } else if (array.length > 0) {
            t = array[array.length - 1];
            t.push(elm);
        }
    });

    array.forEach(function (elm) {
        var value = elm.map(function (e) { return e.text(); }).join(""),
            m = value.match(/^[$£€￥₠₡₢₣₤₥₦₧₨₩₪₫₭₮₯₰₱₲₳₴₵₶₷₸₹₺](\d+)((.|,)\d{2})?/ig),
            price,
            ps;

        if (m) {
            price = {
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
                            .attr("title", "Old price: " + price.value)
                            .css("text-decoration", "underline");
                        //.css("background-color", "red");

                    }

                    price.parts.decimalMark
                        .attr("title", "Old price: " + price.value)
                        .css("text-decoration", "underline");

                    for (i = 0; i < fraction.length; i++) {
                        price.parts.fraction[i]
                            .text(fraction[i])
                            .attr("title", "Old price: " + price.value)
                            .css("text-decoration", "underline");
                            //.css("background-color", "blue");
                    }
                }

                // filter garbage nodes
                //elm = elm.splice(price.valueString.length);

                //console.log("match", m, "->", (m.replace(/[$£€￥₠₡₢₣₤₥₦₧₨₩₪₫₭₮₯₰₱₲₳₴₵₶₷₸₹₺]/, "") % 1).toFixed(2), "||", value);
            }            
        } else {
            //console.log("garbage", value);
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
//});