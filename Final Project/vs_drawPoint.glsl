#version 300 es
  precision mediump float; 
  //layout(location = 0) in float a_index; 
  uniform vec2 scale;
  uniform sampler2D posTexture; 
  void main() { 
  	vec2 uv;
  	uv.x = ( float(int(gl_InstanceID) % int(scale.x)) + 0.5 ) / scale.x;
  	uv.y = ( float(gl_InstanceID) / scale.x + 0.5 ) / scale.y;
  	vec4 currentPos = texture( posTexture, uv); 
  	gl_PointSize = 2.5;
    gl_Position = vec4(currentPos.xy, 0, 1.0);//use position from texture!
  } 