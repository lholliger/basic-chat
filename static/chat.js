var socket = io();
var notify = false;
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}


function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

var id = getCookie("username");
socket.emit("join", id);

function send(msg) {
  var doc = document.getElementById("window");
  doc.innerHTML = msg + "<br>" + doc.innerHTML;
  notifyMe(msg);
}
socket.on("post", function(msg) {
  send(msg);
});

socket.on("motd", function(msg) {
  send(msg);
});

socket.on("note", function(msg) {
  var doc = document.getElementById("window");
  doc.innerHTML = "<private>[PRIVATE] " + msg + "</private><br>" + doc.innerHTML;
});
var msping;
var afk = false;
var afktime = 60 * 3;
var afkcache = 0;
var stopbd = false;
setInterval(function() {
  afkcache++;
  if (afkcache > afktime) {
    if (stopbd == true) {} else {
    socket.emit("afk-on", id);
    send("<chatcommand>[COMMAND] you are now afk due to inactivity for 3 minutes</chatcommand>");

  }
    stopbd = true;
  }
}, 1000);

socket.on("ping-return", function() {
  var d = new Date();
  var rt = d.getTime() - msping;
  send("<chatcommand>[COMMAND] Ping took " + rt + " ms</chatcommand>");
});

document.getElementById("chat")
    .addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode == 13) {
      afkcache = 0;
      if (afk == true) {
        afk = false;
        stopbd = false;
        send("<chatcommand>[COMMAND] AFK stopped</chatcommand>");
        socket.emit("afk-off", id);
      }
      var message = document.getElementById("chat").value;
      if (message.startsWith("/")) {
        var command = message.split(" ");


        if (command[0] == "/username") {
          if (id == "") {
            socket.emit("change-username", "Unnamed" + " " + command[1]);

          } else {
            socket.emit("change-username", id + " " + command[1]);
          }
          id = command[1];
          setCookie("username", id, 365 * 5);
          send("<chatcommand>[COMMAND] Username set to " + id + "</chatcommand>");
        } else if (command[0] == "/help") {
          send("<chatcommand>[COMMAND]<br>Commands:<br>/help: show list of commands<br>/username [username]: set username<br>/ping: get time for a message to go to a server and back from your computer<br>/afk: go into or out of AFK mode<br>/notify [true/false on/off]: turn on or off notifications</chatcommand>");
        } else if (command[0] == "/ping") {
        var d = new Date();
        msping = d.getTime();
        socket.emit("ping-send", "");
      } else if(command[0] == "/afk") {
        if (afk == true) {
          afk = false;
          stopbd = false;
          send("<chatcommand>[COMMAND] AFK stopped</chatcommand>");
          socket.emit("afk-off", id);
        } else {
          afk = true;
          stopbd = true;
          send("<chatcommand>[COMMAND] AFK enabled</chatcommand>");
          socket.emit("afk-on", id);
        }
      } else if(command[0] == "/notify") {
        if (command[1] == "on" || command[1] == "true") {
          notify = true;
                    send("<chatcommand>[COMMAND] notifications enabled</chatcommand>");

        } else if(command[1] == "off" || command[1] == "false") {
        notify = false;
        send("<chatcommand>[COMMAND] notifications disabled</chatcommand>");

        } else {

        }
    } else {
          send('<chatcommand>[COMMAND] Command "' + command[0] + '" not found</chatcommand>');
        }
        document.getElementById("chat").value = "";


      } else {
      if (id == "") {
        socket.emit("message", "<b>Unnamed</b>: " + message);

      } else {
        socket.emit("message", "<b>" + id + "</b>: " + message);
      }
        document.getElementById("chat").value = "";
    }
  }
});

if (Notification.permission !== "denied") {
Notification.requestPermission(function (permission) {
  // If the user accepts, let's create a notification
  if (permission === "granted") {
    send("<chatcommand>[NOTIFY] notifications permission granted!</chatcommand>");
  } else {
    send("<chatcommand>[NOTIFY] notifications rejected. Please enable them</chatcommand>");

  }
});
}


function notifyMe(message) {
  if (notify == false) {} else {



  message = message.replace(/<(?:.|\n)*?>/gm, '');

  var options = {
      body: message
  }
  var n = new Notification("BasicChat",options);
}
}
var offline = 0;
var offmax = 3;
var offlock = false;
socket.on("online", function() {
  if (offline > offmax) {
    send("<chatcommand>[CONNECT] Connection to server restored</chatcommand>");
  }
  offline = 0;
});

setInterval(function() {
  offline++;
  if (offline > offmax) {
    if (offlock == false) {
    send("<chatcommand>[CONNECT] Connection lost with server</chatcommand>");
    offlock = true;
  }
} else {

  offlock = false;
}

}, 2000);
