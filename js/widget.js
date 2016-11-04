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


var closeMidstreamFrame = function() {
	var ifrm = document.getElementById("busctr");
	if (ifrm != null) 
		document.body.removeChild(ifrm);
}

var getBusFn = function(callback) {
	return function(event) {
		if (event.data.type == "removebusfrm") {
			closeMidstreamFrame();
		} else if (event.data.type == "verified") {
			callback(event.data.verification, event.data.amount, event.data.maxqty);	
		}
	}
}

var MidstreamWidget = { 

	"configure": function(options) {
		if (!options.rebateid || !options.productid || !options.apikey || !options.uid) {
			alert("Missing parameters in MidstreamWidget request");
			return;		
		}
		var ifrm = document.createElement('iframe');
		var container = document.createElement('div');
		var server = "https://www.rebatebus.com/";
		initWidget(container, ifrm);	
		if (options.server) {
			server = options.server;	
		}
		ifrm.onload = function() {
			window.addEventListener("message", getBusFn(options.verified), false);
		};
		document.body.appendChild(container); // to place at end of document
		container.appendChild(ifrm);

		// assign url
		ifrm.setAttribute('src', "midstreamwidget?rebate=" + options.rebateid + "&product=" + options.productid + "&apikey=" + options.apikey + "&uid=" + options.uid);
	}

};

