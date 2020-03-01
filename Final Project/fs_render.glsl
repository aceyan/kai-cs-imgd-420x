#version 300 es
precision mediump float;
  uniform sampler2D posTexture; 
  uniform sampler2D velTexture; 
  uniform vec2 scale;
  uniform bool isMouseDown;
  uniform vec2 mousePos;
  uniform float time;
 
layout(location = 0) out vec4 o_finalColor;
layout(location = 1) out vec4 o_finalColor1;

void main() 
{ 

 
  		vec2 uv = vec2(gl_FragCoord.xy)/ scale;
    
	if(isMouseDown)
	{
	
		o_finalColor = vec4( 1.0, 1.0, 0 , 1.0); 
    o_finalColor1 = vec4( 1.0, 0.0, 0 , 1.0); 
	}
	else
	{
    vec4 currentPos = texture( posTexture, uv);
    vec4 currentVel = texture( velTexture, uv);
    //col.x += 0.01;
currentPos.x += currentVel.x;
currentPos.y += currentVel.y;


     o_finalColor = currentPos;
    o_finalColor1 = currentVel;
    
			
	}

}