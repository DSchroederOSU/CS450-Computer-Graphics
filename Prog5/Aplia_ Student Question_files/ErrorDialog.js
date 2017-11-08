var ErrorDialogService = {
     showDialog: function(title, message, control) {
         var jQ;
         var dialogClass = 'aplia-dialog';

         if (typeof jQuery === 'undefined') {
             if (typeof apliaJQuery != 'undefined') {
                 jQ = apliaJQuery;
                 dialogClass = 'mindapp-modal-dialog';
             }
         }
         else {
             jQ = jQuery;
         }

        jQ("#errorDialog").dialog({
            draggable: false,
            resizable: false,
            width: 450,
            height: "auto",
            minWidth: "auto",
            minHeight: "auto",
            autoOpen: false,
            describedBy: "descErrorDialog",
            modal: true,
            dialogClass: dialogClass,
            title: title,
            buttons : [{text: "Close", click: function() { jQ(this).dialog("close"); }}]
        });

        jQ("#errorDialogMessage").html(message);
         jQ("#errorDialog").dialog("open");
        if (control != undefined) {
            jQ('#errorDialog').dialog('option', 'buttons', [{text: "Close", click: function() { jQ(this).dialog("close"); control.focus(); }}]);
        }
    }
};

var isIE = /*@cc_on!@*/false || !!document.documentMode;
// Edge 20+
var isEdge = !isIE && !!window.StyleMedia;

var ConfirmDialogService = {
    showDialog: function(title, message, callback) {
        var jQ;
        var dialogClass = 'aplia-dialog';

        if (typeof jQuery === 'undefined') {
            if (typeof apliaJQuery != 'undefined')  {
                jQ = apliaJQuery;
                dialogClass = 'mindapp-modal-dialog';
            }
        }
        else {
            jQ = jQuery;
        }

        jQ("#js_confirmDialog").dialog({
            draggable: false,
            resizable: false,
            width: 450,
            height: "auto",
            minWidth: "auto",
            minHeight: "auto",
            autoOpen: false,
            describedBy: "js_descConfirmDialog",
            modal: true,
            dialogClass: dialogClass,
            title: title,
            buttons : [{text: "OK", click: function() { jQuery(this).dialog("close"); callback();}}, {text: "Cancel", click: function() {if (isIE || isEdge) showFlashObjects(); jQ(this).dialog("close")}}]
        });

        jQ("#js_confirmDialogMessage").html(message);
        if (isIE || isEdge)
            hideFlashObjects();
        jQ("#js_confirmDialog").dialog("open");
    }
};
