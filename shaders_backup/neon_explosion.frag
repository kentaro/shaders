// Neon Explosion Shader
// This shader creates neon explosion effects that burst outward

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

// Line segment function
float line(vec2 p,vec2 a,vec2 b,float width){
    vec2 pa=p-a;
    vec2 ba=b-a;
    float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);
    float d=length(pa-ba*h);
    return smoothstep(width,width*.5,d);
}

// Random function
float random(vec2 st){
    return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);
}

void main(){
    // Normalized coordinates
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Initialize color
    vec3 color=vec3(.02,.02,.05);// Dark background with slight blue tint
    
    // Number of explosion lines
    const int NUM_LINES=25;
    
    // Create multiple explosion lines
    for(int i=0;i<NUM_LINES;i++){
        float fi=float(i);
        float seed=fi*.214;// Unique seed for each line
        
        // Random angle for the line direction
        float angle=seed*6.283+sin(seed*5.)*.5;
        
        // Time variables
        float t=mod(u_time*.7+seed*3.,4.);// 4-second cycle
        float explosionPhase=0.;
        
        // Explosion animation cycle
        if(t<1.5){
            // Expand quickly
            explosionPhase=pow(t/1.5,1.2);
        }else if(t<3.){
            // Hold expanded
            explosionPhase=1.;
        }else{
            // Fade out
            explosionPhase=1.-pow((t-3.)/1.,2.);
        }
        
        // Calculate line endpoints
        float len=.05+explosionPhase*(.2+random(vec2(seed))*.4);
        vec2 dir=vec2(cos(angle),sin(angle));
        
        // Inner and outer points of the line
        vec2 innerPoint=dir*.05*(1.-explosionPhase);// Start point moves toward center as explosion progresses
        vec2 outerPoint=dir*len;// End point expands outward
        
        // Line width varies with explosion phase
        float width=.01+.02*sin(explosionPhase*3.14);
        
        // Draw the line
        float l=line(uv,innerPoint,outerPoint,width);
        
        // Line color based on angle and time
        vec3 lineColor=.5+.5*cos(vec3(angle+0.,angle+2.,angle+4.)+u_time);
        
        // Make colors more neon by increasing saturation and brightness
        lineColor=pow(lineColor,vec3(.5));// Brighten colors
        lineColor=mix(vec3(length(lineColor)),lineColor,1.5);// Increase saturation
        
        // Add glow effect based on explosion phase
        float glow=.5+.5*sin(explosionPhase*3.14);
        
        // Add line to final color with glow
        color+=l*lineColor*glow*explosionPhase;
    }
    
    // Add overall glow
    float overallGlow=length(color)*.3;
    color+=overallGlow*vec3(.2,.4,1.);
    
    // Output final color
    gl_FragColor=vec4(color,1.);
}