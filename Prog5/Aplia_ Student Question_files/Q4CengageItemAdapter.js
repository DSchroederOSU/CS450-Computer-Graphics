//Q4 Aplia specific
// the externally visible function signatures in this adapter comply with the Cengage Item Provider (CIP) API
// please don't change them without coordination with CIP architect team
// it requires that the Q4 js dependencies (as retrieved from the CIP service) are already loaded on to the page
// for more info, see http://wiki.cengage.com/display/COVALENT/Cengage+Item+Service+%28CIS%29+Integration+API

function Q4CengageItemAdapter(containerId, adapterInit) {

	var containerDiv = jQ4('' + containerId);
	//Init Q4 Container
    jQ4(document).triggerHandler('initq4covalent', [containerDiv]);
    this._stepGradeable = false;
    this._containerDiv = containerDiv;
    this._adapterInit = adapterInit;
    this._initialItemState  = null;
    this._activityTakeUUID = null;
    this._focusNodeId = null;
    this._onNeedsUpdateHandler = null;
    this._editable = false;
    this._onLastStep = false;
    this._version = null;
    this._allStepsGraded = false;
	this._currentAttempt = null;

    this._hasFinishedLoading = true;
    
    return this;
}

Q4CengageItemAdapter.prototype.isCompleted = function() {
	if(this._activityTakeUUID == null)
	{
		return true;  // single step items are always 'completed'
	}
	else
	{
		return this._allStepsGraded;
	}
}

//TODO: enhance CIS API with this 'finalize' method.  it is necessary to support more complex items and activities masquerading as items
//this is used when the item needs to 'do' something with some remote server (pehaps a LMS proxy 'render' call, or direct ajax call) before the final
//'getState' call gets the 'student answer' (state). That call would normally be invoked by student pressing a 'grade this question' or 'save my progress
//on this question' platform provided button), where we want to do something like save the current step state on the server before submitting the
//entire question for final grading.

//We don't want to have it be a side effect of 'getState', because having an update or grade occur as a side effect of inspecting state
//(which might be done for a variety of reasons) is wrong.

//The use of a callback function lets the item make asynchronous calls via 'update' and then call back to the LMS page when it is completed.

Q4CengageItemAdapter.prototype.finalize = function(callback) {

	if(this._activityTakeUUID && this._activityTakeUUID.length > 0)
	{
		// its an activity
		if(!this._editable) // if activity isn't editable, there is nothing to finalize.
		{
			callback();
			return;
		}
	    if(this.answerable() && this.hasStateChanged())
	    {
	    	// there could be an in-progress answer on the currently visible stage, we'll save it
		    var finalizeRequest = {
			    	"version" : this._version
		    };

	    	finalizeRequest["answer"]= this.getStudentAnswer();
	    	finalizeRequest["focusNodeId"]= this._focusNodeId;
			finalizeRequest["stepAttempt"]= this._currentAttempt + '';
	    	this._onNeedsUpdateHandler("saveStep", finalizeRequest, true, true, callback);
			return;
	    }
	    else
	    {
	    	// for items that don't have 'in progress', unsaved, saveable answers, finalize means nothing
			callback();
			return;
	    }
	}
	else
	{
		// for simple items, finalize means nothing
		callback();
		return;
	}
}

// used to decide if warning messages to student should show up
Q4CengageItemAdapter.prototype.answerable = function() {
	if(this._activityTakeUUID == null)
	{
		return true;
	}
	else
	{
		return this._stepGradeable;
	}
}

Q4CengageItemAdapter.prototype.onNeedsUpdate = function(handler){
	this._onNeedsUpdateHandler = handler;
	//Add a function that can handle a request by the Item Adapter (or the adapter) for re-rendering based on a changed state (user interaction, inside or
	// outside of the item).
	//This is typically a case where additional rendering information is needed, and the score could potentially be affected as a result of a state change.
	//The consumer should handle this request by sending a call to the service to render the item.
	//For example, if the user is requesting to see hints, and the consumer wants to track the number of hints requests and possibly reduce the score.
	// solve for x, area resolve calls, and work in steps problems ('activities as items') are other examples
	jQ4(this._containerDiv).bind(
		'sendResolveAreaRequest',
		function (e, id, data) {
			var areaResolveRequest = {};
			areaResolveRequest.id = id;
			areaResolveRequest.data = data;
			handler(e.type, areaResolveRequest, false, false);
	    }
	);

	var that = this;

	jQ4(this._containerDiv).bind(
		'gradeStep',
		function (e, stepId, attempt) {
		    var gradeStepRequest = {
		    		"activityTakeUUID": that._activityTakeUUID,
		    		"answer": that.getStudentAnswer(),
		    		"focusNodeId" : stepId,
			        "stepAttempt" : attempt + '',
		    		"version" : that._version
		    }
			handler(e.type, gradeStepRequest, true, true);
	    }
	);

	jQ4(this._containerDiv).bind(
		'gotoStep',
		function (e, stepId, attempt) {

		    if(that.answerable() && that.hasStateChanged())
		    {
		    	// save active stage before going to next stage
		    	var callback= function() {
				    var gotoStepRequest = {
				    		"activityTakeUUID": that._activityTakeUUID,
				    		"focusNodeId" : stepId,
					        "stepAttempt" : attempt + '',
				    		"version" : that._version
				    }
		    		handler(e.type, gotoStepRequest, true, false);
		    	};

			    var finalizeRequest = {
			    	"version" : that._version
			    };

		    	finalizeRequest["answer"]= that.getStudentAnswer();
		    	finalizeRequest["focusNodeId"]= that._focusNodeId;
			    finalizeRequest["stepAttempt"]= that._currentAttempt + '';

		    	that._onNeedsUpdateHandler("saveStep", finalizeRequest, true, true, callback);
				return;
		    }
		    else
		    {
			    var gotoStepRequest = {
			    		"activityTakeUUID": that._activityTakeUUID,
			    		"focusNodeId" : stepId,
				        "stepAttempt" : attempt + '',
				        "version" : that._version
			    }

		    	handler(e.type, gotoStepRequest, true, false);
		    }
	    }
	);
}

/*
Q4CengageItemAdapter.prototype.clearCurrent = function()
{
	jQ4('.q4-renderer').find('*').unbind();

	jQ4('.q4-renderer').find('*').each(function(){
	      delete this;
	    })

	jQ4('.q4-renderer').remove();
}*/

// TODO: enhance CIP api to accept optional error callback method
Q4CengageItemAdapter.prototype.handleUpdate = function(renderInfoAsString, callback) {

	var renderInfo = JSON.parse(renderInfoAsString);
	var resultCode = 0;

	// TODO: all error handling should really be outside of the adaptor
	// otherwise we can't show YSN if renderer fails to load
	if(!renderInfo.status.success)
	{
		this._containerDiv.triggerHandler('authoringError', ['Unexpected Error<br/><br/>'+renderInfo.status.message+'.<br/><br/>  Please try again.  If that fails, print this page and sign out.  Then sign in and try again.']);
		resultCode = renderInfo.status.code;
		callback(resultCode);
	}
	else if(renderInfo.activity)
	{
		// save this activity's unique id, for callbacks
		this._activityTakeUUID = renderInfo.activity.takeUUID;
		//alert(renderInfo.pointsPossible);
		this._stepGradeable = renderInfo.activity.currentStepGradeable;
		//alert("step gradeable: " + this._stepGradeable);

		this._editable = renderInfo.activity.editable;

		this._version = renderInfo.activity.version;

		// save this activity's focus node id, for callbacks
		this._focusNodeId = renderInfo.activity.focusNodeId;

		this._onLastStep = renderInfo.activity.onLastStep;
		// 'grey zone' (platform buttons that show up based on activity state)
		//alert(renderInfo.activity.completed);
		this._allStepsGraded = renderInfo.activity.allStepsGraded;

		var idx = 0;
		for (var i = 0; i < renderInfo.activity.activityNodes.length; i++) {
			if (renderInfo.activity.activityNodes[i].id === this._focusNodeId) {
				idx = i;
				break;
			}
		}
		this._currentAttempt = renderInfo.activity.activityNodes[idx].stepAttempt;

	    // tell renderer to render this activity
		this._containerDiv.triggerHandler('applyActivity', renderInfo);
	}
	else
	{
		if(renderInfo.renderUpdateResponseData)
		{
			if(renderInfo.renderUpdateEventType != "sendResolveAreaRequest")
			{
				// we only recognize sendResolveAreaRequest (for now)
    			resultCode = -1;
    			callback(resultCode);
			}

			// TODO: we shouldn't have to parse this data here.  should pass single json object
		    var areaId = renderInfo.renderUpdateResponseData.areaId;
		    var resolvedArea = renderInfo.renderUpdateResponseData.resolvedArea;
		    this._containerDiv.triggerHandler('applyResolveAreaRequestResponse', [areaId, resolvedArea]);
		    return;
		}

		// TODO: change renderer, we should not have to nest qResponse elements before calling
		// the renderer.  its silly
		var renderInfoWrapper = {};
		renderInfoWrapper.qResponse = renderInfo;

		try {
			if(renderInfo.qDoc)
			{
				this._containerDiv.triggerHandler('applyQResponse', renderInfoWrapper);
			}

			// TODO: Lee may be adding handling a list of deltas in applyQResponse
			// and to toggle showing feedback
			// which would make the below code not necessary
			renderInfoWrapper.qResponse.qDoc = undefined;
			var isGradedFeedback = false;
			for (x in renderInfo.state)
			{
				var qDelta = renderInfo.state[x];
				renderInfoWrapper.qResponse.qDelta = qDelta;
				this._containerDiv.triggerHandler('applyQResponse', renderInfoWrapper);
				if(renderInfo.gradedFeedback)
				{
					isGradedFeedback= true;
				}

			}
			if(isGradedFeedback)
			{
			 	this._containerDiv.triggerHandler('showAnswers');
			}


		/*
			if(renderInfo.studentAnswer)
			{
				// TODO: get wilson to add a 'apply array of qDelta' method
				// so we don't have to monkey around like this
				renderInfoWrapper.qResponse.qDoc = undefined;

				renderInfoWrapper.qResponse.qDelta = renderInfo.studentAnswer;
				this._containerDiv.triggerHandler('applyQResponse', renderInfoWrapper);
			}
			if(renderInfo.gradedFeedback)
			{
				// TODO: get wilson to add a 'apply array of qDelta' method
				// so we don't have to monkey around like this
				renderInfoWrapper.qResponse.qDoc = undefined;

				renderInfoWrapper.qResponse.qDelta = renderInfo.gradedFeedback;
	     		this._containerDiv.triggerHandler('applyQResponse', renderInfoWrapper);
				this._containerDiv.triggerHandler('showAnswers');
			}
			*/


		} catch (err) {
			this._containerDiv.triggerHandler('authoringError', ['There was an issue displaying this question, please try again. If you continue to have problems, please contact tech support. ']);
			resultCode = 26;
		}
	}
	var self = this;
	// TODO: try/catch with exception result code
	this._containerDiv.triggerHandler
    (
        'getClientDelta',
        function (qDocId, clientDelta)
        {
        	self._initialItemState =  jQ4.toJSON(clientDelta);
        	//alert(self._initialItemState);
        }
	);

	if(callback)
	{
		callback(resultCode);
	}
};

Q4CengageItemAdapter.prototype.hasStateChanged = function() {
	var itemState = this.getStudentAnswer();

	// compare itemState with initial itemState (at time of first load for this item)
	if(this._initialItemState == null)
	{
		throw new Error("initial item state should not be null here");
	}
	if(itemState == null)
	{
		throw new Error("item state should not be null here");
	}

	if(this._initialItemState == itemState)
	{
		return false; // state has not changed
	}

	// TODO: replace the active code and sort method with following more bullet proof code from http://stackoverflow.com/questions/1068834/object-comparison-in-javascript
	// except don't extend Object, pass in both
	/*
	 * Object.equals = function( x, y ) {
  if ( x === y ) return true;
    // if both x and y are null or undefined and exactly the same

  if ( ! ( x instanceof Object ) || ! ( y instanceof Object ) ) return false;
    // if they are not strictly equal, they both need to be Objects

  if ( x.constructor !== y.constructor ) return false;
    // they must have the exact same prototype chain, the closest we can do is
    // test there constructor.

  for ( var p in x ) {
    if ( ! x.hasOwnProperty( p ) ) continue;
      // other properties were tested using x.constructor === y.constructor

    if ( ! y.hasOwnProperty( p ) ) return false;
      // allows to compare x[ p ] and y[ p ] when set to undefined

    if ( x[ p ] === y[ p ] ) continue;
      // if they have the same strict value or identity then they are equal

    if ( typeof( x[ p ] ) !== "object" ) return false;
      // Numbers, Strings, Functions, Booleans must be strictly equal

    if ( ! Object.equals( x[ p ],  y[ p ] ) ) return false;
      // Objects and Arrays must be tested recursively
  }

  for ( p in y ) {
    if ( y.hasOwnProperty( p ) && ! x.hasOwnProperty( p ) ) return false;
      // allows x[ p ] to be set to undefined
  }
  return true;
}

if (Object.equals(anObj, anotherObj))
(instead we want if(this.deepEquals
	 */

	// they didn't equal each other. perhaps because delta elements
	// are in a different order?  sort them & compare again

	var initialItemStateJson = JSON.parse(this._initialItemState);
	var currentItemStateJson = JSON.parse(itemState);
	var initArray = null;
	if(initialItemStateJson.qDelta['_'] !== undefined)
	{
		initArray = initialItemStateJson.qDelta['_'];
	}
	else
	{
		initArray=new Array();
		for (var k in initialItemStateJson.qDelta) {
			if (initialItemStateJson.qDelta.hasOwnProperty(k) && k.indexOf('@') == -1) {
				initArray.push(initialItemStateJson.qDelta[k]) ;
			}
		}
	}
	var currentArray = null;
	if(currentItemStateJson.qDelta['_'] !== undefined)
	{
		currentArray = currentItemStateJson.qDelta['_'];
	}
	else
	{
		currentArray=new Array();
		for (var k in currentItemStateJson.qDelta) {
			if (currentItemStateJson.qDelta.hasOwnProperty(k) && k.indexOf('@') == -1) {
				currentArray.push(currentItemStateJson.qDelta[k]) ;
			}
		}
	}

	var sortFunc = function (a, b) {
		for (var k in a) {
			if (a.hasOwnProperty(k)) {
				var aRef = a[k]['@ref'];
				var bRef = null;
				for (var g in b) {
					if (b.hasOwnProperty(g)) {
						bRef = b[g]['@ref'];
					}
				}

				if (aRef < bRef) {
					return -1;
				} else if (aRef > bRef) {
					return 1;
				} else {
					return 0;
				}
			}
		}
	};
	currentArray.sort(sortFunc);
	initArray.sort(sortFunc);

	var initSortedString = JSON.stringify(initArray);
	var currentSortedString  = JSON.stringify(currentArray);

	if( initSortedString === currentSortedString)
	{
		return false;
	}

	return true;

};

Q4CengageItemAdapter.prototype.getState = function() {

	if(this._activityTakeUUID && this._activityTakeUUID.length > 0)
	{
		return this._activityTakeUUID;
	}
	else
	{
		return this.getStudentAnswer();
	}
}

Q4CengageItemAdapter.prototype.getStudentAnswer = function() {
	var itemState;

	// TODO: try/catch with exception result code
	this._containerDiv.triggerHandler
    (
        'getClientDelta',
        function (qDocId, clientDelta)
        {
        	itemState =  jQ4.toJSON(clientDelta);
        	//alert(itemState);
        }
	);
	return itemState;

};



