// Fractal Burst Shader
// This shader creates fractal-like patterns that burst and spin

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

// Complex number operations
vec2 cmul(vec2 a,vec2 b){
    return vec2(a.x*b.x-a.y*b.y,a.x*b.y+a.y*b.x);
}

vec2 cdiv(vec2 a,vec2 b){
    float denom=b.x*b.x+b.y*b.y;
    return vec2(a.x*b.x+a.y*b.y,a.y*b.x-a.x*b.y)/denom;
}

// Fractal function
float fractal(vec2 z,float iteration){
    vec2 c=vec2(.285,.01);
    float smooth_iter=0.;
    
    for(float i=0.;i<6.;i++){
        if(i>=iteration)break;
        
        // Check if escaping
        if(length(z)>2.){
            // Calculate smooth iteration count
            smooth_iter=i+1.-log(log(length(z)))/log(2.);
            break;
        }
        
        // z = z^2 + c
        z=cmul(z,z)+c;
    }
    
    return smooth_iter/iteration;
}

void main(){
    // Normalized coordinates with aspect ratio correction
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Initialize color
    vec3 color=vec3(0.);
    
    // Create multiple layers of fractal patterns
    for(float i=0.;i<4.;i++){
        // Time variables
        float t=u_time*.4+i*1.;
        float cycle=mod(t,5.);// 5-second cycle
        
        // Burst effect parameters
        float burst=0.;
        if(cycle<2.5){
            // Expand
            burst=pow(cycle/2.5,1.2);
        }else{
            // Contract
            burst=pow(1.-(cycle-2.5)/2.5,.8);
        }
        
        // Scaling and rotation
        float zoom=1.5+burst*2.;// Scale based on burst
        float rotation=t*.2+i*1.5708;// Rotate over time (i * π/2)
        
        // Transform coordinates
        vec2 pos=vec2(
            uv.x*cos(rotation)-uv.y*sin(rotation),
            uv.x*sin(rotation)+uv.y*cos(rotation)
        );
        pos=pos*zoom;
        
        // Add movement
        pos+=vec2(sin(t*.5+i),cos(t*.3+i*.7))*burst;
        
        // Generate fractal pattern
        float f=fractal(pos,3.+i);
        
        // Color based on fractal value and layer
        vec3 layerColor=.5+.5*cos(vec3(i*.8+0.,i*.8+2.,i*.8+4.)+t*.5);
        
        // Add to final color with glow effect
        float glow=pow(f,.5)*(1.-burst*.3);
        color+=glow*layerColor*.7;
    }
    
    // Enhance colors
    color=pow(color,vec3(.8));// Gamma adjustment for brighter colors
    
    // Output final color
    gl_FragColor=vec4(color,1.);
}