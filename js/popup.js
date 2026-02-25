
$(document).ready(async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  $(".iconImg").on("click", () => {
    $(".iconImg").toggle();
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: toggleSectionsExpand
    });  
  });
  
});

function toggleSectionsExpand() {
  document.querySelectorAll("section .opblock-tag .expand-operation").forEach(btn => btn.click());
}
