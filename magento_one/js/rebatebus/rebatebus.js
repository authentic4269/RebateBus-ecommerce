/*
 * Rebate Bus Client API demo
 *
 * Note that the AJAX should be run server side in production applications. It only works on demo.rebatebus.com because the 
 * Rebate Bus server sets the Access-Control-Allow-Origin header on requests from that domain. Including it here so that the 
 * entire API process will be visible in this demo.
 *
 * Also note that stealing this API key and UID won't do you much good - they're tied to the products in the inventory managed by user 1
 * Feel free to use this API key and UID with these products to develop and debug your own apps. 
 *
 * Mitch Vogel, 9/30/16
 */

var PUB_API_KEY = "MSKMCzp5edmCBeYx";
var initial_price = 15.99;
var server = "http://dev.rebatebus.com/"
var UID = 129;
var products = [];

/*
 * We've found a rebate that applies to productid in the program we're localizing to - update the DOM to reflect the discount
 */
function updateRebatePriceQuotes(productid, incentive) {
	var amount = parseFloat(incentive.rebateAmount); // widget delivers rebateAmount in a string
	var pric = jQuery("#" + productid + " .pric1");
	var programimg = document.createElement("img");
	programimg.src = "https://www.rebatebus.com/assets/programimages/" + incentive.program + ".png";
	programimg.style['max-width'] = "9em";
	programimg.style['margin'] = "0 auto";
	programimg.setAttribute("id", productid + "img");
	pric.text("");
	pric.append("<del>$" + incentive.msrp.toFixed(2) + "</del>");
	jQuery("#" + productid + " .pric2").text("$" + (incentive.msrp - amount).toFixed(2));
	jQuery("#" + productid + " .disc").text("$" + incentive.rebateAmount + " rebate from " + incentive.program);
	jQuery("#" + productid).append(programimg);
}

function clearRebatePriceQuotes() {
	var i;
	for (i = 0; i < products.length; i++) {
		var pric2 = jQuery("#" + products[i] + " .pric2");
		var pric = jQuery("#" + products[i] + " .pric1");
		var disc = jQuery("#" + products[i] + " .disc");
		if (jQuery("#" + products[i] + "img"))
			jQuery("#" + products[i] + "img").remove();
		if (pric.text().length)
			pric2.text(pric.text());
		disc.text("");
		pric.text("");
	}
}

window.onload = function() {
// if .item, we're on a catalog or search page. if .price-box, we're on a single product page
	if ((".item").length) {
		jQuery(".item .ref").each(function(i) {
			products.push(this.getAttribute('id'));
		});
	} else {
		jQuery(".price-box").each(function(i) {
			products.push(this.getAttribute('id'));
		});

	}
	SearchWidget.configure({
		"uid": UID,
		"apikey": PUB_API_KEY,
		"productid_list": products,
		"showdownstream": true,
		"callback": updateRebatePriceQuotes,
		"clear": clearRebatePriceQuotes

	});

}
