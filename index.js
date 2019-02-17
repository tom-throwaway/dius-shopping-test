// Special get one X free with every Y
function SpecialFreeXWithY(x, y) {
	this.x = x;
	this.y = y;

	this.applySpecial = function(items, currentTotal) {
		// Clone item list to avoid side effects
		var newItemList = items.slice(0);

		// Count the number of Y items
		var _y = this.y;
		var numberOfY = newItemList.filter(function(itemSKU) {
			return _y === itemSKU;
		}).length;

		// Remove an X item from the item list for every Y (the X becomes free)
		for(var index=0; index<numberOfY; index++) {
			var firstXIndex = newItemList.indexOf(this.x);

			if(firstXIndex !== -1) {
				newItemList.splice(firstXIndex, 1);
			}
		}

		return {
			items: newItemList,
			total: currentTotal
		}
	}
}

function SpecialBulkDiscount(productSKU, minBuy, discountPrice) {
	this.productSKU = productSKU;
	this.minBuy = minBuy;
	this.discountPrice = discountPrice;

	this.applySpecial = function(items, currentTotal) {
		// Clone item list to avoid side effects
		var newItemList = items.slice(0);

		// Count how many items we have
		var _sku = this.productSKU;
		var numberOfItems = newItemList.filter(function(itemSKU) {
			return itemSKU === _sku;
		}).length;

		// Apply special if we are buying enough items
		if(numberOfItems >= this.minBuy) {
			currentTotal += numberOfItems * this.discountPrice;

			// Remove all items from list
			_productSKU = this.productSKU;
			newItemList = newItemList.filter(function(itemSKU) {
				return itemSKU !== _productSKU;
			});
		}

		return {
			items: newItemList,
			total: currentTotal
		}
	}
}

// Special - Buy X items for the price of Y items
function SpecialXforY(productSKU, x, y) {
	this.productSKU = productSKU;
	this.x = x;
	this.y = y;

	this.applySpecial = function(items, currentTotal) {
		// Clone item list to avoid side effects
		var newItemList = items.slice(0);

		// Count how many items we have
		var _sku = this.productSKU;
		var numberOfItems = newItemList.filter(function(itemSKU) {
			return itemSKU === _sku;
		}).length;

		// Calculate how many free items due to bulk buying
		var numberOfMultiples = Math.floor(numberOfItems / this.x);
		var numberOfFreeItems = numberOfMultiples * (this.x - this.y);

		// Remove the free items from the item list
		for(var index=0; index<numberOfFreeItems; index++) {
			var firstXIndex = newItemList.indexOf(this.productSKU);

			if(firstXIndex !== -1) {
				newItemList.splice(firstXIndex, 1);
			}
		}

		return {
			items: newItemList,
			total: currentTotal
		}
	}
}



function Checkout(pricingRules) {
	this.order = {
		items: [],
		total: 0.0
	}

	this.pricingRules = pricingRules;
}

Checkout.prototype.total = function() {

	// Apply specials
	for(var index=0; index<this.pricingRules.length; index++) {
		this.order = this.pricingRules[index].applySpecial(this.order.items, this.order.total);
	}

	// Total remaining items
	this.order.total += this.order.items.reduce(function(subTotal, itemSKU) {
		return subTotal + products[itemSKU].price;
	}, 0.0);

	return this.order.total;
}

Checkout.prototype.scan = function(productSKU) {
	this.order.items.push(productSKU);
}

// Define product list
var products = {
	'ipd': {
		name: 'Super iPad',
		price: 549.99
	},
	'mbp': {
		name: 'MacBook Pro',
		price: 1399.99
	},
	'atv': {
		name: 'Apple TV',
		price: 109.50
	},
	'vga': {
		name: 'VGA adapter',
		price: 30.00
	}
};

// Define pricing rules
var pricingRules = [
	new SpecialFreeXWithY('vga', 'mbp'),
	new SpecialXforY('atv', 3, 2),
	new SpecialBulkDiscount('ipd', 5, 499.99)
];


// TESTS /////////////////////////////////////////////////////////////////////////

// SKUs Scanned: atv, atv, atv, vga Total expected: $249.00
var checkout = new Checkout(pricingRules);
checkout.scan('atv');
checkout.scan('atv');
checkout.scan('atv');
checkout.scan('vga');
console.log(checkout.order.items)
console.log('Total: $', checkout.total().toFixed(2));

// SKUs Scanned: atv, ipd, ipd, atv, ipd, ipd, ipd Total expected: $2718.95
checkout = new Checkout(pricingRules);
checkout.scan('atv');
checkout.scan('ipd');
checkout.scan('ipd');
checkout.scan('atv');
checkout.scan('ipd');
checkout.scan('ipd');
checkout.scan('ipd');
console.log(checkout.order.items)
console.log('Total: $', checkout.total().toFixed(2));

// SKUs Scanned: mbp, vga, ipd Total expected: $1949.98
checkout = new Checkout(pricingRules);
checkout.scan('mbp');
checkout.scan('vga');
checkout.scan('ipd');
console.log(checkout.order.items)
console.log('Total: $', checkout.total().toFixed(2));

