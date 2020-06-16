var currentWindow = null;
var hasLaunched = false;


const launch = function() {
  chrome.windows.create({url: chrome.extension.getURL("index.html"), type: "popup"},
  function(createdWindow) {
    console.log("new window", createdWindow)
    currentWindow = createdWindow;
    chrome.storage.sync.set({ "window_id": currentWindow.id }, function(){
      //  A data saved callback omg so fancy
    });

    createdWindow.onClosed.addListener(function (event) {
      console.log('window closed');
      currentWindow = null;
      hasLaunched = false;
    });
  });
}

openOrFocus = () => {
  if (!currentWindow) 
    launch();
  else
    chrome.windows.update(currentWindow.id, {focused: true}, function() {
      // focus window if exists and create one if there was en error
      if (chrome.runtime.lastError) {
        launch();
      }
    });
}



function onMessage(a) {

  console.log("new message", a)
}

chrome.contextMenus.create({
  title: "Mobiphone Kullanarak Ara",
  contexts:["selection"],  // ContextType
  onclick: openOrFocus // A callback function
 });

function getCookies(windowId) {
  console.log("getting cookies with wid", windowId);
  chrome.cookies.getAll({ domain: 'mobikob.com', name: 'sessionid' },
    function (cookies) {
      if (cookies) {
        console.log("got the sesid", cookies);
        // user logged in multiple sth domains
        if ( cookies.length > 0) {
          // TODO 
          cookies.forEach((cookie) => {})
        } else {
          let cookie = cookies[0];
          let sessionid = cookie.value;
        }
      }
      else {
        console.log('Can\'t get cookie! Check the name!');
      }
  });
}


chrome.browserAction.onClicked.addListener(function(tab) {
  // Send a message to the active tab
  /*
  chrome.tabs.query({active: true, currentWindow:true},function(tabs) {
       var activeTab = tabs[0];
       chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
  });
  */
 openOrFocus();
}); 
 
chrome.runtime.onInstalled.addListener(function(a) {
  console.log("hiii")
  onMessage(a)
});