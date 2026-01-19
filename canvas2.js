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
    // Create a buffer object
    let vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
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

let g_shapes = [] // The shapes currently drawn to the screen
let g_selectedColor = [1.0, 1.0, 1.0, 1.0]; // The color the user is currently drawing with
let g_selectedSize = 10.0;
let g_selectedSegments = 4;
let g_selectedRotation = 0;
let g_tool = 0;
let last_clicked = null;

function bindActions() {
  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(event) {
    if (event.buttons == 0) {
      last_clicked = null;
    } else if (event.buttons == 1) {
      click(event); 
    }
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
      gl.clear(gl.COLOR_BUFFER_BIT);
      g_shapes = [];
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

  document.getElementById('button_draw')
    .addEventListener('click', drawPreset);

  document.getElementById('button_tool_draw')
    .addEventListener('click', function() {
      g_tool = 0;
    })
  document.getElementById('button_tool_pan')
    .addEventListener('click', function() {
      g_tool = 1;
    })
  document.getElementById('button_tool_zoom')
    .addEventListener('click', function() {
      g_tool = 2;
    })
}

function click(event) {
  let [x, y] = convertToGL(event.clientX, event.clientY, event.target.getBoundingClientRect());
  let delta;
  if (last_clicked) {
    delta = [x - last_clicked[0], y - last_clicked[1]];
  } else {
    delta = [0, 0];
  }
  switch (g_tool) {
    case 0: // Draw tool
      let shape = new Shape([x, y], g_selectedColor.slice(), g_selectedSize, g_selectedSegments, g_selectedRotation);
      shape.render();
      g_shapes.push(shape);
      break;
    case 1: // Pan tool
      gl.clear(gl.COLOR_BUFFER_BIT);
      for (let shape of g_shapes) {
        shape.position[0] += delta[0];
        shape.position[1] += delta[1];
        shape.render();
      }
      break;
    case 2: // Zoom tool
      gl.clear(gl.COLOR_BUFFER_BIT);
      let strength = delta[1];
      for (let shape of g_shapes) {
        shape.size *= 1 + strength;
        shape.position[0] *= (1 + strength);
        shape.position[1] *= (1 + strength);
        shape.render();
      }
      break;
  }
  last_clicked = [x, y];
}

function convertToGL(x, y, rect) {
  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return [x, y];
}

function drawPreset() {
  gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);
  gl.uniform4f(u_FragColor, 0.5, 0.5, 0.6, 1.0);
  
  // Draw body
  drawTriangle([0.0, -0.2,  0.1, -0.2,  0.1, -0.3]);
  drawTriangle([0.0, -0.3,  0.0, -0.4,  0.1, -0.4]);
  drawTriangle([-0.1, -0.3,  -0.1, -0.4,  0.0, -0.4]);
  drawSquare([-0.1, -0.3]);
  drawSquare([-0.1, -0.2]);
  drawSquare([-0.1, -0.1]);
  drawSquare([-0.1, 0.0]);
  drawTriangle([0.0, 0.0,  0.1, 0.0,  0.0, 0.1]);
  drawTriangle([0.0, 0.0,  0.1, 0.0,  0.1, -0.1]);
  drawTriangle([0.1, -0.1,  0.2, -0.1,  0.2, -0.2]);
  drawTriangle([0.1, 0.0,  0.2, -0.1,  0.1, -0.1]);
  drawSquare([0.2, -0.2]);
  drawSquare([0.2, -0.1]);
  drawSquare([0.2, 0.0]);
  drawSquare([0.2, 0.1]);
  drawTriangle([0.3, 0.2,  0.3, 0.3,  0.2, 0.3]);
  drawTriangle([0.2, 0.2,  0.2, 0.3,  0.1, 0.3]);
  drawTriangle([0.1, 0.1,  0.1, 0.2,  0.2, 0.1]);

  // Draw eyes
  gl.uniform4f(u_FragColor, 1, 1, 1, 1);
  drawTriangle([-0.1, -0.3,  0.0, -0.3,  0.0, -0.4]);
  drawTriangle([0.2, 0.2,  0.2, 0.3,  0.3, 0.2]);

  // Draw scales
  gl.uniform4f(u_FragColor, 0.3, 0.3, 0.4, 1);
  drawTriangle([-0.2, -0.3,  -0.1, -0.3,  -0.1, -0.4]);
  drawTriangle([-0.2, -0.2,  -0.1, -0.2,  -0.1, -0.3]);
  drawTriangle([-0.2, -0.1,  -0.1, -0.1,  -0.1, -0.2]);
  drawTriangle([-0.2, 0.0,  -0.1, 0.0,  -0.1, -0.1]);
  drawTriangle([-0.2, 0.1,  -0.1, 0.1,  -0.1, 0.0]);
  drawTriangle([-0.1, 0.1,  -0.0, 0.1,  -0.0, 0.2]);
  drawTriangle([0.3, 0.2,  0.3, 0.3,  0.4, 0.2]);
  drawTriangle([0.3, 0.1,  0.3, 0.2,  0.4, 0.1]);
  drawTriangle([0.3, 0.0,  0.3, 0.1,  0.4, 0.0]);
  drawTriangle([0.3, -0.1,  0.3, 0.0,  0.4, -0.1]);
  drawTriangle([0.3, -0.2,  0.3, -0.1,  0.4, -0.2]);
  drawTriangle([0.2, -0.2,  0.3, -0.2,  0.2, -0.3]); 
}

function drawTriangle(vertices) {
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);
  // Draw
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// Pos is the bottom-left of the square
// This is used exclusively for drawPreset()
function drawSquare(pos) {
  drawTriangle([pos[0], pos[1],  pos[0], pos[1] + 0.1,  pos[0] + 0.1, pos[1]]);
  drawTriangle([pos[0], pos[1] + 0.1,  pos[0] + 0.1, pos[1] + 0.1,  pos[0] + 0.1, pos[1]]);
}
