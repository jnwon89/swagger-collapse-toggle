$(document).ready(async () => {
    const RESPONSE_THRESHOLD = 3;
    const option = {
        attributes: false,
        characterData: false,
        childList: true,
        subtree: true
    };
    
    const opBlockObserver = new MutationObserver(getTokenAndSet);
    opBlockObserver.observe(document.getElementById('swagger-ui'), option);

    function getTokenAndSet() {
        $('.responses-wrapper span.headerline').each((index, item) => {
            if(item.innerText.indexOf('date: ') >= 0) {
                const responseOffset = (Date.now() - Date.parse(item.innerText.split('date: ')[1]))/1000;
                if(responseOffset < RESPONSE_THRESHOLD) {
                    const $opBlockRoot = $(item).closest('.opblock-post');
                    const apiNameString = $opBlockRoot.find('.opblock-summary-control').first().text();
                    if(apiNameString.indexOf('/login') > 0 && $opBlockRoot.find('.live-responses-table tbody td.response-col_status').first().text() == '200') {
                        const jsonString = $opBlockRoot.find('.live-responses-table code.language-json').text();
                        const accessToken = JSON.parse(jsonString).accessToken;
                        $('button.btn.authorize.unlocked').first().click();
                        $('#auth-bearer-value').val(accessToken);
                        $('#auth-bearer-value').focus();
                        const htmlToAppend = '<section style="color:salmon"><b>스페이스바를 한 번 누른 후 Authorize 버튼을 누르세요!</b></section>';
                        $('#auth-bearer-value').parent().append(htmlToAppend);
                    }
                }
            }
        })
    }
});