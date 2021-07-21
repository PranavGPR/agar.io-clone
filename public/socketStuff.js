let socket = io.connect("http://localhost:5000");

function init() {
  draw();
  socket.emit("init", { playerName: player.name });
}

socket.on("initReturn", (data) => {
  orbs = data.orbs;
  setInterval(() => {
    socket.emit("tick", {
      xVector: player.xVector,
      yVector: player.yVector,
    });
  }, 33);
});

socket.on("tock", (data) => {
  players = data.players;
});

socket.on("orbSwitch", (data) => {
  orbs.splice(data.orbIndex, 1, data.newOrb);
});

socket.on("tickTock", (data) => {
  player.locX = data.playerX;
  player.locY = data.playerY;
});

socket.on("updateLeaderboard", (data) => {
  document.querySelector(".leader-board").innerHTML = "";
  document.querySelector(".player-score").innerHTML = "";
  data.forEach((curPlayer) => {
    document.querySelector(
      ".leader-board"
    ).innerHTML += `<li class="leaderboard-player">${curPlayer.name} - ${curPlayer.score}</li>`;
    document.querySelector(".player-score").innerHTML = curPlayer.score;
  });
});
