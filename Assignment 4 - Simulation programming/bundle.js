(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
    const glslify = require( 'glslify' )
    // "global" variables
    let gl, uTime

    window.onload = function() {
      const canvas = document.getElementById( 'gl' )
      gl = canvas.getContext( 'webgl' )
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      // define drawing area of canvas. bottom corner, width / height
      gl.viewport( 0,0,gl.drawingBufferWidth, gl.drawingBufferHeight )

      // create a buffer object to store vertices
      const buffer = gl.createBuffer()

      // point buffer at graphic context's ARRAY_BUFFER
      gl.bindBuffer( gl.ARRAY_BUFFER, buffer )

      const triangles = new Float32Array([
        -1, -1,
        1,  -1,
        -1, 1,
        -1, 1,
        1, -1,
        1, 1
      ])

      // initialize memory for buffer and populate it. Give
      // open gl hint contents will not change dynamically.
      gl.bufferData( gl.ARRAY_BUFFER, triangles, gl.STATIC_DRAW )

      // create vertex shader
      let shaderSource = glslify(["#define GLSLIFY 1\n    attribute vec2 a_position;\n\n    void main() {\n      gl_Position = vec4( a_position, 0., 1. );\n    }"]) 
      const vertexShader = gl.createShader( gl.VERTEX_SHADER )
      gl.shaderSource( vertexShader, shaderSource );
      gl.compileShader( vertexShader )

      // create fragment shader
      shaderSource = glslify(["#ifdef GL_ES\nprecision mediump float;\n#define GLSLIFY 1\n#endif\n\n//\n// Description : Array and textureless GLSL 2D/3D/4D simplex\n//               noise functions.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute(vec4 x) {\n     return mod289(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise(vec3 v)\n  {\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g;\n  vec3 i1 = min( g.xyz, l.zxy );\n  vec3 i2 = max( g.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod289(i);\n  vec4 p = permute( permute( permute(\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D.wyz - D.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1.xy,h.z);\n  vec3 p3 = vec3(a1.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n  }\n\nfloat luma(vec3 color) {\n  return dot(color, vec3(0.299, 0.587, 0.114));\n}\n\nfloat luma(vec4 color) {\n  return dot(color.rgb, vec3(0.299, 0.587, 0.114));\n}\n\nfloat character(float n, vec2 p) {\n  p = floor(p*vec2(4.0, -4.0) + 2.5);\n  if (clamp(p.x, 0.0, 4.0) == p.x && clamp(p.y, 0.0, 4.0) == p.y){\n    if (int(mod(n/exp2(p.x + 5.0*p.y), 2.0)) == 1) return 1.0;\n  }\n  return 0.0;\n}\n\nfloat asciiFilter(vec3 color, vec2 uv, float pixelSize) {\n  float threshold = luma(color);\n  float n =  65536.0;                  // .\n  if (threshold > 0.2) n = 65600.0;    // :\n  if (threshold > 0.3) n = 332772.0;   // *\n  if (threshold > 0.4) n = 15255086.0; // o\n  if (threshold > 0.5) n = 23385164.0; // &\n  if (threshold > 0.6) n = 15252014.0; // 8\n  if (threshold > 0.7) n = 13199452.0; // @\n  if (threshold > 0.8) n = 11512810.0; // #\n  vec2 p = mod( uv / ( pixelSize * 0.5 ), 2.0) - vec2(1.0);\n  return character(n, p);\n}\n\nfloat asciiFilter(vec3 color, vec2 uv) {\n  return asciiFilter(color, uv, 1.0 / 25.0);\n}\n\nuniform float time;\nuniform vec2 resolution;\n \nvoid main() {\n  vec2 uv = gl_FragCoord.xy / resolution;\n  float noise = snoise( vec3(uv.x*4., uv.y*1., time/250.) );\n  float ascii_out = asciiFilter( vec3(noise), uv );\n  gl_FragColor = vec4( .25,ascii_out,ascii_out, 1. );\n}"])
      const fragmentShader = gl.createShader( gl.FRAGMENT_SHADER )
      gl.shaderSource( fragmentShader, shaderSource );
      gl.compileShader( fragmentShader )

      // create shader program
      const program = gl.createProgram()
      gl.attachShader( program, vertexShader )
      gl.attachShader( program, fragmentShader )
      gl.linkProgram( program )
      gl.useProgram( program )
      
      /* ALL ATTRIBUTE/UNIFORM INITIALIZATION MUST COME AFTER 
      CREATING/LINKING/USING THE SHADER PROGAM */
      
      // find a pointer to the uniform "time" in our fragment shader
      uTime = gl.getUniformLocation( program, 'time' ) 
      const uRes = gl.getUniformLocation( program, 'resolution' )
      gl.uniform2f( uRes, window.innerWidth, window.innerHeight )

      // get position attribute location in shader
      const position = gl.getAttribLocation( program, 'a_position' )
      // enable the attribute
      gl.enableVertexAttribArray( position )
      // this will point to the vertices in the last bound array buffer.
      // In this example, we only use one array buffer, where we're storing 
      // our vertices
      gl.vertexAttribPointer( position, 2, gl.FLOAT, false, 0,0 )
      
      render()
    }

    // keep track of time via incremental frame counter
    let time = 0
    function render() {
      // schedules render to be called the next time the video card requests 
      // a frame of video
      window.requestAnimationFrame( render )
      
      // update time on CPU and GPU
      time++
      gl.uniform1f( uTime, time )

      // draw triangles using the array buffer from index 0 to 6 (6 is count)
      gl.drawArrays( gl.TRIANGLES, 0, 6 )
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
