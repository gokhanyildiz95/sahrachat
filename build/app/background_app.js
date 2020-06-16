// Called when the user clicks on the browser action
// chrome.browserAction.onClicked.addListener(function(tab) {
//    // Send a message to the active tab
//    chrome.tabs.query({active: true, currentWindow:true},function(tabs) {
//         var activeTab = tabs[0];
//         chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
//    });
// });
var currentWindow = null;
var hasLaunched = false;

 
 var launch = function(callback) {
  chrome.app.window.create('index.html', {
      "bounds": {
        "width": 1100,
        "height": 770
      }
    }, function(createdWindow) {
      currentWindow = createdWindow;

      createdWindow.onClosed.addListener(function (event) {
        window.console.log('window closed');
        currentWindow = null;
        hasLaunched = false;
      });

      callback(createdWindow);
    }
  );
};

chrome.app.runtime.onLaunched.addListener(function(event) {
  window.console.log('wow', event);

  if (!hasLaunched) {
    launch(function() {
    });

    hasLaunched = true;
  }
});