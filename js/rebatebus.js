/*
 * Rebate Bus Client API demo
 *
 * Note that this code should be run server side in production applications. It only works on demo.rebatebus.com because the 
 * Rebate Bus server sets the Access-Control-Allow-Origin header on requests from that domain.
 *
 * The key and UID given below restrict results returned to rebates from Wisconsin's Focus on Energy. You can use it
 * to help develop your app, but it should not be used in production code. 
 *
 * Mitch Vogel, 9/30/16
 */

var API_KEY = "VmOJXmww6eBGT3XW";
var UID = 1;
var bus = {
 downstream: {},
 midstream: {},
 utilityDict: {}
};

function getUtilities() {
$.ajax({
        type: "POST",
        url: "https://www.rebatebus.com/api/getutilities",
        data: {"uid": UID, "apikey": API_KEY},
	crossDomain: true,
        complete: function(response, stat) {
                commercialRebateObj = response.commercial;
                midstreamRebateObj = response.midstream;
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
			bus.downstream = rebates.commercial;
			bus.midstream = rebates.midstream;
                }, error: function(response, stat) {
                        console.log("error retrieving rebates data from Rebate Bus");
                }
        });
}

getUtilities();
getRebates();
