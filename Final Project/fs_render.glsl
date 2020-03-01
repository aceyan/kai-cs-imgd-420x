#version 300 es
precision mediump float;
  uniform sampler2D posTexture; 
  uniform sampler2D velTexture; //xy is postion, zw is acceleration
  uniform vec2 scale;
  uniform bool isMouseDown;
  uniform vec2 mousePos;
  uniform float time;
 
layout(location = 0) out vec4 o_newPos;
layout(location = 1) out vec4 o_newVel;

void main() 
{ 

vec2 uv = vec2(gl_FragCoord.xy)/ scale;
 vec4 currentPos = texture( posTexture, uv);
  vec4 currentVel = texture( velTexture, uv);


    float d = 0.2;
    vec2 totalVelocity;
    vec2 acc;
    float num = 0.0;
    for (float y = 0.0; y < scale.y; y++)
    {
      for (float x = 0.0; x < scale.x; x++) 
      { 
        vec2 neighborUV = vec2(x+0.5, y+0.5)/scale.xy;
        vec4 neighborPos = texture( posTexture, neighborUV);
        float distance = length(currentPos - neighborPos);
        if(currentPos!= neighborPos && distance <= d)
        {
          totalVelocity += texture( velTexture, neighborUV).xy;
          num++;
        }
      }
    }
    if(num > 0.0)
    {
      totalVelocity /= num;
    }
    
    acc = totalVelocity - currentVel.xy;


  		
    

    currentPos.xy += currentVel.xy;
    currentVel.xy += acc;
    currentVel.zw = acc;

    o_newPos = currentPos;
    o_newVel = currentVel;
    
			
	}