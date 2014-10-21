/* global window, document */

var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
    timeOutFlag,
    observer;

module.exports = {

    init: function (callback) {
        observer = new MutationObserver(function (mutations, observer) {
            //console.log(mutations, observer);

            if (timeOutFlag) {
                window.clearTimeout(timeOutFlag);
            }

            timeOutFlag = window.setTimeout(function () {
                console.log('Mutations belong to us.');

                //module.exports.stop();
                //observer.disconnect();
                callback(mutations, observer);
            }, 300);
        });
    },

    stop: function () {
        window.clearTimeout(timeOutFlag);
        observer.disconnect();

        console.log("Mutant is sleeping ...");
    },

    start: function () {
        // define what element should be observed by the observer
        // and what types of mutations trigger the callback
        observer.observe(document, {
            subtree: true,
            childList: true
        });

        console.log("Mutant is watching you ...");
    }
};