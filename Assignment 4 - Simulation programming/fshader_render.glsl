precision mediump float;
  uniform sampler2D state; 
  uniform vec2 scale;
  
float ALPHA_M = 0.147;
float ALPHA_N = 0.028;
float B1 = 0.278;
float B2 =  0.365;
float D1 = 0.267;
float D2 = 0.445;

const float Ra = 9.0;
const float Ri = 3.0;
float b = 1.0;
float PI = 3.1415926;


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
  		float vaule = texture2D( state, uv).r;
  		
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
    
    gl_FragColor = vec4( vec3(result), 1. ); 
  //vec4 textureColor = texture2D( state,  gl_FragCoord.xy  / scale ); 
  //gl_FragColor = vec4( textureColor.rgb, 1. ); 
} 