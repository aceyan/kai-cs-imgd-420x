precision mediump float;
  uniform sampler2D state; 
  uniform vec2 scale;
  uniform bool isMouseDown;
  uniform vec2 mousePos;
  uniform float time;
  //
  uniform float ALPHA_M;
uniform float ALPHA_N;
uniform float B1;
uniform float B2;
uniform float D1;
uniform float D2;

//float ALPHA_M = 0.147;
//float ALPHA_N = 0.028;
//float B1 = 0.278;
//float B2 =  0.365;
//float D1 = 0.267;
//float D2 = 0.445;


float b = 1.0;
float PI = 3.1415926;

const float Ra = 9.0;
const float Ri = 3.0;

float  sigma1(float alpha, float x, float a)
{
	return 1.0 / (1.0 + exp(-(x - a) * 4.0 / alpha));
}

//for n
float sigma2(float x, float a, float b)
{
	return sigma1(ALPHA_N, x, a) * (1.0 - sigma1(ALPHA_N, x, b) );
}

float sigma_m(float x, float y, float m) 
{
    float sigma = sigma1(ALPHA_M, m, 0.5);
    return x * (1.0 - sigma) + y * sigma;
 }

float s(float n, float m)
{
	return sigma2(n, sigma_m(B1, D1, m), sigma_m(B2, D2, m));
}

//from book of shader
vec3 hsb2rgb( in vec3 c )
{
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                             6.0)-3.0)-1.0,
                     0.0,
                     1.0 );
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return c.z * mix( vec3(1.0), rgb, c.y);
}

void main() 
{ 

  float m = 0.0;//inner
  float n = 0.0;//outter
  float innerArea = PI * Ri * Ri;
  float outterArea = PI * (Ra*Ra - Ri*Ri);
  for(float i = -Ra; i <= Ra; i++)
  {
  	for(float j = -Ra; j <= Ra; j++)
  	{
  		float l = sqrt(i * i + j * j);
  		vec2 uv = (vec2(gl_FragCoord.xy) + vec2(i,j)) / scale;
  		float vaule = texture2D( state, uv).w;
  		
  		//for m, inner 	
  		if(l < Ri - b / 2.0)
  		{
  			m += vaule;
  		}
  		else if(l > Ri + b / 2.0)
  		{
  			//do nothing
  		}
  		else
  		{
  			m += vaule * (Ri + b/2.0 - l) / b;
  		}
  		
  		//for n, outter
  		if(l < Ra - b / 2.0 )
  		{
  			if(l > Ri + b / 2.0)
  			{
  				n += vaule;
  			}
  			else if(l < Ri - b / 2.0 )
  			{
  				//do nothing
  			}
  			else
  			{
  				n += vaule * (Ri + b/2.0 - l) / b;
  			}
  		}
  		else if(l > Ra + b / 2.0)
  		{
  			//do nothing
  		}
  		else
  		{
  			n += vaule * (Ra + b/2.0 - l) / b;
  		}
  		
  		
  	}
  }


  m /= innerArea;
  n /= outterArea;

  float result = s(n,m);
    
	if(isMouseDown)
	{
	
		vec2 toMousePos = vec2( gl_FragCoord.xy  / scale) - mousePos;
		float dist = length(toMousePos);

 		vec3 color = vec3(0.0);

    
	    float angle = atan(toMousePos.y,toMousePos.x) + time  * PI;
	    float radius = length(toMousePos)*2.0;
		color = hsb2rgb(vec3((angle/2.0*PI)+0.5,radius,1.0));
	   	if(dist <= Ra / scale.x) 
	 	{
	        	result = step((Ri+1.5)/scale.x, dist) * (1.0 - step(Ra/scale.x, dist));
		}
		
		gl_FragColor = vec4( color*result , result); 
	}
	else
	{

			gl_FragColor = vec4( sin(result * 12.0 * PI), sin(result * 22.0 * PI), sin(result * 32.0 * PI) , result); 
	}

}