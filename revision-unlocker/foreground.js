(async () => {
    var url = window.location.href;
    if (String(url).match(/^https:\/\/qualifications\.pearson\.com\/en\/qualifications\/.*Exam-materials$/g) != null) {
        document.querySelectorAll('.expandFilters')[1].children[0].click();
        document.querySelectorAll('.docmargin').forEach(async function (el) {
            el.querySelectorAll('a').forEach(async function (el2) {
                if (el2.id.match(/secure/gm) != null && el2.href.match(/pdf/gm) != null && el2.href.match(/pef/gm) == null) {
                    var baseURL = 'https://dynamicpapers.com/wp-content/uploads/';
                    var filename = el2.href.match(/(?<=\/exam-materials\/).*?(?=\?)/gm)[0].replace("_@_",".")
                    var year = filename.match(/\d{4}(?=\d{2}\d{2}\.pdf)/gm)[0];
                    var month = filename.match(/(?<=\d{4})\d{2}(?=\d{2}\.pdf)/gm)[0];
                    if (month != "01") {
                        month = String(parseInt(month) - 1).padStart(2, '0')
                    }
                    var newURL = baseURL + year + '/' + month + '/' + filename;
                    var port = chrome.runtime.connect({ name: "urlTransfer" });
                    await port.postMessage({ test: false, url: newURL, month: month, year: year})
                    var listener = port.onMessage.addListener(async function (msg) {
                        if (msg.confirmedURL != "") {
                            console.log(msg)
                            el2.href = msg.confirmedURL
                            var titleEl = el2.querySelectorAll(".textContent")[0]
                            var padlockEl = el2.querySelectorAll("img.padlock")[0]
                            titleEl.textContent = titleEl.textContent + " (Unlocked)"
                            padlockEl.src = chrome.runtime.getURL("images/icon_padlock_Blue.png")
                            await port.disconnect()
                        }
                    })
                    
                }
            });
        });

    }
})();
