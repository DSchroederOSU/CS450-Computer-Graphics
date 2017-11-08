var jQ;

if (typeof jQuery === 'undefined') {
    if (typeof apliaJQuery != 'undefined')
        jQ = apliaJQuery;
}
else
    jQ = jQuery;

// pn - Positive AND negative
// dp - decimal places
// Jamie - May 8, 02
function getNumericPattern (pn, dp) {
    var neg = (pn) ? '-?' : '';
    var p = '(^' + neg + '\\d\\d*$)';
    if (dp > 0) {
        p += '|(^' + neg + '\\d\\d*\\.\\d{0,' + dp + '}$)|(^' + neg + '\\.\\d{1,' + dp + '}$)';
    }
    return new RegExp (p);
}

function daylightSavings (date)
{
    today = new Date ();

    if (today.getTimezoneOffset () == date.getTimezoneOffset ())
    {
        return true;
    }
    else
    {
        return false;
    }
}

// date function --------------------------------------------
// x is date adjust, use 0 for today's date
// t is type, t == 1 prints 1/1/01, t == 2 prints 01.01.01, t == 3 prints January 1, 2001
// t == 4 prints Monday, January 1  t == 5 prints Monday, January 1, 2001
function getaDate(x,t) {
    Todays = new Date();
    var d = Todays.getDate();
    var m = Todays.getMonth();
    var y = Todays.getYear();
    var da = Todays.getDay();
    m = m + 1;
    d = d + x;
    while (d > days(m,y)) {
        d = d - days(m,y);
        m++;
        if (m > 12) {
            m = 1;
            y++;
        }
    }
    while (d < 1) {
        d = d + 30;
        m--;
        if (m < 1) {
            m = 12;
            y--;
        }
    }
    if(navigator.appName == "Netscape")
    {y = y + 1900;}
    y = y - 2000;
    if (y < 10)
    { y = "0"+y; }
    if (t == 1) {
        TheDate = m + "/" + d + "/" + y
    }
    if (t == 2) {
        if (d < 10)
            d = "0"+d
        if (m < 10)
            m = "0"+m
        TheDate = m + "." + d + "." + y
    }
    if (t == 3) {
        y = 20 + y;
        m = mon(m);
        TheDate = m + " " + d + ", " + y
    }
    if (t == 4) {
        m = mon(m);
        da = whatDay(da,x);
        TheDate = da + ", " + m + " " + d
    }
    if (t == 5) {
        m = mon(m);
        y = 20 + y;
        da = whatDay(da,x);
        TheDate = da + ", " + m + " " + d + ", " + y
    }
    document.write(TheDate);
}

// generates correct day for pretty printing the day
function weekDay (d) {
    var dayText = "";
    if (d == 0)
        dayText += "Sunday";
    if (d == 1)
        dayText += "Monday";
    if (d == 2)
        dayText += "Tuesday";
    if (d == 3)
        dayText += "Wednesday";
    if (d == 4)
        dayText += "Thursday";
    if (d == 5)
        dayText += "Friday";
    if (d == 6)
        dayText += "Saturday";
    return dayText;
}

// generates correct month for pretty printing the date
function mon(m) {
    var dateText = "";
    if (m == 1)
        dateText += "January"
    if (m == 2)
        dateText += "February"
    if (m == 3)
        dateText += "March"
    if (m == 4)
        dateText += "April"
    if (m == 5)
        dateText += "May"
    if (m == 6)
        dateText += "June"
    if (m == 7)
        dateText += "July"
    if (m == 8)
        dateText += "August"
    if (m == 9)
        dateText += "September"
    if (m == 10)
        dateText += "October"
    if (m == 11)
        dateText += "November"
    if (m == 12)
        dateText += "December"
    return dateText
}

function days(m,y) {
    var daysInMonth = "";
    if (m == 2 && amILeap(y))
        daysInMonth = 29
    if (m == 2 && !amILeap(y))
        daysInMonth = 28
    if (m == 4 || m == 6 || m == 9 || m == 11)
        daysInMonth = 30
    if (m == 1 || m == 3 || m == 5 || m == 7 || m == 8 || m == 10 || m == 12)
        daysInMonth = 31
    return daysInMonth
}

function setDays(d, dLen, showBlank)
{
    var curLen = d.options.length;
    while (d.options.length < dLen)
    {
        var value = showBlank ? d.options.length : d.options.length + 1;
        d.options[d.options.length] = new Option (value, value, false, false);
    }

    while (d.options.length > dLen)
    {
        if (d.options[d.options.length-1].selected)
        {
            d.options[d.options.length-2].selected = true;
        }
        d.options[d.options.length-1] = null;
    }
}

function amILeap(x) {
    while (x > 3) {
        x -= 4;
    }
    if (x == 0) {
        return true
    }
    else
        return false
}

function whatDay(d,x){
    var dayText = "";
    d = d + x;
    while (d > 6) {
        d -= 7;
    }
    while (d < 0) {
        d += 7;
    }
    if (d == 0)
        dayText += "Sunday"
    if (d == 1)
        dayText += "Monday"
    if (d == 2)
        dayText += "Tuesday"
    if (d == 3)
        dayText += "Wednesday"
    if (d == 4)
        dayText += "Thursday"
    if (d == 5)
        dayText += "Friday"
    if (d == 6)
        dayText += "Saturday"
    return dayText
}

// end date code ----------------------------------

// gives correct CSS if Mac or non-Mac ----------------------------
function text(){
    //if (navigator.appVersion.indexOf("Mac") != -1 && (navigator.appName.indexOf("Netscape") != -1 ||  parseInt(navigator.appVersion) < 5)) {
    /* if (navigator.appVersion.indexOf("Mac") != -1 && (((navigator.appName.indexOf("Netscape") != -1 && parseInt(navigator.appVersion) != 5) || navigator.appVersion.indexOf("5.0") != -1)) || navigator.appName.indexOf("Netscape/7") != -1) { */
    /*		if (navigator.appVersion.indexOf("Mac") != -1 && navigator.appName.indexOf("Netscape6") == -1){ */
    if (navigator.appVersion.indexOf("Mac") != -1 && (((navigator.appName.indexOf("Netscape") != -1 && parseInt(navigator.appVersion) != 5) || navigator.appVersion.indexOf("5.0") == -1))) {
        document.write("<link rel=stylesheet href=\"/css/aplia_macnn.css\" type=\"text/css\">"); }
    else {
        document.write("<link rel=stylesheet href=\"/css/aplia.css\" type=\"text/css\">");
    }
}

// return version number (e.g., 4.03)
function versionNumber() {
    return parseFloat(navigator.appName)
}

function whatTextAmI(){
    if (navigator.appVersion.indexOf("Mac") != -1 && (((navigator.appName.indexOf("Netscape") != -1 && parseInt(navigator.appVersion) != 5) || navigator.appVersion.indexOf("5.0") == -1))) {
        document.write("/css/aplia_macnn.css"); }
    else {
        document.write("/css/aplia.css");
    }
}

// prints version
function whatAmI(){
    document.write("appVersion: " + navigator.appVersion);
    document.write("<br><br>");
    document.write("appName: " + navigator.appName);
    document.write("<br><br>");
    document.write("other app version: " + parseInt(navigator.appVersion));
}

// makes "student answer" pretty
function prettyMe(x) {
    if (x == 1) {
        document.write("A");
    }
    else if (x == 2) {
        document.write("B");
    }
    else if (x == 3) {
        document.write("C");
    }
    else if (x == 4) {
        document.write("D");
    }
    else if (x == 5) {
        document.write("E");
    }
    else {
        document.write("Not Answered");
    }
}

// pop up function - full browser functionality, forces non-full screen
//  function printablePage(content) {
// window.open("content","Information","toolbar=1,location=1,directories=1,status=1,menubar=1,scrollbars=1,resizable=1,width=400,height=300");
//  }

// prints out 3 select boxes with today's date --------------------------------
function dateMeToday() {
    document.write("<select name=\"start_month\" size=\"1\" class=\"txtsub\">");
    Todays = new Date();
    var mo = Todays.getMonth();
    mo++;
    //var i = 0;
    for (var i=1; i < 13; i++) {
        if (i == mo) {
            document.write("<option value=\"" + i + "\" selected>" + mon(i) + "</option>");
        } else {
            document.write("<option value=\"" + i + "\">" + mon(i) + "</option>");
        }
    }
    document.write("</select>&nbsp;<select name=\"start_day\" size=\"1\" class=\"txtsub\">");
    var da = Todays.getDate();
    for (var j=1; j < 32; j++) {
        if (j == da) {
            document.write("<option value=\"" + j + "\" selected>" + j + "</option>");
        } else {
            document.write("<option value=\"" + j + "\">" + j + "</option>");
        }
    }
    document.write("</select>&nbsp;<select name=\"start_year\" size=\"1\" class=\"txtsub\">");
    var ye = Todays.getYear();
    for (var k=2001; k < 2005; k++) {
        if (k == ye) {
            document.write("<option value=\"" + k + "\" selected>" + k + "</option>");
        } else {
            document.write("<option value=\"" + k + "\">" + k + "</option>");
        }
    }
    document.write("</select>");
}

// simple confirm scripts ----------------------------------
function del_assign(x)
{
    var change_me = confirm("Delete this assignment?");
    if (change_me == true)
    {
        /* this is where the assignment should be deleted */
    }
}

function del_announce(x)
{
    var change_me = confirm("Delete this announcement?");
    if (change_me == true)
    {
        /* this is where the announcement should be deleted */
    }
}

function active_block(x)
{
    var change_me = confirm("Change this student's status?");
    if (change_me == true)
    {
        /* this is where the students status should be switched, visually resulting in
         1) button changing (make active to block student, or vice versa)
         2) status changing (active to Blocked with date or vice versa)
         and in the database changing the status */
    }
}

//-- Converts date passed in mm/dd/yyyy format to Date object.
function newDate (dateStr)
{
    var firstSlash = dateStr.indexOf ("/");
    var lastSlash = dateStr.lastIndexOf ("/");
    var month = dateStr.substr (0, firstSlash) - 1;
    var day = dateStr.substring (firstSlash + 1, lastSlash);
    var year = dateStr.substr (lastSlash + 1);
    var newDate = new Date (year, month, day);
    return newDate;
}

function getShortMonthStr (date)
{
    var monthStr = "UNKNOWN_MONTH";
    switch (date.getMonth ()) {
        case (0):
            monthStr = "Jan. ";
            break;
        case (1):
            monthStr = "Feb. ";
            break;
        case (2):
            monthStr = "Mar. ";
            break;
        case (3):
            monthStr = "Apr. ";
            break;
        case (4):
            monthStr = "May ";
            break;
        case (5):
            monthStr = "Jun. ";
            break;
        case (6):
            monthStr = "Jul. ";
            break;
        case (7):
            monthStr = "Aug. ";
            break;
        case (8):
            monthStr = "Sep. ";
            break;
        case (9):
            monthStr = "Oct. ";
            break;
        case (10):
            monthStr = "Nov. ";
            break;
        case (11):
            monthStr = "Dec. ";
    }
    return monthStr;
}

function padInt (num, padQty)
{
    var intStr = num.toString ();
    if (intStr.length >= padQty) return intStr;
    for (var i = 0;  i < padQty - intStr.length;  i++) {
        intStr = "0" + intStr;
    }
    return intStr;
}

function trimString (str)
{
    if (str == null || str.length == 0) return str;
    while (str.charAt (0) == ' ') {
        str = str.substr (1);
    }
    while (str.charAt (str.length - 1) == ' ') {
        str = str.substr (0, str.length - 1);
    }
    return str;
}

function truncate (str, len)
{
    if (str == undefined) return str;
    if (str == '') return str;
    if (typeof(str) != 'string') return str;
    if (str.length <= len) return str;
    return str.substring(0, len) + '...';
}

function truncateToWidth (str,width,className,newElement) {
  // str    A string where html-entities are allowed but no tags.
  // width  The maximum allowed width in pixels
  // className  A CSS class name with the desired font-name and font-size. (optional)
  // ----
  // _escTag is a helper to escape 'less than' and 'greater than'
  function _escTag(s){ return s.replace("<","&lt;").replace(">","&gt;");}

  //Create a span element that will be used to get the width
  var span = document.createElement("span");
  //Allow a classname to be set to get the right font-size.
  if (className) span.className=className;
  span.style.display='inline';
  span.style.visibility = 'hidden';
  span.style.padding = '0px';
  document.body.appendChild(span);

  var result = _escTag(str); // default to the whole string
  span.innerHTML = result;
  // Check if the string will fit in the allowed width. NOTE: if the width
  // can't be determined (offsetWidth==0) the whole string will be returned.
  if (span.offsetWidth > width) {
    var posStart = 0, posMid, posEnd = str.length, posLength;
    // Calculate (posEnd - posStart) integer division by 2 and
    // assign it to posLength. Repeat until posLength is zero.
    while (posLength = (posEnd - posStart) >> 1) {
      posMid = posStart + posLength;
      //Get the string from the beginning up to posMid;
      span.innerHTML = _escTag(str.substring(0,posMid)) + '&hellip;';

      // Check if the current width is too wide (set new end)
      // or too narrow (set new start)
      if ( span.offsetWidth > width ) posEnd = posMid; else posStart=posMid;
    }
    if (newElement == null)
        newElement = "abbr";
    result = '<' + newElement + ' ' + 'title="' +
      str.replace("\"","&quot;") + '">' +
      _escTag(str.substring(0,posStart)) +
      '&hellip;<\/' + newElement + '>';
  }
  document.body.removeChild(span);
  return result;
}

function escapeJs( str ) {
    str = replaceAll(str, "\\", "\\\\");
    str = replaceAll(str, "'", "\\'");
    str = replaceAll(str, "\"", "\\\"");
    return str;
}

function replaceAll(str, find, replaceWith) {
    var retVal = str;
    var escapedFind =  new RegExp(escapeRegExp(find), 'g');
    //check to see  escapedFind is actually a string
    if (typeof str === 'string' || str instanceof String){
        retVal =  str.replace(escapedFind, replaceWith);
    }
    return retVal;
}

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function validateName(name, allowNull)
{
    return ((allowNull == true || (name != null && name.length > 0)) &&
        name.match(/[^A-Za-z\'\.\-\ ]/) == null);
}

function validateOtherName (name, allowNull) {
    return ((allowNull == true || (name != null && name.length > 0)) &&
        name.match(/[^A-Za-z0-9\'\.\,\-\ ]/) == null);
}

function validateInitial(initial)
{
    return (initial == null || initial.length == 0 ||
        (initial.length == 1 &&
            initial.match(/[A-Za-z]/) != null));
}

function validateISO8859_1(str)
{
    return str.match(/^[\x00-\x7F\xA0-\xFF]+$/) != null;
}

// pop up function - full browser functionality, forces non-full screen
// format should be href="javascript:popup('http://www.yahoo.com')"
function popupSmall(content)
{
    var h = screen.height;
    var w = screen.width;
    h = h * .4;
    w = w * .6;
    var loc = "toolbar=1,location=1,status=1,scrollbars=1,resizable=1,width=" + w + ",height=" + h;
    window.open(content,'Information',loc);
}

// pop up function - full browser functionality, forces non-full screen
// format should be href="javascript:popup('http://www.yahoo.com')"
function popupSized(content, width, height)
{
    var loc = "toolbar=1,location=1,status=1,scrollbars=1,resizable=1,width=" + width + ",height=" + height;
    window.open(content,'Information',loc);
}

function popupSizedScrollable(content, width, height)
{
    var loc = "toolbar=0,location=0,status=0,scrollbars=1,resizable=1,width=" + width + ",height=" + height;
    window.open(content,'Information',loc);
}

function popupSizedNoBar(content, width, height)
{
    var loc = "toolbar=0,location=0,status=0,scrollbars=0,resizable=1,width=" + width + ",height=" + height;
    window.open(content,'Information',loc);
}

var wnd = null;
var ielang = navigator.systemLanguage;
/* if (ielang != null) {
 window.onunload = killPopup
 }*/
function killPopup() {
    if (wnd != null) wnd.close();
}

function popup(theURL, returnWindow) {
    if (ielang != null && wnd != null && !wnd.closed) {
        wnd.close();
        /*
         * Case 6523: Some versions of browsers does not like wnd.closed. Removing it seems to have fixed the problem
         * This might have ramifications on slower machines, which I assume is the reason to have included
         * this popup.closed check in the first place.
         */
        //	while(!wnd.closed) { }
    }
    var h = screen.height;
    var w = screen.width;
    h = h * .7;
    w = w * .7;
    var loc = "toolbar=1,location=1,status=1,scrollbars=1,resizable=1,width=" + w + ",height=" + h;
    // wnd = window.open(theURL, "popup", "resizable,dependent,scrollbars,width=533,height=400");
    var winName = "popup";
    wnd = window.open(theURL, winName, loc);
    if (wnd != null) {
        //wnd.focus();
    }
    if (returnWindow) {
        return wnd;
    }
}

function popupNew(theURL, returnWindow) {
    if (ielang != null && wnd != null && !wnd.closed) {
        wnd.close();
        /*
         * Case 6523: Some versions of browsers does not like wnd.closed. Removing it seems to have fixed the problem
         * This might have ramifications on slower machines, which I assume is the reason to have included
         * this popup.closed check in the first place.
         */
        //	while(!wnd.closed) { }
    }
    var h = screen.height;
    var w = screen.width;
    h = h * .7;
    w = w * .7;

    var loc = "toolbar=0,location=0,status=0,scrollbars=1,resizable=1,width=" + w + ",height=" + h;
    // wnd = window.open(theURL, "popup", "resizable,dependent,scrollbars,width=533,height=400");
    var winName = "popup" + Math.round(Math.random()*10000);
    wnd = window.open(theURL, winName, loc);
    if (wnd != null) wnd.focus();
    if (returnWindow) return wnd;
}


function popupsupport(theURL) {
    if (ielang != null && wnd != null && !wnd.closed) {
        wnd.close();
        while(!wnd.closed) { }
    }
    var h = screen.height;
    h = h * .7;
    var loc = "toolbar=1,location=1,status=1,scrollbars=1,resizable=1,width=740,height=" + h;
    // wnd = window.open(theURL, "popup", "resizable,dependent,scrollbars,width=533,height=400");
    wnd = window.open(theURL, "popupsupport", loc);
    if (wnd != null) wnd.focus();
}

// used in _template/problem/problem_edit_excel.jsp
// used in _template/quiz/Quiz_excel.jsp
function popupCM(theURL) {
    if (ielang != null && wnd != null && !wnd.closed) {
        wnd.close();
        while(!wnd.closed) { }
    }
    var h = screen.height;
    var w = screen.width;
    h = h * .7;
    w = w * .7;
    var loc = "toolbar=1,menubar=1,location=1,status=1,scrollbars=1,resizable=1,width=" + w + ",height=" + h;
    // wnd = window.open(theURL, "popup", "resizable,dependent,scrollbars,width=533,height=400");
    wnd = window.open(theURL, "popupCM", loc);
    if (wnd != null) wnd.focus();
}

function popupFlashPaper(theURL) {
    if (ielang != null && wnd != null && !wnd.closed) {
        wnd.close();
        /*
         * Case 5752: Some versions of browsers does not like wnd.closed. Removing it seems to have fixed the problem
         * This might have ramifications on slower machines, which I assume is the reason to have included
         * this popup.closed check in the first place.
         */
        //	while(!wnd.closed) { }
    }
    var h = screen.height;
    var w = screen.width;
    h = h * .7;
    w = w * .7;
    var loc = "toolbar=0,menubar=0,location=0,status=0,scrollbars=0,resizable=1,width=" + w + ",height=" + h;
    // wnd = window.open(theURL, "popup", "resizable,dependent,scrollbars,width=533,height=400");
    wnd = window.open(theURL, "popupFlashPaper", loc);
    if (wnd != null) {
        wnd.focus();
    }
}

function popupGradebookOneQuestion(theURL, height, width) {
    if (ielang != null && wnd != null && !wnd.closed) {
        wnd.close();
        /*
         * Case 5752: Some versions of browsers does not like wnd.closed. Removing it seems to have fixed the problem
         * This might have ramifications on slower machines, which I assume is the reason to have included
         * this popup.closed check in the first place.
         */
        //	while(!wnd.closed) { }
    }
    var h = screen.height;
    var w = screen.width;
    h = h * .7;
    w = w * .7;

    if (height != null && width != null) {
        h = height;
        w = width;
    }

    var loc = "toolbar=0,menubar=0,location=0,status=0,scrollbars=1,resizable=1,width=" + w + ",height=" + h;
    wnd = window.open(theURL, "popupGradebookOneQuestion", loc);
    if (wnd != null) {
        wnd.focus();
        return true;
    } else {
        // FB 55189 - need to let caller know if the window popup failed and have Flex retry launch
        return false;
    }
}

// rollover function
function roll(reference, img_name)
{
    img_name.src = reference;
}

// preload function
function preloadProfHdr()
{
    var onButtons = new Array('/images/subtab_coursehome_on.gif','/images/subtab_announcements_on.gif', '/images/subtab_assignments_on.gif','/images/subtab_apliamat_on.gif','/images/subtab_coursemat_on.gif','/images/subtab_crsdiscussion_on.gif','/images/subtab_administration_on.gif','/images/subtab_studentview_on.gif','/images/tabs_p_home_on.gif','/images/tabs_p_mycourses_on.gif','/images/tabs_p_contentbrowser_on.gif','/images/tabs_p_discussion_on.gif','/images/tabs_p_myaccount_on.gif');
    preloadMe(onButtons);
}

function preloadMe(onArray)
{
    for(var i = 0; i < onArray.length; i++)
    {
        var onImage = new Image();
        onImage.src = onArray[i];
    }
}

function validPassword (pwd) {
    //return ((pwd != null && trimString(pwd).length >= 6) &&
    //    	(pwd.match(/[^A-Za-z0-9]/) == null));
    return (
        (pwd != null) && (pwd.length >= 6) && (trimString(pwd).length > 0)
        );
}

function getNumberCheckBoxes(checkbox)
{
    var len = checkbox.length;
    if (isNaN (len)) {
        // only one checkbox: not an array
        return 1;
    }
    else
    {
        return len;
    }
}

function getNumberCheckBoxesChecked (checkbox) {
    var count = 0;
    if (checkbox == null) {return count;}
    var len = checkbox.length;
    if (isNaN (len)) {
        // only one checkbox: not an array
        if (checkbox.checked == true) {
            count++;
        }
    } else {
        for (var i = 0; i < len; i++) {
            if (checkbox[i].checked == true) {
                count++;
            }
        }
    }
    return count;
}


function checkAll (checkbox) {
    if (checkbox == null) {return;}
    var len = checkbox.length;
    if (isNaN (len)) {
        // only one checkbox: not an array
        if (!checkbox.disabled) {
            checkbox.checked = true;
        }
    } else {
        for (var i = 0; i < len; i++) {
            if (!checkbox[i].disabled) {
                checkbox[i].checked = true;
            }
        }
    }
}

function uncheckAll (checkbox) {
    if (checkbox == null) {return;}
    var len = checkbox.length;
    if (isNaN (len)) {
        // only one checkbox: not an array
        checkbox.checked = false;
    } else {
        for (var i = 0; i < len; i++) {
            checkbox[i].checked = false;
        }
    }
}

function toggleChecked (checkbox) {
    if (checkbox == null) {return;}
    var len = checkbox.length;
    if (isNaN (len)) {
        // only one checkbox: not an array
        checkbox.checked = !checkbox.checked;
    } else {
        for (var i = 0; i < len; i++) {
            checkbox[i].checked = !checkbox[i].checked;
        }
    }
}

function isRadioChecked (radio) {
    if (radio == null) {return false;}
    var len = radio.length;
    if (isNaN (len)) {
        return radio.checked;
    } else {
        var checked = false;
        for (var i = 0; i < radio.length; i++) {
            if (!checked && radio[i].checked) {
                checked = true;
            }
        }
        return checked;
    }
}

function getRadioValue(radio) {
    for (i=0; i<radio.length; i++) {
        if (radio[i].checked) {
            return radio[i].value;
        }
    }
    return '';
}

function writeHiddenInput (doc, checkbox, name)
{
    if (checkbox == null) {return;}
    var len = checkbox.length;
    if (isNaN (len)) {
        // only one checkbox: not an array
        if (checkbox.checked) {
            doc.write ("<input type='hidden' name='" + name + "' value='" + checkbox.value + "'>");
        }
    } else {
        for (var index = 0; index < len; index++) {
            if (checkbox[index].checked) {
                doc.write ("<input type='hidden' name='" + name + "' value='" + checkbox[index].value + "'>");
            }
        }
    }
}

function setOption(option, value)
{
    var len = option.length;
    for(var x=0; x < len; x++)
    {
        if (option[x].value == value)
        {
            option[x].selected = true;
            break;
        }
    }
}

function escapeApostrophes(str)
{
    return (str.replace(/[\']/g, "*"));
}

function unescapeApostrophes(str)
{
    return (str.replace(/[\*]/g, "'"));
}

function writeMe(str)
{
    document.write(str);
}

function textAreaLength(textArea)
{
    nPattern = /[\n]/g;
    rPattern = /[\r]/g;
    if (textArea != null && textArea.value != null)
    {
        var nCount = instanceCount(nPattern, textArea.value);
        var rCount = instanceCount(rPattern, textArea.value);

        var dif = Math.abs(nCount - rCount);

        return textArea.value.length + dif;
    }

    return 0;
}

function instanceCount(pattern, str)
{
    var count = 0;
    var m = null;

    m = str.match(pattern);
    if (m != null)
    {
        count = m.length;
    }

    return count;
}

/**
 Inserts a given option (opt) into an existing list (list) at the specified index (index)
 if index <= 0, inserts option at beginning of list
 if index >= list length, inserts at the end
 */
function insertOption (list, index, opt)
{
    if (index < 0) index = 0;   // if index less than 0 add to beginning of list

    // get list size
    var len = list.options.length;

    if (index >= len)   // if index equal or greater than length, add to end
    {
        list.options[len] = opt;
    }
    else    // add to index and push all items after down
    {
        var opts = list.options;
        opts[len] = new Option (opts[len-1].text, opts[len-1].value, opts[len-1].defaultSelected, opts[len-1].selected);
        for(i=len-1;i>index;i--)
        {
            opts[i] = new Option(opts[i-1].text, opts[i-1].value, opts[i-1].defaultSelected, opts[i-1].selected);
        }
        opts[i] = opt;
    }
}

function listContainsValue(list, value)
{
    return (listValueIndex(list, value) > -1);
}

function listValueIndex(list, value)
{
    var len = list.length;
    for(var i = 0; i < list.length; i++)
    {
        if(list.options[i].value == value)
        {
            return i;
        }
    }

    return -1;
}

function removeOption(list, value)
{
    var index = listValueIndex(list, value);
    if (index > -1)
    {
        list.options[index] = null;
    }
}

function enableRadio(radioArray,enable)
{
    var len = radioArray.length;
    if (isNaN(len))
    {
        radioArray.disabled = !enable;
    }
    else
    {
        for(var i=0;i<radioArray.length;i++)
        {
            radioArray[i].disabled = !enable;
        }
    }
}

function _hideObject(obj){
    if (obj!=null){
        obj.style.display="none";
    }
}

function _showObject(obj){
    if (obj!=null){
        obj.style.display="inline";
    }
}

var __isDivOpened = true;
function toggleImage(targetDivId, imageId, imageSrcClose, imageSrcOpen) {
    var targetDiv = document.getElementById(targetDivId);
    var targetImg = document.getElementById(imageId);
    if (__isDivOpened) {
        // close it
        targetDiv.style.display = "none";
        // switch to open
        targetImg.src = imageSrcClose;
        __isDivOpened = false;
        setCookie("collapsedCourseReading", true, 3 ,90); // from cookies.js
    } else {
        // open div
        targetDiv.style.display = "inline";
        // switch to close
        targetImg.src = imageSrcOpen;
        __isDivOpened = true;
        deleteCookie("collapsedCourseReading"); // from cookies.js
    }


}

/* Javascript alert and confirm handling */
function initDialogAlert() {
    YAHOO.namespace("alerthandling");

    YAHOO.alerthandling.alert =
        new YAHOO.widget.SimpleDialog("alert",
            { width: "300px",
                fixedcenter: true,
                visible: false,
                draggable: false,
                modal: true,
                close: false,
                constraintoviewport: true,
                buttons: [ { text: "OK", handler: handleOK } ]
            } );
}

// event handler for the alert dialog
var handleOK = function() {
    this.hide();
    if (handleAlert != null)
        handleAlert();
};

function jsAlert(msg, function_after_alert) {
    // initialize the alert dialog
    initDialogAlert();

    handleAlert = function_after_alert;
    YAHOO.alerthandling.alert.setHeader("Alert");
    YAHOO.alerthandling.alert.setBody(msg);

    // render and show the alert dialog
    YAHOO.alerthandling.alert.render(document.body);
    YAHOO.alerthandling.alert.show();
}

function initDialogConfirm() {
    YAHOO.namespace("alerthandling");

    YAHOO.alerthandling.confirm =
        new YAHOO.widget.SimpleDialog("confirm",
            { width: "300px",
                fixedcenter: true,
                visible: false,
                draggable: false,
                modal: true,
                close: false,
                constraintoviewport: true,
                buttons: [ { text: "&nbsp;No&nbsp;", handler: handleNo }, { text: "Yes", handler: handleYes } ]
            } );
}

// event handlers for the confirm dialog
var handleYes = function() {
    this.hide();
    handleConfirm();
};

var handleNo = function() {
    this.hide();
};

function jsConfirm(msg, function_if_confirm, fun) {
    // initialize the confirm dialog
    initDialogConfirm();

    handleConfirm = function_if_confirm;
    YAHOO.alerthandling.confirm.setHeader("Are you sure?");
    YAHOO.alerthandling.confirm.setBody(msg);

    // render and show the confirm dialog
    YAHOO.alerthandling.confirm.render(document.body);
    YAHOO.alerthandling.confirm.show();
}

function checkEnterKeyPress(e) {
    var keycode;
    if (navigator.appName.indexOf("Microsoft") != -1)
        keycode = window.event.keyCode;
    else
        keycode = e.which;

    if (keycode == 13) {
        // do nothing
        return false;
    }
    else
        return true;
}

/* Aplia Text */
function toggleFlipbook(isbn, chapter_id, module_id){
    var swf = document.getElementById("flipbook");
    if(swf.className == "flipbook-closed") {
        // open the flipbook div
        swf.className = "";
        // toggle the image
        document.getElementById("textbookImg").src = "/images/apliatext/close_textbook.gif";
        document.getElementById("textbookImg").width= "144";
        document.getElementById("textbookImg").height= "30";
        document.getElementById("textbookImg").alt= "Close Textbook";
        // embed the flipbook
        embedFlipbook(isbn, chapter_id, module_id, controller);
    } else {
        // close the flipbook div
        swf.className = "flipbook-closed";
        // toggle the image
        document.getElementById("textbookImg").src = "/images/apliatext/read_textbook.gif";
        document.getElementById("textbookImg").width= "141";
        document.getElementById("textbookImg").height= "30";
        document.getElementById("textbookImg").alt= "Read Textbook";
    }
}

function launchApliaText(module) {
    var theURL = "/af/servlet/apliatext?action=launch&module=" + module;
    if (ielang != null && wnd != null && !wnd.closed) {
        wnd.close();
    }

    var wndName = window.location.hostname;
    wndName = "atext_" + wndName.substring(0, wndName.indexOf("."));

    var h = screen.height * .8;
    var w = 765;
    var loc = "toolbar=1,location=1,status=1,scrollbars=1,resizable=1,width=" + w + ",height=" + h;
    if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1)
        loc += ",menubar=0";
    else
        loc += ",menubar=1";

    wnd = window.open(theURL, wndName, loc);
    if (wnd != null) {
        wnd.focus();
    }
}

function popupApliaText(i, c, m, s) {
    if (s == null)
        s = "";
    else
        s = atextURLEncode(s);

    var theURL = "/af/servlet/apliatext?action=popup&i=" + i + "&c=" + c + "&m=" + m + "&s=" + s;
    if (ielang != null && wnd != null && !wnd.closed) {
        wnd.close();
    }

    var wndName = window.location.hostname;
    wndName = "atext_" + wndName.substring(0, wndName.indexOf("."));

    var h = screen.height * .8;
    var w = 765;
    var loc = "toolbar=1,location=1,status=1,scrollbars=1,resizable=1,width=" + w + ",height=" + h;
    if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1)
        loc += ",menubar=0";
    else
        loc += ",menubar=1";

    wnd = window.open(theURL, wndName, loc);
    if (wnd != null) {
        wnd.focus();
    }
}

function atextURLEncode(s) {
    var SAFECHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_.!~*'()";
    var HEX = "0123456789ABCDEF";

    var plaintext = s;
    var encoded = "";
    for (var i = 0; i < plaintext.length; i++ ) {
        var ch = plaintext.charAt(i);
        if (ch == " ") {
            encoded += "+"; // x-www-urlencoded, rather than %20
        } else if (SAFECHARS.indexOf(ch) != -1) {
            encoded += ch;
        } else {
            var charCode = ch.charCodeAt(0);
            if (charCode > 255) {
                encoded += "+";
            } else {
                encoded += "%";
                encoded += HEX.charAt((charCode >> 4) & 0xF);
                encoded += HEX.charAt(charCode & 0xF);
            }
        }
    }
    var retVal = "" + encoded;
    return retVal;
}


function launchMindTap(i, n, c) {
    if (document.getElementById("dialogEBook") != null)
        $("#dialogEBook").dialog("close");

    if (c == null)
        c = "";

    var ctx = getUrlParam("ctx");

    var theURL = "/af/servlet/mindtap?action=launch&ctx=" + ctx + "&i=" + i + "&n=" + n + "&c=" + c;
    if (wnd != null && !wnd.closed) {
        wnd.close();
    }

    var wndName = window.location.hostname;
    wndName = "mindtap_" + wndName.substring(0, wndName.indexOf("."));

    wnd = window.open(theURL, wndName);
    if (wnd != null) {
        wnd.focus();
    }
}

function launchFlashpaper(file) {
    var theURL = "/article/?file=" + file;

    if (wnd != null && !wnd.closed) {
        wnd.close();
    }
    var h = screen.height;
    var w = screen.width;
    h = Math.ceil(h * .7);
    w = Math.ceil(w * .7);
    var loc = "toolbar=0,menubar=0,location=0,status=0,scrollbars=0,resizable=1,width=" + w + ",height=" + h;
    wnd = window.open(theURL, "popupFlashPaper", loc);
    if (wnd != null) {
        wnd.focus();
    }
}


function getSwf(id) {
    if (navigator.appName.indexOf("Microsoft") != -1) {
        return window[id];
    }
    else {
        return document[id];
    }
}

function htmlEncode(str)
{
    if (str == null) return str;

    var len = str.length;
    var capacity = len + 20;
    var buf = "";
    for (i = 0; i < len; i++) {
        var ch = str.charAt(i);
        switch (ch) {
            case ' ':
                buf += ch;
                break;
            case '<':
                buf += "&lt;";
                break;
            case '>':
                buf += "&gt;";
                break;
            case '&':
                buf += "&amp;";
                break;
            case '"':
                buf += "&quot;";
                break;
            case '\'':
                buf += "&#39;";
                break;
            default:
                buf += ch;
                break;
        }
    }
    return buf;
}

function HtmlDecode(s) {
    var out = "";
    if (s==null) return;

    var l = s.length;
    for (var i=0; i<l; i++) {
        var ch = s.charAt(i);

        if (ch == '&') {
            var semicolonIndex = s.indexOf(';', i+1);

            if (semicolonIndex > 0) {
                var entity = s.substring(i + 1, semicolonIndex);
                if (entity.length > 1 && entity.charAt(0) == '#') {
                    if (entity.charAt(1) == 'x' || entity.charAt(1) == 'X')
                        ch = String.fromCharCode(eval('0'+entity.substring(1)));
                    else
                        ch = String.fromCharCode(eval(entity.substring(1)));
                }
                else {
                    switch (entity) {
                        case 'quot': ch = String.fromCharCode(0x0022); break;
                        case 'amp': ch = String.fromCharCode(0x0026); break;
                        case 'lt': ch = String.fromCharCode(0x003c); break;
                        case 'gt': ch = String.fromCharCode(0x003e); break;
                        case 'nbsp': ch = String.fromCharCode(0x00a0); break;
                        case '#39': ch = '\\'; break;
                        default: ch = ''; break;
                    }
                }
                i = semicolonIndex;
            }
        }

        out += ch;
    }

    return out;
}

function getUrlParam(name) {
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( window.location.href );
    if( results == null )
        return "";
    else
        return results[1];
}


function getIEVersion() {
    // Returns the version of Internet Explorer, or a -1 if another browser
    var rv = -1;
    var ua, re;
    if (navigator.appName === 'Microsoft Internet Explorer') {
        ua = navigator.userAgent;
        re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
            rv = parseFloat( RegExp.$1 );
    } else if (navigator.appName === 'Netscape') {
        ua = navigator.userAgent;
        re = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
            rv = parseFloat( RegExp.$1 );
    }
    return rv;
}

function isInternetExplorer() {
    if (navigator.appName === 'Microsoft Internet Explorer')
        return true;
    else
        return false;
}

function isGoogleChrome() {
    if (navigator.userAgent.indexOf("Chrome") != -1)
        return true;
    else
        return false;
}

String.prototype.trim = function() {
    return (this.replace(/^\s*/, "").replace(/\s*$/, ""));
}

String.prototype.startsWith = function(str) {
    return (this.match("^"+str)==str)
}

String.prototype.endsWith = function(str) {
    return (this.match(str+"$")==str)
}

function hideYsn(problemDivId)
{
    var ysnDivId = problemDivId+"-ysn";
    jQ(ysnDivId).hide();
}

function showYsn(problemDivId, message)
{
    var ysnDivId = problemDivId+"-ysn";
    var selectStringBody = ysnDivId + "-body";
    var selectStringOuterDiv = ysnDivId;
    var ysnDiv = jQ(selectStringOuterDiv);

    if(!ysnDiv.length)
    {
        // first time invoked.. create it
        var problemDivSelector = '' + problemDivId;
        //jQ(problemDivSelector).parent().insertBefore();
        var ysnDivName = selectStringOuterDiv.substr(selectStringOuterDiv.indexOf("#") + 1)
        var ysnBodyDivName = ysnDivName + "-body";
        var ysnButtonName = ysnDivName + "-button";
        var ysnDivHtml = '<div id="'+ysnDivName+'" class="ysn" aria-hidden="false" role="dialog"><div id="'+ysnBodyDivName+'" class="ysn-body"></div><div class="ysn-action"><button id="'+ysnButtonName+'">Dismiss</button></div></div>';
        jQ(problemDivSelector).before(ysnDivHtml);
        jQ("#" + ysnButtonName).click(
            function()
            {
                hideYsn(problemDivId);
            });
    }

    jQ(selectStringBody).empty();
    jQ(selectStringBody).html(message);
    jQ(selectStringOuterDiv).show();
}

function showCNowErrorMsg(problemDivId, title, message)
{
    var htmlMessage = "";

    htmlMessage += "<p><b>" + title + "</b></p>";
    htmlMessage += "<p>" + message + "</p>";
    htmlMessage += "<p>When contacting support, we suggest you include a screenshot.  See <a href=\"http://www.take-a-screenshot.org/\" target=\"_new\">how to take a screenshot</a>.</p>";
    showYsn(problemDivId, htmlMessage);
}

