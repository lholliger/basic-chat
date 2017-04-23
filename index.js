var app = require('express')();
var emoji = require('node-emoji')
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require("express");
var port = 25501; // port for server to run on
var motd = "<motd>Welcome to BasicChat version 0.1.0<br>To view the list of commands, enter /help in the chat box at the bottom of the page</motd>";      //set this message to what you want to show users every time they log on
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

app.use('/external/', express.static(__dirname + "/static/"));
io.on('connection', function(socket){

});

io.on('connection', function(socket){
  socket.on('join', function(msg){
        msg = clean(msg);
    if (msg == "") {
      io.emit("post", "<server>SERVER:</server> an unnamed user connected");
      this.emit("note", "<server>SERVER:</server> To change your username, type in /username (username)");
    } else {
    io.emit("post", "<server>SERVER: </server>" + msg + " joined the server");
  }
  this.emit("motd", motd);
  });
});

function clean(msg) {
  msg = String(msg);
  msg = msg.replace(/>/g, "&#62;")
  msg = msg.replace(/</g, "&#60;")
  msg = msg.replace("&#60;b&#62;", "<b>");
  msg = msg.replace("&#60;/b&#62;", "</b>");
  msg += "</b>";
  msg = emoji.emojify(msg);
  return msg;
}
io.on('connection', function(socket){
  socket.on('message', function(msg){

    msg = clean(msg);

    io.emit("post", msg);
  });
});

http.listen(port, function(){
  console.log('Server started. listening on port ' + port);
});

io.on('connection', function(socket){
  socket.on('change-username', function(msg){
    msg = msg.split(" ");
        msg = clean(msg);
    console.log("COMMAND: user " + msg[0] + " changed their username to " + msg[1]);
    io.emit("post", "<server>SERVER:</server> user " + msg[0] + " changed their username to " + msg[1]);

  });
});

io.on('connection', function(socket){
  socket.on('afk-on', function(msg){
        msg = clean(msg);
    console.log("COMMAND: afk enabled for " + msg);
    this.emit("post", "<server>AFK: </server><b>" + msg + "</b> is afk");
  });
});
io.on('connection', function(socket){
  socket.on('afk-off', function(msg){
        msg = clean(msg);
    console.log("COMMAND: afk disabled for " + msg);
    this.emit("post", "<server>AFK: </server><b>" + msg + "</b> is now not afk");
  });
});

io.on('connection', function(socket){
  socket.on('ping-send', function(msg){
    console.log("COMMAND: ping");
    this.emit("ping-return", "");
  });
});

setInterval(function() {
  io.emit("online");
}, 5000);
