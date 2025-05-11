// Warp Speed Shader
// Creates a dynamic star field warp speed effect

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

// Random function
float random(vec2 st){
    return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);
}

// 2D Noise
float noise(vec2 st){
    vec2 i=floor(st);
    vec2 f=fract(st);
    
    // Four corners in 2D of a tile
    float a=random(i);
    float b=random(i+vec2(1.,0.));
    float c=random(i+vec2(0.,1.));
    float d=random(i+vec2(1.,1.));
    
    // Smooth interpolation
    vec2 u=f*f*(3.-2.*f);
    
    // Mix 4 corners percentages
    return mix(a,b,u.x)+
    (c-a)*u.y*(1.-u.x)+
    (d-b)*u.x*u.y;
}

void main(){
    // Normalized coordinates with aspect ratio correction
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Star field parameters
    float speed=u_time*2.;
    float starDensity=.4+.2*sin(u_time*.1);
    float warpFactor=2.+sin(u_time*.2)*.5;
    
    // Initialize color
    vec3 finalColor=vec3(0.);
    
    // Background gradient
    vec3 bgColor=mix(
        vec3(.02,0.,.05),// Dark purple
        vec3(0.,.02,.08),// Dark blue
        .5+.5*sin(u_time*.1)
    );
    
    // Generate multiple layers of stars with different speeds
    const int STAR_LAYERS=5;
    
    for(int i=0;i<STAR_LAYERS;i++){
        float fi=float(i);
        float layerSpeed=speed*(.5+fi*.2);// Each layer has different speed
        float starSize=mix(.001,.005,fi/float(STAR_LAYERS-1));// Different star sizes
        
        // Generate star field by transforming coordinates
        for(int j=0;j<100;j++){// Number of stars per layer
            float fj=float(j);
            
            // Create random star position
            float randAngle=random(vec2(fi*100.+fj,fi))*6.28;// Random angle
            float randDist=.1+random(vec2(fj,fi*100.))*3.;// Random distance
            
            // Star position
            vec2 starPos=vec2(cos(randAngle),sin(randAngle))*randDist;
            
            // Warp star position based on distance and time
            vec2 warpedPos=starPos*(1.-exp(-length(starPos)*warpFactor));
            warpedPos=warpedPos-normalize(warpedPos)*layerSpeed;
            
            // Calculate distance to the warped star
            float dist=length(uv-warpedPos);
            
            // Star brightness
            float brightness=smoothstep(starSize,0.,dist);
            
            // Star color based on its position and layer
            vec3 starColor=mix(
                vec3(.6,.8,1.),// Blue-white
                vec3(1.,.8,.6),// Yellow-white
                random(vec2(fj*213.32,fi*732.21))
            );
            
            // Add stars with streaks
            float streakLength=length(warpedPos)*.3;// Longer streaks at the edges
            vec2 streakDir=normalize(warpedPos);
            
            // Inner stars have minimal streaks, outer stars have longer streaks
            for(int k=0;k<5;k++){// Number of streak segments
                float fk=float(k)/5.;
                vec2 streakPos=warpedPos-streakDir*streakLength*fk;
                float streakDist=length(uv-streakPos);
                float streakBrightness=brightness*(1.-fk)*.6;
                
                finalColor+=starColor*streakBrightness*smoothstep(starSize,0.,streakDist);
            }
            
            // Add the star itself
            finalColor+=starColor*brightness;
        }
    }
    
    // Central glow to indicate direction of travel
    float centerGlow=.05/(.01+length(uv)*length(uv));
    vec3 glowColor=mix(
        vec3(.2,.5,1.),// Blue
        vec3(.5,.2,1.),// Purple
        .5+.5*sin(u_time*.3)
    );
    
    // Add center glow
    finalColor+=glowColor*centerGlow*.5;
    
    // Add background
    finalColor+=bgColor;
    
    // Add subtle vignette
    float vignette=1.-length(uv)*.3;
    finalColor*=vignette;
    
    // Output final color
    gl_FragColor=vec4(finalColor,1.);
}