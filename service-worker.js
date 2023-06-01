(async () => {
	chrome.runtime.onConnect.addListener(async function(port) {
		console.assert(port.name == "urlTransfer");
		port.onMessage.addListener(async function(msg) {
			if (msg.test == true) {
				port.postMessage({ confirmedURL: "pong" });
				return true;
			}
			else if (msg.url) {
				var URL = msg.url
				var year = msg.year
				var month = msg.month
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
						port.postMessage({ confirmedURL: URL });
						found = true
						return true;
					}
					else if (month == currentMonth && year == currentYear) {
						port.postMessage({ confirmedURL: "" });
						return true;
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
			}
		});		
	});
})();