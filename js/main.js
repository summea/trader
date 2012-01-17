const VERSION = "0.0.5";
const FPS = 30;
const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;
const MOVE_AMOUNT = 1;

var gameLoopID;
var gameTime = 0;
var gamePaused = 0;

var background = new Image();
background.src = 'img/background.gif';

var planetX = 300;
var planetY = 300;
var planetImage = new Image();
planetImage.src = 'img/planet.gif';

var lastKey = 0;
var playerShipSize = 12;
var playerShipColor = "#077";
var playerShipX = CANVAS_WIDTH/2;
var playerShipY = CANVAS_HEIGHT/2;
var playerShipXDirection = 1;
var playerShipYDirection = 1;
var playerShipRotateAngle = 0;
var lastPlayerShipSpeed = 0;
var playerShipSpeed = 0.3;
var playerShipThrusterCooldown = 60;
var playerShipThrusterOffTime = 0;
var playerShipImage = new Image();
playerShipImage.src = 'img/brick_ship.gif';
var playerShipFuel = 5000;

/*
  1 - space
  2 - planet
*/
var gameView = 1;

//var canvas = null;
//var context2D = null;
var paper = null;
window.onload = init;

function init() {
  paper = Raphael("canvas", CANVAS_WIDTH, CANVAS_HEIGHT);
  document.getElementById('version').innerHTML = "version: " + VERSION;
  window.addEventListener('keydown', doKeyDown, true);
  spaceInit();
}

function spaceInit() {
  updateGame();
}

function doKeyDown(event) {
  lastPlayerShipSpeed = playerShipSpeed;
  if (gamePaused) {
    switch (event.keyCode) {
      case 80:  /* p was pressed */
        gamePaused = 0;
        updateGame();
        break;
    }
  } else {
    if (gameView == 1) {
      switch (event.keyCode) {
        case 38:  /* Up arrow was pressed */
          if (lastKey != 38 && playerShipSpeed > 0) {
            if (playerShipY - playerShipYDirection > 0){
              playerShipY -= playerShipYDirection + MOVE_AMOUNT;
              playerShipYDirection = -1;
            }
          }
          break;
        case 40:  /* Down arrow was pressed */
          if (lastKey != 40 && playerShipSpeed > 0) {
            if (playerShipY + playerShipYDirection < CANVAS_HEIGHT){
              playerShipY += playerShipYDirection + MOVE_AMOUNT;
              playerShipYDirection = 1;
            }
          }
          break;
        case 37:  /* Left arrow was pressed */
          if (lastKey != 37 && playerShipSpeed > 0) {
            if (playerShipX - playerShipXDirection > 0){
              playerShipX -= playerShipXDirection + MOVE_AMOUNT;
              playerShipXDirection = -1;
            }
          }
          break;
        case 39:  /* Right arrow was pressed */
          if (lastKey != 39 && playerShipSpeed > 0) {
            if (playerShipX + playerShipXDirection < CANVAS_WIDTH){
              playerShipX += playerShipXDirection + MOVE_AMOUNT;
              playerShipXDirection = 1;
            }
          }
          break;
        case 48:  /* 0 was pressed */
          playerShipSpeed = 0;
          playerShipThrusterOffTime = gameTime;
          break;
        case 49:  /* 1 was pressed */
          playerShipSpeed = 0.3;
          break;
        case 50:  /* 2 was pressed */
          playerShipSpeed = 0.7;
          break;
        case 51:  /* 3 was pressed */
          playerShipSpeed = 1.1;
          break;
        case 52:  /* 4 was pressed */
          playerShipSpeed = 1.5;
          break;
        case 53:  /* 5 was pressed */
          playerShipSpeed = 2.1;
          break;
        case 54:  /* 6 was pressed */
          playerShipSpeed = 2.7;
          break;
        case 55:  /* 7 was pressed */
          playerShipSpeed = 3.5;
          break;
        case 56:  /* 8 was pressed */
          playerShipSpeed = 4.7;
          break;
        case 57:  /* 9 was pressed */
          playerShipSpeed = 5.9;
          break;
        case 80:  /* p was pressed */
          if (!gamePaused) { 
            clearTimeout(gameLoopID);
            gamePaused = 1;
            var status = document.getElementById('status');
            status.innerHTML =  "gameTime: " + Math.round(gameTime/60) +
                                "&nbsp;&nbsp;fuel: " + playerShipFuel +
                                "&nbsp;&nbsp;(game paused)";
          }
          break;
        case 68:  /* d was pressed */
          if (playerShipSpeed == 0) {
            gameView = 2;
            planetInit();
          }
          break;
      }
    } else if (gameView == 2) {
      switch(event.keyCode) {
        case 84:  /* t was pressed */
          if (gameView == 2) {
            gameView = 1;
            playerShipSpeed = 0.3;
            $('#info_screen').remove();
            paper = Raphael("canvas", CANVAS_WIDTH, CANVAS_HEIGHT);
          }
          break;
        case 80:  /* p was pressed */
          if (!gamePaused) { 
            clearTimeout(gameLoopID);
            gamePaused = 1;
            var status = document.getElementById('status');
            status.innerHTML =  "gameTime: " + Math.round(gameTime/60) +
                                "&nbsp;&nbsp;fuel: " + playerShipFuel +
                                "&nbsp;&nbsp;(game paused)";
          }
          break;
      }
    }
  }
  lastKey = event.keyCode;
  logger("lastKey: " + lastKey);
  logger("lastPlayerShipSpeed: " + lastPlayerShipSpeed);
  logger("playerShipSpeed: " + playerShipSpeed);
}

function updateGame() {
  if (gameTime < 40000) {  /* temporary time limit */
    switch(gameView) {
      case 1: /* space */
        spaceDraw();
        updateGameLogic();
        var status = document.getElementById('status');
        status.innerHTML =  "gameTime: " + Math.round(gameTime/60) +
                            "&nbsp;&nbsp;fuel: " + playerShipFuel; 
        break;
      case 2: /* planet */
        planetDraw();
        var status = document.getElementById('status');
        status.innerHTML =  "gameTime: " + Math.round(gameTime/60) +
                            "&nbsp;&nbsp;fuel: " + playerShipFuel + 
                            "&nbsp;&nbsp;On Planet: " + "Epsilon";
        break;
    }
    gameTime++;
    gameLoopID = setTimeout(updateGame, 1000 / FPS);
  }
}

function spaceDraw() {
  paper.clear();

  var ship = paper.set();
  ship.push(
    paper.circle(playerShipX+(playerShipSize/2), playerShipY+(playerShipSize/2), playerShipSize/1.4),
    paper.circle(playerShipX, playerShipY, playerShipSize)
  );
  ship.attr({fill: playerShipColor});
  ship.pop();
  var transformX = 0;
  var transformY = 0;
  switch(playerShipXDirection) {
    case 1:
      transformX = 0.1 * playerShipSize;
      break;
    case -1: 
      transformX = -2 * (playerShipSize/2);
      break;
  }
  switch(playerShipYDirection) {
    case 1:
      transformY = 0.1 * playerShipSize;
      break;
    case -1:
      transformY = -2 * (playerShipSize/2);
      break;
  }

  ship.transform("t" + transformX + "," + transformY);



  //canvas.drawImage(background, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  //canvas.drawImage(planetImage, planetX, planetY);

  //canvas.save();
  //canvas.translate(playerShipX, playerShipY);
  //canvas.rotate(playerShipRotateAngle * (Math.PI / 180));
  //canvas.drawImage(playerShipImage, playerShipX, playerShipY);
  //canvas.restore();
}

function updateGameLogic() {
  if (playerShipFuel == 0) {
    playerShipSpeed = 0;
  }

  if (playerShipSpeed != 0) {
    playerShipX += 1 * playerShipXDirection * playerShipSpeed;
    playerShipY += 1 * playerShipYDirection * playerShipSpeed;

    if (playerShipX >= CANVAS_WIDTH) {
      playerShipX = -playerShipSize;
      playerShipXDirection = 1;
    } else if (playerShipX < -playerShipSize) {
      playerShipX = CANVAS_WIDTH;
      playerShipXDirection = -1;
    } else if (playerShipY >= CANVAS_HEIGHT) {
      playerShipY = -playerShipSize;
      playerShipYDirection = 1;
    } else if (playerShipY < -playerShipSize) {
      playerShipY = CANVAS_HEIGHT;
      playerShipYDirection = -1;
    }
  } else {
    thrustersOffFloating();
  }
  if (playerShipFuel > 0) {
    if ((playerShipFuel - Math.round(playerShipSpeed)) < 0) {
      playerShipFuel = 0;
      playerShipThrusterOffTime = gameTime;
      lastPlayerShipSpeed = 1.3;
      thrustersOffFloating();
    } else {
      if (playerShipSpeed != 0) {
        playerShipFuel -= Math.round(playerShipSpeed) + 1;
      }
    }
  }
}

function thrustersOffFloating() {
  // spacey float after thrusters turned off
  // first, reduce speed during thruster cooldown
  if (gameTime < (playerShipThrusterOffTime + playerShipThrusterCooldown)) {
    playerShipX += 1 * playerShipXDirection *
                    (0.1 + (lastPlayerShipSpeed / 4));
    playerShipY += 1 * playerShipYDirection *
                    (0.1 + (lastPlayerShipSpeed / 4));
  } else {
    // now the ship is stopped
    playerShipSpeed = 0;
  } 
}

function planetInit() {
  //updateGame();
  paper.clear();
  $('#canvas').html('<div id="info_screen"></div>');
  $.get('data/docking_station.html', function(data) {
    $('#info_screen').append(data);
  });
  planetDraw();
}

function planetDraw() {
}

function refuel() {
  $('#canvas').html('<div id="info_screen"></div>');
  $.get('data/refuel.html', function(data) {
    $('#info_screen').append(data);
  });
}

function buy() {
  //alert('buy' + arguments[0]);
  // FIXME connect to database later...

  // db lookup

  var tmpFuelPrice = 4;
}

function sell() {
}
