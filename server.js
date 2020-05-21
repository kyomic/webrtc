var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

server.listen(3000);
app.use(express.static(__dirname+"/src/"))
app.get("/",function(req,res){
	res.sendfile(__dirname+"/index.html");
})

io.on("connection",function(socket){
	socket.on("message", function(data){
		var message = JSON.parse(data);
		if( message.type ){
			console.log(message.type)
		}else{
			console.log(message.event)
		}
		console.log("请求已经广播:", data)
		socket.broadcast.emit("message", message)
	})
})