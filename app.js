/*
	Bless this mess (of code).
*/

/*

	- TODO: When there are no users left in a room - remove the room.
	- TODO: Make user joins to rooms not appear to every other room.

*/

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
		if (name === (array[i].username ? array[i].username : array[i].name) || name === "global") {
			return true;
		}
	}
	return false;
}
function sendMessage(roomName, message, socket, server) {
	io.in(roomName).emit("chat-message", {
		from: socket.username ? socket.username : "",
		msg: message,
		serverMsg: server
	});
}
function joinRoom(roomName, socket) {
	if (roomName != socket.connectedTo) {
		for (var i = 0; i < allRooms.length; i++) {
			if (allRooms[i].name == roomName) {
				if (socket.connectedTo) {
					for (var b = 0; b < allRooms[i].users.length; b++) {
						if (allRooms[i].users[b].username == socket.username) {
							allRooms[i].users[b].splice(b, 1);
						}
					}
					socket.broadcast.emit("user-left", socket.username);
					socket.leave(socket.connectedTo);
				}
				socket.join(roomName);
				socket.emit("room-joined", roomName);
				allRooms[i].users.push(socket);
				sendMessage(roomName, (socket.username + " has joined the room."), socket, true);
				socket.connectedTo = roomName;
				console.log((socket.username ? socket.username : "User") + " has joined room called " + allRooms[i].name);
			}
		}
	}
}

// Events and logic
io.on("connection", function(socket) {
	console.log((socket.username ? socket.username : "User") + " joined");
	socket.join("global");
	//console.log(socket.rooms);

	var allNames = [];
	for(var i = 0; i < allUsers.length; i++) {
		allNames.push(allUsers[i].username);
	}
	socket.emit("user-all", allNames);
	var allRoomNames = [];
	for(var i = 0; i < allRooms.length; i++) {
		allRoomNames.push(allRooms[i].name);
	}
	socket.emit("room-all", allRoomNames);
	socket.emit("reqUsername");

	socket.on("newName", function(data) {
		if (checkTaken(data, allUsers)) {
			console.log((socket.username ? socket.username : "User") + " attempted to change their name to " + data + " but it was taken");
			socket.emit("reqUsername", {
				taken: true,
				rejectedUsername: data
			});
		} else {
			console.log((socket.username ? socket.username : "User") + " has changed their name to " + data);
			socket.username = data;
			allUsers.push(socket);
			socket.broadcast.to("global").emit("user-joined", socket.username);
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
			console.log((socket.username ? socket.username : "User") + " has created room called " + data);
			joinRoom(data, socket);
			socket.broadcast.emit("room-created", data);
		}
	});
	socket.on("joinRoom", function(data) {
		joinRoom(data, socket);
		//console.log(socket.rooms);
	});
	socket.on("sendMsg", function(data) {
		sendMessage(socket.connectedTo, data, socket, false);
	});

	socket.on("disconnect", function() {
		console.log((socket.username ? socket.username : "User") + " has disconnected");
		for (var i = 0; i < allUsers.length; i++) {
			if (allUsers[i].username === socket.username) {
				allUsers.splice(i, 1);
			}
		}
		if (socket.connectedTo) {
			socket.broadcast.emit("user-left", socket.username);
		}
	});
});