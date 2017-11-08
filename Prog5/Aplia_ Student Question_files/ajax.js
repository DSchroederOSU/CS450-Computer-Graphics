/*
 * Turn AJAX call into unique URL to defeat browser cache and proxy cache.
 * Note that it is important to craft unique URL on the outbound call, and also have
 * servlet to return the correct No-Cache HTTP headers.
 */
function uniqueUrl(url) {

	// append &_t=millis to end (or ?_t=millis if no query params)
	if (url.indexOf("?") == -1) {
		return url + "?_t=" + new Date().getTime();
	} else {
		return url + "&_t=" + new Date().getTime();
	}
}

/*
 * Get URL Parameter from current window.location.href
 */
function getUrlParam(strParamName, doLowerCase){
    var strReturn = "";
	var strHref = window.location.href;
	if (strHref.indexOf("?") > -1) {
		var strQueryString = strHref.substr(strHref.indexOf("?"));
        if (doLowerCase == 'undefined' || doLowerCase == true) {
            strQueryString = strQueryString.toLowerCase();
        }
		var aQueryString = strQueryString.split("&");
		for (var iParam = 0; iParam < aQueryString.length; iParam++) {
			if (aQueryString[iParam].indexOf(strParamName.toLowerCase() + "=") > -1) {
		        var aParam = aQueryString[iParam].split("=");
		        strReturn = aParam[1];
		        break;
		    }
    	}
 	}
	return unescape(strReturn);
}