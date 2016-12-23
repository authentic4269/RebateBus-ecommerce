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

var API_KEY = "vtrGfISXrgkaUbZg";
var UID = 1;
var TEST_REBATE_ID = 5327;
var TEST_ZIP = 99999;
var TEST_PRODUCTID = "TC26869";

/*
 * Submit application for verified midstream rebate
 * 
 * verification: verification code obtained in verifyMidstream
*/
function applyMidstream(verification) {
	var requestobj = {};
	requestobj.uid = UID;
	requestobj.apikey = API_KEY;
	requestobj.verification = verification;
	requestobj.zip = 53711;
	requestobj.contactname = "Jane Customer";
	requestobj.contactphone = "5555555555";
	requestobj.contactemail = "team@rebatebus.com";
	requestobj.address = "2908 Brian Lane, Fitchburg, WI";
	$.ajax({
		type: "POST", 
		url: "http://localhost:8000/api/applymidstream",
		data: requestobj,
		complete: function(response, stat) {
			alert('rebate applied!');
		}, error: function(response, stat) {
			console.log("error applying midstream rebate");
			alert(response.error);
		}

	});
}

/*
 * Do server side zip code and product validation, then call applyMidstream with the code
 * 
*/
function verifyMidstream() {
	$.ajax({
		type: "POST",
		url: "http://localhost:8000/api/verifymidstream",
		data: {"uid": UID, "apikey": API_KEY, "productid": TEST_PRODUCTID, "rebateid": TEST_REBATE_ID, "zip": TEST_ZIP, "quantity": 2},
		complete: function(response, stat) {
			applyMidstream(response.responseJSON.verification);
		}, error: function(response, stat) {
			console.log("error verifying midstream rebate");
		}
	});
}


