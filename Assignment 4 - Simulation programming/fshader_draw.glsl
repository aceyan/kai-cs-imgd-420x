precision mediump float;
  uniform sampler2D state; 
  uniform vec2 scale; 
  
  void main() { 
    vec4 color = texture2D(state, gl_FragCoord.xy / scale); 
    gl_FragColor = vec4( color.rgb, 1. ); 
  }