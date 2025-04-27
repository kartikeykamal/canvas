// Canvas setup
const canvas = document.querySelector('#draw');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.strokeStyle = '#4A90E2';
ctx.lineJoin = 'round';
ctx.lineCap = 'round';
ctx.lineWidth = 10;

// Drawing state
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let hue = 0;
let direction = true;
let isRainbowMode = true;
let isGlowMode = false;
let isShadowMode = false;
let isShiftPressed = false;
let startX, startY;

// UI elements
const brushSizeSlider = document.getElementById('brush-size');
const sizeValueDisplay = document.getElementById('size-value');
const rainbowModeBtn = document.getElementById('rainbow-mode');
const solidModeBtn = document.getElementById('solid-mode');
const colorPicker = document.getElementById('color-picker');
const colorPickerContainer = document.getElementById('color-picker-container');
const toggleGlowBtn = document.getElementById('toggle-glow');
const toggleShadowBtn = document.getElementById('toggle-shadow');
const clearCanvasBtn = document.getElementById('clear-canvas');
const saveCanvasBtn = document.getElementById('save-canvas');
const brushPreview = document.getElementById('brush-preview');

// Initialize UI
updateBrushPreview();
colorPickerContainer.style.display = 'none';

// Drawing functions
function draw(e) {
  if (!isDrawing) return;
  
  // Set the stroke style based on mode
  if (isRainbowMode) {
    ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
  } else {
    ctx.strokeStyle = colorPicker.value;
  }
  
  // Apply special effects if enabled
  if (isGlowMode) {
    ctx.shadowBlur = 10;
    ctx.shadowColor = ctx.strokeStyle;
  } else {
    ctx.shadowBlur = 0;
  }
  
  if (isShadowMode) {
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
  } else if (!isGlowMode) {
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
  
  ctx.beginPath();
  
  if (isShiftPressed && lastX !== 0 && lastY !== 0) {
    // Draw straight line from starting point
    ctx.moveTo(startX, startY);
    ctx.lineTo(e.offsetX, e.offsetY);
  } else {
    // Normal drawing
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
  }
  
  ctx.stroke();
  
  // Update last position
  [lastX, lastY] = [e.offsetX, e.offsetY];
  
  // Update hue for rainbow mode
  hue = (hue + 1) % 360;
  
  // Update brush size if direction is changing
  if (ctx.lineWidth >= 100 || ctx.lineWidth <= 1) {
    direction = !direction;
  }
  
  if (direction) {
    ctx.lineWidth++;
  } else {
    ctx.lineWidth--;
  }
  
  // Update brush preview position
  updateBrushPreviewPosition(e);
}

function updateBrushPreview() {
  const size = parseInt(brushSizeSlider.value);
  brushPreview.style.width = `${size}px`;
  brushPreview.style.height = `${size}px`;
  
  if (isRainbowMode) {
    brushPreview.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
  } else {
    brushPreview.style.backgroundColor = colorPicker.value;
  }
  
  if (isGlowMode) {
    brushPreview.style.boxShadow = `0 0 10px ${brushPreview.style.backgroundColor}`;
  } else if (isShadowMode) {
    brushPreview.style.boxShadow = '2px 2px 4px rgba(0,0,0,0.3)';
  } else {
    brushPreview.style.boxShadow = 'none';
  }
  
  sizeValueDisplay.textContent = `${size}px`;
}

function updateBrushPreviewPosition(e) {
  brushPreview.style.left = `${e.clientX}px`;
  brushPreview.style.top = `${e.clientY}px`;
  brushPreview.style.transform = 'translate(-50%, -50%)';
}

// Event listeners for drawing
canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  [lastX, lastY] = [e.offsetX, e.offsetY];
  [startX, startY] = [e.offsetX, e.offsetY]; // Store start position for shift-line
  updateBrushPreviewPosition(e);
  brushPreview.style.opacity = '0.5';
});

canvas.addEventListener('mousemove', (e) => {
  updateBrushPreviewPosition(e);
  draw(e);
});

canvas.addEventListener('mouseup', () => {
  isDrawing = false;
  // Reset starting point
  startX = 0;
  startY = 0;
  brushPreview.style.opacity = '0.3';
});

canvas.addEventListener('mouseout', () => {
  isDrawing = false;
  brushPreview.style.opacity = '0';
});

canvas.addEventListener('mouseover', () => {
  brushPreview.style.opacity = '0.3';
});

// Event listeners for controls
brushSizeSlider.addEventListener('input', () => {
  ctx.lineWidth = brushSizeSlider.value;
  updateBrushPreview();
});

rainbowModeBtn.addEventListener('click', () => {
  isRainbowMode = true;
  rainbowModeBtn.classList.add('active');
  solidModeBtn.classList.remove('active');
  colorPickerContainer.style.display = 'none';
  updateBrushPreview();
});

solidModeBtn.addEventListener('click', () => {
  isRainbowMode = false;
  rainbowModeBtn.classList.remove('active');
  solidModeBtn.classList.add('active');
  colorPickerContainer.style.display = 'block';
  updateBrushPreview();
});

colorPicker.addEventListener('input', updateBrushPreview);

toggleGlowBtn.addEventListener('click', () => {
  isGlowMode = !isGlowMode;
  toggleGlowBtn.classList.toggle('active');
  updateBrushPreview();
});

toggleShadowBtn.addEventListener('click', () => {
  isShadowMode = !isShadowMode;
  toggleShadowBtn.classList.toggle('active');
  updateBrushPreview();
});

clearCanvasBtn.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

saveCanvasBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'canvas-artwork.png';
  link.href = canvas.toDataURL();
  link.click();
});

// Keyboard events for shift key
window.addEventListener('keydown', (e) => {
  if (e.key === 'Shift') {
    isShiftPressed = true;
  }
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'Shift') {
    isShiftPressed = false;
  }
});

// Resize handler
window.addEventListener('resize', () => {
  // Save current canvas content
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  tempCtx.drawImage(canvas, 0, 0);
  
  // Resize canvas
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Restore context properties
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.lineWidth = brushSizeSlider.value;
  
  // Restore canvas content
  ctx.drawImage(tempCanvas, 0, 0);
}); 