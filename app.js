var usdToBynRate = null;
var lastUpdateDate = null;

var updateTimeInterval = 0 // in minutes;
var maxUpdateTimeInterval = 720 // in minutes;
var bestrateUrl = 'https://www.onliner.by/sdapi/kurs/api/bestrate?currency=USD&type=nbrb';
var notResonUpdateDates = [6, 0]; // Saturday and Sunday
var startTradingHour = 10; // start tradin in 10:00
var endTradingHour = 13; // end trading in 13:00

fillWebData();

async function fillWebData() {
	await getDataFromStorage();
	
	if (!usdToBynRate) {
		return;
	}
	
}
async function updateUsdToByn() {
	await fetch(bestrateUrl)
		.then(response => response.json())
		.then(result => setUsdToByn(result));
}

function setUsdToByn(result) {
	return new Promise(resolve => {
		if (!result) {
			resolve();
		}
		
		usdToBynRate = +result.amount.split(',').join('.');
		lastUpdateDate = getCurrentTimeInMinutes();
		saveDataToStorage();
		resolve();
	});
}

function saveDataToStorage() {
	chrome.storage.local.set({usdToBynRate});
	chrome.storage.local.set({lastUpdateDate});
}

function getDataFromStorage() {
	return new Promise(resolve => {
		chrome.storage.local.get(['usdToBynRate', 'lastUpdateDate'], function(result) {
		  usdToBynRate = result.usdToBynRate;
		  lastUpdateDate = result.lastUpdateDate;
		  
		  if (!isNeedUpdateData()) {
			  resolve();
			  return;
		  }
		  
		  resolve(updateUsdToByn());
		});
	});
}

function isNeedUpdateData() {
	return !usdToBynRate
		|| !lastUpdateDate
		|| isResonToUpdate();
}

function isResonToUpdate() {
	var date = new Date();
	var currentHour = date.getHours();
	
	return !notResonUpdateDates.includes(date.getDay())
		&& currentHour > startTradingHour
		&& currentHour < endTradingHour
		&& getCurrentTimeInMinutes() - lastUpdateDate > updateTimeInterval
		|| getCurrentTimeInMinutes() - lastUpdateDate > maxUpdateTimeInterval;
}

function getCurrentTimeInMinutes() {
	return new Date().getTime() / 1000;
}