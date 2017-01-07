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
var allRooms = [];

function checkTaken(name, array) {
	for (var i = 0; i < array.length; i++) {
		if (name === (array[i].username ? array[i].username : array[i].name)) {
			return true;
		}
	}
	return false;
}
// Events and logic
io.on("connection", function(socket) {
	console.log((socket.username ? socket.username : "User") + " joined");
	var allNames = [];
	for(var i = 0; i < allUsers.length; i++) {
		allNames.push(allUsers[i].username);
	}
	socket.emit("user-all", allNames);
	socket.emit("reqUsername");

	socket.on("newName", function(data) {
		if (checkTaken(data, allUsers)) {
			console.log((socket.username ? socket.username : "User") + " attempted to change their name to " + data + " but it was taken");
			socket.emit("reqUsername", "taken");
		} else {
			console.log((socket.username ? socket.username : "User") + " has changed their name to " + data);
			socket.username = data;
			allUsers.push(socket);
			socket.broadcast.emit("user-joined", socket.username);
			if (allRooms.length == 0) {
				socket.emit("reqRoom");
			}
		}
	});
	socket.on("newRoom", function(data) {
		if (checkTaken(data, allRooms)) {
			socket.emit("reqRoom", "taken");
			console.log((socket.username ? socket.username : "User") + " attempted to create room called " + data + " but it was taken");
		} else {
			allRooms.push({
				name: data,
				users: []
			});
			socket.broadcast.emit("room-created", data);
			console.log((socket.username ? socket.username : "User") + " has created room called " + data);
		}
	});

	socket.on("disconnect", function() {
		console.log((socket.username ? socket.username : "User") + " has disconnected");
		socket.broadcast.emit("user-left", socket.username);
		for (var i = 0; i < allUsers.length; i++) {
			if (allUsers[i].username === socket.username) {
				allUsers.splice(i, 1);
			}
		}
	});
});