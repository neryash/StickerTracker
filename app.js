const express = require("express");
const app = express();
const httpServer = require("http").createServer(app);
const options = { /* ... */ };
const io = require("socket.io")(httpServer, options);

app.use(express.static("public"))

io.on("connection", socket => {
  socket.on("time",function(data) {
    console.log(data);
  })
});

app.get("/phone",function(req,res) {
  res.sendFile(__dirname + "/index.html");
})

httpServer.listen(3000,function(){
  console.log("listening");
});
