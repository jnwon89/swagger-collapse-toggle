$(document).ready(async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let apiInfo = "";
  let tokenSavelessOption = false;

  await chrome.storage.local.get(['apiInfo', 'tokenSavelessOption'], (item) => {
    apiInfo = item.apiInfo == null || undefined? "" : item.apiInfo;
    tokenSavelessOption = item.tokenSavelessOption == null || undefined? false : item.tokenSavelessOption

    if(apiInfo != "") {
      $('#token_dashboard').html('<span style="color:blue">Access 토큰 저장됨</span><br>(' + apiInfo + ')');
      $('#delete_token').show();
    }
    $('#is_token_saveless').prop('checked', tokenSavelessOption);
  });

  // END OF INIT.


  $('#delete_token').on("click", () => {
    clearStorage();
  });

  $('#is_token_saveless').on("click", () => {
    if($('#is_token_saveless').is(':checked')) {
      clearStorage();
      tokenSavelessOption = true;
    }
    else {
      tokenSavelessOption = false;
    }
    chrome.storage.local.set({tokenSavelessOption: tokenSavelessOption});
  });


  $(".iconImg").on("click", () => {
    // $(".iconImg").toggle();
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: toggleSectionsExpand
    });  
  });
  
});

function clearStorage() {
  chrome.storage.local.remove(['token', 'apiInfo']);
  $('#token_dashboard').html("");
  $('#delete_token').hide();
}

function toggleSectionsExpand() {
  document.querySelectorAll("section .opblock-tag .expand-operation").forEach(btn => btn.click());
  document.querySelectorAll(".models-control").forEach(btn => btn.click());
}
