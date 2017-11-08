jQuery(document).ready(function() {
	// draw the Q4 quiz item
    renderQuizView(attemptId, userGuid);

//    $("#vaa-attempt-" + 1).text('T');
//    $("#vaa-attempt-" + 1).addClass('vaa-bold');
//    $("#vaa-attempt-" + 1).removeClass('vaa-bold');
});

function renderQuizView(attempt, studentGuid) {
    var action = "QUIZ_PAGE";
    loadItemDetailAsynchronous ('div#q4-0001', problemGuid, attempt, studentGuid, action, updateQuizPage);
}

function tryAnother() {
	attemptId = attemptId + 1;
	if(-1 == document.location.href.indexOf('attempt'))
	{
		document.location.href = document.location.href + "&attempt=" + attemptId;
	}
	else
	{
		var idx = document.location.href.indexOf('&attempt=');
		var withoutAttemptHref = document.location.href.substring(0, idx);
		// replace the attempt parameter with a new attempt ('try another' attempt)
		document.location.href = withoutAttemptHref + "&attempt=" + attemptId;
	}
}

function grade(action) {
	var studentAnswer = getStudentAnswer('div#q4-0001');

	// get the time (millis) that the student viewed the loaded question
	// deltaTimer is restarted every time question is loaded, and updated every time an answer is submitted
	deltaTimer.update();
	var timeOnTask =  deltaTimer.getDelta();
	window.scrollTo(0, 0);
    finalizeAndSubmitAnswerAsynchronous(action, ctx, userGuid, problemGuid, studentAnswer, attemptId, updateQuizPage, 'div#q4-0001', timeOnTask, !isPractice);
}

function isUnsupportedBrowser() {
	// APLIAQF-2210 This function determines if the Q4 problem is being rendered in an unsupported browser.
	// It should return true iff a) the problem has fully loaded and b) there is a turnaway message in it.
	return (isLoaded && jQuery('#unsupportedBrowserMessage').length > 0);
}

// This gets called from the parent jsp, onClick on any page navigational element other than our own quiz buttons
// The purpose is to prevent students from losing their work if they accidentally click away from the quiz page
// after answering something (but not saving or checking that answer yet)
function willStudentLoseAnswer() {
	if(!canSubmit) {
		return false; //if they can't submit the question, no point in checking if they changed it
	}
	if(!isLoaded) {
		return false; //if they can't even view the question, no point in checking if they changed it
	}
	if(saved) {
		return false;
		// if we just saved this item, we should be free to continue to next page
	}
	try {

		return studentWillLoseAnswer('div#q4-0001');
		/*
		 // NOTE: if getStudentAnswer returns something different than the original page state,
		 // but the student doesn't need to save their answer because it isn't different from the original answer,
		 // that is a bug in the renderer.  student answer (also known as client delta or item state) should contain
		 // only the information necessary to grade/view this question later
		 // Please fix any bugs in the q4 renderer delta mechanism in the q4 provided js libraries, not here.

		 // This code must treat item state like a black box or it violates the CIS API contract,
		 // used for external Q4 integraitons also.
		 }*/

	} catch (e) {
		// return false (this will only happen if the getClientDelta method failed, so we don't know if the answer is different or not)
		// having it throw an exception was blocking any navigation away from this page, when Q4 rendering or delta calculation error occurs.
		return false;
	}
}


// update the score row, attempts box, buttons, etc (everything except the actual rendered problemSetItem)
function updateQuizPage(quizItemView) {

    updateViewAllAttempts(quizItemView)

	updateContentsDivWidth();
	attemptId = quizItemView.currentAttemptNumber;

	//itemStateSerialized = getStudentAnswer('div#q4-0001');

	jQuery('#problemTitleDiv').empty().append('<strong>'+quizItemView.problemNumber+'. '+htmlEncode(quizItemView.problemTitle)+'</strong>');

	//update the score row
	var attemptsDiv = jQuery("#attemptsDiv");
	var attemptsDetailDiv = jQuery("#attemptsDetailDiv");
	var nonScoreGinOuterDiv = jQuery("#nonScoreGinOuterDiv");
	var gradedBoxDiv = jQuery("#gradedBoxDiv");
	var ginInProgressDiv = jQuery("#ginInProgressDiv");
	var ginScoreDiv = jQuery("#ginScoreDiv");

	// hide all the score divs.  this method will populate & show those that should be shown
	attemptsDiv.css("display","none");
	nonScoreGinOuterDiv.css("display", "none");
	gradedBoxDiv.css("display", "none");
	ginInProgressDiv.css("display", "none");
	ginScoreDiv.css("display", "none");
	// todo: hide the rest

	canSubmit = quizItemView.canSubmit;
	if(quizItemView.ginGradingMode == "PRACTICE") {
		isPractice = true;
	}

	isLoaded = true;
	deltaTimer.start();	 //tell deltaTimer to start when question is rendered.
	window.scrollTo(0, 0);

	if (!isUnsupportedBrowser()) {
		// show the right buttons
		var buttons = quizItemView.buttons;

		for (var idx in buttons) {
			if(buttons[idx]) {
				jQuery('#' + idx + "Div").css("display","block");
			}
			else {
				jQuery('#' + idx + "Div").css("display","none");
			}
		}

		// APLIAQF-596 Hack to fix IE
		// TODO: clean this up?
		jQuery('span.q4-select-hitarea').focus(function(){
			jQuery(this).css('background', 'transparent');
		});
	}

	// does this q4-container contain a q4-activity or a q4-item?
	if(jQuery('.q4-container-root').children('.q4-activity-container').length == 1) {
		// q4-activity
		jQuery('.q4-problem').addClass('activity');
	}
}

//function isVisible(){
//    jQuery('#continueWithoutSaveDiv').show();
//}
//
////hookup the event
//jQuery('#gradeItNowButtonDiv').bind('isVisible', isVisible);
//
////show div and trigger custom event in callback when div is visible
//jQuery('#gradeItNowButtonDiv').show('slow', function(){
//    jQuery(this).trigger('isVisible');
//});

