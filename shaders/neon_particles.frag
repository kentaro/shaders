// Neon Particles Shader
// Creates dynamic neon particle effects with trails and physics

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

// Hash function for randomness
float hash(float n){
    return fract(sin(n)*43758.5453123);
}

// 2D hash function
float hash(vec2 p){
    return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);
}

void main(){
    // Normalized coordinates with aspect ratio correction
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Initialize color
    vec3 finalColor=vec3(0.);
    
    // Particle parameters
    float particleCount=100.;
    float particleSpeed=u_time*.5;
    float particleSize=.008+.004*sin(u_time*.3);
    
    // Loop through particles
    for(float i=0.;i<particleCount;i++){
        // Unique seed for each particle
        float seed=i*.01;
        
        // Position and movement
        float uniqueTime=particleSpeed+seed*100.;
        
        // Random angle rotation
        float angle=hash(seed)*6.28+sin(uniqueTime*.1)*2.;
        float radius=.2+.6*hash(seed+1.)+.1*sin(uniqueTime*.3);
        
        // Particle position using oscillating circular motion
        vec2 center=vec2(
            sin(uniqueTime*(.1+.05*hash(seed+2.))),
            cos(uniqueTime*(.1+.05*hash(seed+3.)))
        )*.5;// Central movement
        
        vec2 pos=center+vec2(
            cos(angle)*radius,
            sin(angle)*radius
        );
        
        // Trail position calculation
        vec2 trailDir=vec2(
            cos(angle+3.14),// Opposite direction of movement
            sin(angle+3.14)
        );
        
        // Distance from particle position
        float dist=length(uv-pos);
        
        // Base particle shape
        float particle=smoothstep(particleSize,0.,dist);
        
        // Generate trails
        float trailLength=.1+.2*hash(seed+4.);
        float trailWidth=particleSize*.8;
        float trail=0.;
        
        // Create trail segments
        const int TRAIL_SEGMENTS=10;
        for(int j=0;j<TRAIL_SEGMENTS;j++){
            float t=float(j)/float(TRAIL_SEGMENTS);
            float segmentAlpha=1.-t;// Fade out trail
            
            vec2 trailPos=pos+trailDir*t*trailLength;
            float trailDist=length(uv-trailPos);
            
            // Narrowing trail
            float segmentWidth=trailWidth*(1.-t*.5);
            
            trail+=smoothstep(segmentWidth,0.,trailDist)*segmentAlpha*.3;
        }
        
        // Particle color based on seed
        vec3 color=.5+.5*cos(vec3(0.,2.,4.)+hash(seed+5.)*15.+uniqueTime*.3);
        
        // Make colors more vibrant
        color=pow(color,vec3(.8));
        
        // Brightness pulsation
        float brightness=.8+.2*sin(uniqueTime*2.);
        
        // Add particle and trail to final color
        finalColor+=color*particle*brightness*2.;
        finalColor+=color*trail*brightness;
    }
    
    // Glow effect
    vec3 glow=finalColor;
    
    // Apply blur for glow
    const int BLUR_SAMPLES=6;
    float blurSize=.03;
    
    for(int i=0;i<BLUR_SAMPLES;i++){
        float t=float(i)/float(BLUR_SAMPLES-1);
        float angle=t*6.28;
        
        vec2 offset=vec2(cos(angle),sin(angle))*blurSize;
        
        // Sample color at offset position
        vec3 sampleColor=vec3(0.);
        
        for(float j=0.;j<particleCount;j++){
            float seed=j*.01;
            float uniqueTime=particleSpeed+seed*100.;
            
            float angle=hash(seed)*6.28+sin(uniqueTime*.1)*2.;
            float radius=.2+.6*hash(seed+1.)+.1*sin(uniqueTime*.3);
            
            vec2 center=vec2(
                sin(uniqueTime*(.1+.05*hash(seed+2.))),
                cos(uniqueTime*(.1+.05*hash(seed+3.)))
            )*.5;
            
            vec2 pos=center+vec2(
                cos(angle)*radius,
                sin(angle)*radius
            );
            
            float dist=length((uv+offset)-pos);
            float particle=smoothstep(particleSize*1.5,0.,dist);
            
            vec3 color=.5+.5*cos(vec3(0.,2.,4.)+hash(seed+5.)*15.+uniqueTime*.3);
            color=pow(color,vec3(.8));
            
            float brightness=.8+.2*sin(uniqueTime*2.);
            sampleColor+=color*particle*brightness;
        }
        
        glow+=sampleColor*(1.-t*.8)*.1;
    }
    
    // Add glow
    finalColor+=glow*.3;
    
    // Add background
    vec3 bgColor=vec3(.01,.02,.05);
    
    // Add subtle vignette
    float vignette=1.-length(uv)*.4;
    
    // Final composition
    finalColor=finalColor+bgColor;
    finalColor*=vignette;
    
    // Output
    gl_FragColor=vec4(finalColor,1.);
}