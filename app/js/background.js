/* global chrome */

var buddy,
    CONST = {
        options: {
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

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
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