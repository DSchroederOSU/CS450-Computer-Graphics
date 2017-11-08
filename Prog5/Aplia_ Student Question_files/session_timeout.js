var ROLE_STUDENT = 'student';
var ROLE_INSTRUCTOR = 'instructor';
var ROLE_DEMOUSER = 'demoUser';
var ROLE_OTHER = 'other';
var timerId = null;
var sessionTimer = null;
var originalTitle = document.title;
var blinkTitleBarId;
var flashObjects;
var objectHeights = [];

function stoLocateJQuery() {
    if (typeof apliaJQuery != 'undefined') {
        return apliaJQuery
    }
    else return jQuery;
}

var stoJQuery =  stoLocateJQuery();

function SessionTimer(warning_time, expiration_time, role, platform, debug) {
	var startTime = 0;
	var warningTime = warning_time;
	var expirationTime = expiration_time;
	var userRole = role;
	var userPlatform = platform;
	var debugMode = debug;
	var status = 'active';

	return {
		now: function() {
			return (new Date()).getTime();
		},

		start: function() {
			startTime = this.now();
			timerId = setInterval(checkTimer, 1000);
		},

		since: function() {
			return (this.now() - startTime);
		},

		getUserRole: function() {
			return userRole;
		},

		checkStatusDemoUser: function() {
			var timeElapsed = this.since();

			if (timeElapsed > warningTime) {
				// We've hit the warning threshold
				if (timeElapsed > expirationTime) {
					// We've hit the expiration threshold
					status = 'expired';
					// sign off user
					this.invalidateSession(startTime, this.now(), this.since(), expirationTime);
                    clearInterval(timerId);
				} else {
					// We haven't hit the expiration threshold
					status = 'warning';
				}
			} else {
				// We haven't hit the warning threshold
				status = 'active';
			}
		},

		checkStatus: function() {
			var timeElapsed = this.since();
			if (debugMode) {
				updateDebugConsoleTimer(timeElapsed);
			}

			if (timeElapsed > warningTime) {
				// We've hit the warning threshold
				if (timeElapsed > expirationTime) {
					// We've hit the expiration threshold
					status = 'expired';
					if (debugMode) {
						//appendToDebugConsole("<b>Timeout (actual):</b> " + Math.round(timeElapsed / 1000) + "s");
					}

					// hide the warning dialog
					hideWarningDialog(userPlatform, userRole);

					// show the expiration dialog
					showTimeoutExpirationDialog(userPlatform, userRole);

					// sign off user
					this.invalidateSession(startTime, this.now(), this.since(), expirationTime);
                    clearInterval(timerId);
				} else {
					// We haven't hit the expiration threshold
					if (status === 'active') {
						if (debugMode) {
							//appendToDebugConsole("<b>Warning (actual):</b> " + Math.round(timeElapsed / 1000) + "s");
						}

						// show the warning dialog
						showTimeoutWarningDialog(userPlatform, userRole);

						// alert the title bar
                        blinkTitleBarId = setInterval(alertTitleBar, 1000);
					}

					stoJQuery(".session-time-remaining").html(this.getTimeRemaining(timeElapsed));
					status = 'warning';
				}
			} else {
				// We haven't hit the warning threshold
				status = 'active';
			}
		},

		getTimeRemaining: function(timeElapsed) {
			var timeRemaining = expiration_time - timeElapsed;
			if (timeRemaining >= 60000) {
				var minutes = Math.ceil(timeRemaining / 60000);
				return minutes + (minutes == 1 ? " minute" : " minutes");
			} else {
				var seconds = Math.round(timeRemaining / 1000);
				return seconds + (seconds == 1 ? " second" : " seconds");
			}
		},

		continueSession: function() {
			// ping the server to continue the session
			stoJQuery.ajax({
				type: "POST",
				url: "/af/servlet/pingajax",
				success: function(data) {
					var result = stoJQuery.parseJSON(data);
					if (result.status == 1) {
						if (debugMode) {
							//appendToDebugConsole("<b>Session continued...</b>");
						}

						// restart the timer
						clearInterval(timerId);
						sessionTimer.start();

						// hide the warning dialog
						hideWarningDialog(userPlatform, userRole);

						// show all the flash objects
						showFlashObjects();
					}
				}
			});
		},

		invalidateSession: function(start, now, elapsed, timeout) {
			// send a logoff request to the server
			var requestData = {
				"start": start,
				"now": now,
				"elapsed": elapsed,
				"timeout": timeout
			};

			stoJQuery.ajax({
				type: "POST",
				url: "/af/servlet/logoffajax",
				dataType: "json",
				data: requestData
			});
		},

		loginUser: function() {
			var errorMsg = stoJQuery("#error-msg");
			errorMsg.css("display", "none");

			var email = stoJQuery.trim(jQuery("#reloginEmail").val());
			var password = stoJQuery.trim(stoJQuery("#reloginPassword").val());

			if (this.validateLoginForm(email, password)) {
				// form is valid; send login request
				var formData = stoJQuery("#ReloginForm").serialize();

				// open the please wait dialog
				stoJQuery("#dialogPleaseWait").dialog("open");

				// fire off the ajax request
				jQuery.ajax({
					type: "POST",
					url: "/af/servlet/loginajax",
					dataType: "json",
					data: formData,
					success: function(result) {
						switch (result.status) {
							// successful login by a different user
							case 1:
								window.location.href = result.redirectURL;
								break;

							// successful login by the same user
							case 2:
								sessionTimer.renewSession();
								break;

							// invalid login credentials
							case 3:
								errorMsg.html(result.errorMessage);
								errorMsg.css("display", "block");
								break;

							// inactive or disabled user
							case 4:
								window.location.href = result.redirectURL;
								break;

							// mindapp session detected
							case 6:
								errorMsg.html(result.errorMessage);
								errorMsg.css("display", "block");
								break;

							// sso error
							case 5:
                                errorMsg.html(result.errorMessage);
                                errorMsg.css("display", "block");
                                break;
							default:
								errorMsg.html("There was an error processing your request.   Please try again.");
								errorMsg.css("display", "block");
						}

						// close the please wait dialog
						stoJQuery("#dialogPleaseWait").dialog("close");
					},
					error: function() {
						errorMsg.html("There was an error processing your request.   Please try again.");
						errorMsg.css("display", "block");

						// close the please wait dialog
						jQuery("#dialogPleaseWait").dialog("close");
					}
				});
			}
		},

		validateLoginForm: function(email, password) {
			var errorMsg = stoJQuery("#error-msg");
			// validate email
			if (email.length == 0) {
				errorMsg.html("Please enter an e-mail address");
				errorMsg.css("display", "block");
				return false;
			} else {
				// validate password
				if (password.length == 0) {
					errorMsg.html("Please enter a password");
					errorMsg.css("display", "block");
					return false;
				} else {
					errorMsg.css("display", "none");
					return true;
				}
			}
		},

		renewSession: function() {
			if (debugMode) {
				//appendToDebugConsole("<b>Session renewed...</b>");
			}

			// restart the timer
			clearInterval(timerId);
			sessionTimer.start();

			// hide the expiration dialog
			hideExpirationDialog(userPlatform, userRole);

			// show all the flash objects
			showFlashObjects();
		}
	}
}

function checkTimer() {
	if (sessionTimer != null) {
		if (sessionTimer.getUserRole() === ROLE_DEMOUSER)
			sessionTimer.checkStatusDemoUser();
		else
			sessionTimer.checkStatus();
	}
}

function alertTitleBar() {
	if (new Date().getSeconds() % 2 == 0)
		document.title = originalTitle;
	else
		document.title = "Aplia session timeout!";
}

function hideFlashObjects() {
	flashObjects = document.getElementsByTagName("object");
	for (var i = 0, count = flashObjects.length; i < count; i++) {
		// hide the ApliaText Flipbook
		if (flashObjects[i].id === 'flipbook') {
			flashObjects[i].style.visibility = "hidden";
		}
		// hide the parent of the flash object
		var flashObjParent = flashObjects[i].parentNode;
		objectHeights.push(flashObjParent.style.height);
		flashObjParent.style.height = 0;
		flashObjParent.style.visibility = "hidden";
	}
}

function showFlashObjects() {
	for (var i = 0, count = flashObjects.length; i < count; i++) {
		// show the ApliaText Flipbook
		if (flashObjects[i].id === 'flipbook') {
			flashObjects[i].style.visibility = "visible";
		}
		// show the parent of the flash object
		flashObjects[i].parentNode.style.height = objectHeights[i];
		flashObjects[i].parentNode.style.visibility = "visible";
	}
}

function showTimeoutDescDialog(){
    hideFlashObjects();
    stoJQuery('#dialogTimeoutDesc').dialog('open');
}

var expTime;

function initDebugConsole(warningTime, expirationTime, showConsole) {
    expTime = expirationTime/1000;
    var html;
    if (showConsole)
	    html = '<div id="debug-timeout">';
    else
        html = '<div id="debug-timeout" style="display:none">';
    html += '<div class="closeTimeout"><a href="javascript:closeTimeout();"><img src="/images/icon_close_grey.png" height="10" width="10" id="minimizeTimeout"/></a></div>';
	html += '<div class="leftTimeout"> <a class="timeout" href="javascript:showTimeoutDescDialog();"><div style="height:16px">Session</div><div style="height:16px">Timeout</div></a></div><div class="rightTimeout"><span id="debug-timer">' + convertTimeoutTime(0) + '</span></div>';
	html += '<div class="clearfix" style="background-color: #323232;"></div></div>';
	stoJQuery("body").append(html);
    var collapsedHtml;
    if (showConsole)
        collapsedHtml = '<div id="collapsed-debug-timeout" style="display:none;">';
    else
        collapsedHtml = '<div id="collapsed-debug-timeout">';

    collapsedHtml += '<div class="timeoutPlaceholder"><img id="open-timeout" src="/images/icon_contracted.gif" onclick="openTimeout();"/></div></div>'
    stoJQuery("body").append(collapsedHtml);
}

function updateDebugConsoleTimer(time) {
	stoJQuery("#debug-timer").html(convertTimeoutTime(time));
}

function closeTimeout(){
    stoJQuery.ajax({
        url: "/af/servlet/coursehome?crshome_command=toggleTimeoutDisplay",
        cache: false
    });
    stoJQuery( "#debug-timeout" ).toggle("slide", {direction: "right"});
    stoJQuery( "#collapsed-debug-timeout" ).toggle("slide", {direction: "left"});
}

function openTimeout(){
    stoJQuery.ajax({
        url: "/af/servlet/coursehome?crshome_command=toggleTimeoutDisplay",
        cache: false
    });
    stoJQuery( "#collapsed-debug-timeout" ).toggle("slide", {direction: "right"});
    stoJQuery( "#debug-timeout" ).toggle("slide", {direction: "right"});
}

function convertTimeoutTime(time){
    var timeLeftSeconds = expTime - (Math.round(time / 1000));
    if (timeLeftSeconds < 0)
        return '00:00';
    var minutes = Math.floor(timeLeftSeconds / 60);
    var seconds = timeLeftSeconds - minutes * 60;
    var minStr = minutes + '';
    var secStr = seconds + '';
    if (minStr.length == 1)
        minStr = '0' + minStr;
    if (secStr.length == 1)
        secStr = '0' + secStr;
    return minStr + ':' + secStr;
}


function appendToDebugConsole(html) {
	stoJQuery("#debug-timeout").append(html + "<br>");
}

function initSessionTimeoutDialogs() {
    /* Timeout Description Aplia */
    stoJQuery("#dialogTimeoutDesc").dialog({
        draggable : false,
        resizable : false,
        title : "About Session Timeout",
        width : 420,
        height : "auto",
        autoOpen : false,
        describedBy : "descTimeout",
        dialogClass : "aplia-dialog",
        modal : true,
        closeOnEscape: false,
        buttons : { "Close": function() { stoJQuery(this).dialog("close");showFlashObjects(); }}
    });

	/* Warning Dialog - Aplia - Student */
	stoJQuery("#dialogTW-aplia-student").dialog({
		draggable : false,
		resizable : false,
		title : "Are you still there?",
		width : 420,
		height : "auto",
		autoOpen : false,
		describedBy : "descTW-aplia-student",
		dialogClass : "aplia-dialog",
		modal : true,
		closeOnEscape: false,
		buttons : { "Continue my session": function() { sessionTimer.continueSession(); }}
	});

	/* Warning Dialog - Aplia - Instructor */
	stoJQuery("#dialogTW-aplia-instructor").dialog({
		draggable : false,
		resizable : false,
		title : "Are you still there?",
		width : 420,
		height : "auto",
		autoOpen : false,
		describedBy : "descTW-aplia-instructor",
		dialogClass : "aplia-dialog",
		modal : true,
		closeOnEscape: false,
		buttons : { "Continue my session": function() { sessionTimer.continueSession(); }}
	});

	/* Expiration Dialog - Aplia - Student */
	stoJQuery("#dialogTE-aplia-student").dialog({
		draggable : false,
		resizable : false,
		title : "You have been signed out",
		width : "auto",
		height : "auto",
		autoOpen : false,
		describedBy : "descTE-aplia-student",
		dialogClass : "aplia-dialog",
		modal : true,
		closeOnEscape: false,
		buttons : { "Sign In": function() { sessionTimer.loginUser(); }}
	});

	/* Expiration Dialog - Aplia - Instructor */
	stoJQuery("#dialogTE-aplia-instructor").dialog({
		draggable : false,
		resizable : false,
		title : "You have been signed out",
		width : 400,
		height : "auto",
		autoOpen : false,
		describedBy : "descTE-aplia-instructor",
		dialogClass : "aplia-dialog",
		modal : true,
		closeOnEscape: false,
		buttons : { "Go to Aplia main page": function() { window.location.href = "https://www.aplia.com/"; }}
	});

	/* Warning Dialog - Gateway - Student */
	stoJQuery("#dialogTW-gateway-student").dialog({
		draggable : false,
		resizable : false,
		title : "Are you still there?",
		width : 420,
		height : "auto",
		autoOpen : false,
		describedBy : "descTW-gateway-student",
		dialogClass : "aplia-dialog",
		modal : true,
		closeOnEscape: false,
		buttons : { "Continue my session": function() { sessionTimer.continueSession(); }}
	});

	/* Warning Dialog - Gateway - Instructor */
	stoJQuery("#dialogTW-gateway-instructor").dialog({
		draggable : false,
		resizable : false,
		title : "Are you still there?",
		width : 420,
		height : "auto",
		autoOpen : false,
		describedBy : "descTW-gateway-instructor",
		dialogClass : "aplia-dialog",
		modal : true,
		closeOnEscape: false,
		buttons : { "Continue my session": function() { sessionTimer.continueSession(); }}
	});

	/* Expiration Dialog - Gateway - Student */
	stoJQuery("#dialogTE-gateway-student").dialog({
		draggable : false,
		resizable : false,
		title : "You have been signed out",
		width : 400,
		height : "auto",
		autoOpen : false,
		describedBy : "descTE-gateway-student",
		dialogClass : "aplia-dialog",
		modal : true,
		closeOnEscape: false
	});

	/* Expiration Dialog - Gateway - Instructor */
	stoJQuery("#dialogTE-gateway-instructor").dialog({
		draggable : false,
		resizable : false,
		title : "You have been signed out",
		width : 400,
		height : "auto",
		autoOpen : false,
		describedBy : "descTE-gateway-instructor",
		dialogClass : "aplia-dialog",
		modal : true,
		closeOnEscape: false
	});

	/* Warning Dialog - MindApp - Student */
	stoJQuery("#dialogTW-mindapp-student").dialog({
		draggable : false,
		resizable : false,
		title : "Are you still there?",
		width : 420,
		height : "auto",
		autoOpen : false,
		describedBy : "descTW-mindapp-student",
		dialogClass : "mindapp-modal-dialog",
		modal : true,
		closeOnEscape: false,
		buttons : { "Continue my session": function() { sessionTimer.continueSession(); }}
	});

	/* Warning Dialog - MindApp - Instructor */
	stoJQuery("#dialogTW-mindapp-instructor").dialog({
		draggable : false,
		resizable : false,
		title : "Are you still there?",
		width : 420,
		height : "auto",
		autoOpen : false,
		describedBy : "descTW-mindapp-instructor",
		dialogClass : "mindapp-modal-dialog",
		modal : true,
		closeOnEscape: false,
		buttons : { "Continue my session": function() { sessionTimer.continueSession(); }}
	});

	/* Expiration Dialog - MindApp - Student */
	stoJQuery("#dialogTE-mindapp-student").dialog({
		draggable : false,
		resizable : false,
		title : "You have been signed out",
		width : 400,
		height : "auto",
		autoOpen : false,
		describedBy : "descTE-mindapp-student",
		dialogClass : "mindapp-modal-dialog",
		modal : true,
		closeOnEscape: false
	});

	/* Expiration Dialog - MindApp - Instructor */
	stoJQuery("#dialogTE-mindapp-instructor").dialog({
		draggable : false,
		resizable : false,
		title : "You have been signed out",
		width : 400,
		height : "auto",
		autoOpen : false,
		describedBy : "descTE-mindapp-instructor",
		dialogClass : "mindapp-modal-dialog",
		modal : true,
		closeOnEscape: false
	});
}

function showTimeoutWarningDialog(platform, role) {
	// hide all flash objects on the page before showing the dialog
	hideFlashObjects();

	stoJQuery("#dialogTW-"+platform+"-"+role).dialog("open");
}

function hideWarningDialog(platform, role) {
	stoJQuery("#dialogTW-"+platform+"-"+role).dialog("close");

	// stop alerting the title bar
	clearInterval(blinkTitleBarId);
	document.title = originalTitle;
}

function showTimeoutExpirationDialog(platform, role) {
	stoJQuery("#dialogTE-"+platform+"-"+role).dialog("open");

	if (platform === 'aplia' && role === ROLE_STUDENT) {
        stoJQuery('#reloginEmail').val('');
        stoJQuery('#reloginPassword').val('');
        stoJQuery("form#ReloginForm input").keypress(function(event) {
			if (event.which == 13) {
				event.preventDefault();
				sessionTimer.loginUser();
				return false;
			}
		});
	}
}

function hideExpirationDialog(platform, role) {
	stoJQuery("#dialogTE-"+platform+"-"+role).dialog("close");
}
