const socket = io({ transports: ['websocket', 'polling', 'flashsocket'], secure:true, rejectUnauthorized: false});


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
// var black = {r:240,g:170,b:200};
var black = {r:30,g:30,b:30};
var generalCorners = {up:{x:0,y:0},down:{x:0,y:0},left:{x:0,y:0},right:{x:0,y:0}};
// var black = {r:220,g:120,b:170};
var white = {r:230,g:200,b:200};
requestAnimationFrame(function loop() {

  secCounter++;
  if(secCounter == 1){
    ctx.drawImage(video, 0, 0, 400,600);
    drawCross(80,10);
    let corners = analysis(80,black,30);
    getQuarters(corners);
    secCounter=0;
  }
  requestAnimationFrame(loop);
});

function distanceBetween(point,pointa){
  return Math.floor(Math.sqrt(Math.pow(point[0]-pointa[0],2)+Math.pow(point[1]-pointa[1],2)))
}

function getQuarters(corners){
  if(corners){
    console.log(corners);
    document.querySelector(".foundDis").innerHTML = distanceBetween(corners.l,corners.b) + " * " + distanceBetween(corners.l,corners.r);
  }

}

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
        imagePixels.push(row);
        row = [];
      }
      if(pix[i] > color.r-sensitivity && pix[i] < color.r+sensitivity && pix[i+1] > color.g-sensitivity && pix[i+1] < color.g+sensitivity && pix[i+2] > color.b-sensitivity && pix[i+2] < color.b+sensitivity){
        // pix[i] = 0;
        // pix[i+1] = 0;
        // pix[i+2] = 0;
        colorFound = true;
        if(generalCorners.left == undefined || currX < generalCorners.left[0]){
          generalCorners.left = [currX,currY];
        }
        if(generalCorners.right == undefined || currX > generalCorners.right[0]){
          generalCorners.right = [currX,currY];
        }
        if(generalCorners.up == undefined || currY < generalCorners.up[1]){
          generalCorners.up = [currX,currY];
        }
        if(generalCorners.down == undefined || currY > generalCorners.down[1]){
          generalCorners.down = [currX,currY];
        }
      }
    }
  for(var i = generalCorners.left; i < 200; i++){

  }
  var middle = findMiddle(pix);
  document.querySelector(".colorDis").innerHTML = pix[middle] + ", " + pix[middle+1] + ", " + pix[middle+2];
  document.querySelector(".colorView").style.backgroundColor = "rgb("+pix[middle] + ","+ pix[middle+1] + ", " + pix[middle+2]+")"
  pix[middle] = 0;
  pix[middle+1] = 0;
  pix[middle+2] = 0;

  ctx.putImageData(imgd, cavnas.width/2-size, canvas.height/2-size);

  if(JSON.stringify(generalCorners) != "{}"){
    ctx.strokeStyle = "green"
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(canvas.width/2-size+generalCorners.left[0]-10,canvas.width/2-size+generalCorners.left[1]-10,20,20);
    ctx.rect(canvas.width/2-size+generalCorners.right[0]-10,canvas.width/2-size+generalCorners.right[1]-10,20,20);
    ctx.rect(canvas.width/2-size+generalCorners.down[0]-10,canvas.width/2-size+generalCorners.down[1]-10,20,20);
    ctx.rect(canvas.width/2-size+generalCorners.up[0]-10,canvas.width/2-size+generalCorners.up[1]-10,20,20);

    // ctx.moveTo(canvas.width/2-size+generalCorners.left[0],0);
    // ctx.lineTo(canvas.width/2-size+generalCorners.left[0],canvas.height);
    // ctx.moveTo(canvas.width/2-size+generalCorners.right[0],0);
    // ctx.lineTo(canvas.width/2-size+generalCorners.right[0],canvas.height);
    // ctx.moveTo(0,canvas.height/2-size+generalCorners.up[1]);
    // ctx.lineTo(canvas.width,canvas.height/2-size+generalCorners.up[1]);
    // ctx.moveTo(0,canvas.height/2-size+generalCorners.down[1]);
    // ctx.lineTo(canvas.width,canvas.height/2-size+generalCorners.down[1]);
    // ctx.stroke();
    var topMiddle = generalCorners.down[0] < generalCorners.up[0] ? [(canvas.width/2-size+generalCorners.left[0]+canvas.width/2-size+generalCorners.up[0])/2,(canvas.height/2-size+generalCorners.left[1]+canvas.height/2-size+generalCorners.up[1])/2] : [(canvas.width/2-size+generalCorners.right[0]+canvas.width/2-size+generalCorners.up[0])/2,(canvas.height/2-size+generalCorners.right[1]+canvas.height/2-size+generalCorners.up[1])/2];
    var bottomMiddle = generalCorners.down[0] > generalCorners.up[0] ? [(canvas.width/2-size+generalCorners.left[0]+canvas.width/2-size+generalCorners.down[0])/2,(canvas.height/2-size+generalCorners.left[1]+canvas.height/2-size+generalCorners.down[1])/2] : [(canvas.width/2-size+generalCorners.right[0]+canvas.width/2-size+generalCorners.down[0])/2,(canvas.height/2-size+generalCorners.right[1]+canvas.height/2-size+generalCorners.down[1])/2];
    var middles = {t:[(canvas.width/2-size+generalCorners.left[0]+canvas.width/2-size+generalCorners.up[0])/2,(canvas.height/2-size+generalCorners.left[1]+canvas.height/2-size+generalCorners.up[1])/2],
    l:[(canvas.width/2-size+generalCorners.left[0]+canvas.width/2-size+generalCorners.down[0])/2,(canvas.height/2-size+generalCorners.left[1]+canvas.height/2-size+generalCorners.down[1])/2],
    r:[(canvas.width/2-size+generalCorners.right[0]+canvas.width/2-size+generalCorners.down[0])/2,(canvas.height/2-size+generalCorners.right[1]+canvas.height/2-size+generalCorners.down[1])/2],
    b:[(canvas.width/2-size+generalCorners.left[0]+canvas.width/2-size+generalCorners.up[0])/2,(canvas.height/2-size+generalCorners.left[1]+canvas.height/2-size+generalCorners.up[1])/2],}
    ctx.moveTo(canvas.width/2-size+generalCorners.left[0],canvas.height/2-size+generalCorners.left[1]);
    ctx.lineTo(canvas.width/2-size+generalCorners.up[0],canvas.width/2-size+generalCorners.up[1]);
    ctx.lineTo(canvas.width/2-size+generalCorners.right[0],canvas.height/2-size+generalCorners. right[1]);
    ctx.lineTo(canvas.width/2-size+generalCorners.down[0],canvas.height/2-size+generalCorners.down[1]);
    ctx.lineTo(canvas.width/2-size+generalCorners.left[0],canvas.height/2-size+generalCorners.left[1]);
    ctx.stroke();
    ctx.strokeStyle = "black"
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(topMiddle[0]-10,topMiddle[1]-10,20,20); //TOP MIDDLE WORKS
    ctx.rect(bottomMiddle[0]-10,bottomMiddle[1]-10,20,20); //BOTTOM MIDDLE WORKS
    // ctx.rect(middles.l[0]-10,middles.l[1]-10,20,20);
    // ctx.rect(middles.r[0]-10,middles.r[1]-10,20,20);
    // ctx.rect(middles.b[0]-10,middles.b[1]-10,20,20);
    ctx.stroke();
    ctx.strokeStyle = "red"
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(canvas.width/2-size+generalCorners.up[0]-10,canvas.width/2-size+generalCorners.up[1]-10,20,20);
    ctx.stroke();

    return {l:[generalCorners.left[0],generalCorners.left[1]],
    r:[generalCorners.right[0],generalCorners.right[1]],
    t:[generalCorners.up[0],generalCorners.up[1]],
    b:[generalCorners.down[0],generalCorners.down[1]]}
  }
  return false;

}

function getSide(startCoor,imageArr,color,sensitivity,size) {
  // console.log(imageArr);
  var coors = [];
  var yIndex = startCoor[1],xIndex = 0, drawColor = "pink";
  for(var i = startCoor[0]; i < imageArr.length; i+=2){
    let colorFounda = false;
    while(!colorFounda){
      drawColor = "pink"
      if(yIndex >= imageArr[i].length/3){
        drawColor = "blue"
        colorFounda = true;
        break;
      }
      xIndex = i;
      // console.log(imageArr[i][yIndex].r > color.r-sensitivity && imageArr[i][yIndex].r < color.r+sensitivity && imageArr[i][yIndex].g > color.g-sensitivity && imageArr[i][yIndex].g < color.g+sensitivity && imageArr[i][yIndex].b > color.b-sensitivity && imageArr[i][yIndex].b < color.b+sensitivity);
      if(imageArr[i][yIndex].r > color.r-sensitivity && imageArr[i][yIndex].r < color.r+sensitivity && imageArr[i][yIndex].g > color.g-sensitivity && imageArr[i][yIndex].g < color.g+sensitivity && imageArr[i][yIndex].b > color.b-sensitivity && imageArr[i][yIndex].b < color.b+sensitivity){
        coors.push([xIndex,yIndex])
        colorFounda = true;
        break;
      }else{
        yIndex++;
      }
    }

  }
  ctx.strokeStyle = "black"
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(canvas.width/2-size+startCoor[0]-0,canvas.height/2-size+startCoor[1]-0);
  for(var i = 0; i < coors.length; i++){
    if(i == 0){
      ctx.lineTo(canvas.width/2-size+coors[i][0]-0+startCoor[0],canvas.height/2-size+coors[i][1]-0);
      ctx.stroke();
      ctx.strokeStyle = "purple"
      ctx.lineWidth = 2;
      ctx.beginPath();
    }
    ctx.lineTo(canvas.width/2-size+coors[i][0]-0+startCoor[0],canvas.height/2-size+coors[i][1]-0);
  }
  // ctx.lineTo(xIndex,yIndex);
  // ctx.lineTo(canvas.width/2-size+xIndex-0,canvas.height/2-size+yIndex-0);
  ctx.stroke();
}

function findMiddle(arr) {
  var m = arr.length/2;
  while(m%4 != 0){
    m--;
  }
  return m+Math.floor(Math.sqrt(arr.length/4)*2);
}
