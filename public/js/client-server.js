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
		alert("The username " + data.rejectedUsername + " is taken");
		users.evt.remove({
			name: data.rejectedUsername,
			you: true
		});
	}
	prompt.evt.toggleActive(prompt.el.user);
});
socket.on("reqRoom", function(data) {
	if (data === "taken") {
		alert("That room name is taken!");
	}
	prompt.evt.toggleActive(prompt.el.room);
});

socket.on("user-joined", function(data) {
	users.evt.add({
		name: data
	});
});
socket.on("user-left", function(data) {
	chat.evt.add({
		from: "",
		msg: data + " has left the room.",
		serverMsg: true
	});
	users.evt.remove({
		name: data
	});
});
socket.on("user-all", function(data) {
	users.evt.addAll(data);
});

socket.on("room-created", function(data) {
	rooms.evt.add({
		name: data
	});
});
socket.on("room-all", function(data) {
	rooms.evt.addAll(data);
});
socket.on("room-joined", function(data) {
	rooms.evt.join({
		name: data
	});
	chat.evt.removeAll();
});

socket.on("chat-message", function(data) {
	chat.evt.add(data);
});