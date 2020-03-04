#version 300 es
precision mediump float;
uniform float time;
uniform vec2 scaleOfScreen; 
out vec4 o_finalColor;
uniform bool isEnableRainBow;
const float TWO_PI = 6.28;

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
  	if(isEnableRainBow)
  	{
	  	vec2 uv = vec2( gl_FragCoord.xy  / scaleOfScreen);

	 	vec3 color = vec3(0.0);

	    vec2 toCenter = vec2(0.5)-uv;
	    float angle = atan(toCenter.y,toCenter.x) + time  * TWO_PI * 0.005;
	    float radius = length(toCenter)*2.0;

	    color = hsb2rgb(vec3((angle/TWO_PI)+0.5,radius,1.0));

	    o_finalColor = vec4( color, 1. ); 
  	}
  	else
  	{
  		o_finalColor = vec4( 1., 1., 1., 1. ); 
  	}
  	
  }