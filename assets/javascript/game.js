
function RPSgame() {

  this.initFirebase();


  this.player1 = {
    name: '',
    active: false
  };

  this.player2 = {
    name: '',
    active: false
  };

}

RPSgame.prototype.initFirebase = function () {

  this.rpsData = firebase.database();

  this.playersRef = this.rpsData.ref('players');
  this.player1Ref = this.rpsData.ref('players/player1');
  this.player2Ref = this.rpsData.ref('players/player2');

  //this.connectedRef = this.rpsData.ref(".info/connected");

};


$(document).ready(function () {

  var RPS = new RPSgame();

  RPS.playersRef.child("players").on('value', function (snapshot) {

    console.log(snapshot.val())

  });

  // Experiment with Player One logic

  $("#player-one-submit").on('click', function (e) {
    e.preventDefault();

    RPS.player1.name = $('#player-one-input').val().trim();
    RPS.player1.active = true;

    if(RPS.player1.name){
      RPS.player1Ref.set({
        player: RPS.player1
      });

    }

  });

  RPS.player1Ref.on('child_added', function (player) {

      var playerObj = player.val();

      $("#player-panel-one").empty();
      $("#player-panel-one").append($('<p class="h4">').text("Welcome " + player.val().name))



  });

  RPS.player1Ref.onDisconnect().remove();

  RPS.player1Ref.on('child_removed', function () {
    $("#player-panel-one").empty().text('Player 1 just left...');
  });



  // Same with player two

  $("#player-two-submit").on('click', function (e) {
    e.preventDefault();

    RPS.player2.name = $('#player-two-input').val().trim();
    RPS.player2.active = true;

    if(RPS.player2.name){
      RPS.player2Ref.set({
        player: RPS.player2
      });

    }

  });

  RPS.player2Ref.on('child_added', function (player) {


    var playerObj = player.val();

    $("#player-panel-two").empty();
    $("#player-panel-two").append($('<p class="h4">').text("Welcome " + player.val().name))


  });

  RPS.player2Ref.onDisconnect().remove();


});

