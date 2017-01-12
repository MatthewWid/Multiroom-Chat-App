// Objects for events, functions, interactable elements and templates
var globals = {
	roomIDPrefix: "rid-",
	userIDPrefix: "uid-",
	username: ""
};
var rooms = {
	el: {
		list: document.querySelector("#rooms .list"),
		template: document.getElementById("template-room")
	},
	evt: {
		add: function(data) {
			var newRoomEl = rooms.el.template.cloneNode(true);
			newRoomEl.setAttribute("id", globals.roomIDPrefix + data);
			newRoomEl.title = data;
			newRoomEl.getElementsByClassName("room-name")[0].innerHTML = data;
			newRoomEl.addEventListener("click", function() {
				joinRoom(data);
			});
			rooms.el.list.appendChild(newRoomEl);
		},
		remove: function(data) {
			var roomElToRemove = document.getElementById(globals.roomIDPrefix + data.name);
			roomElToRemove.parentElement.removeChild(roomElToRemove);
		},
		addAll: function(data) {
			for (var i = 0; i < data.length; i++) {
				rooms.evt.add(data[i]);
			}
		},
		join: function(data) {
			var allRooms = rooms.el.list.getElementsByClassName("room");
			for (var i = 0; i < allRooms.length; i++) {
				allRooms[i].getElementsByClassName("connectionIndicator")[0].classList.remove("on");
				console.log(allRooms[i].id);
				if (allRooms[i].id == (globals.roomIDPrefix + data)) {
					allRooms[i].getElementsByClassName("connectionIndicator")[0].classList.add("on");
				}
			}
		}
	}
};
var chat = {
	el: {
		textBox: document.getElementById("chat-text"),
		sendButton: document.getElementById("chat-send"),
		list: document.querySelector("#chat .chat-container-messages .chat-container-inner"),
		template: document.getElementById("template-chat-line")
	},
	evt: {
		add: function(data) {
			var msgEl = chat.el.template.cloneNode(true);
			msgEl.removeAttribute("id");
			msgEl.getElementsByClassName("from")[0].textContent = data.from || "";
			if (data.serverMsg) {
				msgEl.classList.add("serverMsg");
				msgEl.getElementsByClassName("message")[0].innerHTML = data.msg;
			} else {
				msgEl.getElementsByClassName("message")[0].textContent = data.msg;
			}
			chat.el.list.appendChild(msgEl);
		},
		addAll: function(data) {
			for (var i = 0; i < data.length; i++) {
				chat.evt.add(data[i]);
			}
		},
		removeAll: function() {
			while(chat.el.list.firstChild) {
				chat.el.list.removeChild(chat.el.list.firstChild);
			}
		},
		send: function() {
			var msg = chat.el.textBox.value;
			sendMessage(msg.substring(0, 249));
			chat.el.textBox.value = "";
		}
	}
};
var users = {
	el: {
		list: document.querySelector("#users .list"),
		template: document.getElementById("template-user-name")
	},
	evt: {
		add: function(data) {
			var newUserEl = document.getElementById("template-user-name").cloneNode(true);
			newUserEl.setAttribute("id", globals.userIDPrefix + data);
			newUserEl.title = newUserEl.innerHTML = data;
			if (data == globals.username) {
				newUserEl.classList.add("you");
			}
			users.el.list.appendChild(newUserEl);
		},
		remove: function(data) {
			if (!data.you) {
				var userElToRemove = document.getElementById(globals.userIDPrefix + data.name);
				userElToRemove.parentElement.removeChild(userElToRemove);
			} else {
				var userElToRemove = document.querySelector("#users .list .you");
				userElToRemove.parentElement.removeChild(userElToRemove);
			}
		},
		addAll: function(data) {
			for (var i = 0; i < data.length; i++) {
				users.evt.add(data[i]);
			}
		},
		removeAll: function() {
			while(users.el.list.firstChild) {
				users.el.list.removeChild(users.el.list.firstChild);
			}
		}
	}
};
var prompt = {
	el: {
		user: document.getElementById("prompt-user"),
		room: document.getElementById("prompt-room")
	},
	evt: {
		toggleActive: function(promptEl) {
			promptEl.classList.toggle("active");
		}
	}
};

// Event listeners
document.getElementById("prompt-user-submit").addEventListener("click", function() {
	var inputVal = document.getElementById("prompt-user-input");
	var name = inputVal.value ? inputVal.value.substring(0, 25) : ("Guest-" + ("0" + Math.floor((Math.random() * 1000) + 1)).slice(-4));
	inputVal.value = "";
	sendUsername(name);
	prompt.evt.toggleActive(prompt.el.user);
	globals.username = name;
});
document.getElementById("prompt-room-submit").addEventListener("click", function() {
	var inputVal = document.getElementById("prompt-room-input");
	var name = inputVal.value ? inputVal.value.substring(0, 25) : ("Room-" + ("0" + Math.floor((Math.random() * 1000) + 1)).slice(-4));
	inputVal.value = "";
	sendRoom(name);
	prompt.evt.toggleActive(prompt.el.room);
});
document.getElementById("newRoomButton").addEventListener("click", function() {
	prompt.evt.toggleActive(prompt.el.room);
});
chat.el.sendButton.addEventListener("click", function() {
	chat.evt.send();
});
chat.el.textBox.addEventListener("keypress", function(event) {
	if (event.keyCode == 13) {
		event.preventDefault();
		chat.evt.send();
	}
});

chat.evt.addAll([
	{
		from: "",
		msg: "Welcome to <b>Chatter</b>!",
		serverMsg: true
	},
	{
		from: "",
		msg: "Click \"Create room\" to make a new room, or join an existing room on the right!",
		serverMsg: true
	}
]);

/* Sample data to view as an example
var userData = [
	{
		name: "Nello"
	},
	{
		name: "The most awesome guy in the world"
	},
	{
		name: "MatthewMob",
		you: true
	},
	{
		name: "Jdubuz"
	}
];
users.evt.addAll(userData);

var roomData = [
	{
		name: "the best chat i've ever seen"
	},
	{
		name: "professional dev talk",
		preConnect: true
	},
	{
		name: "dont join plx"
	},
	{
		name: "hehe"
	}
];
rooms.evt.addAll(roomData);

var chatData = [
	{
		from: "MatthewMob",
		msg: "Hello everyone!"
	},
	{
		from: "Nello",
		msg: "shut up"
	},
	{
		from: "MatthewMob",
		msg: "?"
	},
	{
		msg: "Nello has been permanently banned.",
		serverMsg: true
	},
	{
		from: "Jdubuz",
		msg: "LOL"
	},
	{
		from: "Jdubuz",
		msg: "HAHAHAHAHAHHA"
	},
	{
		from: "MatthewMob",
		msg: "cya guys"
	},
	{
		msg: "MatthewMob has left.",
		serverMsg: true
	},
	{
		from: "Jdubuz",
		msg: "well he's gone..."
	}
];
chat.evt.addAll(chatData);
*/