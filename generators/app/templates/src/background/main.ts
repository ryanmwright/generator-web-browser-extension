//example of using a message handler from the inject scripts
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    // Do something
    sendResponse('hello');
  });