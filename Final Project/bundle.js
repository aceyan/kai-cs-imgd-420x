(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
    const glslify = require( 'glslify' )
    var myGui
   let time = 0
  let lastTime = 0;
  let acumulateTime = 0;
  let mouseX = 0;
  let mouseY = 0;
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
  //
  let UfeedbackAmount;
  let UfeedbackTextureOld, UfeedbackTextureNew;
  let texfeedbackFront, texfeedbackBack
  let UisEnableRainBow;

  var numPoints = 50;// number of points = numPoints * numPoints
  const MAX_POINTS = 22500;
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
this.I_Love_Rainbow = true;
  this.motionBlur = 0.01;
  this.frameRate = 35;


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
gui.add(myGui, 'I_Love_Rainbow');
   gui.add(myGui, 'motionBlur', 0, 1.0);
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

  
    let shaderSource = glslify(["#version 300 es\n  precision mediump float;\n#define GLSLIFY 1\n \n  layout(location = 0) in vec2 a_position; \n  void main() { \n    gl_Position = vec4( a_position, 0, 1.0); \n  } "]) 
    const vertexShader = gl.createShader( gl.VERTEX_SHADER ) 
    gl.shaderSource( vertexShader, shaderSource ) 
    gl.compileShader( vertexShader )
    console.log( gl.getShaderInfoLog( vertexShader ) ) // create fragment shader to run our simulation
    
    shaderSource = glslify(["#version 300 es\nprecision mediump float;\n#define GLSLIFY 1\n\n  uniform sampler2D posTexture; //xy is postion\n  uniform sampler2D velTexture; //xy is velocity\n  uniform vec2 scale;\n  uniform bool isMouseDown;\n  uniform vec2 mousePos;\n  //UI\n uniform float maxForce;\n uniform float maxSpeed;\n uniform float alignmentScale;\n uniform float cohesionScale;\n uniform float separationScale;\n uniform bool bmouseCentral;\n uniform bool bmousePredator;\n uniform bool bgyroscope;\n uniform vec2 gyroscopePos;\n\nlayout(location = 0) out vec4 o_newPos;\nlayout(location = 1) out vec4 o_newVel;\n\nvec2 align(vec4 currentPos, vec4 currentVel)\n{\n    float d = 0.2;\n    vec2 totalVelocity = vec2(0);\n    vec2 acc = vec2(0);\n    float num = 0.0;\n    for (float y = 0.0; y < scale.y; y++)\n    {\n      for (float x = 0.0; x < scale.x; x++) \n      { \n        vec2 neighborUV = vec2(x+0.5, y+0.5)/scale.xy;\n        vec4 neighborPos = texture( posTexture, neighborUV);\n        float distance = length(currentPos.xy - neighborPos.xy);\n        if(currentPos.xy!= neighborPos.xy && distance <= d)\n        {\n          totalVelocity += texture( velTexture, neighborUV).xy;\n          num++;\n        }\n      }\n    }\n    if(num > 0.0)\n    {\n      totalVelocity /= num;\n      totalVelocity = normalize(totalVelocity) * maxSpeed;\n      acc = totalVelocity - currentVel.xy;\n      if(length(acc) > maxForce)\n      {\n        acc = normalize(acc) * maxForce;\n      }\n    }\n    return acc;\n}\n\nvec2 cohesion(vec4 currentPos, vec4 currentVel)\n{\n     float d = 0.2;\n    vec2 totalVelocity = vec2(0);\n    vec2 acc = vec2(0);\n    float num = 0.0;\n\n    if(bmouseCentral)\n      {\n         totalVelocity += mousePos;\n         num++; \n      }\n      else if(bgyroscope)\n      {\n         totalVelocity += gyroscopePos;\n         num++; \n      }\n      else\n      {\n         for (float y = 0.0; y < scale.y; y++)\n          {\n            for (float x = 0.0; x < scale.x; x++) \n            { \n              vec2 neighborUV = vec2(x+0.5, y+0.5)/scale.xy;\n              vec4 neighborPos = texture( posTexture, neighborUV);\n              float distance = length(currentPos.xy - neighborPos.xy);\n              if(currentPos.xy!= neighborPos.xy && distance <= d)\n              {\n                totalVelocity += neighborPos.xy;\n                num++;\n              }\n            }\n          }\n      }\n   \n    if(num > 0.0)\n    {\n      totalVelocity /= num;\n      totalVelocity = totalVelocity - currentPos.xy;\n      totalVelocity = normalize(totalVelocity) * maxSpeed;\n      acc = totalVelocity - currentVel.xy;\n      if(length(acc) > maxForce)\n      {\n        acc = normalize(acc) * maxForce;\n      }\n    }\n    return acc;\n}\n\nvec2 separation(vec4 currentPos, vec4 currentVel)\n{\n    float d = 0.2;\n    vec2 totalVelocity = vec2(0);\n    vec2 acc = vec2(0);\n    float num = 0.0;\n    for (float y = 0.0; y < scale.y; y++)\n    {\n      for (float x = 0.0; x < scale.x; x++) \n      { \n        vec2 neighborUV = vec2(x+0.5, y+0.5)/scale.xy;\n        vec4 neighborPos = texture( posTexture, neighborUV);\n        float distance = length(currentPos.xy - neighborPos.xy);\n        if(currentPos.xy!= neighborPos.xy && distance <= d)\n        {\n          vec2 diff = currentPos.xy - neighborPos.xy;\n          diff /= distance;\n          totalVelocity += diff;\n          num++;\n        }\n      }\n    }\n\n    if(bmousePredator)\n      {\n        float distance = length(currentPos.xy - mousePos);\n        if(distance <= d)\n        {\n           vec2 diff = currentPos.xy - mousePos;\n            diff /= distance;\n            totalVelocity += diff * 100000.0;\n            num++;\n        }\n         \n      }\n\n    if(num > 0.0)\n    {\n      totalVelocity /= num;\n      totalVelocity = normalize(totalVelocity) * maxSpeed;\n      acc = totalVelocity - currentVel.xy;\n      if(length(acc) > maxForce)\n      {\n        acc = normalize(acc) * maxForce;\n      }\n    }\n    return acc;\n}\n\nvoid main() \n{ \n      vec2 uv = vec2(gl_FragCoord.xy)/ scale;\n      vec4 currentPos = texture( posTexture, uv);\n      vec4 currentVel = texture( velTexture, uv);\n\n      vec2 acc;\n      acc += align(currentPos, currentVel) * alignmentScale;\n      acc += cohesion(currentPos, currentVel) * cohesionScale;\n      acc += separation(currentPos, currentVel) * separationScale;\n    \n    currentPos.xy += currentVel.xy;\n\n    if(currentPos.x >= 1.0)\n    {\n      currentPos.x = -1.0;\n    }\n    else if(currentPos.x <= -1.0)\n    {\n      currentPos.x = 1.0;\n    }\n\n    if(currentPos.y >= 1.0)\n    {\n      currentPos.y = -1.0;\n    }\n    else if(currentPos.y <= -1.0)\n    {\n      currentPos.y = 1.0;\n    }\n\n    currentVel.xy += acc;\n\n    o_newPos = currentPos;\n    o_newVel = currentVel;\n    \n\t\t\t\n\t}"]) 
    const fragmentShaderRender = gl.createShader( gl.FRAGMENT_SHADER ) 
    gl.shaderSource( fragmentShaderRender, shaderSource ) 
    gl.compileShader( fragmentShaderRender ) 
    console.log( gl.getShaderInfoLog( fragmentShaderRender ) ) // create shader program const
      
    //used to render position texture and velocity texture
    programRender = gl.createProgram() 
    gl.attachShader( programRender, vertexShader ) 
    gl.attachShader( programRender, fragmentShaderRender )
    gl.linkProgram( programRender )
    gl.useProgram( programRender )
      

    UisMouseDown = gl.getUniformLocation( programRender, 'isMouseDown' ) 
    UmousePos = gl.getUniformLocation( programRender, 'mousePos' ) 
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

    
    shaderSource = glslify(["#version 300 es\nprecision mediump float;\n#define GLSLIFY 1\n\n  uniform vec2 scale; \n  out vec4 o_finalColor;\n  uniform float feedbackAmount;\n  uniform sampler2D feedbackTextureOld;\n  uniform sampler2D feedbackTextureNew;\nvoid main() \n{ \n\tvec2 uv = vec2(gl_FragCoord.xy / scale);\n    vec4 prior = texture( feedbackTextureOld, uv );\n    vec4 new = texture( feedbackTextureNew, uv );\n\tvec4  finalCol = vec4( (new.rgb * (1.0 - feedbackAmount) + prior.rgb * feedbackAmount), 1. );\n    o_finalColor = finalCol; \n  }"]) 
    const fragmentShaderFeedBack = gl.createShader( gl.FRAGMENT_SHADER ) 
    gl.shaderSource( fragmentShaderFeedBack, shaderSource ) 
    gl.compileShader( fragmentShaderFeedBack ) 
    console.log( gl.getShaderInfoLog( fragmentShaderFeedBack ) ) // create shader program const
      
     //used to draw feedback effect, motionblur
    programFeedBack = gl.createProgram() 
    gl.attachShader( programFeedBack, vertexShader ) 
    gl.attachShader( programFeedBack, fragmentShaderFeedBack )
    gl.linkProgram( programFeedBack )
    gl.useProgram( programFeedBack )
    

    UfeedbackAmount  = gl.getUniformLocation( programFeedBack, 'feedbackAmount' ) 
    UfeedbackTextureOld  = gl.getUniformLocation( programFeedBack, 'feedbackTextureOld' ) 
    UfeedbackTextureNew  = gl.getUniformLocation( programFeedBack, 'feedbackTextureNew' ) 


   shaderSource = glslify(["#version 300 es\nprecision mediump float;\n#define GLSLIFY 1\n\n  uniform vec2 scale; \n  out vec4 o_finalColor;\n  uniform sampler2D feedBackTexture;\nvoid main() \n{ \n  vec2 uv = vec2(gl_FragCoord.xy / scale);\n    vec4 new = texture( feedBackTexture, uv );\n  \n    o_finalColor = vec4(new.xyz, 1.0); \n  }"]) 
    const fragmentShaderScreen = gl.createShader( gl.FRAGMENT_SHADER ) 
    gl.shaderSource( fragmentShaderScreen, shaderSource ) 
    gl.compileShader( fragmentShaderScreen ) 
    console.log( gl.getShaderInfoLog( fragmentShaderScreen ) ) 
      
    //just draw a texutre to screen
    programDrawScreen = gl.createProgram() 
    gl.attachShader( programDrawScreen, vertexShader ) 
    gl.attachShader( programDrawScreen, fragmentShaderScreen )
    gl.linkProgram( programDrawScreen )
    gl.useProgram( programDrawScreen )

    //vertex index
    //by using gpu instance, we can use only one vertex to draw multiple instances of them!
    let verts2 = new Float32Array(1);
    verts2[0] = 0;

    //vertex buffer
    let vertBuffer2 = gl.createBuffer() 
    gl.bindBuffer( gl.ARRAY_BUFFER, vertBuffer2 ) 
    gl.bufferData( gl.ARRAY_BUFFER, verts2, gl.STATIC_DRAW ) 


  shaderSource = glslify(["#version 300 es\n  precision mediump float;\n#define GLSLIFY 1\n \n  //layout(location = 0) in float a_index; \n  uniform vec2 scale;\n  uniform sampler2D posTexture; \n  void main() { \n  \tvec2 uv;\n  \tuv.x = ( float(int(gl_InstanceID) % int(scale.x)) + 0.5 ) / scale.x;\n  \tuv.y = ( float(gl_InstanceID) / scale.x + 0.5 ) / scale.y;\n  \tvec4 currentPos = texture( posTexture, uv); \n  \tgl_PointSize = 2.5;\n    gl_Position = vec4(currentPos.xy, 0, 1.0);//use position from texture!\n  } "]) 
   vertexShaderPoint = gl.createShader( gl.VERTEX_SHADER ) 
    gl.shaderSource( vertexShaderPoint, shaderSource ) 
    gl.compileShader( vertexShaderPoint )
    console.log( gl.getShaderInfoLog( vertexShaderPoint ) ) 
    shaderSource = glslify(["#version 300 es\nprecision mediump float;\n#define GLSLIFY 1\nuniform float time;\nuniform vec2 scaleOfScreen; \nout vec4 o_finalColor;\nuniform bool isEnableRainBow;\nconst float TWO_PI = 6.28;\n\n//from book of shader\nvec3 hsb2rgb( in vec3 c )\n{\n    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),\n                             6.0)-3.0)-1.0,\n                     0.0,\n                     1.0 );\n    rgb = rgb*rgb*(3.0-2.0*rgb);\n    return c.z * mix( vec3(1.0), rgb, c.y);\n}\n\n  void main() \n  { \n  \tif(isEnableRainBow)\n  \t{\n\t  \tvec2 uv = vec2( gl_FragCoord.xy  / scaleOfScreen);\n\n\t \tvec3 color = vec3(0.0);\n\n\t    vec2 toCenter = vec2(0.5)-uv;\n\t    float angle = atan(toCenter.y,toCenter.x) + time  * TWO_PI * 0.005;\n\t    float radius = length(toCenter)*2.0;\n\n\t    color = hsb2rgb(vec3((angle/TWO_PI)+0.5,radius,1.0));\n\n\t    o_finalColor = vec4( color, 1. ); \n  \t}\n  \telse\n  \t{\n  \t\to_finalColor = vec4( 1., 1., 1., 1. ); \n  \t}\n  \t\n  }"]) 
    fragmentShaderDraw = gl.createShader( gl.FRAGMENT_SHADER ) 
    gl.shaderSource( fragmentShaderDraw, shaderSource )
    gl.compileShader( fragmentShaderDraw ) 
    console.log( gl.getShaderInfoLog( fragmentShaderDraw ) ) 
      
    //draw points to texture
    programDraw = gl.createProgram() 
    gl.attachShader( programDraw, vertexShaderPoint ) 
    gl.attachShader( programDraw, fragmentShaderDraw ) 
    gl.linkProgram( programDraw )
    gl.useProgram( programDraw )

UposTextureDrawPoints = gl.getUniformLocation( programDraw, 'posTexture' ) 
UisEnableRainBow = gl.getUniformLocation( programDraw, 'isEnableRainBow' ) 
    
    let texPosFront = gl.createTexture() //xy for posistion
    gl.bindTexture( gl.TEXTURE_2D, texPosFront ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST )
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST ) 
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA32F, numPoints, numPoints, 0, gl.RGBA, gl.FLOAT, null ) 

     let texVelFront = gl.createTexture()  //xy for velocity
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

     let texVelBack = gl.createTexture()  //xy for velocity
    gl.bindTexture( gl.TEXTURE_2D, texVelBack ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST ) 
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA32F, numPoints, numPoints, 0, gl.RGBA, gl.FLOAT, null )

    reset(0.005)


    texScreenNew = gl.createTexture() 
    gl.bindTexture( gl.TEXTURE_2D, texScreenNew ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST ) 
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null )

    //textures for feedback effect
    texfeedbackFront = gl.createTexture() 
    gl.bindTexture( gl.TEXTURE_2D, texfeedbackFront ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST ) 
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null )

    texfeedbackBack = gl.createTexture()  
    gl.bindTexture( gl.TEXTURE_2D, texfeedbackBack ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST ) 
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST ) 
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null )
      

    //used as target of drawing position and velocity texture
    const fb = gl.createFramebuffer() 
    const fb2 = gl.createFramebuffer() 
    //for feedback
    const fb_feedback = gl.createFramebuffer() 
  
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
 


      //render particles to texture

      gl.bindFramebuffer( gl.FRAMEBUFFER, fb_feedback ) 
      gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texScreenNew, 0 )
      gl.bindBuffer( gl.ARRAY_BUFFER, vertBuffer2 ) 
      //gl.vertexAttribPointer( 0, 1, gl.FLOAT, false, 0, 0 ) 
      //gl.enableVertexAttribArray( 0 )

      gl.viewport(0, 0, canvas.width, canvas.height )

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture( gl.TEXTURE_2D, texPosBack ) 

      gl.useProgram( programDraw ) 
      gl.uniform1i(UposTextureDrawPoints, 0); 

      scale = gl.getUniformLocation( programDraw, 'scale' ) 
      gl.uniform2f( scale, numPoints, numPoints ) 

      scaleOfScreen = gl.getUniformLocation( programDraw, 'scaleOfScreen' ) 
      gl.uniform2f( scaleOfScreen, canvas.width, canvas.height ) 

      uTime = gl.getUniformLocation( programDraw, 'time' )
      gl.uniform1f( uTime, timeCounter ) 

      gl.uniform1i( UisEnableRainBow, myGui.I_Love_Rainbow ) 

      gl.clearColor(0,0,0,1)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.drawArraysInstanced(gl.POINTS, 0, 1, numPoints * numPoints) //use gpu instance!!!
      //gl.drawArrays( gl.POINTS, 0, numPoints * numPoints  )



      //feedback!
      gl.bindFramebuffer( gl.FRAMEBUFFER, fb_feedback ) 
       gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texfeedbackFront, 0 )
      gl.bindBuffer( gl.ARRAY_BUFFER, vertBuffer ) 
      gl.vertexAttribPointer( 0, 2, gl.FLOAT, false, 0, 0 ) 
      gl.enableVertexAttribArray( 0 )

      gl.viewport(0, 0, canvas.width, canvas.height )
      
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture( gl.TEXTURE_2D, texfeedbackBack ) 
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture( gl.TEXTURE_2D, texScreenNew ) 

      gl.useProgram( programFeedBack )
      // 
      gl.uniform1f(UfeedbackAmount, myGui.motionBlur); 
      gl.uniform1i(UfeedbackTextureOld, 0); 
      gl.uniform1i(UfeedbackTextureNew, 1); 
      scale = gl.getUniformLocation( programFeedBack, 'scale' ) 
      gl.uniform2f( scale, canvas.width, canvas.height  )
      gl.drawArrays( gl.TRIANGLES, 0, 6 ) 


      //draw to screen
      gl.bindFramebuffer( gl.FRAMEBUFFER, null ) 
      gl.bindBuffer( gl.ARRAY_BUFFER, vertBuffer ) 
      gl.vertexAttribPointer( 0, 2, gl.FLOAT, false, 0, 0 ) 
      gl.enableVertexAttribArray( 0 )

      gl.viewport(0, 0, canvas.width, canvas.height )
      
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture( gl.TEXTURE_2D, texfeedbackBack ) 

      gl.useProgram( programDrawScreen )
      // 
      scale = gl.getUniformLocation( programDrawScreen, 'scale' ) 
      gl.uniform2f( scale, canvas.width, canvas.height  )

      gl.clearColor(0,0,0,1)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays( gl.TRIANGLES, 0, 6 ) 
        

  let tmp = texfeedbackFront
  texfeedbackFront = texfeedbackBack
  texfeedbackBack = tmp


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

  //gyroscope interaction!
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
