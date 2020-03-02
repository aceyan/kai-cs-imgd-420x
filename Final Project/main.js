    const glslify = require( 'glslify' )
    var myGui
   let time = 0
  let lastTime = 0;
  let acumulateTime = 0;
  let mouseX;
  let mouseY;
  let isMouseDown;
  let timeCounter = 0;
  let gyroscopeX = 0;
  let gyroscopeY = 0;

  let UisMouseDown;
  let UmousePos;
  let uTime;
  let UposTexturePingPong, UvelTexturePingPong;
  let UposTextureDrawPoints;
  let UmaxForce, UmaxSpeed;
  let UalignmentScale, UcohesionScale, UseparationScale;
  let UbmouseCentral, UbmousePredator;
  let Ubgyroscope;
  let UgyroscopePos;

  var numPoints = 50;// number of points = numPoints * numPoints
  const MAX_POINTS = 14400;
window.onload = function() { 
var MyGUI = function() {
  this.name = "Kai's Final Project - GPGPU Flocking";
  this.numberOfPoints = numPoints * numPoints;
  this.maxForce = 0.001;
 this.maxSpeed = 0.008;
this.alignmentScale = 1;
this.cohesionScale = 1;
this.separationScale = 1;
this.mouseCentral = false;
this.mousePredator = false;
this.gyroscope = false;
  this.frameRate = 34;

};
myGui = new MyGUI();
  var gui = new dat.GUI();
  gui.add(myGui, 'name');
gui.add(myGui, 'numberOfPoints', 2, MAX_POINTS);
gui.add(myGui, 'maxForce', 0, 0.002);
gui.add(myGui, 'maxSpeed', 0, 0.1);
gui.add(myGui, 'alignmentScale', 0, 5);
gui.add(myGui, 'cohesionScale', 0, 5);
gui.add(myGui, 'separationScale', 0, 5);
gui.add(myGui, 'mouseCentral');
gui.add(myGui, 'mousePredator');
gui.add(myGui, 'gyroscope');
   gui.add(myGui, 'frameRate', 0, 60);


  let canvas = document.getElementById( 'gl' )
     let gl = canvas.getContext( 'webgl2' )

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let verts = [ 
      1, 1, 
      -1, 1, 
      -1,-1, 
      1, 1, 
      -1, -1, 
      1, -1, 
    ]

  const ext = gl.getExtension("EXT_color_buffer_float");
  if (!ext) {
    alert("need EXT_color_buffer_float");
    return;
  }

    let vertBuffer = gl.createBuffer() 
    gl.bindBuffer( gl.ARRAY_BUFFER, vertBuffer ) 
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW ) 
    gl.vertexAttribPointer( 0, 2, gl.FLOAT, false, 0, 0 ) 
    gl.enableVertexAttribArray( 0 )
  
    let shaderSource = glslify.file( './vs.glsl' ) 
    const vertexShader = gl.createShader( gl.VERTEX_SHADER ) 
    gl.shaderSource( vertexShader, shaderSource ) 
    gl.compileShader( vertexShader )
    console.log( gl.getShaderInfoLog( vertexShader ) ) // create fragment shader to run our simulation
    
    shaderSource = glslify.file( './fs_render.glsl' ) 
    const fragmentShaderRender = gl.createShader( gl.FRAGMENT_SHADER ) 
    gl.shaderSource( fragmentShaderRender, shaderSource ) 
    gl.compileShader( fragmentShaderRender ) 
    console.log( gl.getShaderInfoLog( fragmentShaderRender ) ) // create shader program const
      
    programRender = gl.createProgram() 
    gl.attachShader( programRender, vertexShader ) 
    gl.attachShader( programRender, fragmentShaderRender )
    gl.linkProgram( programRender )
    gl.useProgram( programRender )
    
 
    gl.enableVertexAttribArray( 0 ) 
    gl.vertexAttribPointer( 0, 2, gl.FLOAT, false, 0,0 ) 
      

    UisMouseDown = gl.getUniformLocation( programRender, 'isMouseDown' ) 
    UmousePos = gl.getUniformLocation( programRender, 'mousePos' ) 
    uTime = gl.getUniformLocation( programRender, 'time' ) 
UposTexturePingPong = gl.getUniformLocation( programRender, 'posTexture' ) 
UvelTexturePingPong = gl.getUniformLocation( programRender, 'velTexture' ) 
UmaxForce = gl.getUniformLocation( programRender, 'maxForce' ) 
UmaxSpeed = gl.getUniformLocation( programRender, 'maxSpeed' ) 
UalignmentScale = gl.getUniformLocation( programRender, 'alignmentScale' ) 
UcohesionScale = gl.getUniformLocation( programRender, 'cohesionScale' ) 
UseparationScale = gl.getUniformLocation( programRender, 'separationScale' ) 
UbmouseCentral = gl.getUniformLocation( programRender, 'bmouseCentral' ) 
UbmousePredator  = gl.getUniformLocation( programRender, 'bmousePredator' ) 
Ubgyroscope = gl.getUniformLocation( programRender, 'bgyroscope' ) 
UgyroscopePos  = gl.getUniformLocation( programRender, 'gyroscopePos' ) 


    let verts2 = new Float32Array(MAX_POINTS);
    for (var i = 0; i < MAX_POINTS; i++)
    {
      verts2[i] = i;
    }

    let vertBuffer2 = gl.createBuffer() 
    gl.bindBuffer( gl.ARRAY_BUFFER, vertBuffer2 ) 
    gl.bufferData( gl.ARRAY_BUFFER, verts2, gl.STATIC_DRAW ) 
    gl.vertexAttribPointer( 0, 1, gl.FLOAT, false, 0, 0 ) 
    gl.enableVertexAttribArray( 0 )


  shaderSource = glslify.file( './vs_drawPoint.glsl' ) 
   vertexShaderPoint = gl.createShader( gl.VERTEX_SHADER ) 
    gl.shaderSource( vertexShaderPoint, shaderSource ) 
    gl.compileShader( vertexShaderPoint )
    console.log( gl.getShaderInfoLog( vertexShaderPoint ) ) // create fragment shader to run our simulation
    // create shader program to draw our simulation to the screen 
    shaderSource = glslify.file( './fs_draw.glsl' ) 
    fragmentShaderDraw = gl.createShader( gl.FRAGMENT_SHADER ) 
    gl.shaderSource( fragmentShaderDraw, shaderSource )
    gl.compileShader( fragmentShaderDraw ) 
    console.log( gl.getShaderInfoLog( fragmentShaderDraw ) ) 
      
    // create shader program
    programDraw = gl.createProgram() 
    gl.attachShader( programDraw, vertexShaderPoint ) 
    gl.attachShader( programDraw, fragmentShaderDraw ) 
    gl.linkProgram( programDraw )
    gl.useProgram( programDraw )

UposTextureDrawPoints = gl.getUniformLocation( programDraw, 'posTexture' ) 

    gl.enableVertexAttribArray( 0 )
    gl.vertexAttribPointer( 0, 1, gl.FLOAT, false, 0,0 )
    
    let texPosFront = gl.createTexture() //xy for posistion
    gl.bindTexture( gl.TEXTURE_2D, texPosFront ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST )
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST ) 
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA32F, numPoints, numPoints, 0, gl.RGBA, gl.FLOAT, null ) 

     let texVelFront = gl.createTexture()  //xy for velocity, zw channel for acceleration
    gl.bindTexture( gl.TEXTURE_2D, texVelFront ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST )
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST ) 
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA32F, numPoints, numPoints, 0, gl.RGBA, gl.FLOAT, null ) 
    
    let texPosBack = gl.createTexture() //xy for posistion
    gl.bindTexture( gl.TEXTURE_2D, texPosBack ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST ) 
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA32F, numPoints, numPoints, 0, gl.RGBA, gl.FLOAT, null )


   
    
    const reset = function(pct) { 
      var pixelSize = 4 
       var initState = new Float32Array( numPoints * numPoints * pixelSize ) 
      for( let i = 0; i < numPoints * numPoints; i++ ) 
      { 
          var ii = pixelSize * i;
         
            initState[ ii ] = pct * (Math.random() * 2 - 1);
            initState[ ii + 1] = pct * (Math.random() * 2 - 1 );
            initState[ ii + 2] = 0 ;

            initState[ ii + 3] = 0 ;

      } 
      
      gl.texSubImage2D( 
        gl.TEXTURE_2D, 0, 0, 0, numPoints, numPoints, gl.RGBA, gl.FLOAT, initState, 0 
      ) 
      
    }
    reset(1);

     let texVelBack = gl.createTexture()  //xy for velocity, zw channel for acceleration
    gl.bindTexture( gl.TEXTURE_2D, texVelBack ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST ) 
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA32F, numPoints, numPoints, 0, gl.RGBA, gl.FLOAT, null )

    reset(0.005)
      

  const fb = gl.createFramebuffer() 
    const fb2 = gl.createFramebuffer() 
  
    const pingpong = function() {
      gl.bindFramebuffer( gl.FRAMEBUFFER, fb ) 

      gl.bindBuffer( gl.ARRAY_BUFFER, vertBuffer ) 
      gl.vertexAttribPointer( 0, 2, gl.FLOAT, false, 0, 0 ) 
      gl.enableVertexAttribArray( 0 )

      gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texPosFront, 0 ) 
      gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, texVelFront, 0 ) 
      //
      gl.drawBuffers( [gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1] );


      gl.viewport(0, 0, numPoints, numPoints ) 
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture( gl.TEXTURE_2D, texPosBack ) 
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture( gl.TEXTURE_2D, texVelBack ) 

      gl.drawArrays( gl.TRIANGLES, 0, 6 ) 
    
      gl.bindFramebuffer( gl.FRAMEBUFFER, fb2 )
      gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texPosBack, 0 ) 
      gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, texVelBack, 0 ) 
       gl.drawBuffers( [gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1] );

      gl.viewport(0, 0, numPoints, numPoints )
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture( gl.TEXTURE_2D, texPosFront ) 
       gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture( gl.TEXTURE_2D, texVelFront ) 
      gl.drawArrays( gl.TRIANGLES, 0, 6 ) 
    }
  
  const draw = function() { 

  window.requestAnimationFrame( draw ) 
  gl.clearColor(0,0,0,1)
  gl.clear(gl.COLOR_BUFFER_BIT)
 var now = Date.now();
    acumulateTime +=  now - lastTime;
    lastTime = now;
    
    var frameTime = 1.0 / myGui.frameRate * 1000;
    if(acumulateTime < frameTime)
    {
      return;
    }
    acumulateTime = 0;

      timeCounter++;

      var numP = Math.floor(Math.sqrt(myGui.numberOfPoints));
      if(numP != numPoints)
      {
        numPoints = numP;
        resetTexture();
        //console.log("numPoints:" + numPoints);
      }

      gl.useProgram( programRender )   
      gl.uniform2f( UmousePos, mouseX, mouseY ) 
      gl.uniform1i( UisMouseDown, isMouseDown ) 
      gl.uniform1f( uTime, timeCounter)
      //
 gl.uniform1f( UmaxSpeed, myGui.maxSpeed)
  gl.uniform1f( UmaxForce, myGui.maxForce)
   gl.uniform1f( UalignmentScale, myGui.alignmentScale)
    gl.uniform1f( UcohesionScale, myGui.cohesionScale)
     gl.uniform1f( UseparationScale,  myGui.separationScale)


gl.uniform1i( UbmouseCentral, myGui.mouseCentral ) 
 gl.uniform1i( UbmousePredator, myGui.mousePredator ) 

    gl.uniform1i( Ubgyroscope, myGui.gyroscope ) 
      gl.uniform2f( UgyroscopePos, gyroscopeX, gyroscopeY ) 

      //assign texture unit
      gl.uniform1i(UposTexturePingPong, 0); 
      gl.uniform1i(UvelTexturePingPong, 1); 
      //
      let scale = gl.getUniformLocation( programRender, 'scale' ) 
      gl.uniform2f( scale, numPoints, numPoints )

      pingpong()
 
      // use the default framebuffer object by passing null 
      gl.bindFramebuffer( gl.FRAMEBUFFER, null ) 
    
      gl.bindBuffer( gl.ARRAY_BUFFER, vertBuffer2 ) 
      gl.vertexAttribPointer( 0, 1, gl.FLOAT, false, 0, 0 ) 
      gl.enableVertexAttribArray( 0 )
      // set our viewport to be the size of our canvas 
      // so that it will fill it entirely 
      gl.viewport(0, 0, canvas.width, canvas.height )
      // select the texture we would like to draw the the screen. 
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture( gl.TEXTURE_2D, texPosBack ) 
      // use our drawing (copy) shader 
      gl.useProgram( programDraw ) 
      gl.uniform1i(UposTextureDrawPoints, 0); 

      scale = gl.getUniformLocation( programDraw, 'scale' ) 
      gl.uniform2f( scale, numPoints, numPoints ) 
      // put simulation on screen
      gl.drawArrays( gl.POINTS, 0, numPoints * numPoints  ) 
        

    }
     
    draw()


  const onMousedown = function(ev) 
  { 
    isMouseDown = true;
  }

  const onMouseMove = function(ev) 
  {
  var x = ev.clientX; 
  var y = ev.clientY; 
  
  //console.log("x:" + x);
  //console.log("y:" + y);
  mouseX = x / canvas.width;
  mouseY = (canvas.height - y) / canvas.height;
  //transfer mouse positon to [-1,1]
  mouseX = mouseX * 2.0 - 1.0;
  mouseY = mouseY * 2.0 - 1.0;



  //console.log("mouseX:" + mouseX);
  //console.log("mouseY:" + mouseY);
  }

  const onMouseUp = function()
  {
    isMouseDown = false;
  }

  canvas.onmousedown  = onMousedown;
  canvas.onmouseup  = onMouseUp;
  canvas.onmousemove  = onMouseMove;



 const resetTexture = function() 
  { 
    gl.bindTexture( gl.TEXTURE_2D, texPosFront ) 
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA32F, numPoints, numPoints, 0, gl.RGBA, gl.FLOAT, null ) 


    gl.bindTexture( gl.TEXTURE_2D, texVelFront ) 
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA32F, numPoints, numPoints, 0, gl.RGBA, gl.FLOAT, null ) 
    
  
    gl.bindTexture( gl.TEXTURE_2D, texPosBack ) 
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA32F, numPoints, numPoints, 0, gl.RGBA, gl.FLOAT, null )
    reset(1);

    gl.bindTexture( gl.TEXTURE_2D, texVelBack ) 
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA32F, numPoints, numPoints, 0, gl.RGBA, gl.FLOAT, null )
     reset(0.005);
  }

  window.addEventListener('deviceorientation', function(e){
   //console.log('absolute: ' + e.absolute)
   //console.log('alpha: ' + e.alpha)
   //console.log('beta: ' + e.beta)
   //console.log('gamma: ' + e.gamma)

   //document.getElementById("demo").innerHTML = 'alpha: ' + e.alpha + '   beta: ' + e.beta + '  gamma: ' + e.gamma;


      //transfer orientaiton data to coordinate [-1,1]
      var beta = e.beta;
      if(beta > 90)
      {
        beta = 90;
      }
      else if(beta < -90)
      {
        beta = -90;
      }

      gyroscopeY = -beta / 90;

       var gamma = e.gamma;
      if(gamma > 90)
      {
        gamma = 90;
      }
      else if(gamma < -90)
      {
        gamma = -90;
      }

      gyroscopeX = gamma / 90;

      //console.log('gyroscopeX: ' + gyroscopeX + " gyroscopeY:" + gyroscopeY);
  
});

}

