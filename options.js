"use strict";
/*
var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
	//console.log("XHR has changed state");

	if (xhr.readyState == 4) {
		var response = xhr.responseText;
		//console.log(response.lastIndexOf("</table>"));
		//console.log(response.substring(response.indexOf("<div id=\"content\"")+18,response.lastIndexOf("</table>")+8));
		document.getElementById("clock").innerHTML = response.substring(response.indexOf("<div id=\"content\"")+18,response.lastIndexOf("</table>")+8);
	}
}

xhr.open("GET", "https://spreadsheets.google.com/pub?key=0ApQ2E8kH4UvzdGo5Tkk4Qkw5c0x6X2t3VmVuN0ZDaHc", true);
xhr.send();
*/

var t;
var select;
var stored;

function restore_options() {

    //Sound the Horn
    if (localStorage["sound_horn"] == 1) {
        document.getElementById("sound_horn").checked = true;
        show_unobtrusive_mode();
    } else {
        show_seconds_before();
    }

    //Add timer
    if (localStorage["add_timer"] == 1) {
        document.getElementById("add_timer").checked = true;
    }

    //Timer display
    if (localStorage["time_display"] == "min") {
        document.getElementById("time_display_min").checked = true;
    } else {
        document.getElementById("time_display_s").checked = true;
    }

    //Tourney page
    if (localStorage["tourney_listing"] == 1) {
        document.getElementById("tourney_page").checked = true;
    }

    //Sound the Horn
    if (localStorage["time_action"] == 1) {
        document.getElementById("sth_box").checked = true;
    }

    if (localStorage["play_sound"] == 1) {
        document.getElementById("sth_snd").checked = true;
    }

    //One minute bef tc
    if (localStorage["tc_alert"] == 1) {
        document.getElementById("tca_box").checked = true;
    }
    if (localStorage["tca_snd"] == 1) {
        document.getElementById("tca_snd").checked = true;

    }

    //Trap check
    if (localStorage["tc_warning"] == 1) {
        document.getElementById("tcw_box").checked = true;
    }
    if (localStorage["tcw_snd"] == 1) {
        document.getElementById("tcw_snd").checked = true;
    }

    //Bait left
    document.getElementById("bait_left").value = localStorage["bait_left"];

    if (localStorage["bait_left_popup"] == 1) {

        document.getElementById("bait_left_popup").checked = true;

    }

    if (localStorage["bait_left_sound"] == 1) {
        document.getElementById("bait_left_sound").checked = true;
    }

    if (localStorage["useSuggestions"] == 1) {
        document.getElementById("useSuggestionsCheckbox").checked = true;
    }

    if (localStorage["showCRE"] == 1) {
        document.getElementById("showCREcheckbox").checked = true;
    }

    //Soundclip
    stored = localStorage["soundclip"];
    select = document.getElementById("soundclip");
    for (var j = 0; j < select.children.length; j++) {
        var child = select.children[j];
        if (child.value == stored) {
            child.selected = "true";
            break;
        }
    }
    
    //Volume
    stored = localStorage["volume"];
    select = document.getElementById("volume");
    for (var j = 0; j < select.children.length; j++) {
        var child = select.children[j];
        if (child.value == stored) {
            child.selected = "true";
            break;
        }
    }
    
    /*

    //favWeapon
    stored = localStorage["favWeapon"];
    select = document.getElementById("favWeapon");
    for (var j = 0; j < select.children.length; j++) {
        var child = select.children[j];
        if (child.value == stored) {
            child.selected = "true";
            break;
        }
    }

    //favBase
    stored = localStorage["favBase"];
    select = document.getElementById("favBase");
    for (var j = 0; j < select.children.length; j++) {
        var child = select.children[j];
        if (child.value == stored) {
            child.selected = "true";
            break;
        }
    }

    //favTrinket
    stored = localStorage["favTrinket"];
    select = document.getElementById("favTrinket");
    for (var j = 0; j < select.children.length; j++) {
        var child = select.children[j];
        if (child.value == stored) {
            child.selected = "true";
            break;
        }
    }

    //favCheese
    stored = localStorage["favCheese"];
    select = document.getElementById("favCheese");
    for (var j = 0; j < select.children.length; j++) {
        var child = select.children[j];
        if (child.value == stored) {
            child.selected = "true";
            break;
        }
    }
    
    */

}

function display_saved() {
    clearTimeout(t);
    chrome.extension.sendMessage({
        message: "options_saved"
    }, function (response) {});

    var status = document.getElementById("status");

    status.innerHTML = "";



    t = setTimeout(function () {
        status.innerHTML = "<td colspan='3'>Options Saved</td>";



        t = setTimeout(function () {
            status.innerHTML = "";
        }, 2000);



    }, 100);
}

window.onload = function () {

    restore_options();

    document.getElementById("sound_horn").onchange = function () {
        if (document.getElementById("sound_horn").checked == true) {
            localStorage["sound_horn"] = 1;
            hide_seconds_before();
            show_unobtrusive_mode();
        } else {
            localStorage["sound_horn"] = 0;
            show_seconds_before();
            hide_unobtrusive_mode();
        }

        display_saved();
    };

    document.getElementById("time_display").onchange = function () {
        if (document.getElementById("time_display_min").checked) localStorage["time_display"] = "min";
        else localStorage["time_display"] = "s";

        display_saved();
    };


    document.getElementById("add_timer").onchange = function () {
        if (document.getElementById("add_timer").checked == true) localStorage["add_timer"] = 1;
        else localStorage["add_timer"] = 0;

        display_saved();
    };


    document.getElementById("tourney_page").onchange = function () {
        if (document.getElementById("tourney_page").checked == true) localStorage["tourney_listing"] = 1;
        else localStorage["tourney_listing"] = 0;

        display_saved();
    };


    document.getElementById("sth_box").onchange = function () {
        if (document.getElementById("sth_box").checked == true) localStorage["time_action"] = 1;
        else localStorage["time_action"] = 0;

        display_saved();
    };

    document.getElementById("sth_snd").onchange = function () {
        if (document.getElementById("sth_snd").checked == true) localStorage["play_sound"] = 1;
        else localStorage["play_sound"] = 0;

        display_saved();
    };


    document.getElementById("tcw_box").onchange = function () {
        if (document.getElementById("tcw_box").checked == true) localStorage["tc_warning"] = 1;
        else localStorage["tc_warning"] = 0;

        display_saved();
    };
    document.getElementById("tcw_snd").onchange = function () {
        if (document.getElementById("tcw_snd").checked == true) localStorage["tcw_snd"] = 1;
        else localStorage["tcw_snd"] = 0;

        display_saved();
    };


    document.getElementById("tca_box").onchange = function () {
        if (document.getElementById("tca_box").checked == true) localStorage["tc_alert"] = 1;
        else localStorage["tc_alert"] = 0;

        display_saved();
    };
    document.getElementById("tca_snd").onchange = function () {
        if (document.getElementById("tca_snd").checked == true) localStorage["tca_snd"] = 1;
        else localStorage["tca_snd"] = 0;

        display_saved();
    };

    document.getElementById("bait_left").onchange = function () {
        localStorage["bait_left"] = document.getElementById("bait_left").value;

        display_saved();
    };

    document.getElementById("bait_left_popup").onchange = function () {
        if (document.getElementById("bait_left_popup").checked) localStorage["bait_left_popup"] = 1;
        else localStorage["bait_left_popup"] = 0;

        display_saved();
    };
    document.getElementById("bait_left_sound").onchange = function () {
        if (document.getElementById("bait_left_sound").checked) localStorage["bait_left_sound"] = 1;
        else localStorage["bait_left_sound"] = 0;

        display_saved();
    };


    document.getElementById("soundclip").onchange = function () {
        select = document.getElementById("soundclip")
        localStorage["soundclip"] = select.children[select.selectedIndex].value;

        display_saved();
    };

    document.getElementById('volume').onchange = function () {
        select = document.getElementById('volume')
        localStorage['volume'] = select.children[select.selectedIndex].value;

        display_saved();
    };


    var soundfile = new Array();
    soundfile["alarmShort"] = "alarm_short.mp3";
    soundfile["alarmLong"] = "alarm_long.mp3";
    soundfile["bugleShort"] = "bugle_short.mp3";
    soundfile["bugleLong"] = "bugle_long.mp3";
    soundfile["chime"] = "chime.mp3";
    soundfile["beep"] = "beep.mp3";


    document.getElementById("try_it").onclick = function () {
        var sound = new Audio(soundfile[localStorage["soundclip"]]);
		sound.volume = localStorage["volume"];

        sound.play();
    };
    
    var useSuggestionsCheckbox = $("#useSuggestionsCheckbox")[0];
    $("#useSuggestionsCheckbox").change (function () {
        if (useSuggestionsCheckbox.checked) {
        	localStorage["useSuggestions"] = 1;
        }
        else {
        	localStorage["useSuggestions"] = 0;
        }

        display_saved();
    });
    
    var showCREcheckbox = $("#showCREcheckbox")[0];
    $("#showCREcheckbox").change (function () {
        if (showCREcheckbox.checked) {
        	localStorage["showCRE"] = 1;
        }
        else {
        	localStorage["showCRE"] = 0;
        }

        display_saved();
    });
    

    /*

    $("#favWeapon").change(function () {
        select = $('#favWeapon');
        localStorage['favWeapon'] = select[0].children[select[0].selectedIndex].value;

        display_saved();
    });
    
    $("#favBase").change(function () {
        select = $('#favBase');
        localStorage['favBase'] = select[0].children[select[0].selectedIndex].value;

        display_saved();
    });
    
    $("#favTrinket").change(function () {
        select = $('#favTrinket');
        localStorage['favTrinket'] = select[0].children[select[0].selectedIndex].value;

        display_saved();
    });
    
    $("#favCheese").change(function () {
        select = $('#favCheese');
        localStorage['favCheese'] = select[0].children[select[0].selectedIndex].value;

        display_saved();
    });
    */
}






function show_seconds_before() {
    document.getElementById("seconds_before_row").innerHTML = "<td colspan='3'>Alert me <select id='seconds_before'><option value='0'>0</option><option value='5'>5</option><option value='10'>10</option><option value='20'>20</option></select> seconds before the horn is ready</td>";

    stored = localStorage["seconds_before"];
    select = document.getElementById("seconds_before");
    for (var j = 0; j < select.children.length; j++) {
        var child = select.children[j];
        if (child.value == stored) {
            child.selected = "true";
            break;
        }
    }

    document.getElementById("seconds_before").onchange = function () {
        select = document.getElementById("seconds_before")
        localStorage["seconds_before"] = select.children[select.selectedIndex].value;

        display_saved();
    };
}

function hide_seconds_before() {
    document.getElementById("seconds_before_row").innerHTML = "";
}

function show_unobtrusive_mode() {
    document.getElementById("unobtrusive_mode_row").innerHTML = "<td colspan='2'>Unobtrusive mode<br /><small>Sound the Horn without changing tabs</small></td>   <td colspan='1'><input type='checkbox' id='unobtrusive_mode'></td>";

    if (localStorage["unobtrusive_mode"] == 1) {
        document.getElementById("unobtrusive_mode").checked = true;
    }

    document.getElementById("unobtrusive_mode").onchange = function () {
        if (document.getElementById("unobtrusive_mode").checked == true) localStorage["unobtrusive_mode"] = 1;
        else localStorage["unobtrusive_mode"] = 0;

        display_saved();
    };
}

function hide_unobtrusive_mode() {
    document.getElementById("unobtrusive_mode_row").innerHTML = "";
}

