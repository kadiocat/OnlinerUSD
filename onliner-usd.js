let usdToBynRate = null;
let preparing = false;

const usdToBynRateObserverSelector = '.js-currency-amount';
const offersListGroupObserverSelector = '.offers-list__group';
const catalogObserverSelector = '#schema-products';
const staticPriceContainerSelectors = [
	'.offers-description__details .offers-description__price-group .offers-description__price',
	'.product-aside__offers-list .product-aside__offers-part .product-aside__description .product-aside__link.js-short-price-link',
	'.offers-list__group .offers-list__item .offers-list__part_price .offers-list__description_alter',
	'.catalog-offers .catalog-offers__list .catalog-offers__item .catalog-offers__price .catalog-offers__link',
	'.schema-product .schema-product__part .schema-product__price .schema-product__price-value.js-product-price-link',
	'.schema-product .schema-product__part .schema-product__price .schema-product__price-value span',
	'.product-recommended .product-recommended__list .product-recommended__item .product-recommended__price .product-recommended__link'
];

start();

function start() {
	mutationObserver(usdToBynRateObserverSelector);
	mutationObserver(offersListGroupObserverSelector);
	mutationObserver(catalogObserverSelector);
}

function mutationObserver(selector) {
	const observer = new MutationObserver((mutations) => {
		mutations.forEach((mutation) => {
			if (selector === usdToBynRateObserverSelector && mutation.addedNodes.length && mutation.addedNodes[0].nodeName === '#text') {
				usdToBynRate = getPriceInNumber(mutation.addedNodes[0].data);
			}

			if (preparing) {
				return;
			}

			preparing = true;

			setTimeout(() => {
				preparing = false;
				fillStaticWebData(staticPriceContainerSelectors);
			}, 1000);
		});
	});

	const container = document.querySelector(selector);

	if (container) {
		observer.observe(container, { childList: true });
	}
}

function fillStaticWebData(selectors) {
		if (!usdToBynRate) {
			return;
		}
	
		fillUsdPrice(selectors);
}

function fillUsdPrice(selectors) {
	selectors.forEach(priceContainerSelector => {
		const priceContainers = document.querySelectorAll(priceContainerSelector);

		if (!priceContainers?.length) {
			return;
		}

		for (let priceContainer of priceContainers) {
			if (priceContainer.innerText.includes('$')) {
				continue;
			}

			priceContainer.innerText = `${priceContainer.innerText} \n ${getUsdPrice(priceContainer.innerText)} $`;
		}
	});
}

function getUsdPrice(priceString) {
	return (getPriceInNumber(priceString) / usdToBynRate).toFixed(2);
}

function getPriceInNumber(priceString) {
	const originalPrice = priceString.replace(/[^,\d]/g, '');
	return +originalPrice.split(',').join('.');
}