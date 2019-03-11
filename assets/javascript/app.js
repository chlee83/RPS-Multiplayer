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

var userId = "";

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


    //Grab auth ID and put into userID
    firebase.auth().onAuthStateChanged(firebaseUser => {

            userId = firebaseUser.uid;
            console.log(userId);

    });




/**************************************
 * Main Game Content 
 * */

var playerOneChoice;
var playerTwoChoice;
var playerOneName;
var playerTwoName;


//each player click a button 
$(".btn").on("click", function(event) {

    event.preventDefault();

    //grab the choice into variable
    playerOneChoice = $(this).attr("title");

    console.log(playerOneChoice);

    //push choice and player userID to firebase
    database.ref().push({
        userId: userId,
        playerChoice: playerOneChoice,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
    });

    $(".chosen-button-text").text("You Chose:" + playerOneChoice);

    //disable buttons after choice is made
    $(".btn").prop("disabled", true);

    
});

database.ref().orderByChild("dateAdded").limitToLast(1).on("child_added", function(childSnapshot) {
    var sh = childSnapshot.val();

    console.log(sh.userId);
    console.log(userId);
    console.log(sh.playerChoice);
    if (sh.userId === userId) {

        return false;

    } else if (sh.userId !== userId) {

        playerTwoName = sh.userId;
        playerTwoChoice = sh.playerChoice;

        console.log(playerTwoName + " " + playerTwoChoice);
     
        $(".opponent-choice").text("Opponent Chose: " + playerTwoChoice);

    }

    checkChoices();

}, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
});



 /**********************
  * code for game
  * 
  * once players sign in, put their ID into a variable for the player 1 and push to firebase and load
  * once second player signs in, put their ID into variable for player 2 and push to firebase and load
  * show player 1 and player 2 name on screen
  * when player picks the button choice, disable button, push the value of the button to firebase with nameID and show "player has made a choice"
  * have second player make choice and then disable their button, push the value to firebase with nameID.
  * make if then statement inside the uploading of game details for going to game win/lose function. If other player's choice isnt made yet, return false.
  * else go to function 
  * once both values are loaded, display what each chose and who won. in steps
  * 1) display both players choices with nameID
  * 2) make if statements: if the player's current ID is rock and other player's ID is paper, lose. etc
  * 3) once both values are displayed, run function to enable button and run game again
  */


//once both players made choice, check choices and display winner
function checkChoices() {

    if ((playerOneChoice === "rock" && playerTwoChoice === "paper") || 
        (playerOneChoice === "paper" && playerTwoChoice === "scissor") ||
        (playerOneChoice === "scissor" && playerTwoChoice === "rock")) {

        playerOneLosses++;
        playerTwoWins++;

        $(".chosen-button-text").text("You lost! Play again.");
        $(".losses-text").text(playerOneLosses);

    } else if ((playerOneChoice === "rock" && playerTwoChoice === "rock") || 
    (playerOneChoice === "paper" && playerTwoChoice === "paper") ||
    (playerOneChoice === "scissor" && playerTwoChoice === "scissor")) {

        $(".chosen-button-text").text("It was a tie, choose again.");

    } else if ((playerOneChoice === "rock" && playerTwoChoice === "scissor") || 
    (playerOneChoice === "paper" && playerTwoChoice === "rock") ||
    (playerOneChoice === "scissor" && playerTwoChoice === "paper")) {

        playerOneWins++;
        playerTwoLosses++;

        $(".chosen-button-text").text("You won! Play again.");
        $(".wins-text").text(playerOneWins);

    }

}



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
});





//end of document ready
});
