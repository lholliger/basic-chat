var socket = io();

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

socket.on("ping-return", function() {
  var d = new Date();
  var rt = d.getTime() - msping;
  send("<chatcommand>[COMMAND] Ping took " + rt + " ms</chatcommand>");
});

document.getElementById("chat")
    .addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode == 13) {
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
          send("<chatcommand>[COMMAND]<br>Commands:<br>/help: show list of commands<br>/username [username]: set username<br>/ping: get time for a message to go to a server and back from your computer</chatcommand>");
        } else if (command[0] == "/ping") {
        var d = new Date();
        msping = d.getTime();
        socket.emit("ping-send", "");
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
