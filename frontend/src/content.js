/*global chrome*/
/* src/content.js */
// import "./content.css";

var currentWindow = null;
var hasLaunched = false;

console.log("im in content.js")
 var launch = function(callback) {
  chrome.window.create('index.html', {
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

chrome.runtime.onMessage.addListener(
   function(request, sender, sendResponse) {
      if( request.message === "clicked_browser_action") {
        window.console.log('wow', request);

      }
   }
);
