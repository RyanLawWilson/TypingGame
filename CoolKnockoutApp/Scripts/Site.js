// A class to represent the span elements that I will use.
class Span {
    constructor(letter) {
        // Create a temporary span that will be put into an observable later.
        this.element = document.createElement("SPAN");
        this.element.classList.add("letter");
        this.element.innerHTML = letter;

        this.charCode = letter.charCodeAt(0);
        this.letter = letter;
    }

    correctSwitch() {
        this.element.classList.toggle("right");
    }

    incorrectSwitch() {
        this.element.classList.toggle("wrong");
    }

    reset() {
        this.element.classList.remove("wrong");
        this.element.classList.remove("right");
    }

    setCorrect() {
        this.element.classList.add("right");
    }

    setIncorrect() {
        this.element.classList.add("wrong");
    }
}

var correctPhrasesTemp = 0;
var wrongPhrasesTemp = 0;

function TypingGameVM() {
    this.self = this;

    var isWatchActive = false;
    var watch;      // Variable that represents setInterval function
    var duration = 50;
    function StartTimer() {
        var start = Date.now();
        watch = setInterval(function () {
            duration = Date.now() - start;
            let timeString = parseInt(duration / 60000) + " : " + parseInt(duration / 1000) % 60 + " : ";
            timeString += parseInt((duration / 10) % 100) >= 10 ? parseInt((duration / 10) % 100) : "0" + parseInt((duration / 10) % 100);
            document.getElementById("playerTime").innerHTML = timeString;
        }, 101);
    }

    function StopTimer() {
        clearInterval(watch);
    }

    // Greet the player, notify if they win or lose, etc.
    this.notificationText = ko.observable("Welcome to the Typing Game!!");

    // This is for keeping track of player score
    this.correctPhrases = ko.observable(0);
    this.wrongPhrases = ko.observable(0);

    // Hard coded phrases that the user needs to type in to win.
    var possiblePhrases = [
        "How much wood could a woodchuck chuck if a woodchuck could chuck wood?",
        "What does the fox say?",
        "I've seen things, man.",
        "Say hello to my little friend!",
        "It's the end of the world as we know it.",
        "This program uses the Knockout.js library a little.",];

    // Randomly pick a phrase from the array.  Choose the next phrase as well, make sure it is not the same as current.
    function GetNextPhrase(phrases, cp) {
        let np = phrases[parseInt(Math.random() * possiblePhrases.length)];
        while (cp().localeCompare(np) == 0) {
            np = phrases[parseInt(Math.random() * possiblePhrases.length)];
        }
        return np;
    }
    this.currentPhrase = ko.observable(possiblePhrases[parseInt(Math.random() * possiblePhrases.length)]);
    this.nextPhrase = ko.observable(GetNextPhrase(possiblePhrases, this.currentPhrase));

    // Represent each letter as a span in an array so that each individual letter can be changed later.
    var letterElements = [];
    this.currentPhrase().split("").forEach(function (item, index) {
        letterElements.push(new Span(item));
        document.getElementById("phraseWrapper").appendChild(letterElements[index].element);   // Show the letters in the phrase wrapper.
        // console.log("Letter " + item + " at " + index + " was added.");
    });
    
    this.playerText = ko.observable("");
    this.phraseIncomplete = ko.observable(true);

    // Calculates the player's characters per minute.
    this.charsPerMin = ko.computed(function () {
        return parseInt(1000000 * this.playerText().length / duration);
    }, this);
    var finalCPM = 0;
        
    // When the player clicks the go button, the game starts.
    this.resetGame = function () {
        document.getElementById("playerTime").innerHTML = "0 : 0 : 00";
        StopTimer(watch);
        isWatchActive = false;
        this.playerText("");

        // Delete the phrase
        document.getElementById("phraseWrapper").innerHTML = '';
        // Clearing array.  Got source from https://stackoverflow.com/questions/1232040/how-do-i-empty-an-array-in-javascript
        letterElements.splice(0, letterElements.length);

        this.phraseIncomplete(true);        // Turn on text field
        this.currentPhrase(this.nextPhrase());
        this.nextPhrase(GetNextPhrase(possiblePhrases, this.currentPhrase));

        // Recreate the phrase.
        this.currentPhrase().split("").forEach(function (item, index) {
            letterElements.push(new Span(item));
            document.getElementById("phraseWrapper").appendChild(letterElements[index].element);   // Show the letters in the phrase wrapper.
            console.log("Letter " + item + " at " + index + " was added.");
        });
    }

    // After every keypress, compare the key to the corresponding letter
    // in the phrase.  If correct, paint the letter green, if not, paint it red.
    this.checkLetter = function (data, event) {
        if (!isWatchActive) {
            isWatchActive = true;
            StartTimer();
        }

        // console.log(event.keyCode);
        // If the length of the 
        var playerIndex = this.playerText().length > 0 && this.playerText().length <= letterElements.length ? this.playerText().length - 1 : -1;
        // If the letter that was typed was not valid, don't change anything
        if (playerIndex != -1) {
            if ((event.keyCode >= 32 && event.keyCode <= 126) || (event.keyCode >= 186 && event.keyCode <= 200) || event.keyCode == 222) {
                

                /*******************************************************************
                 
                 The whole reason I split up the possiblePhrases into an array of <span> tags was
                 to do this fancy thing below.  It doesn't work very efficiently however.

                 It changes the letter's class depending on whether the player got the letter correct or not.

                 You can uncomment it to check it out if you want.

                 ********************************************************************/
                //let playerLetter = this.playerText().charAt(playerIndex);
                //let spanElement = letterElements[playerIndex];
                //if (playerLetter.charCodeAt(0) == spanElement.charCode) {
                //    spanElement.correctSwitch();
                //} else {
                //    spanElement.incorrectSwitch();
                //}
            }
            else if (event.keyCode == 8 && this.playerText().length != letterElements.length) {
                letterElements[this.playerText().length].reset();   // Remove styles on letter when the player backspaces.
            }
        }

        // If the player is done typing the string, determine how many letters were correct / incorrect
        if (this.playerText().length >= letterElements.length) {
            StopTimer(watch);
            isWatchActive = false;

            this.phraseIncomplete(false);   // Disable the input when the player has completed the string.
            this.notificationText("Click 'Next Phrase' to go again!");

            for (let i = 0; i < letterElements.length; i++) {
                letterElements[i].reset();
                if (this.playerText().charCodeAt(i) == letterElements[i].charCode) {
                    console.log(letterElements[i].letter + " - CORRECT!");
                    letterElements[i].setCorrect();
                    this.correctPhrases(this.correctPhrases() + 1);
                } else {
                    console.log(letterElements[i].letter + " - Wrong...");
                    letterElements[i].setIncorrect();
                    this.wrongPhrases(this.wrongPhrases() + 1);
                }
            }

            finalCPM = this.charsPerMin();
            this.playerText("");
            document.getElementById("charsPerMin").innerHTML = finalCPM;     // Show the player their final Character / Min
            
        }

        // For some reason, I can't use any observables inside of this loop.  The error I get is this.playerText is not a funtion.
        // You use function notation to call observables as seen above.  For some dumb reason, in this specific part of the program,
        // the program can't read observables when they are called.  Observables hate anonymous functions, I guess.
        // FURTHER TESTING: Defining a function and using this.VARIABLENAME() will alwayls result in an error for some reason.
        //let i = 0;
        //var forLoopWithDelay = setInterval(function () {
        //    // Loop condition
        //    if (i < letterElements.length) {
        //        letterElements[i].reset();
        //        if (playerFinalString.charCodeAt(i) == letterElements[i].charCode) {
        //            console.log(letterElements[i].letter + " - CORRECT!");
        //            letterElements[i].setCorrect();
        //            correctPhrasesTemp++;
        //            // this.correctPhrases(this.correctPhrases() + 1);
        //        } else {
        //            console.log(letterElements[i].letter + " - Wrong...");
        //            letterElements[i].setIncorrect();
        //            wrongPhrasesTemp++;
        //            // this.wrongPhrases(this.wrongPhrases() + 1);
        //        }
        //        i++
        //    } else {
        //        console.log("We stopped!!");
        //        clearInterval(forLoopWithDelay);
        //        self.correctPhrases(correctPhrasesTemp);
        //        self.wrongPhrases(wrongPhrasesTemp);
        //    }
        //    console.log("Loop " + i + " done!");
        //}, 100);

        // $("#phraseWrapper").stop().animate({ top: 0 }, 333);
    }
}

// Can't use this now that I know that observables don't work in anonymous functions.
//$("#go").click(function () {
//    $("#phraseWrapper").animate({ top: "200px" }, 5000,
//        function () {
//            // End the game
//            $("#phraseWrapper").animate({ top: 0 }, 1000);
//        });
//});

//$("#stop").click(function () {
//    $("#phraseWrapper").stop().animate({ top: 0 }, 333);
//});

var vm = new TypingGameVM()
ko.applyBindings(vm);