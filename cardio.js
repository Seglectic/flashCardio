// █▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█
// █                                   █
// █      Flash Cardio                 █
// █                                   █
// █  Kanji Flashcard review system.   █
// █  Select current Kanji from RTK    █
// █  and show random cards from set.  █
// █                                   █
// █▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█
// 

// ┌──────────────────────────────────────────────────────────┐
// │ //TODO Needs a selector that will change kanji font      │
// │ Should also be able to swap between handwritten kanji    │
// │ font and computer font. Should change chicago font too.  │
// │                                                          │
// │ //TODO Maybe remove primitive meanings for the words     │
// │ or have a better way to integrate them onto the card     │	
// │                                                          │
// │ //TODO Add an options panel to control Kanji font,       │
// │ whether card flips back around on drawing new card       │
// │                                                          │
// └──────────────────────────────────────────────────────────┘

/* ------------------------------------ Global vars ----------------------------------- */
var version      = 1.1;		// System version
var kanji        = [];		// Raw list of kanji
var kanjiOrdered = [];		// Array to hold kanji in original RTK order
var kanjiDeck    = [];		// Array to hold kanji to display
var discardDeck  = [];		// Move kanji to this deck after displayed
var knownKanji 	 = 0;		// Number of defined kanji cards
var textIndex    = 2;		// Which text div is currently displayed
var drawTimer    = 0;    	// Holds time when we can draw another card
var lastDraw	 = {};		// Holds value of previous card to keep unique
var drawTime     = 500;  	// Interval at which we can draw a card
var controlState = true;	// Whether control panel is deployed




/* ---------------------------------- Hotkey Controls --------------------------------- */

function cardKeys(e){    //Keybind to flip card
	switch (e.keyCode) {
		case 82:
			$("#card").flip("toggle");
			break;
		case 17:
			$("#card").flip("toggle");
			break;
		case 32:
			randCard();
			break;
		default:
			// console.log(e.keyCode);
			break;
	}
}
addEventListener("keydown",cardKeys)


/* ------------------------------- Card System Callbacks ------------------------------ */

// Request KanjiCards.txt file from server
function kanjiGet(){ 	
	var kanjiReq = new XMLHttpRequest();
	kanjiReq.open('GET', 'data/KanjiCards.txt');
	kanjiReq.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			kanji = kanjiReq.responseText.split('\n');
			console.log("Kanji retrieved.")
			crunchKanji();
			randCard();
		}
	}
	kanjiReq.send();
}

// Process Kanji file, iterate through each and add to deck
function crunchKanji(){   
	let kanjiCount = 0;
	for (let i = 0; i < kanji.length; i++) {
		var k = kanji[i];
		if(k.includes(",")){ 	            //If line has a comma, it should be added to deck
			k = k.split(',');
			kanjiDeck.push({front:k[0],back:k[1]})
			kanjiOrdered.push({front:k[0],back:k[1]})
			knownKanji++;
		}
		kanjiCount++;
	}
	console.log(`Got ${knownKanji} defined kanji of ${kanjiCount}.`)
	$("#cardTo").val(knownKanji)
}

//Sets cards flip axis randomly
function randomFlip(){ 
	var axis = 'x'
	var reverse = false;
	if(Math.random()>0.5){axis='y'}
	if(Math.random()>0.5){reverse=true}
	$("#card").flip({axis:axis,reverse:reverse});
}

//Draw random card to display
function randCard(){ 
	if( Date.now() < drawTimer ){return;} 	// Stop if timer isn't ready
	drawTimer = Date.now()+drawTime			// Update timer
	if(kanjiDeck.length==0){				// Re-fill kanjiDeck when empty
		discardDeck.forEach(e => {kanjiDeck.push(e);});
		discardDeck = [];					// Purge discard
	}
	$(".cardFlash").fadeIn(20);				

	//FIXME Shit will break your tab?
	while (true){							// Loop until new card is unique from prior 
		var cardID = Math.floor(Math.random() * kanjiDeck.length);
		var newCard = kanjiDeck[cardID];
		if(cardID==lastDraw || kanjiDeck.length+discardDeck.length<=2){continue;}
		else{break;}
	}

	lastDraw = newCard;

	if(textIndex==1){
		$("#cardFront2").fadeIn(50);
		$("#cardBack2").fadeIn(50);
		$("#cardFront1").fadeOut(250);
		$("#cardBack1").fadeOut(250);
		textIndex=2;
	}else{
		$("#cardFront1").fadeIn(50);
		$("#cardBack1").fadeIn(50);
		$("#cardFront2").fadeOut(250);
		$("#cardBack2").fadeOut(250);	
		textIndex=1;
	}
	document.getElementById(`cardFront${textIndex}`).innerHTML=newCard.front;
	document.getElementById(`cardBack${textIndex}`).innerHTML=newCard.back;
	$(".cardFlash").fadeOut(500);
	discardDeck.push(newCard);
	kanjiDeck.splice(cardID,1);
}


/* ------------------------------ Control Panel Callbacks ----------------------------- */
function panelToggle(){
	if(!controlState){
		$("#controlPanel").animate({bottom: '0'});
		controlState=true;
	}else{
		$("#controlPanel").animate({bottom: '-170px'});
		controlState=false;
	}
}

function rangeUpdate(){
	let from = $("#cardFrom").val()
	let to = $("#cardTo").val()
	discardDeck = [];
	kanjiDeck   = [];
	for (let i = from-1; i <= to-1; i++) {
		kanjiDeck.push(kanjiOrdered[i])
	}
	saveData();
	randCard();
}

function saveData(){
	localStorage.setItem('cardFrom',$("#cardFrom").val())
}

function loadData(){
	if(localStorage.getItem('cardFrom')){
		$("#cardFrom").val(localStorage.getItem('cardFrom'));
		rangeUpdate();
	}
}

/* ---------------------------------- Run when loaded --------------------------------- */
$( document ).ready(()=>{
	kanjiGet();
	var cardSettings = {             // Settings for flippable card
		axis:"x",
	}
	$("#card").flip({cardSettings}); // Create card object and apply settings object

	$("#subHeader").animate({left:'80px'})

	// Show version in corner
	$("#footerRight").text(`
		(Spacebar: draw card | ctrl / R:  flip card) [Ver. ${version}]
	`)
	$("#footerRight").fadeIn(1000);

	// Set control panel options
	$("#cardFrom").val(1)

	$("#cardFrom").change(()=>{rangeUpdate();});
	$("#cardTo").change(()=>{rangeUpdate();});

	// loadData();
})