$(document).ready(function() {

//initiate game for two players (maybe id or password)
//load game with three choices using images
//each player can pick a choice. 
//the next screen doesn't load until both players have made a choice
//game checks to see who won
//game displays who won and updates wins/losses
//chat can be used anytime and chat gets sent to firebase when submit is pressed
//firebased chat is loaded to right side of game in the chatBox column
//

//pressing start button reveals game page
$(".startbtn").on("click", function() {
    $(".start-cover").css('visibility','hidden');
})

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