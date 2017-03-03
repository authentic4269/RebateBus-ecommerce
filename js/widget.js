/*
 * Rebate Bus client scripts - export MidstreamWidget object with configure function to set up the verification widget
*/

var verified = 0;
var server;

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


var closeMidstreamFrame = function() {
	var ifrm = document.getElementById("busctr");
	if (ifrm != null) 
		document.body.removeChild(ifrm);
}

var getBusFn = function(ifrm, callback) {
	return function(event) {
		if (event.data.type == "removebusfrm") {
			closeMidstreamFrame();
		} if (event.data.type == "foundrebate") {
			ifrm.setAttribute('src', server + "midstreamwidget?zip=" + event.data.zip + "&rebatepairs=" + event.data.rebatepairs + "&apikey=" + event.data.apikey + "&uid=" + event.data.uid + "&propertytype=" + event.data.propertytype + "&program=" + event.data.program);
		} else if (event.data.type == "verified") {
			if (!verified) {
				callback(event.data.data);	
				verified = 1;
				setTimeout(function() { verified = 0; }, 5000); // don't process the event multiple times
			}
		}
	}
}

var MidstreamWidget = { 

	"configure": function(options) {
		if (!options.products || !options.products.length || !options.apikey || !options.uid) {
			alert("Missing parameters in MidstreamWidget request");
			return;	
		}
		var ifrm = document.createElement('iframe');
		var container = document.createElement('div');
		server = "https://rebatebus-staging.herokuapp.com/";
		var i;		
		var prodStr = "[";
		for (i = 0; i < options.products.length - 1; i++) {
			prodStr = prodStr + options.products[i] + ",";
		}
		prodStr = prodStr + options.products[i] + "]";
		initWidget(container, ifrm);	
		if (options.server) {
			server = options.server;	
		}
		ifrm.onload = function() {
			window.addEventListener("message", getBusFn(ifrm, options.verified), false);
		};
		document.body.appendChild(container); // to place at end of document
		container.appendChild(ifrm);

		if (options.programid && options.zip && options.propertytype) {
			ifrm.setAttribute('src', server + "midstreamwidget?program=" + options.rebateid + "&zip=" + options.zip + "&product=" + options.productid + "&apikey=" + options.apikey + "&uid=" + options.uid + "&propertytype=" + options.propertytype);
		}
		else {
		// usual configuration - figure that stuff out through the widget
			
			ifrm.setAttribute('src', server + "midstreamcheck?products=" + prodStr + "&apikey=" + options.apikey + "&uid=" + options.uid);
		}
	}

};

