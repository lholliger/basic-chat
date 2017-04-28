var app = require('express')();
var Filter = require('bad-words')
var emoji = require('node-emoji')
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require("express");
var fs = require('fs');
filter = new Filter();
var port = 25501; // port for server to run on
var motd = "";

var user_ver = JSON.parse(fs.readFileSync(__dirname + '/data/ids', 'utf8'));
var unam_ver = JSON.parse(fs.readFileSync(__dirname + '/data/uss', 'utf8'));
var itadmin = fs.readFileSync(__dirname + '/data/admin', 'utf8');


app.get('/', function(req, res){
  res.sendFile(__dirname + '/static/index.html');
});
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
    next();
});
var onlinep = 0;
app.use('/external/', express.static(__dirname + "/static/"));
io.on('connection', function(socket){

});

io.on('connection', function(socket){
  socket.on('join', function(msg){
    if (typeof msg == "object") {
      if (msg.length == 2) {
        username = clean(msg[0]);
    if (msg[0] == "") {
      io.emit("post", "<server>SERVER:</server> an unnamed user connected");
      this.emit("note", "<server>SERVER:</server> To change your username, type in /username (username)");
    } else {

      var app;
      if (user_ver.indexOf(msg[1]) != -1) {
        if (unam_ver[user_ver.indexOf(msg[1])] == msg[0]) {
        app = "<font color='#1DCAFF'>√</font> ";
      } else {
        app = "";
      }
      } else {
        app = "NI";
      }

    io.emit("post", "<server>SERVER: </server>" + app + username + " joined the server");
  }
  motd = "<motd>Welcome to BasicChat version 0.1.0<br>To view the list of commands, enter /help in the chat box at the bottom of the page<br>View the source at <a href='https://github.com/DatOneLefty/basic-chat'>https://github.com/DatOneLefty/basic-chat</a><br>There is currently " + onlinep + " online</motd>";      //set this message to what you want to show users every time they log on
  this.emit("motd", motd);
} else {
  this.emit("note", "<server>ERROR:</server> join array error. you may want to reset your browser cache");

}
} else {
  this.emit("note", "<server>ERROR:</server> join array error. you may want to reset your browser cache");

}
  });
});

function clean(msg) {
  msg = String(msg);
  msg = msg.replace(/>/g, "&#62;")
  msg = msg.replace(/</g, "&#60;")
  msg = msg.replace(/[^A-Za-z 0-9 \.,\?""'!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '');
  msg = msg.substring(0,500);
  msg = filter.clean(msg);
  msg = emoji.emojify(msg);
  return msg;
}

function addFormatting(item) {
  item = item.split(" ");
  var i = 0;
  item.forEach(function(ite) {
    if (ite.startsWith("https://")) {
      item[i] = "<a href='" + ite + 'target="_blank' + "'>" + ite + "</a>";
    }
    if (ite.startsWith("http://")) {
      item[i] = "<a href='" + ite  + 'target="_blank' +  "'>" + ite + "</a>";
    }
    i++;
  });
  return item.join(" ");
}



io.on('connection', function(socket){
  socket.on('message', function(msg){
    if (msg != "") {
          if (typeof msg == "object") {
            if (msg.length == 3) {
              if (msg[2] != "") {
              if (user_ver.indexOf(msg[2]) != -1) {
                if (unam_ver[user_ver.indexOf(msg[2])] == msg[0]) {
                app = "<font color='#1DCAFF'>√</font> ";
              } else {
                app = "";
              }
              } else {
                app = "";
              }

              if (msg[2] == itadmin.replace(/\n|\r/g, "")) {
                msg[0] = "<font color='cyan'>" + msg[0] + "</font>";
              }

              if (msg[2] == "BasicBot") {
                msg[0] = "<font color='#f27e1f'>" + msg[0] + "</font>";
              }
              msg = "<b>" + app  + msg[0] + ": </b>" + addFormatting(clean(msg[1]));
              io.emit("post", msg);
            } else {
              this.emit("note", "<server>SERVER:</server> you cannot send empty messages");

            }
    } else {
      this.emit("note", "<server>SERVER:</server> message not sent properly, clear browser cache?");
    }

    } else {
      this.emit("note", "<server>SERVER:</server> message is not array, clear browser cache?");
    }
    });
  }
});

http.listen(port, function(){
  console.log('Server started. listening on port ' + port);
});

io.on('connect', function () {
onlinep++;
});

io.on('connection', function(socket){
  socket.on('disconnect', function () {
onlinep--;
  });

  socket.on('change-username', function(msg){
    if (typeof msg == "string") {
      msg = msg + " ";
    msg = msg.split(" ");

        msg = [clean(msg[0]),clean(msg[1])];
    console.log("COMMAND: user " + msg[0] + " changed their username to " + msg[1]);
    io.emit("post", "<server>SERVER:</server> user " + msg[0] + " changed their username to " + msg[1]);
} else {
  this.emit("note", "<server>SERVER:</server> trying to crash my server...hmmmm?");

}
  });
});

io.on('connection', function(socket){
  socket.on('afk-on', function(msg){
        username = clean(msg[0]);
        if (username == "") {
          console.log("COMMAND: afk enabled for an unnamed user");
          io.emit("post", "<server>AFK: </server>an unnamed user is afk");
        } else {

          if (typeof msg == "object") {
            if (msg.length == 2) {
              if (user_ver.indexOf(msg[1]) != -1) {
                if (unam_ver[user_ver.indexOf(msg[1])] == msg[0]) {
                app = "<font color='#1DCAFF'>√</font> ";
              } else {
                app = "";
              }
              } else {
                app = "";
              }
              if (msg[1] == itadmin.replace(/\n|\r/g, "")) {
                username = "<font color='cyan'>" + username + "</font>";
              }
              console.log("COMMAND: afk enabled for " + msg);
              io.emit("post", "<server>AFK: </server><b>" + app + username + "</b> is afk");
          } else {
          this.emit("note", "<server>SERVER:</server> verification array issue, clear browser cache?");
          }

          } else {
          this.emit("note", "<server>SERVER:</server> verification array issue, clear browser cache?");
          }



  }
  });
});
io.on('connection', function(socket){
  socket.on('afk-off', function(msg){
        username = clean(msg[0]);
                if (username == "") {
                  console.log("COMMAND: afk disabled for an unnamed user");
                  io.emit("post", "<server>AFK: </server>an unnamed user is now not afk");
                } else {


                  if (typeof msg == "object") {
                    if (msg.length == 2) {
                      if (user_ver.indexOf(msg[1]) != -1) {
                        if (unam_ver[user_ver.indexOf(msg[1])] == msg[0]) {
                        app = "<font color='#1DCAFF'>√</font> ";
                      } else {
                        app = "";
                      }
                      } else {
                        app = "";
                      }

                      if (msg[1] == itadmin.replace(/\n|\r/g, "")) {
                        username = "<font color='cyan'>" + username + "</font>";
                      }
                      console.log("COMMAND: afk disabled for " + username);
                      io.emit("post", "<server>AFK: </server><b>" + app + username + "</b> is now not afk");
                  } else {
                  this.emit("note", "<server>SERVER:</server> verification array issue, clear browser cache?");
                  }

                  } else {
                  this.emit("note", "<server>SERVER:</server> verification array issue, clear browser cache?");
                  }

  }
  });
});

io.on('connection', function(socket){
  socket.on('get-logged-in', function(msg){
        this.emit("current", onlinep);
  });
});


io.on('connection', function(socket){
  socket.on('ping-send', function(msg){
    console.log("COMMAND: ping");
    this.emit("ping-return", "");
  });
});

io.on('connection', function(socket){
  socket.on('adm-command', function(msg){
    if (typeof msg == "object") {
      if (msg.length == 2) {
        if (msg[0] != itadmin.replace(/\n|\r/g, "")) {
          this.emit("note", "<server>SERVER:</server> authentication denied");

        } else {
          command = msg[1];
          console.log("SERVER RUN: " + msg);
          if (command[1] == "reload") {
            user_ver = JSON.parse(fs.readFileSync(__dirname + '/data/ids', 'utf8'));
            unam_ver = JSON.parse(fs.readFileSync(__dirname + '/data/uss', 'utf8'));
            itadmin = fs.readFileSync(__dirname + '/data/admin', 'utf8');
            this.emit("note", "<server>SERVER:</server> reloaded verification settings");
          }
          else if (command[1] == "verify") {
            var vid = command[2];
            var uid = command[3];
            user_ver = user_ver.concat(vid);
            unam_ver = unam_ver.concat(uid);
            fs.writeFile(__dirname + "/data/ids", JSON.stringify(user_ver));
            fs.writeFile(__dirname + "/data/uss", JSON.stringify(unam_ver));
            this.emit("note", "<server>SERVER:</server> verified user " + uid + " with the id of " + vid);

          } else if (command[1] == "help") {
            this.emit("note", "<server>SERVER:</server> HELP: <br>reload: reload verification<br>verify [id] [name]: add verified user");

          } else {
            this.emit("note", "<server>SERVER:</server> unknown command");
          }
        }
      } else {
        this.emit("note", "<server>SERVER:</server> verification array issue, clear browser cache?");

      }
    } else {
      this.emit("note", "<server>SERVER:</server> verification array issue, clear browser cache?");

    }
  });
});




setInterval(function() {
  io.emit("online");
}, 5000);
