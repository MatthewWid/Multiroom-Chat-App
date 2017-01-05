var socket = io.connect("http://localhost:8080");

var hasTriedUser = false;

function sendUsername(name) {
	socket.emit("newName", name);
}

socket.on("reqUsername", function() {
	prompt.evt.toggleActive(prompt.el.user);
});