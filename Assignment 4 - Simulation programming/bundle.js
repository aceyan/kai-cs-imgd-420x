(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
  let UALPHA_M, UALPHA_N, UB1, UB2, UD1, UD2;

window.onload = function() { 
var MyGUI = function() {
  this.name = "Kai's assignment4 - Simulation programming";
  this.ALPHA_M = 0.147;
  this.ALPHA_N =  0.028;
 this.B1 =  0.278;
  this.B2 =  0.365;
this.D1 = 0.267;
this.D2 = 0.445;
  this.reactionSpeed = 1;
    this.frameRate = 24;
   this.reset = function() { reset(0.25) };
   this.clearScreen = function() { reset(1) };
};
myGui = new MyGUI();
  var gui = new dat.GUI();
  gui.add(myGui, 'name');

 gui.add(myGui, 'ALPHA_M', 0, 0.5);
   gui.add(myGui, 'ALPHA_N', 0, 0.5);
 gui.add(myGui, 'B1', 0, 0.5);
  gui.add(myGui, 'B2', 0, 0.5);
   gui.add(myGui, 'D1',  0, 0.5);
   gui.add(myGui, 'D2',  0, 0.5);
//
 gui.add(myGui, 'reactionSpeed', 1, 20);
   gui.add(myGui, 'frameRate', 0, 60);
  gui.add(myGui, 'reset');
   gui.add(myGui, 'clearScreen');

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
    
    shaderSource = glslify(["precision mediump float;\n#define GLSLIFY 1\n\n  uniform sampler2D state; \n  uniform vec2 scale;\n  uniform bool isMouseDown;\n  uniform vec2 mousePos;\n  uniform float time;\n  //\n  uniform float ALPHA_M;\nuniform float ALPHA_N;\nuniform float B1;\nuniform float B2;\nuniform float D1;\nuniform float D2;\n\n//float ALPHA_M = 0.147;\n//float ALPHA_N = 0.028;\n//float B1 = 0.278;\n//float B2 =  0.365;\n//float D1 = 0.267;\n//float D2 = 0.445;\n\nfloat b = 1.0;\nfloat PI = 3.1415926;\n\nconst float Ra = 9.0;\nconst float Ri = 3.0;\n\nfloat  sigma1(float alpha, float x, float a)\n{\n\treturn 1.0 / (1.0 + exp(-(x - a) * 4.0 / alpha));\n}\n\n//for n\nfloat sigma2(float x, float a, float b)\n{\n\treturn sigma1(ALPHA_N, x, a) * (1.0 - sigma1(ALPHA_N, x, b) );\n}\n\nfloat sigma_m(float x, float y, float m) \n{\n    float sigma = sigma1(ALPHA_M, m, 0.5);\n    return x * (1.0 - sigma) + y * sigma;\n }\n\nfloat s(float n, float m)\n{\n\treturn sigma2(n, sigma_m(B1, D1, m), sigma_m(B2, D2, m));\n}\n\n//from book of shader\nvec3 hsb2rgb( in vec3 c )\n{\n    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),\n                             6.0)-3.0)-1.0,\n                     0.0,\n                     1.0 );\n    rgb = rgb*rgb*(3.0-2.0*rgb);\n    return c.z * mix( vec3(1.0), rgb, c.y);\n}\n\nvoid main() \n{ \n\n  float m = 0.0;//inner\n  float n = 0.0;//outter\n  float innerArea = PI * Ri * Ri;\n  float outterArea = PI * (Ra*Ra - Ri*Ri);\n  for(float i = -Ra; i <= Ra; i++)\n  {\n  \tfor(float j = -Ra; j <= Ra; j++)\n  \t{\n  \t\tfloat l = sqrt(i * i + j * j);\n  \t\tvec2 uv = (vec2(gl_FragCoord.xy) + vec2(i,j)) / scale;\n  \t\tfloat vaule = texture2D( state, uv).w;\n  \t\t\n  \t\t//for m, inner \t\n  \t\tif(l < Ri - b / 2.0)\n  \t\t{\n  \t\t\tm += vaule;\n  \t\t}\n  \t\telse if(l > Ri + b / 2.0)\n  \t\t{\n  \t\t\t//do nothing\n  \t\t}\n  \t\telse\n  \t\t{\n  \t\t\tm += vaule * (Ri + b/2.0 - l) / b;\n  \t\t}\n  \t\t\n  \t\t//for n, outter\n  \t\tif(l < Ra - b / 2.0 )\n  \t\t{\n  \t\t\tif(l > Ri + b / 2.0)\n  \t\t\t{\n  \t\t\t\tn += vaule;\n  \t\t\t}\n  \t\t\telse if(l < Ri - b / 2.0 )\n  \t\t\t{\n  \t\t\t\t//do nothing\n  \t\t\t}\n  \t\t\telse\n  \t\t\t{\n  \t\t\t\tn += vaule * (Ri + b/2.0 - l) / b;\n  \t\t\t}\n  \t\t}\n  \t\telse if(l > Ra + b / 2.0)\n  \t\t{\n  \t\t\t//do nothing\n  \t\t}\n  \t\telse\n  \t\t{\n  \t\t\tn += vaule * (Ra + b/2.0 - l) / b;\n  \t\t}\n  \t\t\n  \t\t\n  \t}\n  }\n\n  m /= innerArea;\n  n /= outterArea;\n\n  float result = s(n,m);\n    \n\tif(isMouseDown)\n\t{\n\t\n\t\tvec2 toMousePos = vec2( gl_FragCoord.xy  / scale) - mousePos;\n\t\tfloat dist = length(toMousePos);\n\n \t\tvec3 color = vec3(0.0);\n\n    \n\t    float angle = atan(toMousePos.y,toMousePos.x) + time  * PI;\n\t    float radius = length(toMousePos)*2.0;\n\t\tcolor = hsb2rgb(vec3((angle/2.0*PI)+0.5,radius,1.0));\n\t   \tif(dist <= Ra / scale.x) \n\t \t{\n\t        \tresult = step((Ri+1.5)/scale.x, dist) * (1.0 - step(Ra/scale.x, dist));\n\t\t}\n\t\t\n\t\tgl_FragColor = vec4( color*result , result); \n\t}\n\telse\n\t{\n\n\t\t\tgl_FragColor = vec4( sin(result * 12.0 * PI), sin(result * 22.0 * PI), sin(result * 32.0 * PI) , result); \n\t}\n\n}"]) 
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
      

    UisMouseDown = gl.getUniformLocation( programRender, 'isMouseDown' ) 
    UmousePos = gl.getUniformLocation( programRender, 'mousePos' ) 
    uTime = gl.getUniformLocation( programRender, 'time' ) 
    UALPHA_M  = gl.getUniformLocation( programRender, 'ALPHA_M' ) 
    UALPHA_N  = gl.getUniformLocation( programRender, 'ALPHA_N' ) 
    UB1  = gl.getUniformLocation( programRender, 'B1' ) 
    UB2  = gl.getUniformLocation( programRender, 'B2' ) 
    UD1  = gl.getUniformLocation( programRender, 'D1' ) 
    UD2  = gl.getUniformLocation( programRender, 'D2' ) 

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
    const reset = function(pct) { 

  
      for( let i = 0; i < stateSize * stateSize; i++ ) 
      { 
          var ii = pixelSize * i;
          var factor;
          if(Math.random() < pct)
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

            initState[ ii + 3] = 1  * factor;

      } 
      
      gl.texSubImage2D( 
        gl.TEXTURE_2D, 0, 0, 0, stateSize, stateSize, gl.RGBA, gl.FLOAT, initState, 0 
      ) 
      
    }
    reset(0.25)

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

      timeCounter++;
      gl.useProgram( programRender )   
      gl.uniform2f( UmousePos, mouseX, mouseY ) 
      gl.uniform1i( UisMouseDown, isMouseDown ) 
      gl.uniform1f( uTime, timeCounter)
      //
      gl.uniform1f( UALPHA_M, myGui.ALPHA_M)
     gl.uniform1f( UALPHA_N, myGui.ALPHA_N)
     gl.uniform1f( UB1, myGui.B1)
      gl.uniform1f( UB2, myGui.B2)
      gl.uniform1f( UD1, myGui.D1)
        gl.uniform1f( UD2, myGui.D2)
      //
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
