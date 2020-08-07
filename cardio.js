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
// │ whether card flips back around on drawing new card and   │
// │ range of kanji characters as listed in RTK               │
// │                                                          │
// └──────────────────────────────────────────────────────────┘

/* ------------------------------------ Global vars ----------------------------------- */
var version     = 1.0;		// System version
var kanji       = [];		// Raw list of kanji
var kanjiDeck   = [];		// Array to hold kanji to display
var discardDeck = [];		// Move kanji to this deck after displayed
var textIndex   = 2;		// Which text div is currently displayed
var drawTimer = 0;		// Holds time when we can draw another card
var drawTime  = 500;		// Interval at which we can draw a card


/* ---------------------------------- Hotkey Controls --------------------------------- */

function cardKeys(e){ //Keybind to flip card
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
			console.log(e.keyCode);
			break;
	}
}
addEventListener("keydown",cardKeys)


// Request KanjiCards.txt file from server
function kanjiGet(){ 	
	var kanjiReq = new XMLHttpRequest();
	kanjiReq.open('GET', 'KanjiCards.txt');
	kanjiReq.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			kanji = kanjiReq.responseText.split('\n');
			console.log("Kanji retrieved from server")
			crunchKanji();
			randCard();
		}
	}
	kanjiReq.send();
}

// Process Kanji file, iterate through each and add to deck
function crunchKanji(){   
	for (let i = 0; i < kanji.length; i++) {
		var k = kanji[i];
		if(k.includes(",")){ 	                //If line has a comma, it should be added to deck
			k = k.split(',');
			kanjiDeck.push({front:k[0],back:k[1]})
		}
	}
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
		discardDeck = [];					// Purge discard Deck
	}
	$(".cardFlash").fadeIn(20);				
	var cardID = Math.floor(Math.random() * kanjiDeck.length)
	var newCard = kanjiDeck[cardID];
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

/* ------------------------------ Run when document ready ----------------------------- */
$( document ).ready(()=>{
	kanjiGet();
	var cardSettings = {             // Settings for flippable card
		axis:"x",
	}
	$("#card").flip({cardSettings}); // Create card object and apply settings object

	// Show version in corner
	$("#footerRight").text(`Version ${version}`)
	$("#footerRight").fadeIn(1000);

})