const makeCert = require("make-cert")
const {key, cert} = makeCert('192.168.1.35')
console.log(key)
console.log(cert)


const express = require("express");
const app = express();
const https = require("https");
const httpServer = https.createServer({
  key: key,
  cert: cert,
  // ca: fs.readFileSync('./test_ca.crt'),
  requestCert: false,
  rejectUnauthorized: false
},app);
const options = { /* ... */ };
const io = require("socket.io")(httpServer, options);

app.use(express.static("public"))

io.on("connection", socket => {
  console.log("connected");
  socket.on("move",function(data) {
    io.emit("movement",data)
  })
});

app.get("/",function(req,res) {
  res.sendFile(__dirname + "/index.html");
})
app.get("/comp",function(req,res) {
  res.sendFile(__dirname + "/computerHtml.html");
})

httpServer.listen(3000,function(){
  console.log("listening");
});
