// Star Radiation Shader
// This shader creates geometric shapes that radiate and rotate in waves

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

// Function to create a star shape
float star(vec2 p,float size,int points){
    float angle=atan(p.y,p.x);
    float radius=length(p);
    float pointAngle=6.28318/float(points);
    
    // Create star points
    float f=cos(floor(.5+angle/pointAngle)*pointAngle-angle)*radius;
    return 1.-smoothstep(size*.8,size,f);
}

// Function to rotate a point
vec2 rotate(vec2 p,float angle){
    float s=sin(angle);
    float c=cos(angle);
    return vec2(p.x*c-p.y*s,p.x*s+p.y*c);
}

void main(){
    // Normalized coordinates
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Initialize color
    vec3 color=vec3(.05,.05,.1);// Dark background
    
    // Create multiple bursting stars
    for(int i=0;i<8;i++){
        float fi=float(i);
        float phase=fi*.8;// Phase offset for each star
        
        // Control timing of burst cycle
        float t=mod(u_time*.8+phase,4.);
        float burst=0.;
        
        // Burst cycle: expand, then contract
        if(t<2.){
            burst=pow(t/2.,1.3);// Expanding
        }else{
            burst=pow(1.-(t-2.)/2.,.7);// Contracting
        }
        
        // Rotation speed varies with burst phase
        float rotSpeed=1.+burst*3.;
        float angle=u_time*(.2+fi*.05)*rotSpeed;
        
        // Calculate position with rotation and scaling
        vec2 pos=rotate(uv,angle+fi*.785);// Rotate by multiples of π/4
        pos/=.3+burst*1.2;// Scale based on burst
        
        // Create star with varying points
        int points=4+i%4;
        float s=star(pos,.6,points);
        
        // Colorize the star based on phase
        vec3 starColor=.6+.4*cos(vec3(fi*.2+0.,fi*.2+2.,fi*.2+4.)+u_time);
        
        // Make the stars glow more intensely at the peak of their burst
        float glow=.8+sin(burst*3.14)*.5;
        
        // Add star to final color
        color+=s*starColor*glow*.7;
    }
    
    // Output final color with saturation boost
    color=mix(vec3(length(color)),color,1.2);// Boost saturation
    gl_FragColor=vec4(color,1.);
}