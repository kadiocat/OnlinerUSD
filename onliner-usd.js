let usdToBynRate = null;
const selectors = {
  usdToBynRateObserverSelector: {
    selector: ".top-informer-currency span",
    repeats: 0,
  },
  offersListGroupObserverSelector: {
    selector: ".product-aside__offers-list",
    repeats: 0,
  },
  catalogObserverSelector: {
    selector: ".catalog-form__offers-list",
    repeats: 0,
  },
};
const maxRepeats = 20;
const timeout = 300;

const staticPriceContainerSelectors = [
  // айтем
  ".offers-description__details .offers-description__price-group .js-description-price-link",
  ".offers-description__details .offers-description__price-group .offers-description__price",
  // продавцы справа от основного айтема
  ".product-aside__offers-item .product-aside__offers-flex .js-short-price-link",
  // продавцы
  ".offers-list__item .offers-list__unit .offers-list__flex .offers-list__part_price div div",
  // избранное каталог
  ".catalog-form__offers-unit .catalog-form__offers-part_control .catalog-form__description span:not(.catalog-form__description)",
  // рекомендации
  ".product-recommended__item .product-recommended__price a",
  // рекомендации в каталоге
  ".catalog-offers__item .catalog-offers__price .catalog-offers__price-value",
];

start();

function start() {
  const container = document.querySelector(
    selectors["usdToBynRateObserverSelector"].selector
  );
  if (container) {
    usdToBynRate = getPriceInNumber(container.innerText);
    fillStaticWebData(staticPriceContainerSelectors);
    rateMutationObserver();
    mutationObserver(selectors["offersListGroupObserverSelector"]);
    mutationObserver(selectors["catalogObserverSelector"]);
  } else if (selectors["usdToBynRateObserverSelector"].repeats <= maxRepeats) {
    selectors["usdToBynRateObserverSelector"].repeats++;
    setTimeout(() => start(), timeout);
  }
}

function rateMutationObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      usdToBynRate = getPriceInNumber(mutation.addedNodes[0].data);
      fillStaticWebData(staticPriceContainerSelectors);
    });
  });
  const container = document.querySelector(
    selectors["usdToBynRateObserverSelector"].selector
  );
  observer.observe(container, { childList: true });
}

function mutationObserver(selectorObj) {
  const container = document.querySelector(selectorObj.selector);
  if (container) {
    const observer = getMutationObserver();
    observer.observe(container, { childList: true });
    fillStaticWebData(staticPriceContainerSelectors);
  } else if (selectorObj.repeats <= maxRepeats) {
    selectorObj.repeats++;
    setTimeout(() => mutationObserver(selectorObj), timeout);
  }
}

function getMutationObserver() {
  return new MutationObserver((mutations) =>
    mutations.forEach(() => fillStaticWebData(staticPriceContainerSelectors))
  );
}

function fillStaticWebData(selectors) {
  if (!usdToBynRate) {
    return;
  }

  fillUsdPrice(selectors);
}

function fillUsdPrice(selectors) {
  selectors.forEach((priceContainerSelector) => {
    const priceContainers = document.querySelectorAll(priceContainerSelector);

    if (!priceContainers?.length) {
      return;
    }

    for (let priceContainer of priceContainers) {
      if (priceContainer.innerText.includes("$")) {
        continue;
      }

      if (priceContainer.innerText.includes(" – ")) {
        fillMultiPrice(priceContainer);
      } else {
        fillSinglePrice(priceContainer);
      }
    }
  });
}

function fillMultiPrice(priceContainer) {
  const sprices = priceContainer.innerText.split(" – ");
  const minPrice = getUsdPrice(sprices[0]);
  const maxPrice = getUsdPrice(sprices[1]);

  priceContainer.innerText = `${priceContainer.innerText} \n ${minPrice} - ${maxPrice} $`;
}

function fillSinglePrice(priceContainer) {
  priceContainer.innerText = `${priceContainer.innerText} \n ${getUsdPrice(
    priceContainer.innerText
  )} $`;
}

function getUsdPrice(priceString) {
  return (getPriceInNumber(priceString) / usdToBynRate).toFixed(2);
}

function getPriceInNumber(priceString) {
  const originalPrice = priceString.replace(/[^,\d]/g, "");
  return +originalPrice.split(",").join(".");
}
