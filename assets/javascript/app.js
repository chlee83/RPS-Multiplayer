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

var userIdOne = "";
var userIdTwo = "";

//initiate game for two players using user connections count (2 players)

    //store connections into this directory
    var connectionsRef = database.ref("/connections");

    // .info/connected updates when client's connection state changes
    var connectedRef = database.ref(".info/connected");

    var chatBox = database.ref("/chatbox");

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



    //initially disable start button until two players are on site
    function disableButton() {

        $(".startText").text("Waiting for another player to start the game... (2 players only)");
        $(".startbtn").prop("disabled", true);
        enableButton();
    }
    disableButton();

    //enable start button when two players are on site
    function enableButton() {
        if (numberOfPeople > 2) {
            $(".startText").text("There are too many people. Only 2 players can play at a time.");
            return false;
        } else if (numberOfPeople !== 2) {
            return false;
        } else {
            $(".startbtn").removeAttr("disabled");
            $(".startText").text("There are two players now. Press Start Game!");
        }
    }

    //pressing start button reveals game page
    $(".startbtn").on("click", function() {

        //login anonymously
        firebase.auth().signInAnonymously();

        $(".start-cover").css('visibility','hidden');
    });



    firebase.auth().onAuthStateChanged(firebaseUser => {

        if (userIdOne === "") {

            userIdOne = firebaseUser.uid;
            console.log(userIdOne);

        } else if (userID2 !== "") {

            userIdTwo = firebaseUser.uid;
            console.log(userIdOne);
            console.log(userIdTwo);
        }
    });











/********************
 * Main Game Content 
 * */

var playerOneChoice;
var playerTwoChoice;
var playerOneName = connectionsRef;
var playerTwoName;
var playerOneWins = 0;
var playerTwoWins = 0;
var playerOneLosses = 0;
var playerTwoLosses = 0;

console.log(playerOneName);

//each player can pick a choice. 
$(".btn").on("click", function(event) {

    event.preventDefault();

    playerOneChoice = $(this).attr("title");

console.log(playerOneChoice);

    $(".chosen-button-text").html("You chose: " + playerOneChoice);

    opponentTurn();
});


function opponentTurn() {

    if (playerOneChoice === "rock" && playerTwoChoice === "paper") {

        playerOneLosse++;
        playerTwoWins++;

    }



}

//the next screen doesn't load until both players have made a choice
//game checks to see who won
//game displays who won and updates wins/losses




 /********** Chatter box content */
//Pressing submit button writes text and timestamp
$(".submitButton").on("click", function(event) {

    event.preventDefault();

    //grab user input text
    var inputText = $("#chat").val().trim();
    
    if (inputText === "") {
        return false;
    } else {

        //upload input text to database
        chatBox.push(inputText);

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
})

//end of document ready
});


/************************
 * Questions to ask
 * 
 * Does each connected person have an ID on Firebase?
 * How to link each player to a specific ID
 * how to assign values to specific elements on firebase
 * how to get those values form firebase
 */