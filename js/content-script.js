$(document).ready(async () => {
    let token = "";

    await chrome.storage.local.get(['token'], (item) => {
        token = item.token == null || undefined? "" : item.token;
    });

    const RESPONSE_THRESHOLD = 5;
    const option = {
        attributes: false,
        characterData: false,
        childList: true,
        subtree: true
    };
    
    const opBlockObserver = new MutationObserver(getTokenAndSet);
    opBlockObserver.observe(document.getElementById('swagger-ui'), option);

    function getTokenAndSet() {
        if(token != "") {
            const healthCheck = setToken(token);
            if(healthCheck) token = "";
        }
        
        $('.responses-wrapper span.headerline').each((index, item) => {
            if(item.innerText.indexOf('date: ') >= 0) {
                const responseOffset = (Date.now() - Date.parse(item.innerText.split('date: ')[1]))/1000;
                if(responseOffset < RESPONSE_THRESHOLD) {
                    const $opBlockRoot = $(item).closest('.opblock-post');
                    const apiNameString = $opBlockRoot.find('.opblock-summary-control').first().text();
                    if(apiNameString.indexOf('/login') > 0 && $opBlockRoot.find('.live-responses-table tbody td.response-col_status').first().text() == '200') {
                        chrome.storage.local.get(['tokenSavelessOption'], (item) => {
                            tokenSavelessOption = item.tokenSavelessOption == null || undefined? false : item.tokenSavelessOption;
                            const jsonString = $opBlockRoot.find('.live-responses-table code.language-json').text();
                            const accessToken = JSON.parse(jsonString).accessToken;
                            const health = setToken(accessToken);
                            if(!tokenSavelessOption && health) {
                                const apiInfo = apiNameString.replace('\/', " \/").replace('\/login', "\/login ");
                                chrome.storage.local.set({token: accessToken, apiInfo: apiInfo});
                            }
                        });
                    }
                }
            }
        })
    }

    $(document).on('click', 'button.btn.modal-btn.auth.authorize.button', function() {
        $('#auth-bearer-value').closest('.wrapper').find('label').first().html('Value:')
    })
});

function setToken(accessToken) {
    $('button.btn.authorize.unlocked').first().click();
    $('#auth-bearer-value').val(accessToken);
    $('#auth-bearer-value').focus();
    const htmlToAppend = '<span style="color:salmon"><b>스페이스바를 한 번 누른 후 Authorize 버튼을 누르세요!</b></span>';
    $('#auth-bearer-value').closest('.wrapper').find('label').first().html(htmlToAppend);
    return $('#auth-bearer-value').val() != undefined? true : false;
}