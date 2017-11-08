YAHOO.namespace("aplia");

YAHOO.aplia.DisplayProfile = {
	profile: null,
	cssToggles: [],

	addCSSToggle: function (newToggle) {
		this.cssToggles[this.cssToggles.length] = newToggle;
	}
};

YAHOO.aplia.FeatureToggler = {
	cssToggle: function (displayProfile, toggleMaps) {
		
		if (displayProfile != null && displayProfile.features != null) {
			
			for (var i = 0; i < displayProfile.features.length; i++) {
				var feature = displayProfile.features[i];
				var featureName = feature.name;
				var featureType = feature.type;
				
				if (toggleMaps.length > 0) { 
				
					for (var k = 0; k < toggleMaps.length; k++) {		
						if (toggleMaps[k][featureType] != null && toggleMaps[k][featureType][featureName] != null) {
 							var toggleEntry = toggleMaps[k][featureType][featureName];
							
							if (toggleEntry.display_none != null) {
								for (var j = 0; j < toggleEntry.display_none.length; j++) {									
									YAHOO.util.Dom.setStyle(toggleEntry.display_none[j], "display", "none");
								}
							}
							if (toggleEntry.display_inline != null) {
								for (var j = 0; j < toggleEntry.display_inline.length; j++) {
									YAHOO.util.Dom.setStyle(toggleEntry.display_inline[j], "display", "inline");
								}
							}
							if (toggleEntry.display_table != null) {
								for (var j = 0; j < toggleEntry.display_table.length; j++) {
									YAHOO.util.Dom.setStyle(toggleEntry.display_table[j], "display", "table");
								}
							}
							if (toggleEntry.visibility_visible != null) {
								for (var j = 0; j < toggleEntry.visibility_visible.length; j++) {
									YAHOO.util.Dom.setStyle(toggleEntry.visibility_visible[j], "visibility", "visible");
								}
							}
							if (toggleEntry.visibility_hidden != null) {
								for (var j = 0; j < toggleEntry.visibility_hidden.length; j++) {
									YAHOO.util.Dom.setStyle(toggleEntry.visibility_hidden[j], "visibility", "hidden");
								}
							}
						}
					}
				}
			}
		}
		
	},	

	pageMask : null,
	
	showMask : function () {
		/* hide body */
		//YAHOO.util.Dom.setStyle(document.body, "visibility", "hidden");
		pageMask = new YAHOO.widget.Overlay("___pageTransitionMask___", { 			
			  visible:true,
			  width:YAHOO.util.Dom.getDocumentWidth() + "px",
			  height:YAHOO.util.Dom.getDocumentHeight() + "px"} );
		pageMask.render(document.body);
		YAHOO.util.Dom.setStyle("___pageTransitionMask___", "background", "white");
	},
	
	hideMask : function () {
		/* show page */
		//YAHOO.util.Dom.setStyle(document.body, "visibility", "visible");
		pageMask.cfg.setProperty("width", "1px");
		pageMask.cfg.setProperty("height", "1px");
		pageMask.hide();		
	},
	
	doInit : function () {
		YAHOO.aplia.FeatureToggler.cssToggle(
				YAHOO.aplia.DisplayProfile.profile, YAHOO.aplia.DisplayProfile.cssToggles);
		
		YAHOO.aplia.FeatureToggler.hideMask();
		
		if ("true" == getUrlParam("_dbg")) {
			YAHOO.aplia.FeatureToggler.initDebugger(
					YAHOO.aplia.DisplayProfile.profile, YAHOO.aplia.DisplayProfile.cssToggles);
		}
	},
	
	/*
	 * NOTE: since IE8 has intermittent issue with window.onLoad, we now call doInit at the footer instead
	 * 60826 Toggle:IE8:Some times: Page doesn't render and shows up with blank page when clicking on top navigation tabs
	 */
	initFramework : function () {

		/* on finished loading, hide/show elements then show body */
		YAHOO.util.Event.addListener(window, "load", function () {					
			doInit();
		});

		/* hide body */
		//YAHOO.util.Dom.setStyle(document.body, "visibility", "hidden");
		/*
		pageMask = new YAHOO.widget.Overlay("___pageTransitionMask___", { 			
			  visible:true,
			  width:YAHOO.util.Dom.getDocumentWidth() + "px",
			  height:YAHOO.util.Dom.getDocumentHeight() + "px"} );
		pageMask.render(document.body);
		YAHOO.util.Dom.setStyle("___pageTransitionMask___", "background", "white");
		*/
		
		// If IE, scroll to top, since IE keeps the viewport to previous scroll position and mask
		// does not cover it. This affects the Back button
		/*
		if (YAHOO.env.ua.ie > 0) {
			window.scrollTo(0, 0);
		}*/		
	},
	
	/* CSS Runtime Debugger */
	debugDisplayProfile : null,
	debugCSSToggles : null,
	debugPanel: null,
		
	initDebugger : function (displayProfile, toggleMap) {
		this.debugDisplayProfile = displayProfile;
		this.debugCSSToggles = toggleMap;
		// look up secretpixel
		var secretPixel = YAHOO.util.Dom.get("__secretPixel");
		if (secretPixel != null) {
			secretPixel.innerHTML = "<a href='javascript:void(0)'>DEBUG</a>";
			YAHOO.util.Event.addListener(secretPixel, "click", function () {
				this.showDebug();
			}, this, true);
		}
	},
	
	showDebug: function () {
		// Instantiate a Panel from script
		if (this.debugPanel == null) {
			this.debugPanel = new YAHOO.widget.Panel("debugPanel", { width:"320px", visible:false, draggable:true, close:true } );
			this.debugPanel.setHeader("Feature Toggle");
			
			var html = "";
			
			if (this.debugDisplayProfile != null && this.debugDisplayProfile.features != null) {
				for (var i = 0; i < this.debugDisplayProfile.features.length; i++) {
					var debugId = this.debugDisplayProfile.features[i].id;
					var debugName = this.debugDisplayProfile.features[i].name;
					var debugType = this.debugDisplayProfile.features[i].type;
					html += "<div><input id='" + "_dbg" + debugId + "' type='checkbox' checked>&nbsp;<span id='_dbgText" + debugId + "'>" + debugName + " - " + debugType + "</span></div><div class='row-gap'></div>";					
				}
				
				html += "<div class='row-gap row-space'></div>";
				html += "<div><a id='_dbgUncheckAll' href='javascript:void(0)'>Show Baseline</a>&nbsp;&nbsp;&nbsp;<a id='_dbgCheckAll' href='javascript:void(0)'>Activate All Features</a></div>"; 
						
			}
			this.debugPanel.setBody(html);
			this.debugPanel.render(document.body);
			
			// attach listeners to input boxes
			if (this.debugDisplayProfile.features != null) {
				for (var i = 0; i < this.debugDisplayProfile.features.length; i++) {
					var debugId = this.debugDisplayProfile.features[i].id;
					var debugName = this.debugDisplayProfile.features[i].name;
					var debugType = this.debugDisplayProfile.features[i].type;
					
					var dbgInput = YAHOO.util.Dom.get("_dbg" + debugId);
					var dbgText	 = YAHOO.util.Dom.get("_dbgText" + debugId);
					var objFeature = this.debugDisplayProfile.features[i];
					
					// on change, toggle css items in and out
					YAHOO.util.Event.addListener(dbgInput, "change", function (event) {
						YAHOO.aplia.FeatureToggler.toggleCSS(this);
					}, objFeature, true);
					
					// on mouseover, show outlines
					YAHOO.util.Event.addListener([dbgInput, dbgText], "mouseover", function (event) {
						YAHOO.aplia.FeatureToggler.showCSSOutlines(event, this, true);
					}, objFeature, true);
					
					// on mouseout, hide outlines
					YAHOO.util.Event.addListener([dbgInput, dbgText], "mouseout", function (event) {
						YAHOO.aplia.FeatureToggler.showCSSOutlines(event, this, false);
					}, objFeature, true);
				}
				
				YAHOO.util.Event.addListener("_dbgCheckAll", "click", function (event) {
					for (var i = 0; i < this.length; i++) {
						var debugId = this[i].id;
						var dbgInput = YAHOO.util.Dom.get("_dbg" + debugId);
						var oldInputState = dbgInput.checked;
						dbgInput.checked = true;
						if (oldInputState != dbgInput.checked) {
							YAHOO.aplia.FeatureToggler.toggleCSS(this[i]);
						}
					}
				}, this.debugDisplayProfile.features, true);

				YAHOO.util.Event.addListener("_dbgUncheckAll", "click", function (event) {
					for (var i = 0; i < this.length; i++) {
						var debugId = this[i].id;
						var dbgInput = YAHOO.util.Dom.get("_dbg" + debugId);
						var oldInputState = dbgInput.checked;
						dbgInput.checked = false;
						if (oldInputState != dbgInput.checked) {
							YAHOO.aplia.FeatureToggler.toggleCSS(this[i]);
						}
					}
				}, this.debugDisplayProfile.features, true);

			}
		}
		
		this.debugPanel.show();
	},
	
	// running in caller's scope
	toggleCSS: function (data) {
		var featureName 	= data.name;
		var featureType 	= data.type;
		var featureId 		= data.id;
		var toggleMaps  	= YAHOO.aplia.FeatureToggler.debugCSSToggles;
		
		// look up all entries
		if (toggleMaps.length > 0) { 			
			for (var k = 0; k < toggleMaps.length; k++) {		
				if (toggleMaps[k][featureType] != null && toggleMaps[k][featureType][featureName] != null) {
					var toggle = toggleMaps[k][featureType][featureName];
					
					if (toggle.display_none != null) {
						YAHOO.aplia.FeatureToggler.toggleAll(toggle.display_none, "display");
					} 
					if (toggle.visibility_hidden != null) {
						YAHOO.aplia.FeatureToggler.toggleAll(toggle.visibility_hidden, "visibility");
					}
					if (toggle.display_inline != null) {
						YAHOO.aplia.FeatureToggler.toggleAll(toggle.display_inline, "display");
					}
					if (toggle.display_table != null) {
						YAHOO.aplia.FeatureToggler.toggleAll(toggle.display_table, "display");
					}
					if (toggle.visibility_visible != null) {
						YAHOO.aplia.FeatureToggler.toggleAll(toggle.visibility_visible, "visibility");
					}
				}
			}
		}
	},
	
	toggleAll: function (arrayIds, styleName) {
		for (var i = 0; i < arrayIds.length; i++) {
			var newStyleValue = null;
			if (styleName == "display") {
				if ("none" == YAHOO.util.Dom.getStyle(arrayIds[i], styleName)) {
					newStyleValue = "inline";
				} else {
					newStyleValue = "none";
				}
			} else if (styleName == "visibility") {
				if ("hidden" == YAHOO.util.Dom.getStyle(arrayIds[i], styleName)) {
					newStyleValue = "visible";
				} else {
					newStyleValue = "hidden";
				}
			}
			YAHOO.util.Dom.setStyle(arrayIds[i], styleName, newStyleValue);
		}
	},

	// running in caller's scope
	showCSSOutlines: function (event, data, isMouseOver) {
		var featureName 	= data.name;
		var featureType 	= data.type;
		var featureId 		= data.id;
		var toggleMaps  	= YAHOO.aplia.FeatureToggler.debugCSSToggles;
		
		// look up all entries
		if (toggleMaps.length > 0) { 			
			for (var k = 0; k < toggleMaps.length; k++) {		
				if (toggleMaps[k][featureType] != null && toggleMaps[k][featureType][featureName] != null) {
					var toggle = toggleMaps[k][featureType][featureName];
					if (toggle.display_none != null) {
						YAHOO.aplia.FeatureToggler.showOutlines(toggle.display_none, isMouseOver);
					} 
					if (toggle.visibility_hidden != null) {
						YAHOO.aplia.FeatureToggler.showOutlines(toggle.visibility_hidden, isMouseOver);
					}
					if (toggle.display_inline != null) {
						YAHOO.aplia.FeatureToggler.showOutlines(toggle.display_inline, isMouseOver);
					}
					if (toggle.visibility_visible != null) {
						YAHOO.aplia.FeatureToggler.showOutlines(toggle.visibility_visible, isMouseOver);
					} 
				}
			}
		}
	},
	
	showOutlines: function(arrayIds, show) {
		for (var i = 0; i < arrayIds.length; i++) {
			if (show) {
				YAHOO.util.Dom.setStyle(arrayIds[i], "border-style", "solid");
				YAHOO.util.Dom.setStyle(arrayIds[i], "border-width", "1px");
				YAHOO.util.Dom.setStyle(arrayIds[i], "border-color", "red");
			} else {
				YAHOO.util.Dom.setStyle(arrayIds[i], "border-style", "none");
			}
		}		
	},
	
	hideDebug: function() {
		this.debugPanel.hide();
	}
};

YAHOO.aplia.FeatureToggler.showMask();