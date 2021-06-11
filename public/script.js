const socket = io({ transports: ['websocket', 'polling', 'flashsocket'], secure:true, rejectUnauthorized: false});
/*ACCELERATION SCRIPT*/
/*
let acl = new LinearAccelerationSensor({frequency: 60});

acl.addEventListener('reading', () => {
    console.log("Acceleration along the X-axis " + acl.x);
    console.log("Acceleration along the Y-axis " + acl.y);
    console.log("Acceleration along the Z-axis " + acl.z);
    document.querySelector(".grogu").innerHTML = acl.x+"gg";
    socket.emit("move", {x:acl.x,y:acl.y,z:acl.z});
});

acl.start();
*/
var secCounter = 0;
var video = document.querySelector('.video');
video.setAttribute('playsinline', '');
video.setAttribute('autoplay', '');
video.setAttribute('muted', '');
video.style.width = '200px';
video.style.height = '200px%';

/* Setting up the constraint */
var facingMode = "environment"; // Can be 'user' or 'environment' to access back or front camera (NEAT!)
var constraints = {
  audio: false,
  video: {
   facingMode: facingMode
  }
};

/* Stream it to video element */
navigator.mediaDevices.getUserMedia(constraints).then(function success(stream) {
  video.srcObject = stream;
});

const cavnas = document.querySelector(".canvas");
const ctx = canvas.getContext('2d');
// var red = {r:240,g:170,b:200};
var red = {r:200,g:90,b:100};
var white = {r:230,g:200,b:200};
requestAnimationFrame(function loop() {
  ctx.drawImage(video, 0, 0, 400,600);
  drawCross(80,10);
  secCounter++;
  // if(secCounter == 2){
    analysis(80,red,30);
    secCounter=0;
  // }
  requestAnimationFrame(loop);
});
var pix;
function drawCross(size,middleSquare) {
  ctx.strokeStyle = "yellow"
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.rect(canvas.width/2-middleSquare/2,canvas.height/2-middleSquare/2,middleSquare,middleSquare);
  ctx.moveTo(cavnas.width/2-size/2, canvas.height/2-size);
  ctx.lineTo(cavnas.width/2-size, canvas.height/2-size);
  ctx.lineTo(cavnas.width/2-size, canvas.height/2-size/2);
  ctx.moveTo(cavnas.width/2+size/2, canvas.height/2-size);
  ctx.lineTo(cavnas.width/2+size, canvas.height/2-size);
  ctx.lineTo(cavnas.width/2+size, canvas.height/2-size/2);

  ctx.moveTo(cavnas.width/2-size/2, canvas.height/2+size);
  ctx.lineTo(cavnas.width/2-size, canvas.height/2+size);
  ctx.lineTo(cavnas.width/2-size, canvas.height/2+size/2);
  ctx.moveTo(cavnas.width/2+size/2, canvas.height/2+size);
  ctx.lineTo(cavnas.width/2+size, canvas.height/2+size);
  ctx.lineTo(cavnas.width/2+size, canvas.height/2+size/2);
  ctx.stroke();
}
var imagePixels = [];
var generalCorners = {};
function analysis(size,color,sensitivity) {
  var imgd = ctx.getImageData(cavnas.width/2-size, canvas.height/2-size, size*2,size*2);
  pix = imgd.data;
  imagePixels = [];
  var colorFound = false;
  generalCorners={};
  var currX = 0,currY = 0;
  var row = [];
  for (var i = 0, n = pix.length; i < n; i += 4) {
    row.push({r:pix[i],g:pix[i+1],b:pix[i+2]});
    currX++;
    if(currX>=Math.sqrt(pix.length/4)){
      currX = 0;
      currY++;
      // imagePixels.push(row);
    }
    if(pix[i] > color.r-sensitivity && pix[i] < color.r+sensitivity && pix[i+1] > color.g-sensitivity && pix[i+1] < color.g+sensitivity && pix[i+2] > color.b-sensitivity && pix[i+2] < color.b+sensitivity){
      pix[i] = 0;
      pix[i] = 0;
      pix[i] = 0;
      colorFound = true;

      // var currY = Math.ceil(i/Math.sqrt(pix.length/4));
      if(generalCorners.left == undefined || currX < generalCorners.left){
        pix[i] = 0;
        pix[i+1] = 255;
        pix[i+2] = 0;
        generalCorners.left = currX;
      }
      if(generalCorners.right == undefined || currX > generalCorners.right){
        pix[i] = 0;
        pix[i+1] = 255;
        pix[i+2] = 0;
        generalCorners.right = currX;
      }
      if(generalCorners.up == undefined || currY < generalCorners.up){
        pix[i] = 0;
        pix[i+1] = 255;
        pix[i+2] = 0;
        generalCorners.up = currY;
      }
      if(generalCorners.down == undefined || currY > generalCorners.down){
        pix[i] = 0;
        pix[i+1] = 255;
        pix[i+2] = 0;
        generalCorners.down = currY;
      }
    }
  }

  if(colorFound){
    document.querySelector(".foundDis").innerHTML = "OK";
  }else{
    document.querySelector(".foundDis").innerHTML = "NO";
  }
  var middle = findMiddle(pix);
  document.querySelector(".colorDis").innerHTML = pix[middle] + ", " + pix[middle+1] + ", " + pix[middle+2];
  document.querySelector(".colorView").style.backgroundColor = "rgb("+pix[middle] + ","+ pix[middle+1] + ", " + pix[middle+2]+")"
  pix[middle] = 0;
  pix[middle+1] = 0;
  pix[middle+2] = 0;
  // Draw the ImageData at the given (x,y) coordinates.
  ctx.putImageData(imgd, cavnas.width/2-size, canvas.height/2-size);
  ctx.strokeStyle = "green"
  ctx.lineWidth = 2;
  ctx.beginPath();
ctx.moveTo(canvas.width/2-size+generalCorners.left,0);
ctx.lineTo(canvas.width/2-size+generalCorners.left,canvas.height);
ctx.moveTo(canvas.width/2-size+generalCorners.right,0);
ctx.lineTo(canvas.width/2-size+generalCorners.right,canvas.height);
ctx.moveTo(0,canvas.height/2-size+generalCorners.up);
ctx.lineTo(canvas.width,canvas.height/2-size+generalCorners.up);
ctx.moveTo(0,canvas.height/2-size+generalCorners.down);
ctx.lineTo(canvas.width,canvas.height/2-size+generalCorners.down);
ctx.stroke();

}
function findMiddle(arr) {
  var m = arr.length/2;
  while(m%4 != 0){
    m--;
  }
  return m+Math.floor(Math.sqrt(arr.length/4)*2);
}
