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


//initiate game for two players using user connections count (2 players)

    //store connections into this directory
    var connectionsRef = database.ref("/connections");

    // .info/connected updates when client's connection state changes
    var connectedRef = database.ref(".info/connected");

    var numberOfPeople;
    //When client's connection state changes show changes
    connectedRef.on("value", function(snap) {

    // If they are connected..
    if (snap.val()) {

        // Add user to the connections list.
        var con = connectionsRef.push(true);

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
    console.log(numberOfPeople);
    enableButton();
    });


    //initially disable start button until two players are on site
    function disableButton() {

        $(".startText").text("Waiting for another player to start the game...");
        $(".startbtn").prop("disabled", true);
        enableButton();
    }
    disableButton();

    //enable start button when two players are on site
    function enableButton() {
        if (numberOfPeople !== 2) {
            return false;
        } else {
            $(".startbtn").removeAttr("disabled");
            $(".startText").text("There are two players now. Press Start Game!");
        }
    }

    //pressing start button reveals game page
    $(".startbtn").on("click", function() {
    $(".start-cover").css('visibility','hidden');
    });


//load game with three choices using images
//each player can pick a choice. 
//the next screen doesn't load until both players have made a choice
//game checks to see who won
//game displays who won and updates wins/losses
//chat can be used anytime and chat gets sent to firebase when submit is pressed
//firebased chat is loaded to right side of game in the chatBox column
//

/********************
 * Main Game Content 
 * */

//Pressing submit button writes text and timestamp
$(".submitButton").on("click", function(event) {

    event.preventDefault();
    var inputText = $("#chat").val().trim();

    if (inputText === "") {
        return false;
    } else {

        var dateT = $("<span>")
        var d = new Date();
        var n = d.toLocaleTimeString();
        var m = d.toLocaleDateString();

        dateT.addClass("timeOfText");
        dateT.text("  (" + n + ", " + m + ")");

        console.log(inputText);
        var newP = $("<p>");
        newP.addClass("chatBoxText");

        newP.append(inputText);
        newP.append(dateT);

        $(".chatBox").prepend(newP);
        $("#chat").val("");
    }

});



    
//end of document ready
});