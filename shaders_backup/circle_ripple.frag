// Circle Ripple Shader
// This shader creates concentric circles that expand and rotate

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

// Circle function
float circle(vec2 p,float r,float blur){
    float d=length(p);
    return smoothstep(r,r-blur,d);
}

// Distortion function
float distort(vec2 p,float freq,float amp){
    return sin(p.x*freq)*sin(p.y*freq)*amp;
}

void main(){
    // Normalized coordinates
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Initialize color
    vec3 color=vec3(0.);
    
    // Create multiple expanding circles
    for(float i=0.;i<7.;i++){
        // Time-based properties
        float t=u_time*.5+i*.5;
        float angle=t*.3;
        
        // Rotation for each layer
        vec2 pos=vec2(
            uv.x*cos(angle)-uv.y*sin(angle),
            uv.x*sin(angle)+uv.y*cos(angle)
        );
        
        // Expansion cycle - grows from 0 to max size and repeats
        float expansion=fract(t*.3)*3.;
        
        // Apply distortion that varies with time
        float dist=distort(pos,5.+sin(t)*2.,.05);
        
        // Create a circle with ripple effect
        float c=circle(pos,expansion,.1);
        float ripple=sin(expansion*10.-t*5.)*.5+.5;
        
        // Create rings by subtracting smaller circles
        c*=(1.-circle(pos,expansion-.1-ripple*.05,.05));
        
        // Color varies with index and time
        vec3 circleColor=.5+.5*cos(vec3(i*.8+0.,i*.8+2.,i*.8+4.)+t);
        
        // Fade out as circles expand
        float fade=1.-expansion/3.;
        
        // Add to final color
        color+=c*circleColor*fade*(dist+1.);
    }
    
    // Add glow effect
    float glow=length(color)*.3;
    color+=glow*vec3(.3,.5,1.);
    
    // Output final color
    gl_FragColor=vec4(color,1.);
}