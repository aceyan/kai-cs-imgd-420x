    const glslify = require( 'glslify' )
    var myGui
  let UfeedRate, UkillRate, UdA, UdB, Udiffusion

window.onload = function() { 
var MyGUI = function() {
  this.name = 'Reaction Diffusion tutorial';
  this.killRate = .059;
  this.feedRate = .04;
  this.diffusionRateA = 0.53;
  this.diffusionRateB = 0.82;
  this.diffusionBchangeAcrossTheGrid = true;
  this.reactionSpeed = 10;
   this.reset = function() { reset() };
};
myGui = new MyGUI();
  var gui = new dat.GUI();
  gui.add(myGui, 'name');
  gui.add(myGui, 'killRate', 0, 0.1);
  gui.add(myGui, 'feedRate', 0, 0.1);
  gui.add(myGui, 'diffusionRateA', 0,1);
  gui.add(myGui, 'diffusionRateB', 0, 1);
  gui.add(myGui, 'diffusionBchangeAcrossTheGrid');
 gui.add(myGui, 'reactionSpeed', 1, 20);
  gui.add(myGui, 'reset');

    let canvas = document.querySelector( 'canvas' ) 
  let size = window.innerHeight > window.innerWidth ? window.innerWidth : window.innerHeight ;
  
    canvas.width = size
    canvas.height = size
    let gl = canvas.getContext( 'webgl' ) 
    let stateSize = Math.pow( 2, Math.floor(Math.log(canvas.width)/Math.log(2)) )
    
    let verts = [ 
      1, 1, 
      -1, 1, 
      -1,-1, 
      1, 1, 
      -1, -1, 
      1, -1, 
    ]

    let vertBuffer = gl.createBuffer() 
    gl.bindBuffer( gl.ARRAY_BUFFER, vertBuffer ) 
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW ) 
    gl.vertexAttribPointer( 0, 2, gl.FLOAT, false, 0, 0 ) 
    gl.enableVertexAttribArray( 0 )
  
    let shaderSource = glslify.file( './vshader.glsl' ) 
    const vertexShader = gl.createShader( gl.VERTEX_SHADER ) 
    gl.shaderSource( vertexShader, shaderSource ) 
    gl.compileShader( vertexShader )
    console.log( gl.getShaderInfoLog( vertexShader ) ) // create fragment shader to run our simulation
    
    shaderSource = glslify.file( './fshader_render.glsl' ) 
    const fragmentShaderRender = gl.createShader( gl.FRAGMENT_SHADER ) 
    gl.shaderSource( fragmentShaderRender, shaderSource ) 
    gl.compileShader( fragmentShaderRender ) 
    console.log( gl.getShaderInfoLog( fragmentShaderRender ) ) // create shader program const
      
    programRender = gl.createProgram() 
    gl.attachShader( programRender, vertexShader ) 
    gl.attachShader( programRender, fragmentShaderRender )
    gl.linkProgram( programRender )
    gl.useProgram( programRender )
    
  UfeedRate = gl.getUniformLocation( programRender, 'f' ) 
  UkillRate = gl.getUniformLocation( programRender, 'k' ) 
  UdA = gl.getUniformLocation( programRender, 'dA' ) 
  UdB = gl.getUniformLocation( programRender, 'dB' ) 
  Udiffusion = gl.getUniformLocation( programRender, 'diffusionBchangeAcrossTheGrid' ) 
    // create pointer to vertex array and uniform sharing simulation size 
    const position = gl.getAttribLocation( programRender, 'a_position' )
    gl.enableVertexAttribArray( position ) 
    gl.vertexAttribPointer( position, 2, gl.FLOAT, false, 0,0 ) 
    let scale = gl.getUniformLocation( programRender, 'scale' ) 
    gl.uniform2f( scale, stateSize, stateSize )
      
    // create shader program to draw our simulation to the screen 
    shaderSource = glslify.file( './fshader_draw.glsl' ) 
    fragmentShaderDraw = gl.createShader( gl.FRAGMENT_SHADER ) 
    gl.shaderSource( fragmentShaderDraw, shaderSource )
    gl.compileShader( fragmentShaderDraw ) 
    console.log( gl.getShaderInfoLog( fragmentShaderDraw ) ) 
      
    // create shader program
    programDraw = gl.createProgram() 
    gl.attachShader( programDraw, vertexShader ) 
    gl.attachShader( programDraw, fragmentShaderDraw ) 
    gl.linkProgram( programDraw )
    gl.useProgram( programDraw )

    scale = gl.getUniformLocation( programDraw, 'scale' ) 
    gl.uniform2f( scale, canvas.width,canvas.height ) 
    const position2 = gl.getAttribLocation( programDraw, 'a_position' ) 
    gl.enableVertexAttribArray( position2 )
    gl.vertexAttribPointer( position2, 2, gl.FLOAT, false, 0,0 )
  
  // enable floating point textures in the browser
    gl.getExtension('OES_texture_float'); 
    
    let texFront = gl.createTexture() 
    gl.bindTexture( gl.TEXTURE_2D, texFront ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST )
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST ) 
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, stateSize, stateSize, 0, gl.RGBA, gl.FLOAT, null ) 
    
    let texBack = gl.createTexture() 
    gl.bindTexture( gl.TEXTURE_2D, texBack ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST ) 
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, stateSize, stateSize, 0, gl.RGBA, gl.FLOAT, null )

    const pixelSize = 4 
    const feedSize = 48
    const initState = new Float32Array( stateSize * stateSize * pixelSize ) 
    const reset = function() { 
      for( let i = 0; i < stateSize; i++ ) { 
          for( let j = 0; j < stateSize * pixelSize; j+= pixelSize ) { 
          // this will be our 'a' value in the simulation 
          initState[ i * stateSize * pixelSize + j ] = 1 
          // selectively add 'b' value to middle of screen 
          if( i > stateSize / 2 - stateSize / feedSize  && i < stateSize / 2 + stateSize / feedSize ) { 
            const xmin = j > (stateSize*pixelSize) / 2 - stateSize / feedSize
            const xmax = j < (stateSize*pixelSize) / 2 + (stateSize*pixelSize) / feedSize 
            if( xmin && xmax ) { 
              initState[ i * stateSize * pixelSize + j + 1 ] = 1 
            } 
          } 
        } 
      } 
      
      gl.texSubImage2D( 
        gl.TEXTURE_2D, 0, 0, 0, stateSize, stateSize, gl.RGBA, gl.FLOAT, initState, 0 
      ) 
    }
    
    reset()
  
  const fb = gl.createFramebuffer() 
    const fb2 = gl.createFramebuffer() 
  
    const pingpong = function() {
      gl.bindFramebuffer( gl.FRAMEBUFFER, fb ) 
      // use the framebuffer to write to our texFront texture
      gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texFront, 0 ) 
      // set viewport to be the size of our state (reaction diffusion simulation) 
      // here, this represents the size that will be drawn onto our texture 
      gl.viewport(0, 0, stateSize, stateSize ) 
      // in our shaders, read from texBack, which is where we poked to 
      gl.bindTexture( gl.TEXTURE_2D, texBack ) // run shader 
      gl.drawArrays( gl.TRIANGLES, 0, 6 ) 
    
      gl.bindFramebuffer( gl.FRAMEBUFFER, fb2 )
      gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texBack, 0 ) 
      // set our viewport to be the size of our canvas 
      // so that it will fill it entirely 
      gl.viewport(0, 0, canvas.width, canvas.height )
      // select the texture we would like to draw the the screen. 
      // note that webgl does not allow you to write to / read from the 
      // same texture in a single render pass. Because of the swap, we're 
      // displaying the state of our simulation ****before**** this render pass (frame) 
      gl.bindTexture( gl.TEXTURE_2D, texFront ) 
      // put simulation on screen 
      gl.drawArrays( gl.TRIANGLES, 0, 6 ) 
    }
  
  const draw = function() { 
      gl.useProgram( programRender ) 
    gl.uniform1f( UfeedRate, myGui.feedRate )     
    gl.uniform1f( UkillRate, myGui.killRate )   
gl.uniform1f( UdA, myGui.diffusionRateA )  
gl.uniform1f( UdB, myGui.diffusionRateB )  
gl.uniform1i(Udiffusion, myGui.diffusionBchangeAcrossTheGrid )        
      for( let i = 0; i < myGui.reactionSpeed; i++ ) pingpong()
 
      // use the default framebuffer object by passing null 
      gl.bindFramebuffer( gl.FRAMEBUFFER, null ) 
    
      // set our viewport to be the size of our canvas 
      // so that it will fill it entirely 
      gl.viewport(0, 0, canvas.width, canvas.height )
      // select the texture we would like to draw the the screen. 
      gl.bindTexture( gl.TEXTURE_2D, texBack ) 
      // use our drawing (copy) shader 
      gl.useProgram( programDraw ) 
      // put simulation on screen
      gl.drawArrays( gl.TRIANGLES, 0, 6 ) 
        
      window.requestAnimationFrame( draw ) 
    }
     
    draw()
}