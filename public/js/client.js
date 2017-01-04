// Objects for events, functions, interactable elements and templates
var globals = {
	config: {
		roomIDPrefix: "rid-",
		userIDPrefix: "uid-"
	},
	evt: {
		setUsername: function(name) {

		},
		usernamePrompt: function() {

		},
		createChat: function(name) {

		},
		chatroomPrompt: function() {

		}
	}
};
var rooms = {
	el: {
		list: document.querySelector("#rooms .list"),
		template: document.getElementById("template-room")
	},
	evt: {
		add: function(data) {
			var newRoomEl = rooms.el.template.cloneNode(true);
			newRoomEl.setAttribute("id", globals.config.roomIDPrefix + data.name);
			newRoomEl.title = data.name;
			newRoomEl.getElementsByClassName("room-name")[0].innerHTML = data.name;
			if (data.preConnect) {
				newRoomEl.getElementsByClassName("connectionIndicator")[0].classList.toggle("on");
			}
			rooms.el.list.appendChild(newRoomEl);
		},
		remove: function(data) {
			var roomElToRemove = document.getElementById(globals.config.roomIDPrefix + data.name);
			roomElToRemove.parentElement.removeChild(roomElToRemove);
		},
		addAll: function(data) {
			for (var i = 0; i < data.length; i++) {
				rooms.evt.add(data[i]);
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
			msgEl.getElementsByClassName("from")[0].innerHTML = data.from || "";
			msgEl.getElementsByClassName("message")[0].innerHTML = data.msg;
			if (data.serverMsg) {
				msgEl.classList.add("serverMsg");
			}
			chat.el.list.appendChild(msgEl);
		},
		addAll: function(data) {
			for (var i = 0; i < data.length; i++) {
				chat.evt.add(data[i]);
			}
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
			newUserEl.setAttribute("id", globals.config.userIDPrefix + data.name);
			newUserEl.title = newUserEl.innerHTML = data.name;
			if (data.you) {
				newUserEl.classList.add("you");
			}
			users.el.list.appendChild(newUserEl);
		},
		remove: function(data) {
			console.log(data);
			var userElToRemove = document.getElementById(globals.config.userIDPrefix + data.name);
			userElToRemove.parentElement.removeChild(userElToRemove);
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

// Event listeners from client events

// Sample data to view as an example
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