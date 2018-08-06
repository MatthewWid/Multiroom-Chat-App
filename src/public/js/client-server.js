var socket = io.connect("http://localhost:8080");

var hasTriedUser = false;

// Send to server functions
function sendUsername(name) {
	socket.emit("newName", name);
}
function sendRoom(name) {
	socket.emit("newRoom", name);
}
function joinRoom(name) {
	socket.emit("joinRoom", name);
	rooms.evt.join(name);
}
function sendMessage(msg) {
	socket.emit("sendMsg", msg);
}

// Receive from server functions
socket.on("reqUsername", function(data) {
	if (data ? data.taken : false) {
		alert("The username " + data.rejectedUsername + " is taken!");
		prompt.evt.toggleActive(prompt.el.user);
	} else {
		prompt.evt.toggleActive(prompt.el.user);
	}
});
socket.on("reqRoom", function(data) {
	if (data == "taken") {
		alert("That room name is taken!");
	}
	prompt.evt.toggleActive(prompt.el.room);
});

socket.on("user-joined", function(data) {
	users.evt.add(data);
});
socket.on("user-left", function(data) {
	users.evt.remove({
		name: data
	});
});
socket.on("user-all", function(data) {
	users.evt.addAll(data);
});

socket.on("room-created", function(data) {
	rooms.evt.add(data);
});
socket.on("room-all", function(data) {
	rooms.evt.addAll(data);
});
socket.on("room-joined", function(data) {
	rooms.evt.join(data.name);
	chat.evt.removeAll();
	users.evt.removeAll();
	users.evt.addAll(data.users);
});
socket.on("room-delete", function(data) {
	rooms.evt.remove({
		name: data
	});
});

socket.on("chat-message", function(data) {
	chat.evt.add(data);
});

socket.on("disconnect", function() {
	document.body.classList.add("useless");
	socket.disconnect();
	alert("You have been disconnected from the server!\n\nTry refreshing the page.");
});