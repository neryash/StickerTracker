const socket = io({ transports: ['websocket', 'polling', 'flashsocket'], secure:true, rejectUnauthorized: false});

var phone = document.querySelector(".phone");
phone.style.left = "50%";
socket.on("movement",function(data){
  // console.log(data);
  distanceUpdate(data.dist)
  rotate(data.yaw);
})

function rotate(deg) {
  phone.style.transform = "translateX(-50%) translateY(-50%) rotate("+deg+"deg)";
}

function distanceUpdate(distance) {
  document.querySelector(".distance").innerHTML = distance+"cm";
}
