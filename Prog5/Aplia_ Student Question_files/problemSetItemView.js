var jQ;

if (typeof jQuery === 'undefined') {
    if (typeof apliaJQuery != 'undefined')
        jQ = apliaJQuery;
}
else
    jQ = jQuery;


//Codes for errors that do not come from QuizService
var Q4_ERROR_SESSION_TIMEOUT_ERROR = "-1";
var Q4_ERROR_MALFORMED_RESPONSE = "-2";
var Q4_ERROR_COMMUNICATIONS = "-3";


if (jQ) {
    jQ(document).ready(function () {
        // initialize please wait dialog since it is referenced before scripts.jsp is referenced
        jQ("#dialogPleaseWait").dialog({
            draggable: false,
            resizable: false,
            width: "auto",
            height: "auto",
            minWidth: "auto",
            minHeight: "auto",
            autoOpen: false,
            describedBy: "descPleaseWait",
            modal: true,
            dialogClass: "dialogPleaseWait"
        });
    });
}

//hash map of all Q4CengageItemAdapters for this page (hashed on div id)
var cengageItemAdapters = {};

function renderView(problemDivId, problemGuid, attempt, studentGuid, action, useCorrectAnswer, myJQuery)
{
    if (typeof myJQuery != 'undefined'){
        jQ = myJQuery;
        jQ("#dialogPleaseWait").dialog({
            draggable: false,
            resizable: false,
            width: "auto",
            height: "auto",
            minWidth: "auto",
            minHeight: "auto",
            autoOpen: false,
            describedBy: "descPleaseWait",
            modal: true,
            dialogClass: "dialogPleaseWait"
        });
    }

    loadItemDetailAsynchronous (problemDivId, problemGuid, attempt, studentGuid, action, updatePage, useCorrectAnswer);
}

function updateContentsDivWidth()
{
    // set the width of the assignment header in quiz_main_qna.jsp
    var contentsWidth = YAHOO.util.Dom.getStyle("quiz-cip", "width");
    YAHOO.util.Dom.setStyle("assignment", "width", contentsWidth);
}

function updatePage(quizItemView, problemDivId)
{
    // does this q4-container contain a q4-activity or a q4-item?
    if(jQ('.q4-container-root').children('.q4-activity-container').length == 1) {
        // q4-activity
        jQ('.q4-problem').addClass('activity');
    }

    updateQuestionTypeDisplay(quizItemView, problemDivId);
}

function updateQuestionTypeDisplay(quizItemView, problemDivId)
{
    var assignmentTypeDiv = jQ(problemDivId + '-assignmentType');
    var assignmentType = assignmentTypeDiv.find('.assignmentType');

    if(quizItemView.ginGradingMode == "AVERAGE" || quizItemView.ginGradingMode == "DO_NO_HARM" || quizItemView.ginGradingMode == "HIGHEST")
    {
        assignmentType.html('Grade it Now');
    }
    else if(quizItemView.ginGradingMode == "PRACTICE")
    {
        assignmentType.html('Practice');
    }
    else
    {
        assignmentType.html('Graded');
    }

    // show
    assignmentTypeDiv.removeClass('q4-hidden');
}

// currently this is only used on student quiz page
function finalizeAndSubmitAnswerAsynchronous(action, ctx, userGuid, problemGuid, itemState, attemptId, updatePageCallback, problemDiv, timeOnTask, warnIfNotComplete)
{
    var showFeedback=false;
    if("CHECK" == action)
    {
        showFeedback = true;
    }

    var callbackAfterFinalize = function(){
        submitAnswerAsynchronous(action, ctx, userGuid, problemGuid, itemState, attemptId, updatePageCallback, problemDiv, timeOnTask, warnIfNotComplete);
    }
    cengageItemAdapters[problemDiv].finalize(callbackAfterFinalize);
}

function isQuestionCompleted(problemDiv)
{
    return cengageItemAdapters[problemDiv].isCompleted();
}

// currently this is only used on student quiz page
function submitAnswerAsynchronous(action, ctx, userGuid, problemGuid, itemState, attemptId, updatePageCallback, problemDiv, timeOnTask, warnIfNotComplete)
{
    if(warnIfNotComplete)
    {
        var completedQuestion = isQuestionCompleted(problemDiv);
        if(!completedQuestion)
        {
            if(action == "CHECK")
            {
                // check answer when not all steps are submitted
                var doIt = confirm("You haven't completed all steps!  \n\n If you grade the question now, you will receive 0 points for all incomplete steps");
                if(!doIt)
                {
                    return;
                }
            }
            else
            {
                // save and continue when not all steps are submitted
                alert("Don't forget to complete all steps!  \n\n You haven't finished all of the steps for this problem.  Make sure you return to complete them before the due date.  You won't receive credit for any incomplete steps");
            }
        }
    }

    if(!showPleaseWaitDialog())
    {
        // already busy handling a prior command
        // TODO: error?
        return;
    }

    var callback = function(itemDetailView)
    {
        if("CHECK" == action)
        {
            // do nav next/buttons/etc, show feedback
            return renderItemDetail(problemDiv, itemDetailView, updatePageCallback);
        }
        else
        { // save & continue, should go to next question, unless there were problems
            if( itemDetailView > "" && itemDetailView.responseCode > 0)
            {
                // error or warning state
                return renderItemDetail(problemDiv, itemDetailView, updatePageCallback);
            }
            else
            {
                // just nav to next item
                saved = true; // don't prompt the student about unsaved changes, we just saved
                hidePleaseWaitDialog();
                doLeavePage();
            }
        }
    }

    var errorCallback = function(errorCode, exceptionCode)
    {
        return showErrorMsg(problemDiv, errorCode, exceptionCode);
    }

    params =
    {
        problemGuid: problemGuid,
        clientAnswerData: itemState,
        action: action,
        timeOnTask : timeOnTask,
        attemptId : attemptId,
        r : Math.random(),
        ctx: ctx,
        userGuid: userGuid

    }
    jQ.ajax
    (
        {
            type: 'POST',
            url: '/af/servlet/problemSetItem/problemSetItemGrade',
            data: params,
            success: function (result)
            {
                var response = result.response;
                if(!response)
                {
                    var errorCode=Q4_ERROR_MALFORMED_RESPONSE;
                    errorCallback(errorCode,"");
                    return;
                }
                if(response.code != 0)
                {
                    errorCallback(response.code, response.exceptionCode);
                    return;
                }
                else
                {
                    var itemDetailView = response.itemDetailView;

                    if(! itemDetailView > "")
                    {
                        var errorCode=Q4_ERROR_MALFORMED_RESPONSE;
                        errorCallback(errorCode,"");
                        return;
                    }


                    // do callback
                    callback(itemDetailView);
                }

            },

            error: function(errorObj)
            {
                var errorCode = Q4_ERROR_COMMUNICATIONS;
                errorCallback(errorCode,"");
            }
        }
    );
}

function getStudentAnswer(problemDiv)
{
    return cengageItemAdapters[problemDiv].getState();
}

function studentWillLoseAnswer(problemDiv)
{
    // returns true if student has made unsaved changes to the answer
    return cengageItemAdapters[problemDiv].answerable() && cengageItemAdapters[problemDiv].hasStateChanged();
}

// student guid is optional
function loadItemDetailAsynchronous(problemDiv, problemGuid, attemptId, studentGuid, action, updatePageCallback, useCorrectAnswer)
{
    showPleaseWaitDialog();

    var errorCallback = function(errorCode, exceptionCode) {
        return showErrorMsg(problemDiv, errorCode, exceptionCode);
    }

    jQ.ajax(
        {
            type: 'POST',
            url: '/af/servlet/problemSetItem/loadCengageItemDependencies',
            data: {
                "problemGuid": problemGuid
            },
            success: function (result)
            {
                var response = result.response;
                if(!response)
                {
                    var errorCode=Q4_ERROR_MALFORMED_RESPONSE;
                    errorCallback(errorCode,"");
                    return;
                }
                if(response.code != 0)
                {
                    errorCallback(response.code, response.exceptionCode);
                    return;
                }
                else
                {
                    var dependenciesJSON = response.dependencies;

                    if(!dependenciesJSON)
                    {
                        var errorCode=Q4_ERROR_MALFORMED_RESPONSE;
                        errorCallback(errorCode, "");
                        return;
                    }

                    var js = dependenciesJSON.js;
                    var css = dependenciesJSON.css;

                    var isJsLoaded = false;

                    // APLIAQF-5939 We need to keep the JS from loading until all the CSS has finished.
                    var loadJavascript = function () {
                        if (isJsLoaded) {
                            return;
                        }

                        isJsLoaded = true;

                        $LAB.setOptions({ AlwaysPreserveOrder:true })
                            .script(js)
                            .wait(function() {

                                // TODO: set cengageItemInitParams
                                var cengageItemInitParams;

                                // TODO: get class name from dependency result
                                var cengageItemAdapter = new Q4CengageItemAdapter(problemDiv, cengageItemInitParams);
                                cengageItemAdapters[problemDiv] = cengageItemAdapter;

                                var errorCallback = function(errorCode, exceptionCode)
                                {
                                    return showErrorMsg(problemDiv, errorCode, exceptionCode);
                                }

                                var callback = function(itemDetailView)
                                {
                                    cengageItemAdapter.onNeedsUpdate( function(eventTypeName, renderUpdateData, isBlockingCall, isExpectScoreUpdate, afterUpdateCallback){
                                        renderUpdate(eventTypeName, renderUpdateData, problemDiv, problemGuid, attemptId, studentGuid, action, useCorrectAnswer, isBlockingCall, isExpectScoreUpdate, afterUpdateCallback);
                                    });

                                    return renderItemDetail(problemDiv, itemDetailView, updatePageCallback);
                                }

                                params =
                                {
                                    problemGuid : problemGuid,
                                    r : Math.random()
                                }

                                if(useCorrectAnswer)
                                {
                                    //if student_guid provided, view this quiz problem for that student (with their answer)
                                    //if not provided, the current logged in (session) user will be used
                                    params["useCorrectAnswer"] = "yes";
                                }

                                if(studentGuid)
                                {
                                    //if student_guid provided, view this quiz problem for that student (with their answer)
                                    //if not provided, the current logged in (session) user will be used
                                    params["studentGuid"] = studentGuid;
                                }
                                if(action)
                                {
                                    params["action"] = action;
                                }

                                if(attemptId)
                                {
                                    // if attemptId provided, view that attempt
                                    // if not provided, the current active attempt will be used (as determined by QuizService)
                                    params["attempt"] = attemptId;

                                    if (typeof isViewAttempt !== "undefined" && isViewAttempt === true)
                                    {
                                        params["isViewAttempt"] = "yes";
                                    }
                                }
                                jQ.ajax
                                (
                                    {
                                        type: 'POST',
                                        url: '/af/servlet/problemSetItem/problemSetItemView',
                                        data: params,
                                        success: function (result)
                                        {
                                            var response = result.response;
                                            if(!response)
                                            {
                                                var errorCode=Q4_ERROR_MALFORMED_RESPONSE;
                                                errorCallback(errorCode, "");
                                                return;
                                            }
                                            if(response.code != 0)
                                            {
                                                errorCallback(response.code, response.exceptionCode);
                                                return;
                                            }
                                            else
                                            {
                                                var itemDetailView = response.itemDetailView;

                                                // do callback
                                                callback(itemDetailView);
                                                return;
                                            }

                                        },

                                        error: function(errorObj)
                                        {
                                            var errorCode = Q4_ERROR_COMMUNICATIONS;
                                            errorCallback(errorCode,"");
                                            return;
                                        }
                                    }
                                );
                            });
                    }

                    var cssToLoad = {};
                    for (var i=0; i<css.length; i++) {
                        cssToLoad[css[i]] = 1;
                    }

                    // APLIAQF-5939 Older versions of Firefox (at least up to 7.0) don't support link.onload
                    if (/firefox\/[0-7]\./i.test(navigator.userAgent)) {
                        var styles = [];

                        var cssLoadIntervalHandle = setInterval(function() {
                            try {
                                for (var j=0; j<css.length; j++) {
                                    if (cssToLoad[css[j]] === 1) {
                                        return;
                                    }
                                }

                                for (var i=0; i<styles.length; i++) {
                                    // This will throw an exception in old FF versions if the stylesheet is not yet loaded
                                    styles[i].sheet.cssRules;
                                }
                                loadJavascript();
                                clearInterval(cssLoadIntervalHandle);
                            } catch (e){}
                        }, 100);

                        for (var i=0; i<css.length; i++) {
                            (function() {
                                var style = document.createElement('style');
                                style.textContent = '@import "' + css[i] + '"';
                                styles.push(style);

                                document.getElementsByTagName('head')[0].appendChild(style);

                                cssToLoad[css[i]] = 0;
                            })();
                        }
                    } else {
                        for (var i=0; i<css.length; i++) {
                            // APLIAQF-5939 Each <link> element has an onload event handler in which the presence of each stylesheet
                            // is checked for. If all are present, then we can proceed with loading the javascript.
                            (function() {
                                var fixedCss = css[i];
                                if (!document.getElementById(fixedCss))
                                {
                                    var link = document.createElement('link');
                                    link.rel = 'stylesheet';
                                    link.type = 'text/css';
                                    link.media = 'all';
                                    link.id = fixedCss;
                                    link.href = fixedCss;

                                    link.onload = function () {
                                        cssToLoad[fixedCss] = 0;

                                        for (var j=0; j<css.length; j++) {
                                            if (cssToLoad[css[j]] === 1) {
                                                return;
                                            }
                                        }
                                        loadJavascript();
                                    }

                                    document.getElementsByTagName('head')[0].appendChild(link);
                                }
                            })();
                        }
                    }

                    // APLIAQF-5947 Set a timeout; if the stylesheets have not been loaded at 60 seconds for whatever reason,
                    // let the javascript load anyway (in Show Full Questions mode, the questions collectively take much longer)
                    setTimeout(function(){
                        loadJavascript();
                    }, 60000);
                }
            },

            error: function(errorObj)
            {
                var errorCode = Q4_ERROR_COMMUNICATIONS;
                errorCallback(errorCode,"");
                return;
            }
        });
}

//Note: These are the error messages defined for Q4 question/answer errors.
//A similar set exists and is shared between CNow and QNA/Q3 answers.   See AnswerResponse.java.
//We should keep these in sync as much as possible, ideally they would be identical.
var errorMessages =
{
    /*  refactored below
     "-1": "<p><b>Session Timeout</b></p><p>You have been automatically signed out. Scroll to the top of the page and sign in again, then resubmit your answers.</p>",
     "11": "<p><b>Duplicate Answer</b></p><p>An answer has already been submitted for this question. Please contact customer support if this reoccurs and you believe it to be an error.</p>",
     "15": "<p>This timed assignment has not started.</p><p>Please go to the assignment page to start this assignment.</p>",
     "8": "<p><b>Time Expired</b></p><p>Your time limit on this assignment has expired.  You can no longer submit answers to this problem set.</p>",
     "6": "<p><b>Past Deadline</b></p><p>It is now past the deadline. You can no longer submit answers to this problem set.</p>",
     "9": "<p><b>Problem Deleted</b></p><p>This problem was recently deleted from your assignments. You can no longer submit an answer.</p>",
     "4": "<p><b>Assignment Removed</b></p><p>This assignment was recently removed.  You can no longer submit an answer.</p>",
     "17": "<p><b>Missing Parameter</b></p><p>The server received a request that was missing a required parameter. Please retry.</p>",
     "2018": "<p>This question contained an error or ambiguity when you answered it.</p><p>You have been granted full credit for the question. Here is the correct answer.</p>",
     "2019": "<p>The last time you submitted this answer, an unexpected error occurred that prevented your score from being saved.</p><p>Please resubmit this answer. If you are not able to resubmit your answer, please contact customer support.</p>",
     "26": "<p>A communications error has occurred, please try again. If you continue to have this problem even though your internet connection is working, please contact customer support.</p>",
     "2017": "<p>This question no longer supports multiple attempts.</p>",
     "2021": "<p>This question no longer supports checking your answer.</p>",
     "2020": "<p><b>Past Deadline</b></p><p>It is now past the deadline. You can no longer submit answers to this problem set.</p>"
     */

    //Errors whose codes are hardcoded in this file
    //See ExpiredSessionFilterQ4.java
    "-1":       {"title" : "Session Timeout",       "text" : "Your session has timed out.  Please sign in again to continue your assignment.", "blockRetry":false},
    "-2":          {"title" : "Unexpected Response",   "text" : "An unexpected response was received from the server. Usually these errors are temporary, so please retry.  If the error persists, please report this error code to customer support.", "blockRetry":false},
    "-3":              {"title" : "Communications Error",  "text" : "A communications error has occurred.  Please Retry.   This is likely a problem with your internet connection.", "blockRetry":false},

    //QuizService.STATUS_ERROR_ILLEGAL_ANSWER
    //QuizService.STATUS_ERROR_DUPLICATE_ANSWER
    //11 deprecated, replaced with 21.  11 should not occur
    "11":   {"title" : "Duplicate Answer",              "text" : "An answer has already been submitted for this question. Please contact customer support if this reoccurs and you believe it to be an error.", "blockRetry":false},
    "21":   {"title" : "Duplicate Attempt Error",       "text" : "An answer has already been submitted for this question.   If you think this is a mistake, please report the error code to customer support.", "blockRetry":true},
    //QuizService.STATUS_ERROR_TIMED_QUIZ_NOT_STARTED
    "15":   {"title" : "Not Started",                   "text" : "This timed assignment has not been properly started. If you think this is a mistake, please report the error code to customer support.", "blockRetry":false},
    //QuizService.STATUS_ERROR_TIME_LIMIT_EXPIRED
    "8":    {"title" : "Time Expired",                  "text" : "Your time limit on this assignment has expired.", "blockRetry":true},
    //QuizService.STATUS_ERROR_PAST_DUE
    "6":    {"title" : "Past Deadline",                 "text" : "It is now past the deadline. You can no longer submit answers to this assignment.", "blockRetry":true},
    //QuizService.STATUS_ERROR_PROBLEM_DELETED
    "9":    {"title" : "Problem Deleted",               "text" : "This problem was recently deleted from your assignment.", "blockRetry":true},
    //QuizService.STATUS_ERROR_INVALID_PROBLEM_SET
    "4":    {"title" : "Assignment Removed",            "text" : "This assignment was recently deleted from your course.", "blockRetry":true},
    //QuizService.STATUS_ERROR_INVALID_ATTEMPTS
    "13":   {"title" : "Answer Sequence Error",         "text" : "The server received an answer that was not in the expected sequence.  Usually these errors are temporary, so please retry.  If the error persists, please report the error code to customer support.", "blockRetry":false},
    //QuizService.STATUS_ERROR_MISSING_PARAMETER
    "17":   {"title" : "Missing Parameter Error",       "text" : "The server received a request that was missing a required parameter. Usually these errors are temporary, so please retry.  If the error persists, please report this error code to customer support.", "blockRetry":false},
    //QuizService.STATUS_ERROR_INVALID_VIEW
    "20":   {"title" : "View Sequence Error",           "text" : "The server received an invalid view request.  Usually these errors are temporary. Please refresh the page to try again. If the error persists, please report the error code to customer support.", "blockRetry":false},
    //QuizService.STATUS_WARN_FULL_CREDIT
    "2018": {"title" : "Updated Question",              "text" : "This question contained an error or ambiguity when you answered it. You have been granted full credit for the question. Here is the correct answer.", "blockRetry":true},
    //QuizService.STATUS_ERROR_MISSING_VIEW
    "2022":   {"title" : "Missing View Error",           "text" : "The server does not have a view recorded and cannot accept your answer. Please refresh the page to try again. If the error persists, please report the error code to customer support.", "blockRetry":true},
    //QuizService.STATUS_ERROR_INVALID_USER
    "3": {"title" : "Invalid User Error",              "text" : "The user identified in your view or answer request is not the logged in user. Please sign out and sign in again.", "blockRetry":true},

    //Following are some specialty Q4 error not handled by other content types
    //QuizService.STATUS_WARN_INTERRUPTED_DURING_GRADING
    "2019": {"title" : "Answer Save Error",             "text" : "Your answer or view could not be recorded.  Please refresh the page and try again. If the error persists, please report the error code to customer support.", "blockRetry":false},
    //QuizService.STATUS_WARN_SINGLE_ATTEMPT_GRADING_MODE
    "2017": {"title" : "Grading Mode Error",            "text" : "This question no longer supports multiple attempts.", "blockRetry":false},
    "2021": {"title" : "Grading Mode Error",            "text" : "This question no longer supports checking your answer.", "blockRetry":false},

    //Same as "6" above?   TODO: Make them use the same code unless they are inherently different
    //QuizService.STATUS_WARN_PAST_DUE
    "2020": {"title" : "Past Deadline",                 "text" : "It is now past the deadline. You can no longer submit answers to this assignment.", "blockRetry":false},

    //ApliaRuntimeException.QUIZ_EXCEPTION_ERROR_CODE
    "1006": {"title" : "Answer Sequence Error",       "text" : "The attempt number received was not expected.  Usually these errors are temporary, so please retry.  If the error persists, please report this error code to customer support.", "blockRetry":false}
}
var defaultErrorMessage = {"title" : "Error", "text" : "An unexpected error has occurred, please try again.  If it still fails, please print your answer and sign out, then sign in again and resubmit your answer.  If you continue to have trouble please report this error code to customer support.", "blockRetry":false};

function showErrorMsg(containerDivName, errorCode, exceptionCode)
{
    hidePleaseWaitDialog();

    var containerDiv = jQ(containerDivName);
    var htmlMessage = "";
    var title = defaultErrorMessage.title;
    var text = defaultErrorMessage.text;
    var blockRetry = false;
    if (typeof errorMessages[errorCode] !== 'undefined')
    {
        title = errorMessages[errorCode].title;
        text = errorMessages[errorCode].text;
        blockRetry = errorMessages[errorCode].blockRetry;
    }

    if (blockRetry)
        disableContinueButtons();

    htmlMessage += "<p><b>" + title + "</b></p>";
    htmlMessage += "<p>Exception code: " + errorCode;
    htmlMessage += exceptionCode ? ":" + exceptionCode : "";
    htmlMessage += "</p>";
    htmlMessage += "<p>" + text + "</p>";
    htmlMessage += "<p>When contacting support, we suggest you include a screenshot.  See <a href=\"http://www.take-a-screenshot.org/\" target=\"_new\">how to take a screenshot</a>.</p>";
    showYsn(containerDivName, htmlMessage);
}

var disableContinueButtons = function(){
    jQ('.grade-problem').attr("disabled","disabled");
    jQ('.msp-navigation-button').attr("disabled","disabled");
};

// TODO: is there a better way to do this than with a global variable?
var handlingButtonPress = false;

function hidePleaseWaitDialog()
{
    jQ("#dialogPleaseWait").dialog("close");

    handlingButtonPress= false;

    return true;
}

function showPleaseWaitDialog()
{
    if(handlingButtonPress)
    {
        // its already showing?
        return false;
    }
    handlingButtonPress= true;

    jQ("#dialogPleaseWait").dialog("open");

    return true;
}

function postRenderItem(quizItemView, responseCode, updatePageCallback, problemDivId)
{
    if(responseCode != 0)
    {
        // error
        showErrorMsg(cengageItemAdapter._containerDiv, responseCode);
        //TODO: only return if critical error... allow warnings through
        // categorize them by types, so we know what to do with the buttons/etc

        return;
    }

    // Check for invisible iframes, tell screen readers to ignore them
    jQ("iframe").attr('role', 'presentation');
    jQ("iframe").attr('tabindex', '-1');

    if(updatePageCallback) // if the calling page defined an 'update page' callback function
    {
        // update the buttons/view/attempts boxes/scores/problem title
        updatePageCallback(quizItemView, problemDivId);
    }

    hidePleaseWaitDialog();

    updateContinueWOSaving();
}

var updateContinueWOSaving = function() {
    if((jQ('#saveAndContinueButtonDiv').is(':visible') || jQ('#gradeItNowButtonDiv').is(':visible')) && !$("button:contains('Next Step >')").is(':visible')) {
        jQ('#q4-noSaveContinue').attr('style', 'display: table-row');
        if (jQ('.q4-activity-tabs').is(':visible'))
            if (!jQ('.msp-navigation-button').is(':visible'))
                jQ('#q4-noSaveContinue').attr('style', 'display: none');
    } else {
        jQ('#q4-noSaveContinue').attr('style', 'display: none');
    }
};



function renderItemDetail(problemDivId, itemDetailView, updatePageCallback)
{
    if(! itemDetailView > "")
    {
        var errorCode=Q4_ERROR_MALFORMED_RESPONSE;
        showErrorMsg(problemDivId, errorCode,"");
        return;
    }
    // error status
    if(itemDetailView.responseCode > 0 && itemDetailView.responseCode < 2000)
    {
        showErrorMsg(problemDivId,itemDetailView.responseCode);
        return;
    }

    // warning status
    else if(itemDetailView.responseCode > 2000)
    {
        // display warning, but don't halt (render) processing
        // Used when we want to show a warning to the user, but still render the item & buttons
        // for example
        // 1. grant full credit
        // 2. interrupted attempt
        // 3. prof changed grading mode to practice and user was doing 'try another'
        // 4. missing view attempt

        // TODO: this could trigger a warning header, different type of YSN, etc
        showErrorMsg(problemDivId,itemDetailView.responseCode);
    }

    cengageItemAdapter = cengageItemAdapters[problemDivId];
    // render the quiz item itself
    cengageItemAdapter.handleUpdate(itemDetailView.renderInfo,

        function(responseCode)
        {
            postRenderItem(itemDetailView.quizItemView, responseCode, updatePageCallback, problemDivId);
        }
    );
}

// below area resolve code was in document.ready()
//        jQ(document).bind('sendResolveAreaRequest',

function canProcessAsync(eventName)
{
    return true;

    // TOOD: may need to use this code, and solve the 'next step' memory leak (if leak isn't fixed in code)
    /*
     if("sendResolveAreaRequest" === eventName)
     {
     return true;
     }

     if("gradeStep" === eventName)
     {
     return true;
     }
     return false;
     */
}

function renderUpdate(eventName, eventData, problemDiv, problemGuid, attemptId, studentGuid, action, useCorrectAnswer, isBlockingCall, isExpectScoreUpdate, afterUpdateCallback) {

    //alert(action);

    if(canProcessAsync(eventName))
    {

        if(!showPleaseWaitDialog())
        {
            // already busy handling a prior command.  user is mashing buttons?
            if(isBlockingCall) //APLIAQF-5166: Q4 Platform: Mankiw: Graph:<area>: Shaded Regions inside the graph are not displayed when navigating to question after answer submission or in static mode
            {
                return;
            }
            // else, if it is a non-blocking call, allow it to go through.
        }

        //alert(eventName);
        //alert(eventData);
        var errorCallback = function(errorCode, exceptionCode)
        {
            return showErrorMsg(problemDiv, errorCode, exceptionCode);
        }

        params =
        {
            updateEventType : eventName,
            updateData : JSON.stringify(eventData),
            problemGuid : problemGuid,
            action: action,
            update: "yes",
            "expectScoreUpdate" : isExpectScoreUpdate,
            r : Math.random()
        }

        if(useCorrectAnswer)
        {
            //if student_guid provided, view this quiz problem for that student (with their answer)
            //if not provided, the current logged in (session) user will be used
            params["useCorrectAnswer"] = "yes";
        }
        if(studentGuid)
        {
            //if student_guid provided, view this quiz problem for that student (with their answer)
            //if not provided, the current logged in (session) user will be used
            params["studentGuid"] = studentGuid;
        }

        if(attemptId)
        {
            // if attemptId provided, view that attempt
            // if not provided, the current active attempt will be used (as determined by QuizService)
            params["attempt"] = attemptId;

            if (typeof isViewAttempt !== "undefined" && isViewAttempt === true)
            {
                params["isViewAttempt"] = "yes";
            }
        }

        jQ.ajax
        (
            {
                type: 'POST',
                url: '/af/servlet/problemSetItem/problemSetItemView',
                data: params,
                success: function (result)
                {
                    var response = result.response;
                    if(!response)
                    {
                        var errorCode="-2"; // malformed json
                        errorCallback(errorCode,"");
                        return;
                    }
                    if(response.code != 0)
                    {
                        errorCallback(response.code, response.exceptionCode);
                        return;
                    }
                    else
                    {
                        var itemDetailView = response.itemDetailView;

                        if(! itemDetailView > "")
                        {
                            var errorCode="-2"; // malformed JSON
                            errorCallback(errorCode, "");
                            return;
                        }

                        if(itemDetailView.responseCode > 0 && itemDetailView.responseCode < 2000)
                        {
                            showErrorMsg(problemDiv,itemDetailView.responseCode,"");
                            return;
                        }

                        // warning status
                        else if(itemDetailView.responseCode > 2000)
                        {
                            // display warning, but don't halt (render) processing
                            // Used when we want to show a warning to the user, but still render the item & buttons
                            // for example
                            // 1. grant full credit
                            // 2. interrupted attempt
                            // 3. prof changed grading mode to practice and user was doing 'try another'

                            // TODO: this could trigger a warning header, different type of YSN, etc
                            showErrorMsg(problemDiv,itemDetailView.responseCode);
                        }

                        cengageItemAdapter = cengageItemAdapters[problemDiv];
                        // render the update
                        cengageItemAdapter.handleUpdate(itemDetailView.renderInfo);
                        hidePleaseWaitDialog();
                        updateContinueWOSaving();
                        if(itemDetailView.responseCode == 0 && afterUpdateCallback > "")
                        {
                            // only do the callback if the prior call succeded without warning.
                            // this prevents entire question submission when intermediary 'grade step', etc (finlization) failed.
                            afterUpdateCallback();
                        }
                        return;
                    }

                },

                error: function(errorObj)
                {
                    var errorCode = Q4_ERROR_COMMUNICATIONS; // communications error
                    errorCallback(errorCode, "");
                    return;
                }
            }
        );
    }
    else
    {
        // update requires a page refresh
        // no way in CIP to demand this right now
        alert(eventName +" requires a page refresh");
    }


}

//		var url = '/rest/resolveAreaUnsecured';

//     rpc.request
//     (
//     	{
//			    url: url,
//			    method: "POST",
//			 	data: {r: Math.random(), areaId:id, data: request}
//			},

//			function(response)
//			{
//				var qResponse = JSON.parse(response.data).qResponse;
//				var containerRoot = jQ('div#q4-0001');

//area resolve

//     					if(!qResponse.status.success)
//					{
//						containerRoot.triggerHandler('authoringError', ['Unexpected Error<br/><br/>'+qResponse.status.message]);
//						handlingButtonPress = false;
//					}
//					else
//					{
//					    var areaId = qResponse.areaId;
//					    var response = qResponse.response;
//	                    containerRoot.triggerHandler('applyResolveAreaRequestResponse', [areaId, response]);
//					}
