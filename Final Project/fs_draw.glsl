#version 300 es
precision highp float;
  uniform vec2 scale; 
  out vec4 o_finalColor;
  void main() { 
    o_finalColor = vec4( vec3(1.0, 0.0 ,1.0), 1. ); 
  }