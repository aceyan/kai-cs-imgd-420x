precision mediump float;
  uniform sampler2D state; 
  uniform vec2 scale;
  uniform float f;
  uniform float k;
  uniform float dA;
   uniform float dB;
   uniform bool diffusionBchangeAcrossTheGrid;
  //float f=.0545, k=.062, dA = 1., dB = 0.; // coral preset 
  
  vec2 get(int x, int y) { 
    return texture2D( state, ( gl_FragCoord.xy + vec2(x, y) ) / scale ).rg; 
  } 
  
  vec2 run() { 
  vec2 uv = vec2(gl_FragCoord.xy) / scale;
	float dis = length(uv - vec2(0.5)) + 0.15;
    vec2 state = get( 0, 0 ); 
    float a = state.r; 
    float b = state.g; 
    float sumA = a * -1.; 
    float sumB = b * -1.; 
    
    sumA += get(-1,0).r * .2; 
    sumA += get(-1,-1).r * .05; 
    sumA += get(0,-1).r * .2; 
    sumA += get(1,-1).r * .05; 
    sumA += get(1,0).r * .2; 
    sumA += get(1,1).r * .05; 
    sumA += get(0,1).r * .2; 
    sumA += get(-1,1).r * .05;
    
    sumB += get(-1,0).g * .2; 
    sumB += get(-1,-1).g * .05; 
    sumB += get(0,-1).g * .2; 
    sumB += get(1,-1).g * .05; 
    sumB += get(1,0).g * .2; 
    sumB += get(1,1).g * .05; 
    sumB += get(0,1).g * .2; 
    sumB += get(-1,1).g * .05; 
    
    state.r = a + dA  
      * sumA - 
      a * b * b + 
      f * (1. - a); 
      
	  
	float factorB = diffusionBchangeAcrossTheGrid? dis : 1.0;
    state.g = b + dB *  factorB * 
      sumB + 
      a * b * b - 
      ((k+f) * b);
      
    return state; 
  } 
  void main() { 
    vec2 nextState = run(); 
    gl_FragColor = vec4( nextState.r, nextState.g, 0., 1. ); 
  } 