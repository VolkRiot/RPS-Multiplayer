function RPSgame() {

  this.initFirebase();
  this.player = {};
  this.opponent = {};
  this.playerContainers = ["#player-panel-one", "#player-panel-two"];
  this.currentTurn = 1;
  this.messages = {};

}

RPSgame.prototype.initFirebase = function () {

  this.rpsData = firebase.database();
  this.participants = this.rpsData.ref('players');

};

RPSgame.prototype.createButtons = function () {

  var $playerMoveCont = $(this.player.container + " .player-move");
  $playerMoveCont.empty();
  $playerMoveCont.append($('<button class="btn btn-primary move-buttons" id="rock">').text("Rock"));
  $playerMoveCont.append($('<button class="btn btn-primary move-buttons" id="paper">').text("Paper"));
  $playerMoveCont.append($('<button class="btn btn-primary move-buttons" id="scissors">').text("Scissors"))

};

RPSgame.prototype.determineWinner = function () {

  var $gameContainer = $('#game-state');
  var $resultP = $('<p class="h4">');

  var winCond1 = this.player.move == "rock" && this.opponent.move == "scissors";
  var winCond2 = this.player.move == "scissors" && this.opponent.move == "paper";
  var winCond3 = this.player.move == "paper" && this.opponent.move == "rock";

  $gameContainer.empty();

  if(this.player.move == this.opponent.move){

    $gameContainer.append($resultP.text('You Tied'));

  }else if(winCond1 || winCond2 || winCond3){

    this.player.wins++;
    this.rpsData.ref(this.player.playerRef + "/player/").update({wins:this.player.wins});
    $gameContainer.append($resultP.text( this.player.name + ' Won!'));

  }else{

    this.player.losses++;
    this.rpsData.ref(this.player.playerRef + "/player/").update({losses:this.player.losses});
    $gameContainer.append($resultP.text( this.opponent.name + ' Won!'));

  }

  $(this.opponent.container).find('.player-move').text(this.opponent.move.charAt(0).toUpperCase() +
      this.opponent.move.slice(1));

};


$(document).ready(function () {

  var RPS = new RPSgame();

  $("#player-submit").on('click', function (e) {

    e.preventDefault();

    if($('#player-input').val()){

      RPS.participants.once('value', function (snapshot) {

        var childNumber = parseInt(snapshot.numChildren());

        if(snapshot.numChildren() <=1){
          RPS.player.num = childNumber + 1,
          RPS.player.name = $('#player-input').val().trim(),
          RPS.player.container = RPS.playerContainers[childNumber],
          RPS.player.playerRef = 'players/' + String(RPS.player.num),
          RPS.player.wins = 0,
          RPS.player.losses = 0
        }

        RPS.rpsData.ref(RPS.player.playerRef).set({
          player: RPS.player
        });

        if(RPS.player.num == 2){
          RPS.rpsData.ref('turn').set(RPS.currentTurn)
        }

        $('#player-form').hide();

        RPS.rpsData.ref('turn').on("value", function (snapshot) {

          var turn = snapshot.val();

          if(turn && RPS.player.num == turn){
            RPS.createButtons();
          }

          if(turn === 3){
            RPS.determineWinner();

            function reset() {

              $(".player-move").filter(function() {
                return($(this).find(".move-buttons").length == 0);
              }).empty();

              $('#game-state').empty();
              RPS.currentTurn = 1;
              RPS.rpsData.ref().update({turn : RPS.currentTurn});
              $( RPS.player.container + ' .win-loss').text('Wins: ' + RPS.player.wins + ' Losses: ' + RPS.player.losses);
              $( RPS.opponent.container + ' .win-loss').text('Wins: ' + RPS.opponent.wins + ' Losses: ' + RPS.opponent.losses);
            }

            setTimeout(reset, 3000);

          }

        });

        RPS.rpsData.ref('players').child(RPS.player.num).onDisconnect().remove();
        RPS.rpsData.ref('turn').onDisconnect().remove();
        RPS.rpsData.ref('messages').onDisconnect().remove();

      });
    }

  });

  RPS.participants.on('child_added', function (snapshot) {

    var players = snapshot.val();

    $(players.player.container).find('.player-name').text(players.player.name);
    $(players.player.container).show();

  });

  $('.player-panel').on('click', '.move-buttons', function () {

    RPS.player.move = $(this).attr('id');

    RPS.rpsData.ref(RPS.player.playerRef).set({
      player: RPS.player
    });

    RPS.currentTurn++;

    RPS.rpsData.ref().update({turn : RPS.currentTurn});

    $('.move-buttons').hide();

    $(RPS.player.container + " .player-move").text(RPS.player.move.charAt(0).toUpperCase() +
        RPS.player.move.slice(1));

  });

  RPS.rpsData.ref('turn').on('value', function (snapshot) {

    if(snapshot.val()){
      RPS.currentTurn = snapshot.val();
    }

  });

  RPS.rpsData.ref('players/1/player').on('value', function(snapshot){

    if(snapshot.val()) {

      if (RPS.player.num != 1) {
        RPS.opponent = snapshot.val();
      }

    }

  });

  RPS.rpsData.ref('players/2/player').on('value', function (snapshot) {

    if(snapshot.val()) {

      if (RPS.player.num != 2) {
        RPS.opponent = snapshot.val();
      }

    }
  });

  $('#message-submit').on('click', function (e) {

    e.preventDefault();

    var message = $('#message-input').val().trim();

    if(!RPS.player.name){
      RPS.player.name = "Anonymous";
    }

    RPS.rpsData.ref('messages').push({
      name : RPS.player.name,
      body : message
    });
    $('#message-input').val('');

  });

  RPS.rpsData.ref('messages').on('child_added', function (snapshot) {

    if(snapshot.val()){

      var $chatBody = $('#chat-body');
      var fullLine = snapshot.val().name + ": " + snapshot.val().body;

      $chatBody[0].scrollTop = $chatBody[0].scrollHeight;
      $chatBody.append($('<p class="h5">').text(fullLine));
      $chatBody.animate({ scrollTop: $chatBody[0].scrollHeight }, "slow");

    }

  });

  RPS.participants.on('child_removed', function (snapshot) {

    if(snapshot.val() !== null){

      var numChildren = parseInt(snapshot.numChildren());

      if(numChildren < 2){
        $('#chat-body').append($('<p class="h5">').text('System Message: ' + RPS.opponent.name + ' disconnected.'));
      }
    }

  })

 }); // End of document.ready()

