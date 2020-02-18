#ifdef GL_ES
precision mediump float;
#endif

#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)
#pragma glslify: ascii   = require(glsl-ascii-filter)

uniform float time;
uniform vec2 resolution;
 
void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  float noise = snoise3( vec3(uv.x*4., uv.y*1., time/250.) );
  float ascii_out = ascii( vec3(noise), uv );
  gl_FragColor = vec4( .25,ascii_out,ascii_out, 1. );
}