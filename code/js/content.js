/* global require, window */

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

        isNew = true,
        isActive = false,

        _isIgnored,
        _isWhitelisted,

        mutantNodes;

    //console.log(storage.options);

    /**
     * When the tab is new and gets it's id, it requests options from the background.
     * 
     */
    handlers.rememberTabId = function (data) {
        thisTabId = data.id;
        isActive = data.isActive;

        storeNewOptions(data.options);
        //getNewOptions();
    };

    /**
     * Handles setting tab active or inactive.
     * 
     */
    handlers.setActive = function (value) {
        isActive = value;

        console.log('PPNN - CT: I\'active', value);

        evolution();
    };

    handlers.optionsChanged = function (res) {
        console.log('PPNN - CT: Got new options', res);

        storeNewOptions(res);

        //mutant.stop();

        // we don't notify background with found/updated prices yet
        //notifyBackground();

        //mutant.start();
    };

    parser.init();

    msg = msg.init('ct', handlers);

    function getNewOptions() {
        msg.bg('getOptions', thisTabId, function (res) {
            console.log('PPNN - CT : Got options', storage.options, res);

            storeNewOptions(res);

            //mutant.init(function () {
            //    parser.purge();
            //    evolution();
            //});
        });
    }

    /**
     * Stores received options.
     * If passed object is empty - request options from background.
     * This only happens on the first tab loaded in a windows as the background didn't retrieve options yet.
     * 
     */
    function storeNewOptions(res) {
        if (res) {
            toggleIcon(res.otherRules.enabled);
            storage.options = res;
            // reset whitelist status to be rechecked
            _isWhitelisted = undefined;

            evolution();
        } else {
            getNewOptions();
        }
    }

    /**
     * 
     * @param {Boolean} enabled new global rule enabled value
     */
    function toggleIcon(enabled) {

        // change icon only if the enabled option changed or if it's a new page - toggle icon
        if (!storage.options || storage.options.otherRules.enabled !== enabled) {

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
    }

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
        var arePricesDetected;
        
        if (isIgnored()) {
            notifyBackground(false);

            return;
        }

        // parse if new and active; not just new
        if (isNew && isActive) {
            isNew = false;
            // if the page is new, peek and parse it
            arePricesDetected = parser.peek();
            notifyBackground(arePricesDetected);

            if (!isWhitelisted()) {
                parser
                    .parse()
                    .updatePrices()
                ;
            }


        } else if (mutantNodes && isActive) {
            // for future use with mutations
            /*
            parser
                .peek()
                .parse()
                .updatePrices()
            ;
            */
        } else if (isActive) {
            // update prices if the tab is active
            if (!isWhitelisted()) {
                parser
                    .parse()
                    .updatePrices()
                ;
            }
        }
        
        //mutant.start();
    }
    
    /**
     * Checks if the tab page is in the ignore list. Check once and store the result as the ignore list cannot be dynamically changed.
     */
    function isIgnored() {
        var ignorelistDefault = storage.defaults.ignorelistDefault,
            reg,
            url = window.location.href;

        if (typeof _isIgnored === "undefined") {

            _isIgnored = false;

            ignorelistDefault.items.forEach(function (item) {
                reg = new RegExp(item.reg);

                if (reg.test(url)) {
                    console.log('PPNN - CT: Ignored page detected:', item.name);

                    _isIgnored = true;
                }
            });
        }

        return _isIgnored;
    }

    function isWhitelisted(force) {
        var whitelist = storage.options.whitelist,
            whitelistDefault = storage.defaults.whitelistDefault,
            
            url = window.location.href;
    
        if (typeof _isWhitelisted === "undefined" || force) {
            _isWhitelisted = false;

            if (whitelist.defaultsEnabled) {

                whitelistDefault.items.forEach(function (item) {
                    if (url.indexOf(item.url) !== -1) {
                        console.log('PPNN - CT: Whitelisted page detected:', item.name);
                        _isWhitelisted = true;
                    }

                });
            }

            if (whitelist.enabled) {

                whitelist.items.forEach(function (item) {
                    if (url.indexOf(item.url) !== -1) {
                        console.log('PPNN - CT: User-whitelisted page detected:', item.url);
                        _isWhitelisted = true;
                    }

                });
            }
        }

        if (_isWhitelisted) {
            console.log('PPNN - CT: Page is whitelisted');
        }

        return _isWhitelisted;
    }

    console.log('PPNN - CT: jQuery version:', $().jquery);
})();