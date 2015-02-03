var css = document.createElement("style");
css.type = "text/css";
css.innerHTML = ".trapSelectorBrowserHeading{background:url('" + chrome.extension.getURL("trapSelectorBrowserHeading.jpg") + "') 0 100% no-repeat;position:relative;height:25px;line-height:25px;font-size:10px;padding:0 0 0 8px}.trapSelectorBrowserHeading2{background:url('" + chrome.extension.getURL("trapSelectorBrowserHeadingO.jpg") + "') 0 100% no-repeat;position:relative;height:25px;line-height:25px;font-size:10px;padding:0 0 0 8px}.trapSelectorBrowserHeading3{background:url('" + chrome.extension.getURL("trapSelectorBrowserHeadingF.jpg") + "') 0 100% no-repeat;position:relative;height:25px;line-height:25px;font-size:10px;padding:0 0 0 8px}.trapSelectorBrowserHeading label{color:#fff;font-variant:small-caps;font-weight:bold}.trapSelectorBrowserHeading2 label{color:#fff;font-variant:small-caps;font-weight:bold}.trapSelectorBrowserHeading3 label{color:#fff;font-variant:small-caps;font-weight:bold}"
document.body.appendChild(css);


var d = new Date();
var doc_title = document.title;
var waiting_to_click_horn = false;

var AllScripts = document.getElementsByTagName("script");
for (var i = 0; i < AllScripts.length; i++) {
	
    if (AllScripts[i].innerHTML.indexOf("next_activeturn_seconds") != -1) {

        var userLoc = AllScripts[i].innerHTML.indexOf("user =") + 7;
        var userJSON = JSON.parse(AllScripts[i].innerHTML.substr(userLoc, AllScripts[i].innerHTML.indexOf("};") - (userLoc - 1)))

        var horn_ms_left = (userJSON.next_activeturn_seconds) * 1000;
        var horn_time = d.getTime() + horn_ms_left;

        chrome.extension.sendMessage({
            message: "page_load",
            hornTime: horn_time,
            bait_left: userJSON.bait_quantity
        }, function (response) {});

        break;
    }
}

var AllText = document.getElementsByClassName("journaltext");
var i = 0;
var j = 0;
for (; j == 0 && i < AllText.length; i++) {
    if (AllText[i].innerHTML.indexOf("check") != -1) j++;
}
i--

if (j == 1) {
    var AllDates = document.getElementsByClassName("journaldate");
    var tct = AllDates[i].innerHTML.substr(AllDates[i].innerHTML.indexOf(":") + 1, 2)
    chrome.extension.sendMessage({
        message: "trap_check",
        tct: tct
    }, function (response) {});
}

//Code below for when horn is clicked
//var hornButtonInfo = document.getElementsByClassName("hornbutton")[0].innerHTML.toString().match(/<a href="(.+?)" onclick/);
//Button clicked

var hornElement = $('.hornbutton a');
if ($('.mousehuntHud-huntersHorn').length) {
    hornElement = $('.mousehuntHud-huntersHorn'); // beta UI
}
hornElement.click(function () {
    chrome.extension.sendMessage({
        message: "horn_sounded"
    }, function (response) {});

});

//End horn-click code

//Receive horn_ready_time from extension
chrome.extension.onMessage.addListener(

function (request, sender, sendResponse) {

    if (request.message == "time") {
        horn_ready_time = request.HRT;
        sendResponse({});
        countdown();
    } else if (request.message == "click_horn") {
        window.scrollTo(0, 0);
		if(document.readyState === "complete") {
			//Document is ready, clicking horn;
			//$('.hornbutton a').click();
			hornElement[0].click();
						
		} else {
			//console.log("Document not ready, waiting_to_click_horn set as true");
	        waiting_to_click_horn = true;
		}
    } else if (request.message == "options") {
    	if (request.tourney == '1') {
	    	var tourney_page = 1;
    		//console.log("tourney page is "+tourney_page);
    	
    		if (document.URL.indexOf("tournamentlist.php") >= 0 && tourney_page == 1) {
    			var timeNow = new Date();

				var frog = document.getElementsByClassName("beginsIn");
				var froglength = frog.length;
	
				for(i=0; i<froglength; i++){
	
					//If active tourney don't process
					if (frog[i].innerHTML.indexOf("Ends") >= 0) break;
					
					var beginsIn = frog[i].innerHTML.slice(55,-6);
					beginsIn = beginsIn.replace("<br>"," "); //replace breaks with spaces
					//console.log("Begins in "+beginsIn);
	
					var msToAdd;

					var dayPresent = beginsIn.indexOf("day");
					var daysLeft = 0;
					if (dayPresent >= 0) {
						var beginsInDays = beginsIn.slice(0,beginsIn.indexOf("day")-1);
						var beginsInHours = 0;
						var beginsInMins = 0;
						var restOfString = beginsIn.slice(dayPresent + 4);
						if (restOfString.indexOf("hour") >= 0) {
							beginsInHours = restOfString.slice(0,restOfString.indexOf("hour")-1);
						} else {
							beginsInMins = restOfString.slice(0,restOfString.indexOf("minute")-1);
						}
						msToAdd = beginsInDays * 24 * 60 * 60000 + beginsInHours * 60 * 60000 + beginsInMins * 60000;
						daysLeft = beginsInDays;
					} else { //Begins in less than one day
						var hourPresent = beginsIn.indexOf("hour");
						if (hourPresent >= 0) {
							var beginsInHours = beginsIn.slice(0,beginsIn.indexOf("hour")-1);
							var beginsInMins = beginsIn.slice(beginsIn.indexOf(" ",3),beginsIn.indexOf("min")-1);
							msToAdd = beginsInHours * 60 * 60000 + beginsInMins * 60000;
						} else { //begins in less than an hour
							var beginsInMins = beginsIn.slice(0,beginsIn.indexOf("min")-1);
							var beginsInSecs = beginsIn.slice(beginsIn.indexOf(" ",3)+1,beginsIn.indexOf("sec")-1);
							msToAdd = beginsInMins * 60000;
						}
					}
					
					var beginsAtMs = timeNow.getTime() + msToAdd;
					beginsAtMs = Math.ceil(beginsAtMs/60/60000)*60000*60;
					
					var beginsAt = new Date(beginsAtMs);
					var beginsAtMin = beginsAt.getMinutes().toString();
					var beginsAtH = beginsAt.getHours().toString();
					
					if (beginsAtMin.length == 1) beginsAtMin = "0"+beginsAtMin;
					if (beginsAtH.length == 1) beginsAtH = "0"+beginsAtH;
					
					var beginsPrep = " At";
					var dayStart = '';
					
					if (beginsAt.getDay() == timeNow.getDay()+1) {
						dayStart = "Tomorrow ";
						beginsPrep = '';
					} else if (beginsAt.getDay() != timeNow.getDay()) {
						var daysOfWeek = ["Sunday ","Monday ","Tuesday ","Wednesday ","Thursday ","Friday ","Saturday "];
						dayStart = daysOfWeek[beginsAt.getDay()];
						beginsPrep = " On";
					}
	
					frog[i].innerHTML = "<div class='heading'>Begins" + beginsPrep + "</div><div class='value'>" + dayStart + beginsAtH+":"+beginsAtMin+"</div>";
				}
			}
		}
	
		//console.log(request);
		if (request.useSuggestions == '1') loadTrapSuggestions(/*request.favWeapon, request.favBase, request.favTrinket, request.favCheese, */request.useSuggestions);
		if (request.showCRE == '1') loadCRE();
		else if (request.showCRE == 'ar') loadAR();
	
    }    	
});
//}

function countdown() {
    d = new Date();
    var time_left = horn_ready_time - d.getTime();

    if (time_left <= 0) {
        document.title = "Sound the Horn! | " + doc_title;
    } else {
        //Calculate minutes & seconds left
        var horn_min_left = Math.floor((horn_ready_time - d.getTime()) / 60000);
        var horn_sec_left = Math.ceil((horn_ready_time - d.getTime()) / 1000 - horn_min_left * 60);

        //Add timer to tab title
        if (horn_sec_left == 60) {
            document.title = (horn_min_left + 1) + ":00 | " + doc_title;
        } else if (horn_sec_left >= 10) {
            document.title = horn_min_left + ":" + horn_sec_left + " | " + doc_title;
        } else {
            document.title = horn_min_left + ":0" + horn_sec_left + " | " + doc_title;
        }

        //Timeout to next countdown()
        d = new Date();
        var ms_to_next_sec = (horn_ready_time - d.getTime()) % 1000;
        var timeout = setTimeout("countdown()", ms_to_next_sec);
    }
}

$(document).ready(function() {
	//Document is ready
	if(waiting_to_click_horn) {
		//console.log("waiting_to_click_horn is true, clicking horn");
		hornElement[0].click();
		//$('.hornbutton a').click();
		waiting_to_click_horn = false;
	}// else console.log("waiting_to_click_horn is false, not clicking");

});

var suggestions;
var catchRateList = [], minLuckList = [];

function loadTrapSuggestions(/*favWeapon, favBase, favTrinket, favCheese, */useSuggestions) {
	
    MutationObserver = window.WebKitMutationObserver;

    var target = $("#trapSelectorBrowser");

    var observer = new MutationObserver(function (mutations, observer) {
       	console.log("Mutation!");
        mutations.forEach(function (mutation) {
        	
            if ($("#trapSelectorBrowserControls")[0].firstChild.firstChild.childNodes[1].value == '') { //If no trap is being searched for
                if (target[0].innerHTML != '') { //If there's stuff e.g. weapon, charms i.e. not trap component selector not closed.

	                var passedtrapComponentList = $(".passed");
	                
                    var trapComponentType = $(".showComponents")[0].attributes.class.nodeValue.split(" ")[1];
					
                    //var trapComponentList = $(".trapComponentRow");

                    var trapComponentList = passedtrapComponentList[0].childNodes;

                    var trapComponentCount = Object.size(trapComponentList) - 4;
                    //console.log(trapComponentCount);

					/*
                    var trapComponentListArray = [];

                    for (var i = 0; i < trapComponentCount; i++) {
                        //console.log(trapComponentList[i]);
                        trapComponentListArray.push(trapComponentList[i].childNodes[1].firstChild.firstChild.innerHTML);
                    }
                    //console.log(trapComponentList[0].childNodes[1].firstChild.firstChild.innerHTML);
                    console.log(trapComponentListArray);
                    */

					//Clearing old labels
					$(".trapSelectorBrowserHeading").remove();
					$(".trapSelectorBrowserHeading2").remove();

                    var suggestedLabel = "<div class='trapSelectorBrowserHeading'><div><label>Suggested</label></div></div>";
                    var otherLabel = "<div class='trapSelectorBrowserHeading2'><div><label>Other</label></div></div>";
                    //var favLabel = "<div class='trapSelectorBrowserHeading3'><div><label>Favourite</label></div></div>";
                    var trapComponentBrowser = $(passedtrapComponentList[0]);

                    var areaSuggestions = suggestions[user_data.area];
                    //console.log(areaSuggestions);




                    if (trapComponentType == "weapon" && $(".sortBy")[0].selectedIndex == 0 && $(".tagFilter")[0].selectedIndex == 0) {

                        //trapComponentBrowser.prepend(otherLabel);

                        if (useSuggestions == '1') {
                            var trapComponentCount = Object.size(suggestions["*"]["Weapon"]); //generic location suggestions
                            if (areaSuggestions != undefined) var trapComponentCount2 = Object.size(areaSuggestions["Weapon"]); //phase-specific suggestions
                            var suggestionFound = 0;

                            for (var i = trapComponentCount - 1; i >= 0; i--) {
                                var trapComponentName = suggestions["*"]["Weapon"][i];
                                if ($("[data-item-type='" + trapComponentName +"']", "#trapSelectorBrowser")[0] != undefined) {
                                    $("[data-item-type='" + trapComponentName +"']", "#trapSelectorBrowser").prependTo(passedtrapComponentList[0]);
                                    suggestionFound = 1;
                                }
                            }
                            for (var i = trapComponentCount2 - 1; i >= 0; i--) {
                                var trapComponentName = areaSuggestions["Weapon"][i];
                                if ($("[data-item-type='" + trapComponentName +"']", "#trapSelectorBrowser")[0] != undefined) {
                                    $("[data-item-type='" + trapComponentName +"']", "#trapSelectorBrowser").prependTo(passedtrapComponentList[0]);
                                    suggestionFound = 1;
                                }
                            }

                            //Do not create "Suggested" label if no suggestions found in inventory
                            if (suggestionFound) {
                                trapComponentBrowser.prepend(suggestedLabel);
                            }
                        }

                        /*if (favWeapon != "none") {
                            $("[data-item-type='" + favWeapon +"']", "#trapSelectorBrowser").prependTo(passedtrapComponentList[0]);
                            trapComponentBrowser.prepend(favLabel);
                        }*/




                    } else if (trapComponentType == "base" && $(".sortBy")[0].selectedIndex == 0 && $(".tagFilter")[0].selectedIndex == 0) {
                        //console.log("selecting base");

                        //trapComponentBrowser.prepend(otherLabel);

                        if (useSuggestions == '1') {
                            var trapComponentCount = Object.size(suggestions["*"]["Base"]);
                            if (areaSuggestions != undefined) var trapComponentCount2 = Object.size(areaSuggestions["Base"]);
                            var suggestionFound = 0;

                            for (var i = trapComponentCount - 1; i >= 0; i--) {
                                var trapComponentName = suggestions["*"]["Base"][i];
                                if ($("[data-item-type='" + trapComponentName +"']", "#trapSelectorBrowser")[0] != undefined) {
                                    $("[data-item-type='" + trapComponentName +"']", "#trapSelectorBrowser").prependTo(passedtrapComponentList[0]);
                                    suggestionFound = 1;
                                }
                            }
                            for (var i = trapComponentCount2 - 1; i >= 0; i--) {
                                var trapComponentName = areaSuggestions["Base"][i];
                                if ($("[data-item-type='" + trapComponentName +"']", "#trapSelectorBrowser")[0] != undefined) {
                                    $("[data-item-type='" + trapComponentName +"']", "#trapSelectorBrowser").prependTo(passedtrapComponentList[0]);
                                    suggestionFound = 1;
                                }
                            }

                            //Do not create "Suggested" label if no suggestions found in inventory
                            if (suggestionFound) {
                                trapComponentBrowser.prepend(suggestedLabel);
                            }
                        }

                        /*if (favBase != "none") {
                            $("[data-item-type='" + favBase +"']", "#trapSelectorBrowser").prependTo(passedtrapComponentList[0]);
                            trapComponentBrowser.prepend(favLabel);
                        }*/





                    } else if (trapComponentType == "trinket" && $(".tagFilter")[0].selectedIndex == 0) {
                        //console.log("selecting charm");

                        //trapComponentBrowser.prepend(otherLabel);

                        if (useSuggestions == '1') {
                            var trapComponentCount = Object.size(suggestions["*"]["Charm"]);
                            if (areaSuggestions != undefined) var trapComponentCount2 = Object.size(areaSuggestions["Charm"]);
                            var suggestionFound = 0;

                            for (var i = trapComponentCount - 1; i >= 0; i--) {
                                var trapComponentName = suggestions["*"]["Charm"][i];
                                if ($("[data-item-type='" + trapComponentName +"']", "#trapSelectorBrowser")[0] != undefined) {
                                    $("[data-item-type='" + trapComponentName +"']", "#trapSelectorBrowser").prependTo(passedtrapComponentList[0]);
                                    suggestionFound = 1;
                                }
                            }
                            for (var i = trapComponentCount2 - 1; i >= 0; i--) {
                                var trapComponentName = areaSuggestions["Charm"][i];
                                if ($("[data-item-type='" + trapComponentName +"']", "#trapSelectorBrowser")[0] != undefined) {
                                    $("[data-item-type='" + trapComponentName +"']", "#trapSelectorBrowser").prependTo(passedtrapComponentList[0]);
                                    suggestionFound = 1;
                                }
                            }

                            //Do not create "Suggested" label if no suggestions found in inventory
                            if (suggestionFound) {
                                trapComponentBrowser.prepend(suggestedLabel);
                            }
                        }

                        /*if (favTrinket != "none") {
                            $("[data-item-type='" + favTrinket +"']", "#trapSelectorBrowser").prependTo(passedtrapComponentList[0]);
                            trapComponentBrowser.prepend(favLabel);
                        }*/




                    } else if (trapComponentType == "bait") {
                        //console.log("selecting cheese");

                        //("<div id='trapSelectorBrowserControls'><div><label>'Suggested Cheeses'</label></div></div>").prependTo(passedtrapComponentList[0]);
						//console.log($(".trapSelectorBrowserHeading2").[0]);
                        trapComponentBrowser.prepend(otherLabel);

                        if (useSuggestions == '1') {
                            var trapComponentCount = Object.size(suggestions["*"]["Bait"]);
                            if (areaSuggestions != undefined) var trapComponentCount2 = Object.size(areaSuggestions["Bait"]);
                            var suggestionFound = 0;

                            for (var i = trapComponentCount - 1; i >= 0; i--) {
                                var trapComponentName = suggestions["*"]["Bait"][i];
//                                console.log($("[data-item-type='" + trapComponentName +"']", "#trapSelectorBrowser"));
                                if ($("[data-item-type='" + trapComponentName +"']", "#trapSelectorBrowser")[0] != undefined) {
                                    $("[data-item-type='" + trapComponentName +"']", "#trapSelectorBrowser").prependTo(passedtrapComponentList[0]);
                                    suggestionFound = 1;
                                }
                            }
                            for (var i = trapComponentCount2 - 1; i >= 0; i--) {
                                var trapComponentName = areaSuggestions["Bait"][i];
                                if ($("[data-item-type='" + trapComponentName +"']", "#trapSelectorBrowser")[0] != undefined) {
                                    $("[data-item-type='" + trapComponentName +"']", "#trapSelectorBrowser").prependTo(passedtrapComponentList[0]);
                                    suggestionFound = 1;
                                }
                            }

                            //Do not create "Suggested" label if no suggestions found in inventory
                            if (suggestionFound) {
                                trapComponentBrowser.prepend(suggestedLabel);

                            } else { //Take away other label as well
								$(".trapSelectorBrowserHeading2").remove();
                            }
                        }

                        /*if (favCheese != "none") {
                            $("[data-item-type='" + favCheese +"']", "#trapSelectorBrowser").prependTo(passedtrapComponentList[0]);
                            trapComponentBrowser.prepend(favLabel);
                        }*/

                    }

                }

            }

            //else console.log("Trap component selector closed");

            //console.log(target[0].innerHTML);
            //console.log(mutation.addedNodes);
        });
    });
    	
    if(target[0] != undefined) {
    	observer.observe(target[0], {
        	childList: true
	    });
	}

}

function loadAR () {
    MutationObserver = window.WebKitMutationObserver;
	
    var target = $("#trapSelectorBrowser");
    var miceEffectivenessBox = $("#trapSelectorEffectivenessContainer");
    
	var effObserver = new MutationObserver(function (mutations, effObserver) {
		//console.log("Eff box changed");
		mutations.forEach(function (mutation) {
			//miceEffectivenessBox[0].innerHTML += "Loading attraction rates";
			console.log("Mutation!");	
			//updateUserJSON();
			var mice = $('.mouse');
			var miceList = [];			
			
			for (var i=0; i<mice.length; i++) {
				miceList.push(mice[i].firstChild.firstChild.getAttribute('title'));
			}
			console.log("Mice list", miceList);
			
			if (catchRateList.length > 0) loadCatchRates();
			else if (miceList.length>0) {
				var phase = 'none';
				if (userJSON.location == "Sunken City") phase = userJSON.quests.QuestSunkenCity.zone_name;
		        chrome.extension.sendMessage({
       			    message: "attractionRates",
	        	    miceList: miceList,
	            	location: userJSON.location,
		            cheese: userJSON.bait_name,
		            phase: phase
		        }, function (response) {
	    	    	console.log(response);
	        		catchRateList = response;
	        		loadCatchRates();
			    });
			}
		       
		    //Old deprecated code    
			/*
			for (var i=0; i<mice.length; i++) {
				miceList.push(mice[i].firstChild.firstChild.getAttribute('title'));
				var mousePower;
				
		        chrome.extension.sendMessage({
        		    message: "catchRates",
		            mouseName: miceList[i],
		            trapPower: userJSON.trap_power,
		            trapLuck: userJSON.trap_luck,
		            trapType: userJSON.trap_power_type_name
		        }, function (response) {
		        	mousePower = (response*100).toFixed(2) + "%";
        		    console.log(mousePower);
        		    catchRateList.push(mousePower);
		        });				
			}
			
			console.log("We're here already");
			setTimeout("loadCatchRates()", 1000); //Make it synchronous
			*/
		});
	});
	
    if(target[0] != undefined) {
	    effObserver.observe(miceEffectivenessBox[0], {
	    	childList: true
	    });
	}
}

function loadCRE () {
    MutationObserver = window.WebKitMutationObserver;
	
    var target = $("#trapSelectorBrowser");
    var miceEffectivenessBox = $("#trapSelectorEffectivenessContainer");
    
	var effObserver = new MutationObserver(function (mutations, effObserver) {
		//console.log("Eff box changed");
		mutations.forEach(function (mutation) {
			console.log("Mutation!");
			//updateUserJSON();
			var mice = $('.mouse');
			var miceList = [];			
			
			for (var i=0; i<mice.length; i++) {
				miceList.push(mice[i].firstChild.firstChild.getAttribute('title'));
			}
			//console.log("Mice list", miceList);
			
			if (catchRateList.length>0 && miceList.length>0) {
				loadCatchRates();
				hasTrapSetupChanged();
				console.log("Checking if setup has changed");
			}
			else if (miceList.length>0) {
		        chrome.extension.sendMessage({
    	   		    message: "catchRateList",
	    	        miceList: miceList,
	        	    trapPower: userJSON.trap_power,
	            	trapLuck: userJSON.trap_luck,
		            trapType: userJSON.trap_power_type_name
		        }, function (response) {
	    	    	//console.log(response);
	        		catchRateList = response.catchRates;
	        		minLuckList = response.minLuckVals;
	        		loadCatchRates();
			    });	
			}
		       
		    //Old deprecated code    
			/*
			for (var i=0; i<mice.length; i++) {
				miceList.push(mice[i].firstChild.firstChild.getAttribute('title'));
				var mousePower;
				
		        chrome.extension.sendMessage({
        		    message: "catchRates",
		            mouseName: miceList[i],
		            trapPower: userJSON.trap_power,
		            trapLuck: userJSON.trap_luck,
		            trapType: userJSON.trap_power_type_name
		        }, function (response) {
		        	mousePower = (response*100).toFixed(2) + "%";
        		    console.log(mousePower);
        		    catchRateList.push(mousePower);
		        });				
			}
			
			console.log("We're here already");
			setTimeout("loadCatchRates()", 1000); //Make it synchronous
			*/
		});
	});
	
    if(target[0] != undefined) {
	    effObserver.observe(miceEffectivenessBox[0], {
	    	childList: true
	    });
	}
}

function loadCatchRates () {
	var mice = $('.mouse');
	for (var i=0; i<mice.length; i++) {
		//Only append if ends with "class=power_type blah blah to prevent duplicate powers
		//console.log(mice[i].innerHTML);
		if (mice[i].innerHTML.slice(-8) == "\"></div>") {
			mice[i].innerHTML += "<div><body>" + catchRateList[i] + "</body></div>";
		}
	}
	
	var temContent = $(".chanceGroup");
	//console.log(temContent[0].parentNode.innerHTML.slice(-10));
	
	if (temContent[0].parentNode.innerHTML.slice(-10) == "</a></div>" ) {
		temContent[0].parentNode.innerHTML += "<div><button type='button' id='btnShowMinLuck'>Show min. luck values</a></div>"
		loadButtonEventListener();
	}
}

function loadButtonEventListener () {
	$("#btnShowMinLuck").click(function() {
		toggleMinLuckVals();
	});
}

function toggleMinLuckVals () {
	var mice = $('.mouse');
	
	//Determine if min luck is showing
	if (mice[0].lastChild.className == "minLuckValue") {
		//Hide min luck values
		for (var i=0; i<mice.length; i++) {
			var idx = mice[i].innerHTML.indexOf("<div class=\"minLuckValue\">");
			mice[i].innerHTML = mice[i].innerHTML.slice(0,idx);
		}
		$("#btnShowMinLuck")[0].innerHTML = $("#btnShowMinLuck")[0].innerHTML.replace("Hide","Show");
	} else {
		for (var i=0; i<mice.length; i++) {
			mice[i].innerHTML += "<div class='minLuckValue'>" + minLuckList[i] + " (" + (userJSON.trap_luck-minLuckList[i]) + ")</div>";
		}
		$("#btnShowMinLuck")[0].innerHTML = $("#btnShowMinLuck")[0].innerHTML.replace("Show","Hide");
	}
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

// Get the size of an object
//var size = Object.size(myArray);




var userJSON;
function updateUserJSON() {
	var AllScripts = document.getElementsByTagName("script");
	for (var i = 0; i < AllScripts.length; i++) {

		if (AllScripts[i].innerHTML.indexOf("user =") != -1) {
			var userLoc = AllScripts[i].innerHTML.indexOf("user =") + 7;
			userJSON = JSON.parse(AllScripts[i].innerHTML.substr(userLoc, AllScripts[i].innerHTML.indexOf("};") - (userLoc - 1)));

			user_data = new Object();

			user_data.bait = userJSON.bait_name;
			user_data.weapon = userJSON.weapon_name;
			user_data.base = userJSON.base_name;
			user_data.trinket = userJSON.trinket_name;
			user_data.location = userJSON.location;
			/*
				user_data.title = userJSON.title_name;
				user_data.shield = userJSON.has_shield;*/
			if ("QuestIceberg" in userJSON.quests) user_data.area = userJSON.quests.QuestIceberg.current_phase;
			//if ("QuestHalloween2013" in userJSON.quests) user_data.area = userJSON.quests.QuestHalloween2013.area;
			/*
				if("QuestLostCity" in userJSON.quests) user_data.is_cursed = userJSON.quests.QuestLostCity.minigame.is_cursed*1;

				if("QuestLivingGarden" in userJSON.quests) {
					if("bucket_state" in userJSON.quests.QuestLivingGarden.minigame) user_data.bucket_state = userJSON.quests.QuestLivingGarden.minigame.bucket_state;

					else if ("vials_state" in userJSON.quests.QuestLivingGarden.minigame) user_data.vials_state = userJSON.quests.QuestLivingGarden.minigame.vials_state;


					if("boost" in userJSON.quests.QuestLivingGarden.minigame) user_data.boost = userJSON.quests.QuestLivingGarden.minigame.boost;

				}

				if("QuestSandDunes" in userJSON.quests) {
				
					if("has_stampede" in userJSON.quests.QuestSandDunes.minigame) user_data.has_stampede = userJSON.quests.QuestSandDunes.minigame.has_stampede*1;

				
					if("salt_charms_used" in userJSON.quests.QuestSandDunes.minigame) user_data.salt_charms_used = userJSON.quests.QuestSandDunes.minigame.salt_charms_used;
			
				}
				if("viewing_atts" in userJSON) {
					if("desert_warpath" in userJSON.viewing_atts) user_data.wave = userJSON.viewing_atts.desert_warpath.wave;				

				}*/
			//if ("QuestLunarNewYear2013" in userJSON.quests) user_data.cruise_phase = userJSON.quests.QuestLunarNewYear2013.phase_name;
			if (user_data.location == "Gnawnian Express Station") {
				if (userJSON.viewing_atts.hasOwnProperty("tournament")) {
					if (userJSON.viewing_atts.tournament.tournament_type == "train") {
						user_data.area = userJSON.viewing_atts.tournament.phase_name;
					}
				}
			}
			
			chrome.extension.sendMessage({
				message: "location",
				location: user_data.location
			}, function (response) {
				suggestions = response;
				//console.log(suggestions);
			});
			
			break;
		}
	}
}
updateUserJSON();


function hasTrapSetupChanged () {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "http://www.mousehuntgame.com", true);
	
	xhr.onreadystatechange = function () {
		//console.log("Ready state", xhr.readyState);
		if (xhr.readyState == 4) {
			var parser = new DOMParser();
			var response_html = parser.parseFromString(xhr.responseText,"text/html");
			//console.log(response_html);
			var AllScripts = response_html.getElementsByTagName("script");
			
			
			for (var i=0; i<AllScripts.length; i++) {
				if (AllScripts[i].innerHTML.indexOf("user =") >= 0) {
					var userLoc = AllScripts[i].innerHTML.indexOf("user =") + 7;
					var userJsonNew = JSON.parse(AllScripts[i].innerHTML.substr(userLoc, AllScripts[i].innerHTML.indexOf("};") - (userLoc - 1)));
					//console.log(userJsonNew, userJSON);
					//Check that setup remains same
					if (userJsonNew.trap_luck == userJSON.trap_luck && userJsonNew.trap_power == userJSON.trap_power) console.log("Nothing has changed");
					else {
						userJSON.trap_luck = userJsonNew.trap_luck;
						userJSON.trap_power = userJsonNew.trap_power;
						catchRateList = [];
						//Blah blah
					}
					break;
				}
			}
		}
	}
	
	xhr.send();
}









