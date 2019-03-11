var playerOneWins = 0;
var playerTwoWins = 0;
var playerOneLosses = 0;
var playerTwoLosses = 0;

$(document).ready(function() {


// Initialize Firebase
var config = {
apiKey: "AIzaSyBPtpwxvVuZe2U063HYdSIFWICtyww4WT8",
authDomain: "rockpaperscissor-c2078.firebaseapp.com",
databaseURL: "https://rockpaperscissor-c2078.firebaseio.com",
projectId: "rockpaperscissor-c2078",
storageBucket: "rockpaperscissor-c2078.appspot.com",
messagingSenderId: "101062584012"
};
firebase.initializeApp(config);

// Create a variable to reference the database.
var database = firebase.database();

//grab current user's ID 
var userId = "";

//initiate game for two players using user connections count (2 players)

    //store connections into this directory
    var connectionsRef = database.ref("/connections");

    // .info/connected updates when client's connection state changes
    var connectedRef = database.ref(".info/connected");

    //put all chat into chatBox "folder"
    var chatBox = database.ref("/chatbox");

    //put all game choices in gameChoices "folder"
    var gameChoices = database.ref("/gameChoices");

    //number of people logged on
    var numberOfPeople;

    //When client's connection state changes show changes
    connectedRef.on("value", function(snap) {

    // If they are connected..
    if (snap.val()) {

        // Add user to the connections list.
        var con = connectionsRef.push(true);


        console.log(con);
 
        // Remove user from the connection list when they disconnect.
        con.onDisconnect().remove();
    }
    });

    // When first loaded or when the connections list changes...
    connectionsRef.on("value", function(snapshot) {

        numberOfPeople = snapshot.numChildren();
    // Display the viewer count in the html.
    // The number of online users is the number of children in the connections list.
    $("#current-players").text(snapshot.numChildren());

    enableButton();
    });



  

    //enable start button when two players are on site
    function enableButton() {
        if (numberOfPeople > 2) {
            $(".startText").text("There are too many people. Only 2 players can play at a time.");
            $(".startbtn").prop("disabled", true);
        } else if (numberOfPeople === 1) {
            $(".startText").text("Waiting for another player to start the game... (2 players only)");
            $(".startbtn").prop("disabled", true);
        } else {
            $(".startbtn").removeAttr("disabled");
            $(".startText").text("There are two players now. Press Start Game!");
        }
    }

    //pressing start button reveals game page
    $(".startbtn").on("click", function() {

        //login anonymously
        firebase.auth().signInAnonymously();

        //remove data from previous game
        database.ref("/chatbox").remove();
        database.ref("/gameChoices").remove();

        $(".start-cover").css('visibility','hidden');
        $(".play-again").hide();
        
    });


    //Grab auth ID and put into userID
    firebase.auth().onAuthStateChanged(firebaseUser => {

            userId = firebaseUser.uid;
            console.log(userId);

    });



/************************** Main Game Content ************************************/

// variables for player two and player choices
var playerOneChoice;
var playerTwoChoice;
var playerTwoName;


//each player click a button 
$(".btn").on("click", function(event) {

    event.preventDefault();

    //grab the choice into variable
    playerOneChoice = $(this).attr("title");

    //push choice and player userID to firebase
    gameChoices.push({
        userId: userId,
        playerChoice: playerOneChoice,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
    });

    //show player's choice in DOM
    $(".chosen-button-text").text("You Chose:" + playerOneChoice);

    //disable buttons after choice is made
    $(".btn").prop("disabled", true);

});


//get most recent data from firebase/gameChoices 
gameChoices.orderByChild("dateAdded").limitToLast(1).on("child_added", function(childSnapshot) {

    //grab data from firebase
    var sh = childSnapshot.val();

    //if firebase data ID is same as current user's ID then just go to check choices
    if (sh.userId === userId) {

        checkChoices();

    //else if, firebase data ID is different than current user's ID, put information in as opponents choices
    } else if (sh.userId !== userId) {

        playerTwoName = sh.userId;
        playerTwoChoice = sh.playerChoice;

        //display the opponent made a choice in the DOM
        $(".opponent-choice").text("Your opponent made a choice.");

        //go to check choices function
        checkChoices();
    }

}, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
});



//once both players made choice, check choices and display winner
function checkChoices() {

    //if statement for losses for current user 
    if ((playerOneChoice === "rock" && playerTwoChoice === "paper") || 
        (playerOneChoice === "paper" && playerTwoChoice === "scissor") ||
        (playerOneChoice === "scissor" && playerTwoChoice === "rock")) {

        playerOneLosses++;
        playerTwoWins++;

        $(".opponent-choice").text("Opponent Chose: " + playerTwoChoice);
        $(".final-outcome").text("You lost!");
        $(".losses-text").text(playerOneLosses);

        playAgain();

    //if statement for ties
    } else if ((playerOneChoice === "rock" && playerTwoChoice === "rock") || 
    (playerOneChoice === "paper" && playerTwoChoice === "paper") ||
    (playerOneChoice === "scissor" && playerTwoChoice === "scissor")) {

        $(".opponent-choice").text("Opponent Chose: " + playerTwoChoice);
        $(".final-outcome").text("It was a tie!");

        playAgain();

    //if statement for wins for current user
    } else if ((playerOneChoice === "rock" && playerTwoChoice === "scissor") || 
    (playerOneChoice === "paper" && playerTwoChoice === "rock") ||
    (playerOneChoice === "scissor" && playerTwoChoice === "paper")) {

        playerOneWins++;
        playerTwoLosses++;

        $(".opponent-choice").text("Opponent Chose: " + playerTwoChoice);
        $(".final-outcome").text("You won!");
        $(".wins-text").text(playerOneWins);

        playAgain();

    }

}


//function to display play again button
function playAgain() {

    var windowTimeout = setTimeout(function() {
        newGame();
      }, 3000);

}


//function for when play again button is clicked
function newGame() {

    //clear out player's choices
    playerOneChoice = "";
    playerTwoChoice = "";

    //clear DOM of all previous round's text
    $(".chosen-button-text").text(playerOneChoice);
    $(".opponent-choice").text(playerTwoChoice);
    $(".final-outcome").text("");

    //remove disabled attribute and enable RPS buttons
    $(".btn").removeAttr("disabled");

}




/******************** Chatter box content ****************************/


//Pressing submit button writes text and timestamp
$(".submitButton").on("click", function(event) {

    event.preventDefault();

    //grab user input text
    var inputText = $("#chat").val().trim();
    
    //if text box empty, don't push anything
    if (inputText === "") {
        return false;

    //else, push to firebase chatBox
    } else {

        //upload input text to database
        chatBox.push(inputText);

        //clear out chat area
        $("#chat").val("");
    }
});


//display input text from firebase to chatter box past and present
chatBox.on("child_added", function(childSnapshot) {

    //put text in variable
    var inputText = childSnapshot.val();

    //make variable for time stamp
    var dateT = $("<span>")
    var d = new Date();
    var n = d.toLocaleTimeString();
    var m = d.toLocaleDateString();

    //order timestamp to show time then date
    dateT.addClass("timeOfText");
    dateT.text("  (" + n + ", " + m + ")");

    //create new paragraph variable
    var newP = $("<p>");

    //give text a class and append text and timestamp
    newP.addClass("chatBoxText");
    newP.append(inputText);
    newP.append(dateT);
    
    //display text from firebase to chatter box
    $(".chatBox").prepend(newP);
});



//end of document ready
});