#version 300 es
precision mediump float;
  uniform sampler2D posTexture; 
  uniform sampler2D velTexture; //xy is postion, zw is acceleration
  uniform vec2 scale;
  uniform bool isMouseDown;
  uniform vec2 mousePos;
  uniform float time;
  //UI
 uniform float maxForce;
 uniform float maxSpeed;
 uniform float alignmentScale;
 uniform float cohesionScale;
 uniform float separationScale;
 uniform bool bmouseCentral;
 uniform bool bmousePredator;
 uniform bool bgyroscope;
 uniform vec2 gyroscopePos;

layout(location = 0) out vec4 o_newPos;
layout(location = 1) out vec4 o_newVel;


vec2 align(vec4 currentPos, vec4 currentVel)
{
    float d = 0.2;
    vec2 totalVelocity = vec2(0);
    vec2 acc = vec2(0);
    float num = 0.0;
    for (float y = 0.0; y < scale.y; y++)
    {
      for (float x = 0.0; x < scale.x; x++) 
      { 
        vec2 neighborUV = vec2(x+0.5, y+0.5)/scale.xy;
        vec4 neighborPos = texture( posTexture, neighborUV);
        float distance = length(currentPos.xy - neighborPos.xy);
        if(currentPos.xy!= neighborPos.xy && distance <= d)
        {
          totalVelocity += texture( velTexture, neighborUV).xy;
          num++;
        }
      }
    }
    if(num > 0.0)
    {
      totalVelocity /= num;
      totalVelocity = normalize(totalVelocity) * maxSpeed;
      acc = totalVelocity - currentVel.xy;
      if(length(acc) > maxForce)
      {
        acc = normalize(acc) * maxForce;
      }
    }
    return acc;
}

vec2 cohesion(vec4 currentPos, vec4 currentVel)
{
     float d = 0.2;
    vec2 totalVelocity = vec2(0);
    vec2 acc = vec2(0);
    float num = 0.0;

    if(bmouseCentral)
      {
         totalVelocity += mousePos;
         num++; 
      }
      else if(bgyroscope)
      {
         totalVelocity += gyroscopePos;
         num++; 
      }
      else
      {
         for (float y = 0.0; y < scale.y; y++)
          {
            for (float x = 0.0; x < scale.x; x++) 
            { 
              vec2 neighborUV = vec2(x+0.5, y+0.5)/scale.xy;
              vec4 neighborPos = texture( posTexture, neighborUV);
              float distance = length(currentPos.xy - neighborPos.xy);
              if(currentPos.xy!= neighborPos.xy && distance <= d)
              {
                totalVelocity += neighborPos.xy;
                num++;
              }
            }
          }
      }
   
    if(num > 0.0)
    {
      totalVelocity /= num;
      totalVelocity = totalVelocity - currentPos.xy;
      totalVelocity = normalize(totalVelocity) * maxSpeed;
      acc = totalVelocity - currentVel.xy;
      if(length(acc) > maxForce)
      {
        acc = normalize(acc) * maxForce;
      }
    }
    return acc;
}


vec2 separation(vec4 currentPos, vec4 currentVel)
{
    float d = 0.2;
    vec2 totalVelocity = vec2(0);
    vec2 acc = vec2(0);
    float num = 0.0;
    for (float y = 0.0; y < scale.y; y++)
    {
      for (float x = 0.0; x < scale.x; x++) 
      { 
        vec2 neighborUV = vec2(x+0.5, y+0.5)/scale.xy;
        vec4 neighborPos = texture( posTexture, neighborUV);
        float distance = length(currentPos.xy - neighborPos.xy);
        if(currentPos.xy!= neighborPos.xy && distance <= d)
        {
          vec2 diff = currentPos.xy - neighborPos.xy;
          diff /= distance;
          totalVelocity += diff;
          num++;
        }
      }
    }

    if(bmousePredator)
      {
        float distance = length(currentPos.xy - mousePos);
        if(distance <= d)
        {
           vec2 diff = currentPos.xy - mousePos;
            diff /= distance;
            totalVelocity += diff * 100000.0;
            num++;
        }
         
      }

    if(num > 0.0)
    {
      totalVelocity /= num;
      totalVelocity = normalize(totalVelocity) * maxSpeed;
      acc = totalVelocity - currentVel.xy;
      if(length(acc) > maxForce)
      {
        acc = normalize(acc) * maxForce;
      }
    }
    return acc;
}

void main() 
{ 
      vec2 uv = vec2(gl_FragCoord.xy)/ scale;
      vec4 currentPos = texture( posTexture, uv);
      vec4 currentVel = texture( velTexture, uv);

      vec2 acc;
      acc += align(currentPos, currentVel) * alignmentScale;
      acc += cohesion(currentPos, currentVel) * cohesionScale;
      acc += separation(currentPos, currentVel) * separationScale;
    
    currentPos.xy += currentVel.xy;



    if(currentPos.x >= 1.0)
    {
      currentPos.x = -1.0;
    }
    else if(currentPos.x <= -1.0)
    {
      currentPos.x = 1.0;
    }

    if(currentPos.y >= 1.0)
    {
      currentPos.y = -1.0;
    }
    else if(currentPos.y <= -1.0)
    {
      currentPos.y = 1.0;
    }


    currentVel.xy += acc;

    o_newPos = currentPos;
    o_newVel = currentVel;
    
			
	}