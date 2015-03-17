/* global require */

; (function () {
    console.log('CONTENT SCRIPT WORKS!');

    var $ = require('./libs/jquery-1.11.1.min'),
    // here we use SHARED message handlers, so all the contexts support the same
    // commands. but this is NOT typical messaging system usage, since you usually
    // want each context to handle different commands. for this you don't need
    // handlers factory as used below. simply create individual `handlers` object
    // for each context and pass it to msg.init() call. in case you don't need the
    // context to support any commands, but want the context to cooperate with the
    // rest of the extension via messaging system (you want to know when new
    // instance of given context is created / destroyed, or you want to be able to
    // issue command requests from this context), you may simply omit the
    // `handlers` parameter for good when invoking msg.init()
        handlers = require('./modules/handlers').create('ct'),
        msg = require('./modules/msg'),
        parser = require('./modules/parser'),
        storage = require('./modules/storage'),
        //mutant = require('./modules/mutant'),

        thisTabId = null,
        isActive = false;

    //console.log(storage.options);

    function toggleIcon(enabled) {
        // TODO: have individual settings for each page
        // notify bg to turn the icon on the page grey
        msg.bg('enabledChanged',
            {
                enabled: enabled
            },
            thisTabId,
            function (res) {
                console.log(res);
            }
        );
    }

    handlers.rememberTabId = function (data) {
        thisTabId = data.id;
        isActive = data.isActive;

        msg.bg('getOptions', thisTabId, function (res) {
            console.log('PPNN - CT : Got initial options', storage.options, res);

            toggleIcon(res.otherRules.enabled);

            storage.options = res;

            /*mutant.init(function () {
                parser.purge();
                evolution();
            });*/

            // do not parse on creation
            //evolution();
            evolution();
        });
    };

    /**
     * Handles setting tab active or inactive.
     * 
     */
    handlers.setActive = function (value) {
        isActive = value;

        console.log('PPNN - CT: I\'active', value);

        if (isActive) {
            parser
                .parse()
                .updatePrices()
            ;
        }
    };

    handlers.optionsChanged = function (res) {
        console.log('PPNN - CT: Got new options', res);

        if (storage.options.otherRules.enabled !== res.otherRules.enabled) {
            toggleIcon(res.otherRules.enabled);
        }

        storage.options = res;

        //mutant.stop();
        if (isActive) {
            parser
                .parse()
                .updatePrices()
            ;
        }
        // we don't notify background with found/updated prices yet
        //notifyBackground();

        //mutant.start();
    };

    parser.init();

    msg = msg.init('ct', handlers);

    function notifyBackground(arePricesDetected) {
        // maybe use this later for some informational update; ignore now
        //var ppUpdated,
        //    ppUnchanged,
        //    pps;

        //pps = parser.getPricePoints();
        //ppUpdated = pps.filter(function (pp) { return pp.isChanged; });
        //ppUnchanged = pps.filter(function (pp) { return !pp.isChanged; });

        //msg.bg('pricesUpdated',
        //    {
        //        updated: ppUpdated.length,
        //        unchanged: ppUnchanged.length
        //    },
        //    thisTabId,
        //    function (res) {
        //        console.log(res);
        //    });

        msg.bg('pricesDetected',
            {
                detected: arePricesDetected
            },
            thisTabId,
            function (res) {
                console.log(res);
            });
    }

    // isActive set to false, means only peeking to see if there are prices
    function evolution() {
        //mutant.stop();
        var arePricesDetected = parser.peek();

        if (isActive) {
            parser
                .parse()
                .updatePrices();
        }

        notifyBackground(arePricesDetected);

        //mutant.start();
    }

    console.log('PPNN - CT: jQuery version:', $().jquery);
})();