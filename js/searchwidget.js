/*
 * Rebate Bus client scripts - export MidstreamWidget object with configure function to set up the verification widget

*/


var initWidget = function(ctr, ifrm) {
	ctr.setAttribute('id', 'busctr'); // assign an id
	ctr.style.position = "fixed";
	ctr.style.left = 0;
	ctr.style.right = 0;
	ctr.style.top = 0;
	ctr.style.height = "100%";
	ctr.style['z-index'] = 8192;
	ifrm.allowtransparency="true";
	ifrm.style.height = "100%";
	ifrm.style.width = "100%";
	ifrm.style['text-align'] = "center"
	ifrm.style['margin-right'] = "auto";
}


var closeFrame = function() {
	var ifrm = document.getElementById("busctr");
	if (ifrm != null) 
		document.body.removeChild(ifrm);
}

var getCookie = function(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

// for some reason the gotzip event gets caught twice - use this flag to ignore the second event
var gotzipFlag = 0;

var getBusFn = function(options) {
	return function(event) {
		if (event.data.type == "removebusfrm") {
			closeFrame();
		} if (event.data.type == "gotzip" && !gotzipFlag) {
			gotzipFlag = 1;
			document.cookie = "busfrm-rebatezip=" + event.data.zip + "; expires=Thu, 18 Dec 2020 12:00:00 UTC; path=/";
			document.cookie = "busfrm-propertytype=" + event.data.propertytype + "; expires=Thu, 18 Dec 2020 12:00:00 UTC; path=/";
			createZipBar(event.data.zip, event.data.propertytype, options);
			loadRebates(options, event.data.propertytype, event.data.zip);
			closeFrame();
			
		}
	}
}

 
var createZipBar = function(zip, propertytype, options) {
	var bar = document.createElement('div');
	var span = document.createElement('span');
	var mapicon = document.createElement('i');
	var pencilicon = document.createElement('i');
	var curBar = document.getElementById("busbar");
	if (curBar != null)
		document.body.removeChild(curBar);
	bar.setAttribute('id', 'busbar'); // assign an id
	bar.style.position = "fixed";
	bar.style.right = "120px";
	bar.style.padding = "5px 5px 5px 5px";
	bar.style.top = 0;
	bar.style['background-color'] = "#e4e4e4";	
	bar.style['border-bottom-left-radius'] = "5px";
	bar.style['border-bottom-left-radius'] = "5px";
	span.style['font-size'] = "large";
	mapicon.className = "fa fa-map-marker";
	pencilicon.className = "fa fa-pencil";
	span.appendChild(mapicon);
	span.appendChild(document.createTextNode(" Shipping Zip: " + zip + " ")); 
	span.appendChild(pencilicon);
	bar.appendChild(span);
	pencilicon.addEventListener("click", 
		function() {
			gotzipFlag = 0;
			createWidget(options, propertytype, zip);
		}
	);
	document.body.appendChild(bar); // to place at end of document
}

var createWidget = function(options, curtype, curzip) {
	var ifrm = document.createElement('iframe');
	var container = document.createElement('div');
	var server = "https://www.rebatebus.com/";
	initWidget(container, ifrm);	
	if (options.server) {
		server = options.server;	
	} else {
		options.server = "https://www.rebatebus.com/";
	}
	ifrm.onload = function() {
		window.addEventListener("message", getBusFn(options), false);
	};
	document.body.appendChild(container); // to place at end of document
	container.appendChild(ifrm);
	if (curtype && curzip) {
		ifrm.setAttribute('src', server + "searchwidget" + "?apikey=" + options.apikey + "&uid=" + options.uid +
		"&curzip=" + curzip + "&curtype=" + curtype);
	}
	else {
		ifrm.setAttribute('src', server + "searchwidget" + "?apikey=" + options.apikey + "&uid=" + options.uid);
	}
}

var loadRebates = function(options, viewingtype, viewingzip) {
	var bus = {};
	var seen = {};
	$.post(options.server + "api/getrebates", {"productid_list": options.productid_list,
		"uid": options.uid,
		"apikey": options.apikey,
		"zip": viewingzip,
		"propertytype": viewingtype
	}).complete(function(response) {

		var bus = response.responseJSON;
		for (j = 0; j < bus.midstream.length; j++) {
			curProduct = bus.midstream[j];
			found = 0;
			maxIncentive = {"rebateAmount": -1};
			// Look for a prescriptive incentive, then a custom. 
			for (i = 0; i < curProduct.rebates.prescriptive.length; i++) {
				if (curProduct.rebates.prescriptive[i].rebateAmount > maxIncentive.rebateAmount) {
					maxIncentive = curProduct.rebates.prescriptive[i];
					found = 1;
				}
			}
			for (i = 0; i < curProduct.rebates.custom.length; i++) {
				if (curProduct.rebates.custom[i].rebateAmount > maxIncentive.rebateAmount) {
					maxIncentive = curProduct.rebates.custom[i];
					found = 1;
				}
			}
			if (found) {
				options.callback(curProduct.productid, maxIncentive);
				seen[curProduct.productid] = 1;
			}
		} if (options.showdownstream) {
			for (j = 0; j < bus.downstream.length; j++) {
				curProduct = bus.downstream[j];
				if (seen[bus.downstream[j].productid]) continue;
				found = 0;
				maxIncentive = {"rebateAmount": -1};
				// Look for a prescriptive incentive, then a custom. 
				for (i = 0; i < curProduct.rebates.prescriptive.length; i++) {
					if (curProduct.rebates.prescriptive[i].rebateAmount > maxIncentive.rebateAmount) {
						maxIncentive = curProduct.rebates.prescriptive[i];
						found = 1;
					}
				}
				for (i = 0; i < curProduct.rebates.custom.length; i++) {
					if (curProduct.rebates.custom[i].rebateAmount > maxIncentive.rebateAmount) {
						maxIncentive = curProduct.rebates.custom[i];
						found = 1;
					}
				}
				if (found) {
					options.callback(curProduct.productid, maxIncentive);
				}
			}
		}
	});
}

var SearchWidget = { 

	"configure": function(options) {
		if (!options.apikey || !options.uid || !options.productid_list || !options.callback) {
			alert("Missing parameters in RebateSearchWidget request");
			return;	}
		// advanced configuration - known rebateid, property type, zip

		var viewingzip = getCookie('busfrm-rebatezip');
		var viewingtype = getCookie('busfrm-propertytype');
		if (viewingtype == "" || viewingzip == "") {
			gotzipFlag = 0;
			createWidget(options, null, null);
		}
		else {
			createZipBar(viewingzip, viewingtype, options);
			loadRebates(options, viewingtype, viewingzip);	
		}
	}

};

