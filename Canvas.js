// Canvas.js 2026 ndistefa@ucsc.edu
// Derived from ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
let VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
let FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

let canvas;
let gl;
let a_Position;
let u_Size;
let u_FragColor;

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  bindActions();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Initialize the canvas
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (u_Size < 0) {
    console.log('Failed to get the storage position of u_Size');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
}

let g_shapes = [];

let g_selectedColor = [1.0, 1.0, 1.0, 1.0]; // The color the user is currently drawing with
let g_selectedSize = 10.0;
let g_selectedSegments = 4;
let g_selectedRotation = 0;

function bindActions() {
  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(event) {
    if (event.buttons == 1) { click(event); }
  };

  document.getElementById('range_color_r')
    .addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
  document.getElementById('range_color_g')
    .addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
  document.getElementById('range_color_b')
    .addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });

  document.getElementById('range_size')
    .addEventListener('mouseup', function() { g_selectedSize = this.value; });

  document.getElementById('button_clear')
    .addEventListener('click', function() { 
      g_shapes = [];
      renderShapes();
    });

  let slider_segmentCount = 10;
  document.getElementById('range_segments')
    .addEventListener('mouseup', function() { 
      slider_segmentCount = this.value;
      if (g_selectedSegments > 4) {
        g_selectedSegments = slider_segmentCount;
      }
    });
  
  document.getElementById('button_mode_squares')
    .addEventListener('click', function() {
      g_selectedSegments = 4;
    });
  document.getElementById('button_mode_triangles')
    .addEventListener('click', function() {
      g_selectedSegments = 3;
    });
  document.getElementById('button_mode_circles')
    .addEventListener('click', function() {
      g_selectedSegments = slider_segmentCount;
    });
  
  document.getElementById('range_rotation')
    .addEventListener('mouseup', function() {
      g_selectedRotation = this.value;
    });
}

function click(event) {
  let [x, y] = convertToGL(event.clientX, event.clientY, event.target.getBoundingClientRect());

  // Store the shape properties to g_shapes array
  let shape = new Shape([x, y], g_selectedColor.slice(), g_selectedSize, g_selectedSegments, g_selectedRotation);
  g_shapes.push(shape);

  renderShapes();
}

function convertToGL(x, y, rect) {
  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return [x, y];
}

function renderShapes() {
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  let len = g_shapes.length;
  for(let i = 0; i < len; i++) {
    let shape = g_shapes[i];
    shape.render();
  }
}
