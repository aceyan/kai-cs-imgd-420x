#version 300 es
precision highp float;
  uniform vec2 scale; 
  out vec4 o_finalColor;
  uniform sampler2D feedBackTexture;
void main() 
{ 
  vec2 uv = vec2(gl_FragCoord.xy / scale);
    vec4 new = texture( feedBackTexture, uv );
  
    o_finalColor = vec4(new.xyz, 1.0); 
  }