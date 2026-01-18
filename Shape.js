class Shape {
  constructor([x, y], [r, g, b, a], size, segments, rotation) {
    this.type = 'shape';
    this.position = [x ?? 0.0, y ?? 0.0, 0.0];
    this.color = [r ?? 1.0, g ?? 1.0, b ?? 1.0, a ?? 1.0];
    this.size = size ?? 20.0;
    this.segments = segments ?? 3;
    this.rotation = rotation ?? 0;
  }

  render() {
    // Pass the position of a point to a_Position variable
    let [x, y, z] = this.position
    gl.vertexAttrib3f(a_Position, x, y, z);
    // Pass the size of a point to u_Size variable
    gl.uniform1f(u_Size, this.size);
    // Pass the color of a point to u_FragColor variable
    let [r, g, b, a] = this.color
    gl.uniform4f(u_FragColor, r, g, b, a);
    // Ensure segments parameter is valid
    if (this.segments < 3) {
      console.error("Segment count must be >= 3");
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
    // Initialize vertices and draw them
    let delta = this.size / 100.0 / 2;
    let step = 360/this.segments;
    for (let angle = 0; angle < 360; angle += step) {
      let center = this.position.slice();
      let theta = (angle + parseInt(this.rotation));
      let radians = [theta*Math.PI/180, (theta+step)*Math.PI/180];
      let points = [];
      for (let i = 0; i < 2; i++) {
        let vector = [Math.sin(radians[i])*delta, Math.cos(radians[i])*delta];
        points[i] = [center[0] + vector[0], center[1] + vector[1]];
      }
      drawTriangle([
        center[0], center[1], 
        points[0][0], points[0][1], 
        points[1][0], points[1][1]
      ]);
    }
  }
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