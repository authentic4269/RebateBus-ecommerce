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

var UID = 1;
var PUB_API_KEY = "VhrTvdbbVVy1PLPW";

var initial_price1 = 3.99;
var initial_price2 = 111.99;
var bus = {
 downstream: {},
 midstream: {},
 utilityDict: {}
};

var TEST_REBATE_ID = 5401;
var TEST_PRODUCT_ID1 = 1013;
var TEST_PRODUCT_ID2 = 1001;

var MIDSTREAM_UID = 129;

function getUtilities() {
	$.ajax({
		type: "POST",
		url: "https://www.rebatebus.com/api/getutilities",
		data: {"uid": UID, "apikey": API_KEY},
		crossDomain: true,
		complete: function(response, stat) {
			bus.utilityDict = JSON.parse(response.responseText);
			getRebates();
		}, error: function(response, stat) {
			console.log("error retrieving utilities data from Rebate Bus");
		}
	});

}

function getRebates() {
        $.ajax({
                type: "POST",
                url: "https://www.rebatebus.com/api/getrebates",
                data: {"uid": UID, "apikey": API_KEY},
		crossDomain: true,
                complete: function(response, stat) {
                        var rebates = JSON.parse(response.responseText);
			bus.downstream = rebates.downstream;
			bus.midstream = rebates.midstream;
			localizeRebateOffers();
                }, error: function(response, stat) {
                        console.log("error retrieving rebates data from Rebate Bus");
                }
        });
}

/*
 * Infer a local program by finding the programid at the closest zip code to the geolocated location
 * After the program has been identified, call setProgramRebates to localize the page to this program
 */
function localizeRebateOffers() {
	var curProgramId;
	var curUtility;
	var closestProgram = -1;
	var closestDifference = 999999999;
	var curDifference;
	var curLatDiff, curLngDiff;
	var i, j;
	var browseProgramId;
	var applicablePrograms = [];
	if (navigator.geolocation) {
        	navigator.geolocation.getCurrentPosition(function(position) {
			for (curProgramId in bus.utilityDict) {
				for (i = 0; i < bus.utilityDict[curProgramId].length; i++)
				{
					curUtility = bus.utilityDict[curProgramId][i];
					if (curUtility.zips) {
						for (j = 0; j < curUtility.zips.length; j++) {
							curLatDiff = (curUtility.zips[j].latitude - position.coords.latitude);
							curLngDiff = (curUtility.zips[j].longitude - position.coords.longitude);
							curDifference = curLatDiff * curLatDiff + curLngDiff * curLngDiff;
							if (curDifference < closestDifference) {
								closestProgram = curProgramId;
								closestDifference = curDifference;
							}
						}
					}
				}
			}
			if (closestProgram < 0) {
				alert("Geolocation failed - rebate demos will not work properly");
			}
			else {
				setProgramRebates(closestProgram);
			}

		});
    	} else {
		alert("Geolocation is not supported by this browser - rebate demos will not work properly!");
    	}
}

/*
 * Here we have identified closestProgram as a rebate program with offerings in the inferred zip code
 *
 * Now alter the displayed prices and discounts to reflect those available in closestProgram
 */
function setProgramRebates(closestProgram) {
	var i, j;
	var found;
	var curProduct;
	var maxIncentive;
	for (j = 0; j < bus.downstream.length; j++) {
		curProduct = bus.downstream[j];

		rebatemap({'utilityDict': bus.utilityDict, 'rebates': bus.downstream}, curProduct.productid, curProduct.productid + 'map');
		found = 0;
		maxIncentive = {"rebateAmount": -1};
		// Look for a prescriptive incentive, then a custom. 
		for (i = 0; i < curProduct.rebates.prescriptive.length; i++) {
			if (curProduct.rebates.prescriptive[i].programid == closestProgram) {
				if (curProduct.rebates.prescriptive[i].rebateAmount > maxIncentive.rebateAmount) {
					maxIncentive = curProduct.rebates.prescriptive[i];
					found = 1;
				}
			}
		}
		for (i = 0; i < curProduct.rebates.custom.length; i++) {
			if (curProduct.rebates.custom[i].programid == closestProgram) {
				if (curProduct.rebates.custom[i].rebateAmount > maxIncentive.rebateAmount) {
					maxIncentive = curProduct.rebates.custom[i];
					found = 1;
				}
			}
		}
		if (found) {
			updateRebatePriceQuotes(curProduct.productid, maxIncentive);
		}
	}
}

/*
 * We've found a rebate that applies to productid in the program we're localizing to - update the DOM to reflect the discount
 */
function updateRebatePriceQuotes(productid, incentive) {
	$("#" + productid + " .pric1").append("<del>$" + incentive.msrp + "</del>");
	$("#" + productid + " .pric2").text("$" + (incentive.msrp - incentive.rebateAmount).toFixed(2));
	$("#" + productid + " .disc").text("$" + incentive.rebateAmount.toFixed(2) + " rebate from " + incentive.program);
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}
function showPosition(position) {
    x.innerHTML = "Latitude: " + position.coords.latitude + 
    "<br>Longitude: " + position.coords.longitude; 
}

function applyMidstream(data) {
        var requestobj = {};
        requestobj.uid = UID;
        requestobj.apikey = API_KEY;
        requestobj.verification = data.verification;
        requestobj.zip = data.zip; 
        requestobj.contactname = "Jane Customer";
        requestobj.contactphone = "5555555555";
        requestobj.contactemail = "team@rebatebus.com";
        requestobj.address = "2908 Brian Lane, Fitchburg, WI";
        requestobj.quantity = 1;
        /*$.ajax({
                type: "POST", 
                url: "http://dev.rebatebus.com/api/applymidstream",
                data: requestobj,
                complete: function(response, stat) {
                        if (response.status == 200)
                                alert('rebate applied!');
                        else 
                                alert('error applying midstream rebate');
                }

        });*/
}

function doRebateApp() {
	MidstreamWidget.configure({
		"uid": UID,
		"apikey": PUB_API_KEY,
		"products": [TEST_PRODUCT_ID1, TEST_PRODUCT_ID2],
		"verified": function(data) {
			
			$("#discount-label").text("Rebate Amount:");
			var totalRebate = 0;
			for (var datidx = 0; datidx < data.length; datidx++) {
				totalRebate += parseFloat(data[datidx].amount);	
			}
			
			$("#discount-value").text("$" + totalRebate.toFixed(2));
			$("#final-price").text("$" + ((initial_price1 + initial_price2) - totalRebate).toFixed(2));
			$("#cpns-notif").hide();
			$("#success-notif").show();
			$("#success-programimg").attr("src", "https://www.rebatebus.com/assets/programimages/" + data[0].program + ".png");
		}
	});	
	
}

window.onload = function() {
	$("#final-price").text("$" + (initial_price1 + initial_price2).toFixed(2));
	$("#initial-price").text("$" + (initial_price1 + initial_price2).toFixed(2));
}
