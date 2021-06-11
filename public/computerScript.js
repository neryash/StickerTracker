const socket = io({ transports: ['websocket', 'polling', 'flashsocket'], secure:true, rejectUnauthorized: false});

var phone = document.querySelector(".phone");
phone.style.left = "50%";
var toDie = 0;
var vx = 0,lastAcc = 0;
socket.on("movement",function(data){
  console.log(parseInt((phone.style.left).replace("%",""))+parseInt(data.x));
  // var t = performance.now()
  // var v = data.x*(t-toDie);
  vx+=data.x/1;
  if((lastAcc < 0 && data.x > 0) || (lastAcc > 0 && data.x < 0)){
    // vx = 0;
  }
  lastAcc = data.x;
  // phone.style.left=50-(parseInt((phone.style.left).replace("%",""))+parseInt(data.x))/10+"%";
  phone.style.left=50-(parseInt((phone.style.left).replace("%",""))+parseInt(vx))/10+"%";
  // toDie = performance.now() - 100;
})
