(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
  
    let shaderSource = glslify(["  precision mediump float;\n#define GLSLIFY 1\n \n  attribute vec2 a_position; \n  void main() { \n    gl_Position = vec4( a_position, 0, 1.0); \n  } "]) 
    const vertexShader = gl.createShader( gl.VERTEX_SHADER ) 
    gl.shaderSource( vertexShader, shaderSource ) 
    gl.compileShader( vertexShader )
    console.log( gl.getShaderInfoLog( vertexShader ) ) // create fragment shader to run our simulation
    
    shaderSource = glslify(["precision mediump float;\n#define GLSLIFY 1\n\n  uniform sampler2D state; \n  uniform vec2 scale;\n  uniform float f;\n  uniform float k;\n  uniform float dA;\n   uniform float dB;\n   uniform bool diffusionBchangeAcrossTheGrid;\n  //float f=.0545, k=.062, dA = 1., dB = 0.; // coral preset \n  \n  vec2 get(int x, int y) { \n    return texture2D( state, ( gl_FragCoord.xy + vec2(x, y) ) / scale ).rg; \n  } \n  \n  vec2 run() { \n  vec2 uv = vec2(gl_FragCoord.xy) / scale;\n\tfloat dis = length(uv - vec2(0.5)) + 0.15;\n    vec2 state = get( 0, 0 ); \n    float a = state.r; \n    float b = state.g; \n    float sumA = a * -1.; \n    float sumB = b * -1.; \n    \n    sumA += get(-1,0).r * .2; \n    sumA += get(-1,-1).r * .05; \n    sumA += get(0,-1).r * .2; \n    sumA += get(1,-1).r * .05; \n    sumA += get(1,0).r * .2; \n    sumA += get(1,1).r * .05; \n    sumA += get(0,1).r * .2; \n    sumA += get(-1,1).r * .05;\n    \n    sumB += get(-1,0).g * .2; \n    sumB += get(-1,-1).g * .05; \n    sumB += get(0,-1).g * .2; \n    sumB += get(1,-1).g * .05; \n    sumB += get(1,0).g * .2; \n    sumB += get(1,1).g * .05; \n    sumB += get(0,1).g * .2; \n    sumB += get(-1,1).g * .05; \n    \n    state.r = a + dA  \n      * sumA - \n      a * b * b + \n      f * (1. - a); \n      \n\t  \n\tfloat factorB = diffusionBchangeAcrossTheGrid? dis : 1.0;\n    state.g = b + dB *  factorB * \n      sumB + \n      a * b * b - \n      ((k+f) * b);\n      \n    return state; \n  } \n  void main() { \n    vec2 nextState = run(); \n    gl_FragColor = vec4( nextState.r, nextState.g, 0., 1. ); \n  } "]) 
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
    shaderSource = glslify(["precision mediump float;\n#define GLSLIFY 1\n\n  uniform sampler2D state; \n  uniform vec2 scale; \n  \n  void main() { \n    vec4 color = texture2D(state, gl_FragCoord.xy / scale); \n    gl_FragColor = vec4( 1.-color.x, 1.-color.x, 1.-color.x, 1. ); \n  }"]) 
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
},{"glslify":2}],2:[function(require,module,exports){
module.exports = function(strings) {
  if (typeof strings === 'string') strings = [strings]
  var exprs = [].slice.call(arguments,1)
  var parts = []
  for (var i = 0; i < strings.length-1; i++) {
    parts.push(strings[i], exprs[i] || '')
  }
  parts.push(strings[i])
  return parts.join('')
}

},{}]},{},[1]);
