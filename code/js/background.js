/* global require, chrome */

; (function () {
    console.log('BACKGROUND SCRIPT WORKS!');

    // here we use SHARED message handlers, so all the contexts support the same
    // commands. in background, we extend the handlers with two special
    // notification hooks. but this is NOT typical messaging system usage, since
    // you usually want each context to handle different commands. for this you
    // don't need handlers factory as used below. simply create individual
    // `handlers` object for each context and pass it to msg.init() call. in case
    // you don't need the context to support any commands, but want the context to
    // cooperate with the rest of the extension via messaging system (you want to
    // know when new instance of given context is created / destroyed, or you want
    // to be able to issue command requests from this context), you may simply
    // omit the `hadnlers` parameter for good when invoking msg.init()
    var handlers = require('./modules/handlers').create('bg'),
        storage = require('./modules/storage.js'),
        CONST = {
            optionsDefault: {
                roundRules: {
                    cents: {
                        value: 79,
                        enabled: true
                    },
                    dollars: {
                        value: 9,
                        enabled: true
                    },
                    tens: {
                        value: 9,
                        enabled: true
                    },
                    hundreds: {
                        value: 1,
                        enabled: true
                    }
                },
                otherRules: {
                    hideAllCents: false,
                    hideZeroCents: true
                }
            }
        };
    
    // adding special background notification handlers onConnect / onDisconnect
    function logEvent(ev, context, tabId) {
        console.log(ev + ': context = ' + context + ', tabId = ' + tabId);
    }

    // retrieve options from local storage if any
    chrome.storage.sync.get({
        options: CONST.optionsDefault
    }, function (items) {
        console.log('BG : Options loaded', items.options);
        storage.options = items.options;
    });    
    
    
    handlers.onConnect = logEvent.bind(null, 'onConnect');
    handlers.onDisconnect = logEvent.bind(null, 'onDisconnect');
    handlers.getOptions = function (done) {
        /*console.log('Showing icon for', this.port.sender.tab.id);        
        chrome.pageAction.show(this.port.sender.tab.id);*/

        console.log('BG : Sending options to tab', this.port.sender.tab.id, storage.options);
        done(storage.options);
    };

    var msg = require('./modules/msg').init('bg', handlers);

    // issue `echo` command in 10 seconds after invoked,
    // schedule next run in 5 minutes
    function helloWorld() {
        console.log('===== will broadcast "hello world!" in 10 seconds');
        setTimeout(function () {
            console.log('>>>>> broadcasting "hello world!" now');
            msg.bcast('echo', 'hello world!', function () {
                console.log('<<<<< broadcasting done');
            });
        }, 10 * 1000);
        setTimeout(helloWorld, 5 * 60 * 1000);
    }

    // start broadcasting loop
    helloWorld();

    // old code

    chrome.runtime.onMessage.addListener(
    function (request, sender) { //, sendResponse) {
        console.log(sender.tab ?
                    "from a content script:" + sender.tab.url :
                    "from the extension", request);

        /*if (request.greeting == "hello") {
            sendResponse({ farewell: "goodbye" });

            chrome.tabs.query({}, function (tabs) {
                var message = {
                    method: "clearLoop"
                };
                for (var i = 0; i < tabs.length; ++i) {
                    chrome.tabs.sendMessage(tabs[i].id, message);
                }
            });
        }*/

        switch (request.action) {
            case 'getOptions':

                chrome.storage.sync.get({
                    options: CONST.options
                }, function (items) {
                    console.log('Sending response');
                    //sendResponse(items);
                    chrome.tabs.sendMessage(sender.tab.id, {
                        action: 'optionsChanged',
                        options: items.options
                    });
                });

                break;

            case 'pricesChanged':
                console.log('Prices changed:', request.count);

                if (request.count > 0) {
                    chrome.pageAction.show(sender.tab.id);
                    /*chrome.pageAction.setTitle({
                        tabId: sender.tab.id,
                        title: 'Hey'
                    });*/
                } else {
                    chrome.pageAction.hide(sender.tab.id);
                }

                break;

            default:
                break;
        }
    });
})();