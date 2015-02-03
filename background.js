
/*################	Initialise browser action	######################*/
chrome.browserAction.setBadgeText({
	text: "?"
});
chrome.browserAction.setBadgeBackgroundColor({
	color: [211, 211, 211, 255]
});

/*####################	Set default values if not set	######################*/
if (localStorage["time_action"] === undefined) localStorage["time_action"] = 1;

if (localStorage["sound_horn"] === undefined) localStorage["sound_horn"] = 1;
if (localStorage["unobtrusive_mode"] === undefined) localStorage["unobtrusive_mode"] = 0;
if (localStorage["seconds_before"] === undefined) localStorage["seconds_before"] = 0;
if (localStorage["add_timer"] === undefined) localStorage["add_timer"] = 1;

if (localStorage["soundclip"] === undefined) localStorage["soundclip"] = "chime";
if (localStorage["volume"] === undefined) localStorage["volume"] = 0.1;

if (localStorage["time_display"] === undefined) localStorage["time_display"] = "min";
if (localStorage["play_sound"] === undefined) localStorage["play_sound"] = 1;

if (localStorage["tc_alert"] === undefined) localStorage["tc_alert"] = 0;
if (localStorage["tca_snd"] === undefined) localStorage["tca_snd"] = 0;

if (localStorage["tc_warning"] === undefined) localStorage["tc_warning"] = 0;
if (localStorage["tcw_snd"] === undefined) localStorage["tcw_snd"] = 0;

if (localStorage["bait_left"] === undefined) localStorage["bait_left"] = 0;
if (localStorage["bait_left_popup"] === undefined) localStorage["bait_left_popup"] = 0;
if (localStorage["bait_left_sound"] === undefined) localStorage["bait_left_sound"] = 0;

if (localStorage["tourney_listing"] === undefined) localStorage["tourney_listing"] = 0;
if (localStorage["useSuggestions"] === undefined) localStorage["useSuggestions"] = 0;
if (localStorage["showCRE"] === undefined) localStorage["showCRE"] = 0;

/*Delete these one day
if (localStorage["favWeapon"] === undefined) localStorage["favWeapon"] = "None";
if (localStorage["favBase"] === undefined) localStorage["favBase"] = "None";
if (localStorage["favTrinket"] === undefined) localStorage["favTrinket"] = "None";
if (localStorage["favCheese"] === undefined) localStorage["favCheese"] = "None";
*/


/*#################	Initialise global variables	######################*/
var time_left_ms;
var horn_ready_time;
var hist;
var ms_before = localStorage["seconds_before"]*1000*(1-localStorage["sound_horn"]);

//For timers
var t;
var t1;
var t2;
var d; //for new Date()
var attemptNo = 0;

var awaiting_page_load = false;

//For animation purposes
var animationFrames = 36;
var animationSpeed = 10;
var rotation = 0;
var canvas = document.getElementById('canvas');
var canvasContext = canvas.getContext('2d');
var loggedInImage = document.getElementById('logged_in');

var soundfile = new Array();
soundfile["alarmShort"] = "alarm_short.mp3";
soundfile["alarmLong"] = "alarm_long.mp3";
soundfile["bugleShort"] = "bugle_short.mp3";
soundfile["bugleLong"] = "bugle_long.mp3";
soundfile["chime"] = "chime.mp3";
soundfile["beep"] = "beep.mp3";
var sound = new Audio(soundfile[localStorage["soundclip"]]);
sound.volume = localStorage["volume"];


/*################	Browser action clicked	######################*/
chrome.browserAction.onClicked.addListener(function () {
	d = new Date();

	//If time left is unknown, check if is new tab.  If new tab load in same page. Else create new tab. open hunters camp/turn.php.
	if (horn_ready_time == null) {
		chrome.tabs.query({
			'active': true
		}, function (tabs) {
			if (tabs[0].url == "chrome://newtab/") {
				chrome.tabs.update({
					url: "http://www.mousehuntgame.com/"
				});
			} else {
				chrome.tabs.create({
					url: "http://www.mousehuntgame.com/"
				});
			}
		});
	}

	//Sound horn or open hunters camp/go to existing tab if time is up
	else if (horn_ready_time <= d.getTime()) {
		chrome.tabs.query({'active': true}, function (tabs) {
			if (tabs[0].url.search("mousehuntgame.com") != -1) {
				scrollTop();
				chrome.tabs.sendMessage(tabs[0].id, {
					message: "click_horn"
				}, function (response) {});
			}
			else find_MH_tab("browser_action_clicked_time_ready");
		});
	}

	else {
		chrome.tabs.query({
			'active': true
		}, function (tabs) {
			//Look for MH tab if active tab is not MH
			if (tabs[0].url.search("mousehuntgame.com") == -1) find_MH_tab("browser_action_clicked_time_yet");
		});
	}

});



/*################	MH tab finding (and confirm box)	######################*/
function find_MH_tab(message) {
	chrome.tabs.query({}, function (tabs) {
		var no_of_tabs = tabs.length;
		var MH_tab_id;

		var MH_found = 0;

		for (var i = 0; i < no_of_tabs && MH_found == 0; i++) {
			//If MH tab found, quit loop
			if (tabs[i].url.search("mousehuntgame.com") != -1) {
				MH_tab_id = tabs[i].id;
				MH_found = 1;
			}
		}

		if (message == "browser_action_clicked_time_ready") {
			if (MH_found == 0) {
				chrome.tabs.query({
					'active': true
				}, function (tabs) {
					if (tabs[0].url == "chrome://newtab/") {
						chrome.tabs.update({
							url: "http://www.mousehuntgame.com/"
						});
						if (localStorage["sound_horn"] == 1) awaiting_page_load = true;

					} else {
						chrome.tabs.create({
							url: "http://www.mousehuntgame.com/"
						});
						if (localStorage["sound_horn"] == 1) awaiting_page_load = true;

					}
				});
			} else {
				chrome.tabs.update(MH_tab_id, {
					"active": true
				});
				scrollTop();
				chrome.tabs.sendMessage(MH_tab_id, {
					message: "click_horn"
				}, function (response) {});
			}
		} else if (message == "browser_action_clicked_time_yet") {
			if (MH_found == 0) { //If MH tab not found
				chrome.tabs.query({
					'active': true
				}, function (tabs) {
					//Check if current tab is new tab, if new tab, open camp in same tab. else create new tab and open camp
					if (tabs[0].url == "chrome://newtab/") chrome.tabs.update({
						url: "http://www.mousehuntgame.com/"
					});
					else chrome.tabs.create({
						url: "http://www.mousehuntgame.com/"
					});
				});
			} else {
				chrome.tabs.update(MH_tab_id, {
					"active": true
				});
			}
		} else if (message == "message_box") {
			if (MH_found) {

				//Get name of MH page
				chrome.tabs.get(MH_tab_id, function (tab) {

					var MH_page_name;
					if (localStorage["add_timer"] == 0) MH_page_name = tab.title
					else MH_page_name = tab.title.substr(tab.title.indexOf("|") + 2);

					var OK_hit = confirm("Time to sound the horn. Hit OK to sound the horn in the tab " + MH_page_name + ".");
					if (OK_hit) {
						if (localStorage["unobtrusive_mode"] == 0 || localStorage["sound_horn"] == 0) {
							chrome.tabs.update(MH_tab_id, {
								"active": true
							});
						}
						scrollTop();
						if (localStorage["sound_horn"] == 1) chrome.tabs.sendMessage(MH_tab_id, {message: "click_horn"}, function (response) {});
					}
				});

			} else {
				var OK_hit = confirm("Time to sound the horn. Hit OK to open MouseHunt in a NEW tab.");
				if (OK_hit) {
					chrome.tabs.create({
						url: "http://www.mousehuntgame.com/"
					});
					if (localStorage["sound_horn"] == 1) awaiting_page_load = true;
				}
			}
		}
	});
}


function calcMinLuck (E, M) {
	return Math.ceil(Math.sqrt((M/(3-Math.min(E,2)))/(Math.min(E,2)*Math.min(E,2))));
}

function calcCR (E, P, L, M) {
	/*
	console.log(E);
	console.log(P);
	console.log(L);
	console.log(M);
	*/

	var CR = Math.min((E*P + (3-Math.min(E,2))*Math.pow((Math.min(E,2)*L),2))/(E*P + M), 0.9999);
	
	return CR;
}

function findEff (mouseName, trapType) {
	var eff;
	if (trapType == '') eff = 0;
	else {
		var eff = parseInt(powersArray[mouseName][typeEff[trapType]])/100;
	}
	
	return eff;
}

/*####################	Handles requests from content script	######################*/
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

	if (request.message == "page_load") {

		//Send options
		chrome.tabs.sendMessage(sender.tab.id, {
			message: "options",
			tourney: localStorage["tourney_listing"],
			useSuggestions: localStorage["useSuggestions"],
			showCRE: localStorage["showCRE"]/*
			favWeapon: weaponLLL[localStorage["favWeapon"]],
			favBase: baseLLL[localStorage["favBase"]],
			favTrinket: trinketLLL[localStorage["favTrinket"]],
			favCheese: cheeseLLL[localStorage["favCheese"]]*/
		}, function (response) {});
		
		if (localStorage["tourney_listing"] == 1) {
			chrome.tabs.sendMessage(sender.tab.id, {message: "tourney_page_yes"}, function (response) {});
		}

		if (awaiting_page_load) {
			awaiting_page_load = false;
			setTimeout(function() {
				chrome.tabs.sendMessage(sender.tab.id, {message: "click_horn"}, function (response) {});
			}, 200);

		} else {

			attemptNo = 0;

			//Update timers in MH tab titles
			if (localStorage["add_timer"] == 1) update_title();

			d = new Date();

			if (horn_ready_time <= d.getTime() || horn_ready_time == null || request.hornTime < horn_ready_time) {
				clearTimeout(t);
				horn_ready_time = request.hornTime;
				animate_flip();

				if (horn_ready_time > d.getTime()) {
					//Send horn_ready_time to all MH tabs
					if (localStorage["add_timer"] == 1) update_title();
					countdown();
				} else if (horn_ready_time <= d.getTime()) {
					if (localStorage["add_timer"] == 1) update_title();
					chrome.browserAction.setBadgeText({
						text: "0"
					});
					chrome.browserAction.setBadgeBackgroundColor({
						color: [255, 0, 0, 255]
					});
				}
			}
		}

		var bait_quantity = request.bait_left;
		if (bait_quantity <= localStorage["bait_left"]) bait_warning(bait_quantity);

		sendResponse({});
	} else if (request.message == "horn_sounded") {
		attemptNo = 0;
		sendResponse({});
		d = new Date();
		if (horn_ready_time <= d.getTime()) get_horn_time();
	} else if (request.message == "options_saved") {
		sendResponse({});

		sound = new Audio(soundfile[localStorage["soundclip"]]);
		sound.volume = localStorage["volume"];

		ms_before = localStorage["seconds_before"] * 1000 * (1-localStorage["sound_horn"]);

		tc_timer();
	} else if (request.message == "trap_check") {
		if (hist == null) {
			hist = 1336708800000 + (request.tct - 1) * 60000;
		}

		sendResponse({});
		if (localStorage["tc_warning"] == 1 || localStorage["tc_alert"] == 1 || localStorage["tca_snd"] == 1 || localStorage["tcw_snd"] == 1) tc_timer();
	} else if (request.message == "location") {
		sendResponse(suggs[request.location]);
	} /*else if (request.message == "catchRates") {
		console.log(request.trapPower, request.trapLuck, request.trapType);
		var mouseName = request.mouseName;
		var indexOfMouse = mouseName.indexOf(" Mouse");
		if (indexOfMouse>0 && mouseName!="Dread Pirate Mousert")	mouseName = mouseName.slice(0, indexOfMouse);
		console.log(mouseName);
		var eff = findEff(mouseName, request.trapType);
		console.log("eff", eff);
		var CR = calcCR(eff, request.trapPower, request.trapLuck, parseFloat(powersArray[mouseName][0]));
		console.log("mouse power", powersArray[mouseName][0], "CR", CR);
		sendResponse(CR);
	}*/ else if (request.message == "catchRateList") {
		console.log(request.trapPower, request.trapLuck, request.trapType);
		console.log(request.miceList);
		var miceList = request.miceList;
		var crList = [], minLuckList = [];
		for (var i=0; i<miceList.length; i++) {
			var mouseName = miceList[i];
			var indexOfMouse = mouseName.indexOf(" Mouse");
			if (indexOfMouse>0 && mouseName!="Dread Pirate Mousert")	mouseName = mouseName.slice(0, indexOfMouse);
			console.log(mouseName);
			var eff = findEff(mouseName, request.trapType);
			console.log("eff", eff);
			var CR = calcCR(eff, request.trapPower, request.trapLuck, parseFloat(powersArray[mouseName][0]));
			console.log("mouse power", powersArray[mouseName][0], "CR", CR);
			crList.push((CR*100).toFixed(2)+"%");
			var minLuck = calcMinLuck(eff, parseFloat(powersArray[mouseName][0]));
			minLuckList.push(minLuck);
		}
		
		var response = new Object();
		response.catchRates = crList;
		response.minLuckVals = minLuckList;
		sendResponse(response);
		
	} else if (request.message == "attractionRates") {
		console.log(request.location, request.cheese);
		//console.log(request.miceList);
		
		var locationID = JSON.parse(getIdFromName("location",request.location)).id;
		var cheeseID = JSON.parse(getIdFromName("cheese",request.cheese)).id;
		var phaseID = request.phase;
		if (request.location == "Sunken City") var phaseID = JSON.parse(getIdFromName("quest_sunken_city_zone",request.phase)).id;
		console.log("Phase ID", phaseID);
		
		var saEncounterRateData = getSAEncounterRateData({location:locationID,cheese:cheeseID,phase:phaseID});
		console.log(saEncounterRateData);
		
		var arList = [];
		
		var miceList = request.miceList;
		var totalAttractions = 0;
		for (var i=0; i<miceList.length; i++) {
			var mouseName = miceList[i];
			var indexOfMouse = mouseName.indexOf(" Mouse");
			if (indexOfMouse>0 && mouseName!="Dread Pirate Mousert")	mouseName = mouseName.slice(0, indexOfMouse);
			//console.log(mouseName);
			var mouseFound = false;
			for (var j=0; j<saEncounterRateData.mice.length; j++) {
				if (mouseName == saEncounterRateData.mice[j].name) {
					//console.log(mouseName, "found at", j, "!");
					mouseFound = true;
					totalAttractions += saEncounterRateData.mice[j].seen*1;
					break;
				}
			}
			if (mouseFound) arList.push(saEncounterRateData.mice[j].seen*1);
			else arList.push(0);
		}
		
		console.log(arList);
		console.log("nAttractions", totalAttractions);
		
		//Divide by total attractions and formatting
		for (var i=0; i<arList.length; i++) {
			arList[i] /= totalAttractions/100;
			arList[i] = arList[i].toFixed(2) + "%";
		}
		
		sendResponse(arList);	
	}
});

function getSAEncounterRateData(setup) {
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "http://horntracker.com/backend/new/api.php", false);
	xhr.setRequestHeader("Content-Type", "application/json;");
	
	var requestObj = {};
	requestObj.f = "getSAEncounterRateData";
	requestObj.vars = {};
	requestObj.vars.location = {};
	requestObj.vars.cheese = {};
	
	requestObj.vars.location[setup.location]={exclude:false};
	requestObj.vars.cheese[setup.cheese]={exclude:false};
	
	//Special cases - phases or population-affecting bases/charms
	//Sunken city
	if (setup.location == 329) {
		requestObj.vars["Sunken City Zone"] = {};
		requestObj.vars["Sunken City Zone"][setup.phase]={exclude:false};
	}
	
	var requestString = JSON.stringify(requestObj);
	console.log("Request string", requestString);
	xhr.send(requestString);

	return JSON.parse(xhr.responseText);
}

function getIdFromName (type, name) {
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "http://horntracker.com/backend/new/api.php", false);
	xhr.setRequestHeader("Content-Type", "application/json;");
	
	xhr.send(JSON.stringify({"f":"getIdFromName","vars":{"type":type,"name":name}}));

	return xhr.responseText;
}


/*####################	Get horn time through XHR	######################*/
function get_horn_time () {
	attemptNo++;
	clearTimeout(t);

	var xhr = new XMLHttpRequest();
	xhr.open("GET", "http://www.mousehuntgame.com/index.php", true);
	
	xhr.onreadystatechange = function () {

		if (xhr.readyState == 4) {

			d = new Date();

			var response_html = xhr.responseText;
			
			if (response_html.indexOf("next_activeturn_seconds") != -1) {
				userLoc = response_html.indexOf("user = ") + 7;
				userJSON = JSON.parse(response_html.substr(userLoc, response_html.indexOf("};") - (userLoc - 1)))

				var horn_seconds_left = userJSON.next_activeturn_seconds * 1;
				horn_ready_time = d.getTime() + horn_seconds_left * 1000;


				if (horn_seconds_left > 0) {
					attemptNo = 0;

					animate_flip()

					//Send horn_ready_time to all MH tabs
					if (localStorage["add_timer"] == 1) update_title();
					countdown();

					if (localStorage["tc_warning"] == 1 || localStorage["tc_alert"] == 1 || localStorage["tca_snd"] == 1 || localStorage["tcw_snd"] == 1) tc_timer();

					var bait_quantity = userJSON.bait_quantity;
					if (bait_quantity < localStorage["bait_left"]) bait_warning(bait_quantity);
				} else if (horn_seconds_left == 0) {
					if (attemptNo <= 3) {
						t = setTimeout(function () {
							get_horn_time();
						}, 5000);
					}
				}
			}
		}
	}

	xhr.send(null);
}


/*##############	Title timer	######################*/
function update_title() {

	//Get all tabs; find out which are MH
	chrome.tabs.query({}, function (tabs) {
		var no_of_tabs = tabs.length;

		for (var i = 0; i < no_of_tabs; i++) {
			//If MH tab
			if (tabs[i].url.search("mousehuntgame.com") != -1) {

				//If colon doesn't exist
				if (tabs[i].title.indexOf(":") == -1) {
					var tabid = tabs[i].id;
					chrome.tabs.sendMessage(tabid, {
						message: "time",
						HRT: horn_ready_time
					}, function (response) {});
				} else {

					//Make sure characters before the colon are between 0 and 15
					var string_bef_colon = tabs[i].title.substring(0, tabs[i].title.indexOf(":"));
					if (!(string_bef_colon >= 0 && string_bef_colon < 15)) {
						var tabid = tabs[i].id;
						chrome.tabs.sendMessage(tabid, {
							message: "time",
							HRT: horn_ready_time
						}, function (response) {});
					}
				}

			}
		}
	});
}



/*###############	Countdown	######################*/
//Countdown time left and print on badge
function countdown() {
	clearTimeout(t);

	var time_now = new Date();
	var time_left_ms = (horn_ready_time - time_now.getTime());

	if (time_left_ms > ms_before) {
		update_badge(time_left_ms);
		t = setTimeout(function () {
			countdown();
		}, time_left_ms % 1000);
	} else if (time_left_ms <= ms_before) {
		clearTimeout(t);
		time_up();
	}
}



/*#############		Update browser action badge	#############*/
function update_badge(time) {

	chrome.browserAction.setBadgeBackgroundColor({
		color: [0, 0, 0, 255]
	});

	if (localStorage["time_display"] == "min") {

		var min_left = Math.ceil(time / 60000);
		if (min_left > 1) {
			chrome.browserAction.setBadgeText({
				text: min_left.toString()
			});
		} else {
			var sec_left = Math.ceil(time / 1000)
			chrome.browserAction.setBadgeText({
				text: sec_left.toString()
			});
		}


	} else {
		var sec_left = Math.ceil(time / 1000)
		chrome.browserAction.setBadgeText({
			text: sec_left.toString()
		});
	}


}



/*###################	Called when timer reaches 0	######################*/
function time_up() {

	//Badge to display "0" on red background
	chrome.browserAction.setBadgeText({
		text: "0"
	});
	chrome.browserAction.setBadgeBackgroundColor({
		color: [255, 0, 0, 255]
	});

	//Play sound
	if (localStorage["play_sound"] == 1) sound.play();

	//Get url of active tab
	chrome.tabs.query({
		'active': true
	}, function (tabs) {

		if (localStorage["time_action"] == 1) {

			//If active tab is not MH, find MH tab
			if (tabs[0].url.search("mousehuntgame.com") == -1) { //If current tab is NOT MH
				find_MH_tab("message_box");
			} else { //If current tab IS MH
				var OK_hit = confirm("Time to sound the horn.");

				if (OK_hit) {
					chrome.tabs.update(tabs[0].id, {
						"active": true //In case another window is open
					});
					scrollTop();
					if (localStorage["sound_horn"] == 1) chrome.tabs.sendMessage(tabs[0].id, {
						message: "click_horn"
					}, function (response) {});
				}
			}
		}
	});
}


/*################	TRAP CHECK TIMING	#################*/
function tc_timer() {

	d = new Date();

	clearTimeout(t1);
	clearTimeout(t2);

	var tcw_ms = hist + Math.ceil((d.getTime() - hist) / 3600000) * 3600000 - d.getTime();
	var tca_ms = hist + 60000 + Math.ceil((d.getTime() - hist - 60000) / 3600000) * 3600000 - d.getTime();

	if (localStorage["tc_warning"] == 1 || localStorage["tcw_snd"] == 1) {
		d = new Date();
		t1 = setTimeout(function () {
			if (localStorage["tcw_snd"] == 1) sound.play();
			if (localStorage["tc_warning"] == 1) tc_msg(0);
		}, tcw_ms);
	}


	if (localStorage["tc_alert"] == 1 || localStorage["tca_snd"] == 1) {
		d = new Date();
		t2 = setTimeout(function () {
			if (localStorage["tca_snd"] == 1) sound.play();
			if (localStorage["tc_alert"] == 1) tc_msg(1);
		}, tca_ms);
	}
}


/*###################	TRAP CHECK MESSAGE	######################*/
function tc_msg(tcm_type) {

	chrome.tabs.query({}, function (tabs) {
		var n_tabs = tabs.length;
		var MH_tabid;

		var MH_found = 0;

		for (var i = 0; i < n_tabs && MH_found == 0; i++) {
			//If MH tab found, quit loop

			if (tabs[i].url.search("mousehuntgame.com") != -1) {
				MH_tabid = tabs[i].id;
				MH_found = 1;
			}

		} //End for

		if (MH_found) {
			//Get name of MH page
			chrome.tabs.get(MH_tabid, function (tab) {

				var MH_tab_name;
				if (localStorage["add_timer"] == 0) MH_tab_name = tab.title;
				else MH_tab_name = tab.title.substr(tab.title.indexOf("|") + 2);

				if (tcm_type == 0) {
					var ok = confirm("Trap check in one minute. Hit OK to open Hunter's Camp in the tab " + MH_tab_name + ".");
					if (ok) chrome.tabs.update(MH_tabid, {
						url: "https://www.mousehuntgame.com",
						"active": true
					});
				} else {
					var ok = confirm("Trap check has occurred. Hit OK to open Hunter's Camp in the tab " + MH_tab_name + ".");
					if (ok) {
						chrome.tabs.update(MH_tabid, {
							url: "https://www.mousehuntgame.com",
							active: true
						});
					}
				}
			}); //End get
		} else {
			//Open hunter's camp in new tab
			if (tcm_type == 0) {
				var ok = confirm("Trap check in one minute. Hit OK to open the Hunter's Camp in a new tab.");
			} else {
				var ok = confirm("Trap check has occurred. Hit OK to open the Hunter's Camp in a new tab.");
			}
			if (ok) chrome.tabs.create({
				url: "http://www.mousehuntgame.com/"
			});
		}

	}); //End query
}

/*###################	Bait warning ######################*/
function bait_warning(bait_left) {
	if (localStorage["bait_left_sound"] == 1) {
		sound.play();
	}

	if (localStorage["bait_left_popup"] == 1) {

		var ok = confirm("There are " + bait_left + " pieces of bait left.");
		if (ok) {

			chrome.tabs.query({}, function (tabs) {
				var no_of_tabs = tabs.length;
				var MH_tab_id;

				var MH_tab_found = 0;

				for (var i = 0; i < no_of_tabs && MH_tab_found == 0; i++) {
					//If MH tab found, quit loop

					if (tabs[i].url.search("mousehuntgame.com") != -1) {
						MH_tab_id = tabs[i].id;
						MH_tab_found = 1;
					}
				}

				if (MH_tab_found) {
					chrome.tabs.update(MH_tab_id, {
						"active": true
					});
				} else {
					chrome.tabs.create({
						url: "http://www.mousehuntgame.com/"
					});
				}
			});
		}
	}
}


//Rotate icon
function animate_flip() {
	rotation += 1 / animationFrames;
	drawIconAtRotation();

	if (rotation <= 1) {
		setTimeout(animate_flip, animationSpeed);
	} else {
		rotation = 0;
		chrome.browserAction.setIcon({
			path: "horn1.png"
		});
	}
}


function drawIconAtRotation() {
	canvasContext.save();
	canvasContext.clearRect(0, 0, canvas.width, canvas.height);
	canvasContext.translate(
	Math.ceil(canvas.width / 2),
	Math.ceil(canvas.height / 2));
	canvasContext.rotate(2 * Math.PI * ease(rotation));
	canvasContext.drawImage(loggedInImage, -Math.ceil(canvas.width / 2), -Math.ceil(canvas.height / 2));
	canvasContext.restore();

	chrome.browserAction.setIcon({
		imageData: canvasContext.getImageData(0, 0,
		canvas.width, canvas.height)
	});
}


function ease(x) {
	return (1 - Math.sin(Math.PI / 2 + x * Math.PI)) / 2;
}

function scrollTop () {

	chrome.tabs.executeScript({code:"window.scrollTo(0,0);"});
}


var suggestions = new XMLHttpRequest();
suggestions.open("get", "MouseHunt Horn Timer - Suggested Trap Components - Suggestions.csv", true);
suggestions.onreadystatechange = function() {
	if (suggestions.readyState == 4) {
		var suggestionsCSVArray = $.csv.toArrays(suggestions.responseText);
		//console.log(suggestionsArray);
		
		processSuggestionsArray(suggestionsCSVArray);

		//suggestionsObject = $.csv.toObjects(suggestions.responseText);
		//console.log(suggestionsObject[0]);
	}
}
suggestions.send();

var suggs = [];
//var suggsObj = {};
	
function processSuggestionsArray(suggCSV) {
	var suggCSVLength = Object.size(suggCSV);
	//console.log(suggCSV);	
	
	for (var i=1; i<suggCSVLength; i++) {
		var suggCSVi = suggCSV[i];//, sugg1 = suggCSV[i][1], sugg2 = suggCSV[i][2], sugg3 = suggCSV[i][3];
		//console.log(suggCSVi[1]);
		if (suggs[suggCSVi[1]] == undefined) suggs[suggCSVi[1]] = {};
//		if (suggsObj.sugg1 == undefined) suggsObj.sugg1 = {};
		if (suggs[suggCSVi[1]][suggCSVi[2]] == undefined) suggs[suggCSVi[1]][suggCSVi[2]] = {};
//		if (suggsObj.sugg1.sugg2 == undefined) suggsObj.suggCSVi1.sugg2 = {};
		if (suggs[suggCSVi[1]][suggCSVi[2]][suggCSVi[3]] == undefined) suggs[suggCSVi[1]][suggCSVi[2]][suggCSVi[3]] = {};
//		if (suggsObj.sugg1.sugg2.sugg3 == undefined) suggsObj.sugg1.sugg2.sugg3 = {};
		
		var j = 0;
		
		for (; suggs[suggCSVi[1]][suggCSVi[2]][suggCSVi[3]][j]!=undefined; j++) {
		}
		
		suggs[suggCSVi[1]][suggCSVi[2]][suggCSVi[3]][j] = suggCSVi[5];
/*		suggsObj = {
			sugg1: {
				sugg2: {
					sugg3: {j: suggCSVi[5]}
				}
			}
		}
*/
		//suggsObj.sugg1.sugg2.sugg3.j = suggCSVi[5];
		
	}
	//console.log(suggs);
}

Object.size = function(obj) {
    var size = 0;
    //var text = '';
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    	//text += obj[key] + "<br>";
    }
    //results.innerHTML += text;
    return size;
    
};