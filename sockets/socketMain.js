const io = require("../server").io;

const checkForOrbCollisions =
  require("./checkCollisions").checkForOrbCollisions;
const checkForPlayerCollisions =
  require("./checkCollisions").checkForPlayerCollisions;

// Classes
const Orb = require("./classes/Orb");
const Player = require("./classes/Player");
const PlayerData = require("./classes/PlayerData");
const PlayerConfig = require("./classes/PlayerConfig");

let orbs = [];
let players = [];
let settings = {
  defaultOrbs: 50,
  defaultSpeed: 6,
  defaultSize: 6,
  defaultZoom: 1.5,
  worldWidth: 500,
  worldHeight: 500,
};

initGame();

setInterval(() => {
  if (players.length) {
    io.to("game").emit("tock", {
      players,
    });
  }
}, 33); // there are 30 33's in 1000 milliseconds or 1/30th of a second or 1 of 30 FPS

io.sockets.on("connect", (socket) => {
  let player = {};
  // works when a player is connected
  socket.on("init", (data) => {
    socket.join("game");

    let playerConfig = new PlayerConfig(settings);

    let playerData = new PlayerData(data.playerName, settings);

    player = new Player(socket.id, playerConfig, playerData);

    setInterval(() => {
      socket.emit("tickTock", {
        playerX: player.playerData.locX,
        playerY: player.playerData.locY,
      });
    }, 33); // there are 30 33's in 1000 milliseconds or 1/30th of a second or 1 of 30 FPS

    socket.emit("initReturn", {
      orbs,
    });

    players.push(playerData);
  });

  socket.on("tick", (data) => {
    speed = player.playerConfig.speed;
    // update playerConfig object with new direction in data
    // also create local variable for readability
    xV = player.playerConfig.xVector = data.xVector;
    yV = player.playerConfig.xVector = data.yVector;

    if (
      (player.playerData.locX < 5 && player.playerData.xVector < 0) ||
      (player.playerData.locX > settings.worldWidth && xV > 0)
    ) {
      player.playerData.locY -= speed * yV;
    } else if (
      (player.playerData.locY < 5 && yV > 0) ||
      (player.playerData.locY > settings.worldHeight && yV < 0)
    ) {
      player.playerData.locX += speed * xV;
    } else {
      player.playerData.locX += speed * xV;
      player.playerData.locY -= speed * yV;
    }

    // ORB COLLISION
    let capturedOrb = checkForOrbCollisions(
      player.playerData,
      player.playerConfig,
      orbs,
      settings
    );
    capturedOrb
      .then((data) => {
        const orbData = {
          orbIndex: data,
          newOrb: orbs[data],
        };
        io.sockets.emit("orbSwitch", orbData);
        io.sockets.emit("updateLeaderboard", getLeaderboard());
      })
      .catch(() => {});

    // PLAYER COLLISION
    let playerDeath = checkForPlayerCollisions(
      player.playerData,
      player.playerConfig,
      players,
      player.socketId
    );
    playerDeath
      .then((data) => {
        io.sockets.emit("updateLeaderboard", getLeaderboard());
        io.sockets.emit("playerDeath", data);
      })
      .catch(() => {});
  });

  socket.on("disconnect", (data) => {
    if (player.playerData) {
      players.forEach((curPlayer, index) => {
        if (curPlayer.uid === player.playerData.uid) {
          players.splice(index, 1);
          io.sockets.emit("updateLeaderboard", getLeaderboard());
        }
      });
    }
  });
});

function getLeaderboard() {
  players.sort((a, b) => {
    return b.score - a.score;
  });
  let leaderboard = players.map((curPlayer) => {
    return {
      name: curPlayer.name,
      score: curPlayer.score,
    };
  });
  return leaderboard;
}

function initGame() {
  for (i = 0; i < settings.defaultOrbs; i++) {
    orbs.push(new Orb(settings));
  }
}

module.exports = io;
