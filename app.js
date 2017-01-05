// Server init vars
var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

// Server setup
var PORT = 8080;
server.listen(PORT, function() {
	console.log("Now listening on port: " + PORT);
});
app.use(express.static("public"));

var allUsers = [];

// Events and logic
io.on("connection", function(socket) {
	console.log("User joined.");
	socket.emit("reqUsername");

	socket.on("newName", function(data) {
		if (allUsers.indexOf(data) != -1) {
			socket.emit("reqUsername");
			console.log("User attempted to change their name to " + data + " but it was taken");
		} else {
			socket.username = data;
			allUsers.push(socket);
			console.log("User has changed their name to " + data);
		}
	});
});