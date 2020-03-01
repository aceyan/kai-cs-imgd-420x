    const glslify = require( 'glslify' )
    var myGui
   let time = 0
  let lastTime = 0;
  let acumulateTime = 0;
  let mouseX;
  let mouseY;
  let isMouseDown;
  let timeCounter = 0;

  let UisMouseDown;
  let UmousePos;
  let uTime;
  let UposTexturePingPong, UvelTexturePingPong;
  let UposTextureDrawPoints;

  const numPoints = 4;// number of points = numPoints * numPoints

window.onload = function() { 
var MyGUI = function() {
  this.name = "Kai's Final Project";

  this.reactionSpeed = 1;
    this.frameRate = 24;
   this.reset = function() { reset(0.25) };
   this.clearScreen = function() { reset(1) };
};
myGui = new MyGUI();
  var gui = new dat.GUI();
  gui.add(myGui, 'name');
//
 gui.add(myGui, 'reactionSpeed', 1, 20);
   gui.add(myGui, 'frameRate', 0, 60);
  gui.add(myGui, 'reset');
   gui.add(myGui, 'clearScreen');

  let canvas = document.getElementById( 'gl' )
     let gl = canvas.getContext( 'webgl2' )
    size = 512
    canvas.width = size
    canvas.height = size
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

    let verts2 = new Float32Array(numPoints * numPoints);
    for (var i = 0; i < numPoints * numPoints; i++)
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
    
    let texFront = gl.createTexture() //for pos
    gl.bindTexture( gl.TEXTURE_2D, texFront ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST )
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST ) 
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA32F, numPoints, numPoints, 0, gl.RGBA, gl.FLOAT, null ) 

     let texFront2 = gl.createTexture()  //for vel
    gl.bindTexture( gl.TEXTURE_2D, texFront2 ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST )
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST ) 
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA32F, numPoints, numPoints, 0, gl.RGBA, gl.FLOAT, null ) 
    
    let texBack = gl.createTexture() //for pos
    gl.bindTexture( gl.TEXTURE_2D, texBack ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST ) 
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA32F, numPoints, numPoints, 0, gl.RGBA, gl.FLOAT, null )

const pixelSize = 4 
    const initState = new Float32Array( numPoints * numPoints * pixelSize ) 
    
    const reset = function(pct) { 
      for( let i = 0; i < numPoints * numPoints; i++ ) 
      { 
          var ii = pixelSize * i;
         
            initState[ ii ] = pct * (Math.random() * 2 - 1);
            initState[ ii + 1] = pct * (Math.random() * 2 - 1 );
            initState[ ii + 2] = 1 ;

            initState[ ii + 3] = 1 ;

      } 
      
      gl.texSubImage2D( 
        gl.TEXTURE_2D, 0, 0, 0, numPoints, numPoints, gl.RGBA, gl.FLOAT, initState, 0 
      ) 
      
    }
        reset(1);

     let texBack2 = gl.createTexture()  //for vel
    gl.bindTexture( gl.TEXTURE_2D, texBack2 ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST ) 
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA32F, numPoints, numPoints, 0, gl.RGBA, gl.FLOAT, null )

    reset(0.01);

  const fb = gl.createFramebuffer() 
    const fb2 = gl.createFramebuffer() 
  
    const pingpong = function() {
      gl.bindFramebuffer( gl.FRAMEBUFFER, fb ) 

      gl.bindBuffer( gl.ARRAY_BUFFER, vertBuffer ) 
      gl.vertexAttribPointer( 0, 2, gl.FLOAT, false, 0, 0 ) 
      gl.enableVertexAttribArray( 0 )
      // use the framebuffer to write to our texFront texture
      gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texFront, 0 ) 
      gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, texFront2, 0 ) 
      //
      gl.drawBuffers( [gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1] );

      // set viewport to be the size of our state (reaction diffusion simulation) 
      // here, this represents the size that will be drawn onto our texture 
      gl.viewport(0, 0, numPoints, numPoints ) 
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture( gl.TEXTURE_2D, texBack ) 
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture( gl.TEXTURE_2D, texBack2 ) 

      gl.drawArrays( gl.TRIANGLES, 0, 6 ) 
    
      gl.bindFramebuffer( gl.FRAMEBUFFER, fb2 )
      gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texBack, 0 ) 
      gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, texBack2, 0 ) 
            gl.drawBuffers( [gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1] );
      // set our viewport to be the size of our canvas 
      // so that it will fill it entirely 
      gl.viewport(0, 0, numPoints, numPoints )
      // select the texture we would like to draw the the screen. 
      // note that webgl does not allow you to write to / read from the 
      // same texture in a single render pass. Because of the swap, we're 
      // displaying the state of our simulation ****before**** this render pass (frame) 
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture( gl.TEXTURE_2D, texFront ) 
       gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture( gl.TEXTURE_2D, texFront2 ) 
      // put simulation on screen 
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
      gl.useProgram( programRender )   
      gl.uniform2f( UmousePos, mouseX, mouseY ) 
      gl.uniform1i( UisMouseDown, isMouseDown ) 
      gl.uniform1f( uTime, timeCounter)
      //assign texture unit
      gl.uniform1i(UposTexturePingPong, 0); 
      gl.uniform1i(UvelTexturePingPong, 1); 
      //
      let scale = gl.getUniformLocation( programRender, 'scale' ) 
      gl.uniform2f( scale, numPoints, numPoints )

      for( let i = 0; i < myGui.reactionSpeed; i++ ) pingpong()
 
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
      gl.bindTexture( gl.TEXTURE_2D, texBack ) 
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
}

