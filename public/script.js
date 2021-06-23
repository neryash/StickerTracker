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

var torcha = false;

/* Stream it to video element */
navigator.mediaDevices.getUserMedia(constraints).then(function success(stream) {
  video.srcObject = stream;
  const track = stream.getVideoTracks()[0];

  const imageCapture = new ImageCapture(track)
  const photoCapabilities = imageCapture.getPhotoCapabilities().then(() => {
    const btn = document.querySelector('.switch');
    canvas.addEventListener('click', function(){
      track.applyConstraints({
        advanced: [{torch: torcha}]
      });
      torcha = !torcha;
    });
  });
});

const cavnas = document.querySelector(".canvas");
const ctx = canvas.getContext('2d');
// var black = {r:240,g:170,b:200};
var black = {r:30,g:30,b:30};
var white = {r:230,g:230,b:230};
var generalCorners = {up:{x:0,y:0},down:{x:0,y:0},left:{x:0,y:0},right:{x:0,y:0}};
// var black = {r:220,g:120,b:170};
requestAnimationFrame(function loop() {

  secCounter++;
  if(secCounter == 2){
    // ctx.fillStyle = "hsl(0,100%,50%)";  // saturation at 100%
    ctx.drawImage(video, 0, 0, 400,600);
    ctx.globalCompositeOperation = "saturation";
    ctx.fillStyle = "hsl(0,100%,0%)";  // saturation at 100%
    ctx.fillRect(0,0,canvas.width,canvas.height);  // apply the comp filter
    ctx.globalCompositeOperation = "source-over";
    drawCross(80,10);
    let corners = analysis(80,black,40);
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
    // document.querySelector(".foundDis").innerHTML = distanceBetween(corners.l,corners.b) + " * " + distanceBetween(corners.l,corners.r);
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
var bottomCorner = "";
var refCorner = "";
var STICKER_SIZE = 7;
var pixelSize = (screen.width/calcScreenDPI()*2.54)/screen.width;
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

      if(checkColors({r:pix[i],g:pix[i+1],b:pix[i+2]},color,sensitivity)){
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

    var topMiddle = generalCorners.down[0] < generalCorners.up[0] ? [(generalCorners.left[0]+generalCorners.up[0])/2,(generalCorners.left[1]+generalCorners.up[1])/2] : [(generalCorners.right[0]+generalCorners.up[0])/2,(generalCorners.right[1]+generalCorners.up[1])/2];
    var bottomMiddle = generalCorners.down[0] > generalCorners.up[0] ? [(generalCorners.left[0]+generalCorners.down[0])/2,(generalCorners.left[1]+generalCorners.down[1])/2] : [(generalCorners.right[0]+generalCorners.down[0])/2,(generalCorners.right[1]+generalCorners.down[1])/2];
    var leftMiddle = generalCorners.down[0] > generalCorners.up[0] ? [(generalCorners.left[0]+generalCorners.up[0])/2,(generalCorners.left[1]+generalCorners.up[1])/2] : [(generalCorners.left[0]+generalCorners.down[0])/2,(generalCorners.left[1]+generalCorners.down[1])/2];
    var rightMiddle = generalCorners.down[0] < generalCorners.up[0] ? [(generalCorners.right[0]+generalCorners.up[0])/2,(generalCorners.right[1]+generalCorners.up[1])/2] : [(generalCorners.right[0]+generalCorners.down[0])/2,(generalCorners.right[1]+generalCorners.down[1])/2];
    var centerPoint = getMiddleOfPoints({up:topMiddle,down:bottomMiddle});

    var pixelDistance = Math.sqrt(Math.pow(leftMiddle[0]-rightMiddle[0],2)+Math.pow(leftMiddle[1]-rightMiddle[0],2));
    var height = STICKER_SIZE/pixelDistance*335;
    document.querySelector(".colorDis").innerHTML = (height+"").substring(0,5);

    ctx.moveTo(canvas.width/2-size+generalCorners.left[0],canvas.height/2-size+generalCorners.left[1]);
    ctx.lineTo(canvas.width/2-size+generalCorners.up[0],canvas.width/2-size+generalCorners.up[1]);
    ctx.lineTo(canvas.width/2-size+generalCorners.right[0],canvas.height/2-size+generalCorners.right[1]);
    ctx.lineTo(canvas.width/2-size+generalCorners.down[0],canvas.height/2-size+generalCorners.down[1]);
    ctx.lineTo(canvas.width/2-size+generalCorners.left[0],canvas.height/2-size+generalCorners.left[1]);
    ctx.stroke();
    ctx.strokeStyle = "black"
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(canvas.width/2-size+topMiddle[0]-10,canvas.width/2-size+topMiddle[1]-10,20,20); //TOP MIDDLE WORKS
    ctx.rect(canvas.width/2-size+bottomMiddle[0]-10,canvas.width/2-size+bottomMiddle[1]-10,20,20); //BOTTOM MIDDLE WORKS
    ctx.rect(canvas.width/2-size+leftMiddle[0]-10,canvas.width/2-size+leftMiddle[1]-10,20,20); //LEFT MIDDLE WORKS
    ctx.rect(canvas.width/2-size+rightMiddle[0]-10,canvas.width/2-size+rightMiddle[1]-10,20,20); //RIGHT MIDDLE WORKS
    ctx.rect(canvas.width/2-size+centerPoint[0]-10,canvas.width/2-size+centerPoint[1]-10,20,20); //MIDDLE WORKS
    ctx.moveTo(canvas.width/2-size+topMiddle[0],canvas.width/2-size+topMiddle[1]);
    ctx.lineTo(canvas.width/2-size+bottomMiddle[0],canvas.width/2-size+bottomMiddle[1]);
    ctx.moveTo(canvas.width/2-size+leftMiddle[0],canvas.width/2-size+leftMiddle[1]);
    ctx.lineTo(canvas.width/2-size+rightMiddle[0],canvas.width/2-size+rightMiddle[1]);
    ctx.stroke();

    var middleOfSquares = {tl:getMiddleOfPoints({up:leftMiddle,down:topMiddle}),
      tr:getMiddleOfPoints({up:rightMiddle,down:topMiddle}),
      br:getMiddleOfPoints({up:bottomMiddle,down:rightMiddle}),
      bl:getMiddleOfPoints({up:bottomMiddle,down:leftMiddle})};

    if(checkColors(imagePixels[Math.floor(middleOfSquares.tr[1])][Math.floor(middleOfSquares.tr[0])],white,30)){
      bottomCorner = "tr";
      refCorner = "br";
    }
    if(checkColors(imagePixels[Math.floor(middleOfSquares.tl[1])][Math.floor(middleOfSquares.tl[0])],white,30)){
      bottomCorner = "tl";
      refCorner = "tr";
    }
    if(checkColors(imagePixels[Math.floor(middleOfSquares.br[1])][Math.floor(middleOfSquares.br[0])],white,30)){
      bottomCorner = "br";
      refCorner = "bl";
    }
    if(checkColors(imagePixels[Math.floor(middleOfSquares.bl[1])][Math.floor(middleOfSquares.bl[0])],white,30)){
      bottomCorner = "bl";
      refCorner = "tl";
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = "yellow";
    ctx.beginPath();
    // for(var i = 0; i < imagePixels.length; i++){
    //   for(var j = 0; j < imagePixels[i].length; j++){
    //     if(checkColors(imagePixels[i][j],white,sensitivity)){
    //       ctx.rect(canvas.width/2-size+j-0,canvas.width/2-size+i-0,1,1);
    //     }
    //   }
    // }
    ctx.stroke();

    ctx.strokeStyle = "red"
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(canvas.width/2-size+middleOfSquares.tl[0]-10,canvas.width/2-size+middleOfSquares.tl[1]-10,20,20);
    ctx.rect(canvas.width/2-size+middleOfSquares.br[0]-10,canvas.width/2-size+middleOfSquares.br[1]-10,20,20);
    ctx.rect(canvas.width/2-size+middleOfSquares.tr[0]-10,canvas.width/2-size+middleOfSquares.tr[1]-10,20,20);
    ctx.rect(canvas.width/2-size+middleOfSquares.bl[0]-10,canvas.width/2-size+middleOfSquares.bl[1]-10,20,20);
    ctx.stroke();
    ctx.strokeStyle = "blue"
    ctx.lineWidth = 2;
    ctx.beginPath();
    if(bottomCorner != ""){
      console.log(middleOfSquares[bottomCorner]);
      ctx.rect(canvas.width/2-size+middleOfSquares[bottomCorner][0]-10,canvas.width/2-size+middleOfSquares[bottomCorner][1]-10,20,20);
      let angle = calculateAngleFromX({x:middleOfSquares[bottomCorner][0],y:middleOfSquares[bottomCorner][1]},{x:middleOfSquares[refCorner][0],y:middleOfSquares[refCorner][1]})
      document.querySelector(".foundDis").innerHTML = Math.floor(angle);
      transmitData(angle,height,0);
    }
    ctx.stroke();

    return {l:[generalCorners.left[0],generalCorners.left[1]],
    r:[generalCorners.right[0],generalCorners.right[1]],
    t:[generalCorners.up[0],generalCorners.up[1]],
    b:[generalCorners.down[0],generalCorners.down[1]]}
  }
  return false;

}

function calcScreenDPI() {
    const el = document.createElement('div');
    el.style = 'width: 1in;'
    document.body.appendChild(el);
    const dpi = el.offsetWidth;
    document.body.removeChild(el);

    return dpi;
}

function calculateAngleFromX(pointa,pointb){
  return Math.atan2((pointa.y-pointb.y),(pointa.x-pointb.x))*180 / Math.PI;
}

function checkColors(colora,colorb,marginOfErr) {
  if(marginOfErr == 0){
    marginOfErr = 1;
  }
  // console.log(colora.r,colorb.r);
  if(within(colora.r,colorb.r,marginOfErr)&& within(colora.g,colorb.g,marginOfErr)&&within(colora.b,colorb.b,marginOfErr)){
    return true;
  }
  return false;
}

function within(numa,numb,numc) {
  if(numa<numb+numc && numa > numb-numc){
    return true;
  }
  return false;
}

function getMiddleOfPoints(points){
  return [(points.up[0]+points.down[0])/2,(points.up[1]+points.down[1])/2]
}

function transmitData(yaw,distance,roll){
  socket.emit("move",{yaw:yaw,dist:distance,roll:roll});
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
