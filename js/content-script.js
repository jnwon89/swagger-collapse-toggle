$(document).ready(async () => {
    let token = "";
    let respTime = "";

    await chrome.storage.local.get(['token', 'rspTime'], (item) => {
        token = item.token == null || undefined? "" : item.token;
        respTime = item.rspTime;
    });

    const RESPONSE_THRESHOLD = 10;
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
            const healthCheck = setToken(token, respTime);
            if(healthCheck) token = "";
        }
        
        $('.responses-wrapper span.headerline').each((index, item) => {
            if(item.innerText.indexOf('date: ') >= 0) {
                const rspTime = Date.parse(item.innerText.split('date: ')[1]);
                const responseOffset = (Date.now() - rspTime)/1000;
                if(responseOffset < RESPONSE_THRESHOLD) {
                    const $opBlockRoot = $(item).closest('.opblock-post');
                    const apiNameString = $opBlockRoot.find('.opblock-summary-control').first().text();
                    if(apiNameString.indexOf('/login') > 0 && $opBlockRoot.find('.live-responses-table tbody td.response-col_status').first().text() == '200') {
                        chrome.storage.local.get(['tokenSavelessOption'], (item) => {
                            const tokenSavelessOption = item.tokenSavelessOption == null || undefined? false : item.tokenSavelessOption;
                            const jsonString = $opBlockRoot.find('.live-responses-table code.language-json').text();
                            const accessToken = JSON.parse(jsonString).accessToken;
                            const health = setToken(accessToken, rspTime);
                            if(!tokenSavelessOption && health) {
                                const apiInfo = apiNameString.replace('\/', " \/").replace('\/login', "\/login ");
                                chrome.storage.local.set({token: accessToken, apiInfo: apiInfo, rspTime: rspTime});
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

function setToken(accessToken, rspTime) {
    $('button.btn.authorize.unlocked').first().click();
    $('#auth-bearer-value').val(accessToken);
    $('#auth-bearer-value').focus();
    const elapsed = Math.floor((Date.now() - rspTime)/60000);
    const htmlToAppend = '<span style="color:salmon"><b>스페이스바를 한 번 누른 후 Authorize 버튼을 누르세요! (토큰발급: ' + elapsed + '분 전)</b></span>';
    $('#auth-bearer-value').closest('.wrapper').find('label').first().html(htmlToAppend);
    return $('#auth-bearer-value').val() != undefined? true : false;
}