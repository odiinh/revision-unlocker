(async () => {
	await chrome.runtime.onConnect.addListener(async function(port) {
		console.assert(port.name == "urlTransfer");
		await port.onMessage.addListener(async function(msg) {
			console.log("New Message:" + JSON.stringify(msg))
			if (msg.test == true) {
				console.log("TEST: Pong!")
				return true;
			}
			else if (msg.fileNames != []) {
				console.log("i see some filenames")
				var storedUrls = {}
				var search = await chrome.storage.local.get("storedUrls")
				if (search != {}) {
					storedUrls = search.storedUrls
				}
				
				var storedUrlKeys = Object.keys(storedUrls)
				var storedUrlValues = Object.values(storedUrls)
				var returnedURLS = {}
				for (let index = 0; index < msg.fileNames.length; index++) {
					let urlInfo = msg.fileNames[index]
					var fileStorageIndex = storedUrlKeys.indexOf(urlInfo.fileName)
					if (fileStorageIndex != -1){
						returnedURLS[index]=storedUrlValues[fileStorageIndex]
					}
					else {
						var searchedURL = await findURL(urlInfo).then(url => {
							console.log(url)
							if (url != "") {
								storedUrls[urlInfo.fileName] = url
							}
							returnedURLS[index]=url
						})
					}
					if (index == msg.fileNames.length-1) {
						await port.postMessage({returnedURLS:returnedURLS})
						await chrome.storage.local.set({storedUrls})
					}

				}
			}
		});		
	});
})();

async function findURL(urlInfo) {
	var year = urlInfo.year
	var month = urlInfo.month
	if (month != "01") {
		month = String(parseInt(month) - 1).padStart(2, '0')
	}
	var fileName = urlInfo.fileName
	var URL = 'https://dynamicpapers.com/wp-content/uploads/' + year + '/' + month + '/' + fileName;
	var currentMonth = String(new Date().getMonth() + 1).padStart(2,"0")
	var currentYear = String(new Date().getFullYear())
	var found = false
	var count = 0
	while (found == false && count < 5) {
		var request = await fetch(URL, {
			"headers": {
				"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
				"accept-language": "en-US,en;q=0.9,en-GB;q=0.8",
				"sec-ch-ua-mobile": "?0",
				"sec-fetch-dest": "document",
				"sec-fetch-mode": "navigate",
				"sec-fetch-site": "none",
				"sec-fetch-user": "?1",
				"upgrade-insecure-requests": "1"
			},
			"referrerPolicy": "strict-origin-when-cross-origin",
			"body": null,
			"method": "HEAD",
			"mode": "cors",
			"credentials": "include"
		});
		if (request.status == 200) {
			found = true
			return URL;
		}
		else if (month == currentMonth && year == currentYear) {
			return "";
		}
		else if (request.status == 404) {
			URL = URL.split('/')
			month = String(parseInt(month) + 1).padStart(2, '0')
			if (parseInt(month) % 12 == 1) {
				month = '01'
				year = String(parseInt(year) + 1)
				URL[URL.length - 3] = year
			}
			URL[URL.length - 2] = month
			URL = URL.join("/")
			count++
		}
	}
	return ""
}