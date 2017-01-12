/*
	Bless this mess (of code).
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
		if (name === (array[i].username ? array[i].username : array[i].name) || name == "global") {
			return true;
		}
	}
	return false;
}
function sendMessage(roomName, message, socket, serverMsg) {
	io.in(roomName).emit("chat-message", {
		from: socket.username ? socket.username : "",
		msg: message,
		serverMsg: serverMsg
	});
}
function joinRoom(room, socket) {
	var lastRoom = socket.connectedTo;
	var roomToJoin;
	if (room.name == lastRoom.name || room.name == "global") { // If user is trying to join the room they're already in, reject the join
		console.log("Rejecting join");
		return false;
	} else {
		for (var b = 0; b < allRooms.length; b++) { // Iterate through all rooms
			if (allRooms[b].name == room.name) { // If the room user is trying to join exists
				roomToJoin = allRooms[b]; // Set the planned room to joined to the found rooms' object
			}
		}
		if (roomToJoin) { // If there is a planned room to join
			socket.leave("global"); // Leave default "global" sIO room

			if (lastRoom) {
				if ((lastRoom.users.length - 1) <= 0) { // If the old room would be empty if the user leaves, delete the old room
					for (var i = 0; i < allRooms.length; i++) { // Iterate through all rooms
						if (lastRoom.name == allRooms[i].name) { // If the old rooms name match the current iteration name
							io.emit("room-delete", lastRoom.name); // Send event to clients to remove room from list of chat rooms
							allRooms.splice(i, 1); // Remove the old room from the list of all rooms
						}
					}
				} else { // If the user is leaving a room, send messages to the old room that the user has left
					io.in(lastRoom.name).emit("user-left", socket.username);
					sendMessage(lastRoom.name, (socket.username + " has left the room."), socket, true);
					socket.leave(lastRoom.name);

					// Remove user from old room's list of users
					for (var i = 0; i < lastRoom.users.length; i++) {
						if (lastRoom.users[i].username == socket.username) {
							lastRoom.users.splice(i, 1);
						}
					}
				}
			}

			// Join user to planned room
			socket.join(roomToJoin.name);
			roomToJoin.users.push(socket);

			// Send all users in new room to user to render
			var usersToSend = [];
			for (var i = 0; i < roomToJoin.users.length; i++) {
				usersToSend.push(roomToJoin.users[i].username);
			}
			socket.emit("room-joined", {
				name: roomToJoin.name,
				users: usersToSend
			});

			socket.broadcast.to(roomToJoin.name).emit("user-joined", socket.username); // Send event to client about user joining to add to user list
			sendMessage(roomToJoin.name, (socket.username + " has joined the room"), socket, true); // Send message to users in new room that the user has joined
			socket.connectedTo = roomToJoin; // Set users' currently connected room to the new rooms' object
			console.log((socket.username ? socket.username : "User") + " has joined room called " + roomToJoin.name);
		}
	}
}

// Events and logic
io.on("connection", function(socket) {
	console.log((socket.username ? socket.username : "User") + " joined");
	socket.join("global");
	socket.connectedTo = false;
	console.log(socket.connectedTo);

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
			socket.username = data.substring(0, 25);
			allUsers.push(socket);
			io.in("global").emit("user-joined", socket.username);
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
			var newRoom = {
				name: data,
				users: []
			}
			allRooms.push(newRoom);
			console.log((socket.username ? socket.username : "User") + " has created room called " + data);
			io.emit("room-created", data);
			joinRoom(newRoom, socket);
		}
	});
	socket.on("joinRoom", function(data) {
		joinRoom({
			name: data
		}, socket);
	});
	socket.on("sendMsg", function(data) {
		sendMessage(socket.connectedTo.name, data.substring(0, 249), socket, false);
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