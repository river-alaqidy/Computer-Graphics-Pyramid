function start() {

  var canvas = document.getElementById("mycanvas");
  var gl = canvas.getContext("webgl");

  var cameraSlider = document.getElementById('slider1');
  cameraSlider.value = 0;
  var pyramidSlider = document.getElementById('slider2');
  pyramidSlider.value = 0;

  var vertexSource = document.getElementById("vertexShader").text;
  var fragmentSource = document.getElementById("fragmentShader").text;

  // setting up and linking shader followed structure of 
  // https://jsbin.com/zivofiw/edit?html,js,output example
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader,vertexSource);
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(vertexShader)); return null; }

  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader,fragmentSource);
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(fragmentShader)); return null; }
    
  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Could not initialize shaders"); }
  gl.useProgram(shaderProgram);	    
    
  shaderProgram.PositionAttribute = gl.getAttribLocation(shaderProgram, "vPosition");
  gl.enableVertexAttribArray(shaderProgram.PositionAttribute);
    
  shaderProgram.NormalAttribute = gl.getAttribLocation(shaderProgram, "vNormal");
  gl.enableVertexAttribArray(shaderProgram.NormalAttribute);
    
  shaderProgram.ColorAttribute = gl.getAttribLocation(shaderProgram, "vColor");
  gl.enableVertexAttribArray(shaderProgram.ColorAttribute);
    
  shaderProgram.MVmatrix = gl.getUniformLocation(shaderProgram,"uMV");
  shaderProgram.MVNormalmatrix = gl.getUniformLocation(shaderProgram,"uMVn");
  shaderProgram.MVPmatrix = gl.getUniformLocation(shaderProgram,"uMVP");

  // created new vertices, normal, and colors for object
  var vertexPos = new Float32Array(
    [  .5, .5, 1,  -.5, .5, 1,  -.5,-.5, 1,   .5,-.5, 1, 
       .5, .5, 1,   .5,-.5, 1,   0, 0, 0,               
       .5, .5, 1,   0, 0, 0,  -.5, .5, 1,               
      -.5, .5, 1,  -.5,-.5, 1,   0, 0, 0,              
      -.5,-.5, 1,   .5,-.5, 1,   0, 0, 0 ]);            

  var vertexNormals = new Float32Array(
    [  0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,   
       1, 0, 0,   1, 0, 0,   1, 0, 0,               
       0, 0, -1,  0, 0, -1,  0, 0, -1,             
       -1, 0, 0,  -1, 0, 0,  -1, 0, 0,               
       0, -1, 0,   0, -1, 0,   0, -1, 0 ]);         

  var vertexColors = new Float32Array(
    [  1, 0, 0,   1, 0, 0,   1, 0, 0,   1, 0, 0, 
       1, 0, 0,   1, 0, 0,   1, 0, 0,             
       1, 0, 0,   1, 0, 0,   1, 0, 0,             
       1, 0, 0,   1, 0, 0,   1, 0, 0,              
       1, 0, 0,   1, 0, 0,   1, 0, 0 ]);           

  var triangleIndices = new Uint8Array(
    [  0, 1, 2,   0, 2, 3,  
       4, 5, 6,              
       7, 8, 9,              
       10,11,12,              
       13,14,15 ]);            

  var trianglePosBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexPos, gl.STATIC_DRAW);
  trianglePosBuffer.itemSize = 3;
  trianglePosBuffer.numItems = 16;

  var triangleNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexNormals, gl.STATIC_DRAW);
  triangleNormalBuffer.itemSize = 3;
  triangleNormalBuffer.numItems = 16;

  var colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexColors, gl.STATIC_DRAW);
  colorBuffer.itemSize = 3;
  colorBuffer.numItems = 16; 

  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleIndices, gl.STATIC_DRAW);

    function draw() {
    
      var camRot = cameraSlider.value*0.01*Math.PI;
      var pyRot = pyramidSlider.value*0.01*Math.PI;
    

      var eye = [500*Math.sin(camRot),0.0,500.0*Math.cos(camRot)];
      var target = [0,0,0];
      var up = [0,1,0];
    
      var tModel = mat4.create();
      mat4.fromScaling(tModel,[100,100,100]);
      mat4.rotate(tModel,tModel,pyRot,[0,0,1]);
      
      var tCamera = mat4.create();
      mat4.lookAt(tCamera, eye, target, up);      

      var tProjection = mat4.create();
      mat4.perspective(tProjection,Math.PI/4,1,10,1000);
      
      var tMV = mat4.create();
      var tMVn = mat3.create();
      var tMVP = mat4.create();
      mat4.multiply(tMV,tCamera,tModel);
      mat3.normalFromMat4(tMVn,tMV);
      mat4.multiply(tMVP,tProjection,tMV);
      

      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.enable(gl.DEPTH_TEST);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.uniformMatrix4fv(shaderProgram.MVmatrix,false,tMV);
      gl.uniformMatrix3fv(shaderProgram.MVNormalmatrix,false,tMVn);
      gl.uniformMatrix4fv(shaderProgram.MVPmatrix,false,tMVP);

      gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
      gl.vertexAttribPointer(shaderProgram.PositionAttribute, trianglePosBuffer.itemSize,
      gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
      gl.vertexAttribPointer(shaderProgram.NormalAttribute, triangleNormalBuffer.itemSize,
      gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.vertexAttribPointer(shaderProgram.ColorAttribute, colorBuffer.itemSize,
      gl.FLOAT,false, 0, 0);

    gl.drawElements(gl.TRIANGLES, triangleIndices.length, gl.UNSIGNED_BYTE, 0);
       

  }

  cameraSlider.addEventListener("input",draw);
  pyramidSlider.addEventListener("input",draw);
  draw();
}

window.onload=start;
