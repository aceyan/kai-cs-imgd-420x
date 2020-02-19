(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
    const glslify = require( 'glslify' )
    var myGui
   let time = 0
  let lastTime = 0;
  let acumulateTime = 0;
window.onload = function() { 
var MyGUI = function() {
  this.name = 'Reaction Diffusion tutorial';
  this.reactionSpeed = 1;
    this.frameRate = 1;
   this.reset = function() { reset() };
};
myGui = new MyGUI();
  var gui = new dat.GUI();
  gui.add(myGui, 'name');
 gui.add(myGui, 'reactionSpeed', 1, 20);
   gui.add(myGui, 'frameRate', 0, 60);
  gui.add(myGui, 'reset');

    let canvas = document.querySelector( 'canvas' ) 
    let gl = canvas.getContext( 'webgl' ) 
    size = 1024
    canvas.width = size
    canvas.height = size
    let stateSize = size
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
    
    shaderSource = glslify(["precision mediump float;\n#define GLSLIFY 1\n\n  uniform sampler2D state; \n  uniform vec2 scale;\n  \nfloat ALPHA_M = 0.147;\nfloat ALPHA_N = 0.028;\nfloat B1 = 0.278;\nfloat B2 =  0.365;\nfloat D1 = 0.267;\nfloat D2 = 0.445;\n\nconst float Ra = 9.0;\nconst float Ri = 3.0;\nfloat b = 1.0;\nfloat PI = 3.1415926;\n\nfloat  sigma1(float alpha, float x, float a)\n{\n\treturn 1.0 / (1.0 + exp(-(x - a) * 4.0 / alpha));\n}\n\n//for n\nfloat sigma2(float x, float a, float b)\n{\n\treturn sigma1(ALPHA_N, x, a) * (1.0 - sigma1(ALPHA_N, x, b) );\n}\n\nfloat sigma_m(float x, float y, float m) \n{\n    float sigma = sigma1(ALPHA_M, m, 0.5);\n    return x * (1.0 - sigma) + y * sigma;\n }\n\nfloat s(float n, float m)\n{\n\treturn sigma2(n, sigma_m(B1, D1, m), sigma_m(B2, D2, m));\n}\n\nvoid main() \n{ \n\n  float m = 0.0;//inner\n  float n = 0.0;//outter\n  float innerArea = PI * Ri * Ri;\n  float outterArea = PI * (Ra*Ra - Ri*Ri);\n  for(float i = -Ra; i <= Ra; i++)\n  {\n  \tfor(float j = -Ra; j <= Ra; j++)\n  \t{\n  \t\tfloat l = sqrt(i * i + j * j);\n  \t\tvec2 uv = (vec2(gl_FragCoord.xy) + vec2(i,j)) / scale;\n  \t\tfloat vaule = texture2D( state, uv).r;\n  \t\t\n  \t\t//for m, inner \t\n  \t\tif(l < Ri - b / 2.0)\n  \t\t{\n  \t\t\tm += vaule;\n  \t\t}\n  \t\telse if(l > Ri + b / 2.0)\n  \t\t{\n  \t\t\t//do nothing\n  \t\t}\n  \t\telse\n  \t\t{\n  \t\t\tm += vaule * (Ri + b/2.0 - l) / b;\n  \t\t}\n  \t\t\n  \t\t//for n, outter\n  \t\tif(l < Ra - b / 2.0 )\n  \t\t{\n  \t\t\tif(l > Ri + b / 2.0)\n  \t\t\t{\n  \t\t\t\tn += vaule;\n  \t\t\t}\n  \t\t\telse if(l < Ri - b / 2.0 )\n  \t\t\t{\n  \t\t\t\t//do nothing\n  \t\t\t}\n  \t\t\telse\n  \t\t\t{\n  \t\t\t\tn += vaule * (Ri + b/2.0 - l) / b;\n  \t\t\t}\n  \t\t}\n  \t\telse if(l > Ra + b / 2.0)\n  \t\t{\n  \t\t\t//do nothing\n  \t\t}\n  \t\telse\n  \t\t{\n  \t\t\tn += vaule * (Ra + b/2.0 - l) / b;\n  \t\t}\n  \t\t\n  \t\t\n  \t}\n  }\n\n  m /= innerArea;\n  n /= outterArea;\n\n  float result = s(n,m);\n    \n    gl_FragColor = vec4( vec3(result), 1. ); \n  //vec4 textureColor = texture2D( state,  gl_FragCoord.xy  / scale ); \n  //gl_FragColor = vec4( textureColor.rgb, 1. ); \n} "]) 
    const fragmentShaderRender = gl.createShader( gl.FRAGMENT_SHADER ) 
    gl.shaderSource( fragmentShaderRender, shaderSource ) 
    gl.compileShader( fragmentShaderRender ) 
    console.log( gl.getShaderInfoLog( fragmentShaderRender ) ) // create shader program const
      
    programRender = gl.createProgram() 
    gl.attachShader( programRender, vertexShader ) 
    gl.attachShader( programRender, fragmentShaderRender )
    gl.linkProgram( programRender )
    gl.useProgram( programRender )
    
 
    // create pointer to vertex array and uniform sharing simulation size 
    const position = gl.getAttribLocation( programRender, 'a_position' )
    gl.enableVertexAttribArray( position ) 
    gl.vertexAttribPointer( position, 2, gl.FLOAT, false, 0,0 ) 
    let scale = gl.getUniformLocation( programRender, 'scale' ) 
    gl.uniform2f( scale, stateSize, stateSize )
      
    // create shader program to draw our simulation to the screen 
    shaderSource = glslify(["precision mediump float;\n#define GLSLIFY 1\n\n  uniform sampler2D state; \n  uniform vec2 scale; \n  \n  void main() { \n    vec4 color = texture2D(state, gl_FragCoord.xy / scale); \n    gl_FragColor = vec4( color.rgb, 1. ); \n  }"]) 
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
    gl.uniform2f( scale, stateSize,stateSize ) 
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
    const initState = new Float32Array( stateSize * stateSize * pixelSize ) 
    const reset = function() { 
      for( let i = 0; i < stateSize * stateSize; i++ ) 
      { 
          var ii = pixelSize * i;
          var factor;
          if(Math.random() < 0.25)
          {
           factor = 1;
          }
          else
          {
           factor = 0;
          }
            initState[ ii ] = 1 * factor;
            initState[ ii + 1] = 1 * factor;
            initState[ ii + 2] = 1 * factor;

            initState[ ii + 3] = 1 

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

          window.requestAnimationFrame( draw ) 
 var now = Date.now();
    acumulateTime +=  now - lastTime;
    lastTime = now;
    
    var frameTime = 1.0 / myGui.frameRate * 1000;
    if(acumulateTime < frameTime)
    {
      return;
    }
    acumulateTime = 0;

      gl.useProgram( programRender )   
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
