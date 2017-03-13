
var config = {
  apiKey: "AIzaSyBJPUuzs3i0P6VBBcmj2jBvw0myEJteZ_A",
  authDomain: "rps-multiplayer-62d32.firebaseapp.com",
  databaseURL: "https://rps-multiplayer-62d32.firebaseio.com",
  storageBucket: "rps-multiplayer-62d32.appspot.com",
  messagingSenderId: "761627428999"
};

firebase.initializeApp(config);

function RPSgame() {

  this.rpsData = firebase.database();
  this.numPlayers = 0;

  this.playersRef = this.rpsData.ref('players');
  this.player1Ref = this.rpsData.ref('players/player1');
  this.player2Ref = this.rpsData.ref('players/player2');

  this.numConnectedRef = this.rpsData.ref('connections');

  this.connectedRef = this.rpsData.ref(".info/connected");

  //this.auth = firebase.auth();
  //this.storage = firebase.storage();

  this.player1 = {
    name: '',
    active: false
  };
  this.player2 = {
    name: '',
    active: false
  };

}


$(document).ready(function () {

  var RPS = new RPSgame();

  RPS.connectedRef.on('value', function (status) {

    if(status.val() === true){

      RPS.numPlayers++;

      if(RPS.numConnectedRef.child('value') === null){
        RPS.numConnectedRef.set({
          numConnected: RPS.numPlayers
        })
      }else{
        RPS.numConnectedRef.update({
          numConnected: RPS.numPlayers
        })
      }


    }else{

      RPS.numPlayers--;
    }

  });


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

    if(player.val() !== null){
      console.log("Player one is named" + player.val().name);
      $("#player-panel-one").empty();
    }


  });

  RPS.player1Ref.onDisconnect().remove();


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

    if(player.val() !== null){
      $("#player-panel-two").empty();
    }

  });

  RPS.player2Ref.onDisconnect().remove();


});

