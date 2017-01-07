var socket = io.connect("http://localhost:8080");

var hasTriedUser = false;

// Send to server functions
function sendUsername(name) {
	socket.emit("newName", name);
}
function sendRoom(name) {
	socket.emit("newRoom", name);
}

// Receive from server functions
socket.on("reqUsername", function(data) {
	if (data === "taken") {
		alert("That username is taken!");
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
	users.evt.remove({
		name: data
	});
});
window.testArr = [];
socket.on("user-all", function(data) {
	window.testArr = data;
	users.evt.addAll(data);
})