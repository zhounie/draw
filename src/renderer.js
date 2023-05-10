
const { desktopCapturer, remote } = require('electron')

const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, './public/pen.png')

const importImage = document.getElementById('import-image');

const canvas = document.getElementById('canvas')
const plan = document.getElementById('draw-plan')
canvas.width = plan.clientWidth - 20
canvas.height = plan.clientHeight - 20

window.onresize = () => {
  canvas.width = plan.clientWidth - 20
  canvas.height = plan.clientHeight - 20
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}



const ctx = canvas.getContext('2d');
ctx.fillStyle = '#fff'
ctx.fillRect(0, 0, canvas.width, canvas.height);


let penColor = '#000000'
ctx.strokeStyle = penColor

ctx.lineJoin="round";
ctx.lineCap="round";
ctx.lineWidth = 10;
// fs.readFile()
console.log(filePath);
const img = new Image();
img.src = filePath
img.onload = function() {
  // 将自定义鼠标图像绑定到 Canvas 元素
  // canvas.style.cursor = ``;
};


let drawing = false;
let lastX = 0;
let lastY = 0;

const createInput = (e) => {
  let inputDom = plan.getElementsByTagName('input')
  if (inputDom.length) {
    for(var i = 0; i < inputDom.length; i++) {
      inputDom[i].blur()
    }
  }
  const input = document.createElement('input')
  input.id = 'text-input'
  input.type = 'text'
  input.style.left = `${e.offsetX}px`
  input.style.top = `${e.offsetY}px`
  input.autofocus = true
  input.onkeydown = (e) => {
    const code = e.code
    if (code === 'Enter') {
      input.blur()
    }
  }
  input.onblur = () => {
    const text = input.value
    let inputDom = plan.getElementsByTagName('input')
    if (inputDom.length) {
      for(var i = 0; i < inputDom.length; i++) {
        plan.removeChild(inputDom[i])
      }
    }
    // plan.removeChild(input)
    if (text.length > 0) {
      ctx.font = '24px sans-serif';
      ctx.fillStyle = getColor()
      ctx.fillText(text, e.offsetX, e.offsetY);
    }
  }
  plan.appendChild(input)
}

function onImportImage (e) {
  importImage.click()
}

let isClip = false
function onClip (e) {
  isClip = true
  const box = document.getElementById('canvas-box')
  console.log(box);
  box.onmousedown = function(e) {
    var posx = e.offsetX;
    var posy = e.offsetY;
    console.log(posx);
    var div = document.createElement("div");
    div.className = "tempDiv";
    div.style.left = e.offsetX + "px";
    div.style.top = e.offsetY + "px";
    box.appendChild(div);
    box.onmousemove = function(ev) {
      div.style.left = Math.min(ev.offsetX, posx) + "px";
      div.style.top = Math.min(ev.offsetY, posy) + "px";
      div.style.width = Math.abs(posx - ev.offsetX) + "px";
      div.style.height = Math.abs(posy - ev.offsetY) + "px";
      box.onmouseup = function(end) {
        isClip = false
        clipArea(posx, posy, end.offsetX - posx, end.offsetY - posy )
        div.parentNode.removeChild(div);
        box.onmousedown = null;
        box.onmousemove = null;
        box.onmouseup = null;

        onSetHB()
      }
    }
  }
}

function clipArea(x, y, w, h) {
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()
  ctx.closePath()
  ctx.restore()

  const newCanvas = document.createElement("canvas");
  newCanvas.width = w;
  newCanvas.height = h;
  const newCtx = newCanvas.getContext("2d");
  newCtx.drawImage(canvas, x, y, w, h, 0, 0, w, h);

  canvas.width = w
  canvas.height = h
  // 显示裁剪后的区域
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(newCanvas, 0, 0);
}

function startDrawing(e) {
  if (isClip) return
  drawing = true;
  if (checked === 1) {
    createInput(e)
  } else {
    if (checked === 0) {
      // ctx.globalCompositeOperation = 'destination-out'
    }
    // 绘制普通线条
    [lastX, lastY] = [e.offsetX, e.offsetY];
    ctx.lineWidth = getThickness(); // 设置当前笔触粗细
    ctx.strokeStyle = checked === 0 ? '#fff' : getColor()
  }
}

function draw(e) {
  if (!drawing) return;
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  [lastX, lastY] = [e.offsetX, e.offsetY];
}

function stopDrawing() {
  if (isClip) return
  ctx.globalCompositeOperation = 'source-over'; // 恢复混合模式为 source-over
  drawing = false;
}

const colorPicker = document.getElementById('color-picker');

function getColor() {
  return colorPicker.value;
}

const thicknessPicker = document.getElementById('thickness-picker');

function getThickness() {
  return parseInt(thicknessPicker.value);
}

const textInput = document.getElementById('text-input');

function getText() {
  return textInput.value;
}
const xp = document.getElementById('xp')
const wz = document.getElementById('wz')
const hb = document.getElementById('hb')
const cj = document.getElementById('cj')
let checked = 3
function onSetXP () {
  hb.className = ''
  wz.className = ''
  cj.className = ''
  checked = 0
  xp.classList.add('active')
}
function onSetWZ () {
  hb.className = ''
  xp.className = ''
  cj.className = ''
  checked = 1
  wz.classList.add('active')
}
function onSetHB () {
  xp.className = ''
  wz.className = ''
  cj.className = ''
  checked = 2
  hb.classList.add('active')
}
function onSetCj () {
  xp.className = ''
  wz.className = ''
  hb.className = ''
  checked = 3
  cj.classList.add('active')
  onClip()
}

const onSave = () => {
  const dataURL = canvas.toDataURL(); // 获取画布数据 URL
  const link = document.createElement('a'); // 创建一个链接元素
  link.download = 'my-canvas.png'; // 设置下载文件名
  link.href = dataURL; // 将数据 URL 赋值给链接 href 属性
  document.body.appendChild(link); // 将链接添加到文档中
  link.click(); // 模拟点击链接以触发下载
  document.body.removeChild(link); // 下载完成后将链接从文档中移除
}


importImage.addEventListener('change', function(e) {
  const file = e.target.files[0]; // 获取选择的文件
  const reader = new FileReader(); // 创建文件读取器

  reader.onload = function(event) { // 文件读取成功后执行
    const image = new Image();
    image.src = event.target.result; // 获取文件数据 URL
    image.width = canvas.width
    image.height = canvas.height
    image.onload = function() { // 图片加载完成后执行
      const imgRatio = image.width / image.height
      let dw, dh
      if (image.width > image.height) {
        dw = image.width / imgRatio
        dh = canvas.height
      } else {
        dw = canvas.width
        dh = image.height / imgRatio
      }
      ctx.drawImage(image, 0, 0, dw, dh); // 将图片绘制到画布上
    };
  };

  reader.readAsDataURL(file); // 读取文件数据
});
const eraserToggle = document.getElementById('eraser-toggle');
const textToggle = document.getElementById('text-toggle');

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);