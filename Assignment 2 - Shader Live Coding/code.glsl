//Kai's Assignment 2 - Shader Live Coding

vec2 rotate2D (vec2 _st, float _angle)
{
    _st -= 0.5;
    _st =  mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle)) * _st;
    _st += 0.5;
    return _st;
}

                            
                        
void main() 
{
    vec3 finalColor = vec3(0);
    
     //stage 1
        vec2 p = uv();
        float color1 = 0.; 
        float frequency = 1.5;
        float gain = 0.5;
        float thickness =  bands.x / 2.0;
        
         p.x += sin( p.y * frequency + time * 4.) * gain * fract(bands.x); 
        color1 = abs( thickness / p.x ) * bands.w;
            
        float clipVaule =  abs(sin(time));

       vec2 st = uv();
         
        //if(step(color1, clipVaule) == 1.0)
        //{
          //   discard;
        //}
           
        color1 += smoothstep(.15,.2,noise(st*10.  * bands.y)); 
        color1 -= smoothstep(.35,.4,noise(st*10. * bands.y)); 
        vec3 color2 = vec3( sin(time) + fract( bands.x), cos(time), sin(time)* cos(time));
        finalColor =  color1   * color2 * bands.x;
         
        
        
        
        //----------------------------------------------------------------------------------------------
        //stage 2 
        
        vec2 stN = uvN();
        vec2 mousePos = mouse.xy/ resolution.xy/2.0;
         mousePos = vec2(mousePos.x, 1.0- mousePos.y);
    
         vec2 dir = mousePos - stN;
                            
         vec2 texcoord = stN;
         float dist = length(dir);  
         dir = normalize(dir); 
        vec4 color3 = texture2D(backbuffer, texcoord);  
        vec4 sum = color3;
                 
		//Radial Bulr effect
        for (int i = 0; i < 6; ++i)  
        {         
            //texcoord = rotate2D(texcoord, 3.0) *dist * 6.0; //rotate VU
            texcoord = texcoord + dir * (-0.05 + float(i)*  0.02 );
            sum += texture2D(backbuffer, texcoord  );    
        }
                              
        sum /= 7.0; 
        finalColor = mix(finalColor, sum.rgb, 0.9); 
                 

 
      gl_FragColor = vec4( finalColor, 1);

}