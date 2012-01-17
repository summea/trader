const VERSION = "0.0.3";
const FPS = 30;
const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;
const MOVE_AMOUNT = 1;
const SHIP_SIZE = 34;

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
var playerShipX = 0;
var playerShipY = 0;
var playerShipXDirection = 1;
var playerShipYDirection = 1;
var playerShipRotateAngle = 0;
var lastPlayerShipSpeed = 0;
var playerShipSpeed = 1;
var playerShipThrusterCooldown = 60;
var playerShipThrusterOffTime = 0;
var playerShipImage = new Image();
playerShipImage.src = 'img/brick_ship.gif';
var playerShipFuel = 5000;

var canvas = null;
var context2D = null;
window.onload = init;

function init() {
  document.getElementById('version').innerHTML = "version: " + VERSION;
  //canvas = document.getElementById('canvas');
  //context2D = canvas.getContext('2d');
  //setInterval(draw, 1000 / FPS);
  window.addEventListener('keydown', doKeyDown, true);
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
          status.innerHTML =  "gameTime: " + gameTime +
                              "&nbsp;&nbsp;fuel: " + playerShipFuel +
                              "&nbsp;&nbsp;(game paused)";
        }
        break;
      }
      lastKey = event.keyCode;
      logger("lastKey: " + lastKey);
      logger("lastPlayerShipSpeed: " + lastPlayerShipSpeed);
      logger("playerShipSpeed: " + playerShipSpeed);
    }
}

function updateGame() {
  if (gameTime < 40000) {  /* temporary time limit */
    draw();
    updateGameLogic();
    gameTime++;
    var status = document.getElementById('status');
    status.innerHTML =  "gameTime: " + gameTime +
                        "&nbsp;&nbsp;fuel: " + playerShipFuel +
                        "&nbsp;&nbsp;x: " + playerShipX +
                        "&nbsp;&nbsp;y: " + playerShipY;
    gameLoopID = setTimeout(updateGame, 1000 / FPS);
  }
}

function draw() {
  var canvas = document.getElementById('canvas');
  var context = canvas.getContext('2d');

  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  //context.translate(playerShipImage.width - 1, playerShipImage.height - 1);
  //context.rotate(0.5);

  context.drawImage(background, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  context.drawImage(planetImage, planetX, planetY);

  context.save();
  context.translate(playerShipX, playerShipY);
  context.rotate(playerShipRotateAngle * (Math.PI / 180));
  context.drawImage(playerShipImage, playerShipX, playerShipY);
  context.restore();
}

function updateGameLogic() {
  if (playerShipFuel == 0) {
    playerShipSpeed = 0;
  }

  if (playerShipSpeed != 0) {
    playerShipX += 1 * playerShipXDirection * playerShipSpeed;
    playerShipY += 1 * playerShipYDirection * playerShipSpeed;

    if (playerShipX >= CANVAS_WIDTH) {
      playerShipX = -SHIP_SIZE;
      playerShipXDirection = 1;
    } else if (playerShipX < -SHIP_SIZE) {
      playerShipX = CANVAS_WIDTH;
      playerShipXDirection = -1;
    } else if (playerShipY >= CANVAS_HEIGHT) {
      playerShipY = -SHIP_SIZE;
      playerShipYDirection = 1;
    } else if (playerShipY < -SHIP_SIZE) {
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
      playerShipFuel -= Math.round(playerShipSpeed);
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
