waitForElm('.docmargin').then(async () => {
    var url = window.location.href;
    if (String(url).match(/^https:\/\/qualifications\.pearson\.com\/en\/qualifications\/.*Exam-materials$/g) != null) {
        var fileNames = []
        var aElements = []
        document.querySelectorAll('.expandFilters')[1].children[0].click();
        document.querySelectorAll('.docmargin').forEach(async function (el) {
            el.querySelectorAll('a').forEach(async function (el2) {
                if (el2.id.match(/secure/gm) != null && el2.href.match(/pdf/gm) != null && el2.href.match(/pef/gm) == null) {
                    aElements.push(el2)
                    var fileName = el2.href.match(/(?<=\/exam-materials\/).*?(?=\?)/gm)[0].replace("_@_",".")
                    var year = fileName.match(/\d{4}(?=\d{2}\d{2}\.pdf)/gm)[0];
                    var month = fileName.match(/(?<=\d{4})\d{2}(?=\d{2}\.pdf)/gm)[0];
                    fileNames.push({fileName:fileName, month: month, year: year})                    
                }
            });
        });
        
        var port = chrome.runtime.connect({ name: "urlTransfer" });
        console.log(fileNames)
        await port.postMessage({test:false,fileNames:fileNames})
        var listener = port.onMessage.addListener(async function (msg) {
            if (msg.returnedURLS) {
                console.log(msg)
                for (let index = 0; index < Object.keys(msg.returnedURLS).length; index++) {
                    if (msg.returnedURLS[index] != "") {
                        aElements[index].href = msg.returnedURLS[index]
                        var titleEl = aElements[index].querySelectorAll(".textContent")[0]
                        var padlockEl = aElements[index].querySelectorAll("img.padlock")[0]
                        titleEl.textContent = titleEl.textContent + " (Unlocked)"
                        padlockEl.src = chrome.runtime.getURL("images/icon_padlock_Blue.png")
                    }   
                    else {
                        console.log("No URL found for " + fileNames[index].fileNames)
                    }                    
                }
                await port.disconnect()
            }
        })
    }
});
function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}