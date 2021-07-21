let socket = io.connect("http://localhost:5000");

socket.on("init", (data) => {
  orbs = data.orbs;
});
