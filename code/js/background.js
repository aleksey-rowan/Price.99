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
        msg = require('./modules/msg'),
        storage = require('./modules/storage.js'),

        chWindows = {};

    // adding special background notification handlers onConnect / onDisconnect
    function logEvent(ev, context, tabId) {
        console.log(ev + ': context = ' + context + ', tabId = ' + tabId);
    }

    handlers.onConnect = function (ctxName, tabId) {
        if (ctxName === 'ct') {
            msg.cmd(tabId, ['ct'], 'rememberTabId',
                {
                    id: tabId,
                    isActive: isTabActive(tabId)
                });
        }

        logEvent('onConnect', ctxName, tabId);
    };
    //handlers.onConnect = logEvent.bind(null, 'onConnect');
    handlers.onDisconnect = logEvent.bind(null, 'onDisconnect');

    handlers.getOptions = function (tabId, done) {
        // get stored options
        //console.log('BG : Sending options to tab', this.port.sender.tab.id, storage.options);
        console.log('PPNN - BG: Sending options to tab', tabId, storage.options);
        storage.getOptions(function () {
            done(storage.options);
        });
    };

    handlers.optionsChanged = function (res) {
        console.log('PPNN - BG: Got new options', res);

        storage.options = res;

        for (var chWin in chWindows) {
            if (chWindows.hasOwnProperty(chWin)) {

                console.log('PPNN - BG: Sending new options to tab', chWindows[chWin]);
                msg.cmd(chWindows[chWin], ['ct'], 'optionsChanged', storage.options);
            }
        }
    };

    handlers.enabledChanged = function (info, tabId, done) {
        var senderId = tabId;
        console.log(info, senderId, tabId);

        if (info.enabled) {
            chrome.pageAction.setIcon({
                tabId: senderId,
                path: 'images/i_19.png'
            });
        } else {
            chrome.pageAction.setIcon({
                tabId: senderId,
                path: 'images/i_19_g.png'
            });
        }

        done("PPNN - BG: Pause / Resume state change received");
    };

    handlers.pricesDetected = function (info, tabId, done) {
        var senderId = tabId;
        console.log(info, senderId, tabId);

        if (info.detected) {
            chrome.pageAction.show(senderId);
        } else {
            chrome.pageAction.hide(senderId);
        }

        done("PPNN - BG: Price Detected update received");
    };

    handlers.pricesUpdated = function (info, tabId, done) {
        //var senderId = this.port.sender.tab.id;
        var senderId = tabId;
        console.log(info, senderId, tabId);

        if (info.updated > 0 || info.unchanged > 0) {
            if (info.updated === 0) {
                chrome.pageAction.show(senderId);
                /*chrome.pageAction.setIcon({
                    tabId: senderId,
                    path: 'images/icon_off.png'
                });*/
                chrome.pageAction.setTitle({
                    tabId: senderId,
                    title: "No updated prices"
                });
            } else {
                chrome.pageAction.show(senderId);
                /*chrome.pageAction.setIcon({
                    tabId: senderId,
                    path: 'images/icon_on.png'
                });*/
                chrome.pageAction.setTitle({
                    tabId: senderId,
                    title: "Price.99"
                });
            }
        } else {
            chrome.pageAction.hide(senderId);
        }

        done("good jo!");
    };

    handlers.openOptionsPage = function (done) {
        var optionsUrl = chrome.extension.getURL('html/options.html');

        chrome.tabs.query({ url: optionsUrl }, function (tabs) {
            if (tabs.length) {
                chrome.tabs.update(tabs[0].id, { active: true });
            } else {
                chrome.tabs.create({ url: optionsUrl });
            }

            done("PPNN - Options page opened!");
        });
    };

    // store which tab is active in what window
    chrome.tabs.onActiveChanged.addListener(function (tabId, windowId) {
        windowId = windowId.windowId;
        console.log('PPNN - BG: Active tab changed', tabId, windowId);

        // if there is already active tab in this window, make it inactive
        if (chWindows[windowId]) {
            //if (activeTabId) {
            setActiveTab(chWindows[windowId], false);
        }

        // if it's a tab, store it's id with a corresponding windwow and make it active
        if (tabId) {
            chWindows[windowId] = tabId;
            //activeTabId = tabId;
            setActiveTab(chWindows[windowId], true);
        }
    });

    function setActiveTab(tabId, isActive) {
        msg.cmd(tabId, ['ct'], 'setActive', isActive);
    }

    // checks if the given tabid is active
    function isTabActive(tabId) {
        for (var chWin in chWindows) {
            if (chWindows.hasOwnProperty(chWin)) {
                if (chWindows[chWin] === tabId) {
                    return true;
                }
            }
        }

        return false;
    }

    msg = msg.init('bg', handlers);

    // old code

    // issue `echo` command in 10 seconds after invoked,
    // schedule next run in 5 minutes
    /*function helloWorld() {
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
    helloWorld();*/

    //chrome.runtime.onMessage.addListener(
    //    function (request, sender) { //, sendResponse) {
    //        console.log(sender.tab ?
    //                    "from a content script:" + sender.tab.url :
    //                    "from the extension", request);

    //        /*if (request.greeting == "hello") {
    //            sendResponse({ farewell: "goodbye" });

    //            chrome.tabs.query({}, function (tabs) {
    //                var message = {
    //                    method: "clearLoop"
    //                };
    //                for (var i = 0; i < tabs.length; ++i) {
    //                    chrome.tabs.sendMessage(tabs[i].id, message);
    //                }
    //            });
    //        }*/

    //        switch (request.action) {
    //            /*case 'getOptions':

    //                chrome.storage.sync.get({
    //                    options: CONST.options
    //                }, function (items) {
    //                    console.log('Sending response');
    //                    //sendResponse(items);
    //                    chrome.tabs.sendMessage(sender.tab.id, {
    //                        action: 'optionsChanged',
    //                        options: items.options
    //                    });
    //                });

    //                break;*/

    //            case 'pricesChanged':
    //                console.log('Prices changed:', request.count);

    //                if (request.count > 0) {
    //                    chrome.pageAction.show(sender.tab.id);
    //                    /*chrome.pageAction.setTitle({
    //                        tabId: sender.tab.id,
    //                        title: 'Hey'
    //                    });*/
    //                } else {
    //                    chrome.pageAction.hide(sender.tab.id);
    //                }

    //                break;

    //            default:
    //                break;
    //        }
    //    }
    //);
})();