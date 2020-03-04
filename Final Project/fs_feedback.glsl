#version 300 es
precision mediump float;
  uniform vec2 scale; 
  out vec4 o_finalColor;
  uniform float feedbackAmount;
  uniform sampler2D feedbackTextureOld;
  uniform sampler2D feedbackTextureNew;
void main() 
{ 
	vec2 uv = vec2(gl_FragCoord.xy / scale);
    vec4 prior = texture( feedbackTextureOld, uv );
    vec4 new = texture( feedbackTextureNew, uv );
	vec4  finalCol = vec4( (new.rgb * (1.0 - feedbackAmount) + prior.rgb * feedbackAmount), 1. );
    o_finalColor = finalCol; 
  }