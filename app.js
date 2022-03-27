let usdToBynRate = null;
let lastUpdateDate = null;

const updateTimeInterval = 10 // in minutes;
const maxUpdateTimeInterval = 720 // in minutes;
const bestrateApi = '/sdapi/kurs/api/bestrate?currency=USD&type=nbrb';
const notResonUpdateDates = [6, 0]; // Saturday and Sunday
const startTradingHour = 10; // start tradin in 10:00
const endTradingHour = 13; // end trading in 13:00
const priceContainerSelectors = [
	'.offers-description__details .offers-description__price-group .offers-description__price',
	'.product-aside__offers-list .product-aside__offers-part .product-aside__description .product-aside__link.js-short-price-link',
	'.offers-list__group .offers-list__item .offers-list__part_price .offers-list__description',
	'.catalog-offers .catalog-offers__list .catalog-offers__item .catalog-offers__price .catalog-offers__link',
	'.schema-product .schema-product__part .schema-product__price .schema-product__price-value.js-product-price-link',
	'.schema-product .schema-product__part .schema-product__price .schema-product__price-value span'
];

fillWebData();

async function fillWebData() {
	await getDataFromStorage();

	if (!usdToBynRate) {
		return;
	}

	fillUsdPrice();
}

function fillUsdPrice() {
	priceContainerSelectors.forEach(priceContainerSelector => {
		const priceContainers = document.querySelectorAll(priceContainerSelector);

		if (!priceContainers?.length) {
			return;
		}

		for (let priceContainer of priceContainers) {
			priceContainer.innerText = `${priceContainer.innerText} \n ${getUsdPrice(priceContainer.innerText)} $`;
		}
	});
}

function getUsdPrice(priceString) {
	return (getBynPrice(priceString) / usdToBynRate).toFixed(2);
}

function getBynPrice(priceString) {
	const originalPrice = priceString.replace(/[^,\d]/g, '');
	return +originalPrice.split(',').join('.');
}

async function updateUsdToByn() {
	await fetch(`https://${window.location.hostname}${bestrateApi}`)
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
	const date = new Date();
	const currentHour = date.getHours();

	return !notResonUpdateDates.includes(date.getDay())
		&& currentHour > startTradingHour
		&& currentHour < endTradingHour
		&& getCurrentTimeInMinutes() - lastUpdateDate > updateTimeInterval
		|| getCurrentTimeInMinutes() - lastUpdateDate > maxUpdateTimeInterval;
}

function getCurrentTimeInMinutes() {
	return new Date().getTime() / 1000;
}