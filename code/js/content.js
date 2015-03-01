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
        thisTabId = null;

    //console.log(storage.options);

    handlers.rememberTabId = function (id) {
        thisTabId = id;
        
        msg.bg('getOptions', thisTabId, function (res) {
            console.log('PPNN - CT : Got initial options', storage.options, res);
            storage.options = res;

            /*mutant.init(function () {
                parser.purge();
                evolution();
            });*/

            evolution();
        });
    };

    handlers.optionsChanged = function (res) {
        console.log('PPNN - CT : Got new options', res);
        storage.options = res;        

        //mutant.stop();

        parser
            .parse()
            .updatePrices()
        ;
        // we don't notify background with found/updated prices yet
        //notifyBackground();

        //mutant.start();
    };

    parser.init();

    msg = msg.init('ct', handlers);

    function notifyBackground(arePricesDetected) {
        // maybe use this later for some inforamtional update; ignore now
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

    function evolution() {
        //mutant.stop();
        var arePricesDetected = parser.peek();

        parser
            .parse()
            .updatePrices();

        notifyBackground(arePricesDetected);

        //mutant.start();
    }

    console.log('PPNN - CT: jQuery version:', $().jquery);
})();