// Laser Grid Shader
// Creates a dynamic laser grid effect with bright neon colors and pulsing animation

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main(){
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Grid settings
    float gridSize=18.+6.*sin(u_time*.2);
    float lineWidth=.02+.01*sin(u_time*2.7);
    
    // Create pulsing grid
    vec2 grid=abs(fract(uv*gridSize)-.5);
    float lines=smoothstep(lineWidth,0.,min(grid.x,grid.y));
    
    // Laser beam movement
    float xBeam=smoothstep(lineWidth,0.,abs(uv.x-.4*sin(u_time*.8)));
    float yBeam=smoothstep(lineWidth,0.,abs(uv.y-.4*cos(u_time*.7)));
    
    // Diagonal lasers
    float diag1=smoothstep(lineWidth*1.5,0.,abs(uv.x+uv.y+sin(u_time*.6)));
    float diag2=smoothstep(lineWidth*1.5,0.,abs(uv.x-uv.y+cos(u_time*.5)));
    
    // Pulse wave effect
    float dist=length(uv);
    float ring=smoothstep(.02,0.,abs(dist-mod(u_time*.3,1.)));
    
    // Combine all elements
    float intensity=lines+xBeam+yBeam+diag1+diag2+ring;
    
    // Dynamic color shifting
    vec3 color=vec3(0.);
    color+=vec3(.8,.2,.8)*lines;
    color+=vec3(0.,.8,.9)*xBeam;
    color+=vec3(.9,.2,0.)*yBeam;
    color+=vec3(.9,.9,0.)*diag1;
    color+=vec3(0.,.9,.4)*diag2;
    color+=vec3(1.,.3,.7)*ring;
    
    // Glow effect
    color+=.1*vec3(.2,.2,.8)*intensity;
    
    // Background color
    vec3 bgColor=vec3(.02,.02,.05);
    
    // Final color with glow
    gl_FragColor=vec4(color+bgColor,1.);
}