chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");

      console.log(request);

      if (request.greeting == "hello") {
          sendResponse({ farewell: "goodbye" });

          chrome.tabs.query({}, function (tabs) {
              var message = {
                  method: "clearLoop"
              };
              for (var i = 0; i < tabs.length; ++i) {
                  chrome.tabs.sendMessage(tabs[i].id, message);
              }
          });
      }
  });


