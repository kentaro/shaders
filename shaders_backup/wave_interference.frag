// Wave Interference Shader
// This shader creates wave patterns that create interference patterns and rotate

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

// Wave function that generates a wave from a point
float wave(vec2 p,vec2 center,float time,float frequency,float amplitude){
    float dist=length(p-center);
    return sin(dist*frequency-time)*amplitude/(dist+.1);
}

// Rotation function
vec2 rotate(vec2 p,float angle){
    float s=sin(angle);
    float c=cos(angle);
    return vec2(p.x*c-p.y*s,p.x*s+p.y*c);
}

void main(){
    // Normalized coordinates with aspect ratio correction
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Initialize color
    vec3 color=vec3(.02,.03,.05);
    
    // Rotation for the entire pattern
    float globalRotation=u_time*.1;
    uv=rotate(uv,globalRotation);
    
    // Wave pattern accumulator
    float waves=0.;
    
    // Create multiple wave sources that move in circular paths
    for(int i=0;i<6;i++){
        float fi=float(i);
        
        // Time with offset for each wave source
        float t=u_time*(.2+fi*.05)+fi*2.;
        
        // Path radius and angle for each wave source
        float radius=.5+.2*sin(t*.3);
        float angle=t*.2+fi*1.047;// fi * PI/3
        
        // Wave source position
        vec2 center=radius*vec2(cos(angle),sin(angle));
        
        // Wave parameters that change over time
        float frequency=10.+5.*sin(t*.1);
        float amplitude=.5+.2*cos(t*.3);
        
        // Generate wave and add to accumulator
        float w=wave(uv,center,t*2.,frequency,amplitude);
        waves+=w;
    }
    
    // Normalize wave value to -1 to 1 range
    waves=waves/6.;
    
    // Create multiple bands with different colors
    for(int i=0;i<3;i++){
        float fi=float(i);
        
        // Time with offset for each color band
        float t=u_time*.2+fi*2.;
        
        // Create band based on wave value range
        float lowerBound=-.8+fi*.5;
        float upperBound=-.3+fi*.5;
        float band=smoothstep(lowerBound,lowerBound+.1,waves)-smoothstep(upperBound,upperBound+.1,waves);
        
        // Band color varies with time
        vec3 bandColor=.5+.5*cos(vec3(fi*1.+0.,fi*1.+2.,fi*1.+4.)+t);
        
        // Add color band to final color
        color+=band*bandColor*.7;
    }
    
    // Edge highlighting where waves cross zero
    float edge=1.-smoothstep(0.,.05,abs(waves));
    color+=edge*vec3(1.,1.,1.)*.3;
    
    // Add subtle pulsating background glow based on wave intensity
    float bgGlow=pow(abs(waves),2.)*.2;
    color+=bgGlow*vec3(.2,.4,.8);
    
    // Add central glow
    float centerGlow=.1/(length(uv)+.1);
    color+=centerGlow*vec3(.5,.7,1.)*(.5+.5*sin(u_time*.5))*.3;
    
    // Output final color
    gl_FragColor=vec4(color,1.);
}