// Electric Storm Shader
// Creates dynamic electric lightning effects with storm clouds

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

// Hash function
float hash(float n){
    return fract(sin(n)*43758.5453123);
}

// 2D Hash
float hash(vec2 p){
    return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);
}

// 2D Value noise
float vnoise(vec2 p){
    vec2 i=floor(p);
    vec2 f=fract(p);
    
    // Cubic Hermite curve
    vec2 u=f*f*(3.-2.*f);
    
    // Four corners
    float a=hash(i);
    float b=hash(i+vec2(1.,0.));
    float c=hash(i+vec2(0.,1.));
    float d=hash(i+vec2(1.,1.));
    
    return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}

// Fractal Brownian Motion
float fbm(vec2 p){
    float value=0.;
    float amplitude=.5;
    float frequency=1.;
    
    // Add multiple layers of noise
    for(int i=0;i<6;i++){
        value+=amplitude*vnoise(p*frequency);
        amplitude*=.5;
        frequency*=2.;
    }
    
    return value;
}

// Lightning bolt function
float lightning(vec2 uv,vec2 start,vec2 end,float thickness,float glow,float time){
    // Get direction vector and length
    vec2 direction=end-start;
    float length=distance(start,end);
    
    // Normalize UV to the line space
    vec2 normal=normalize(vec2(direction.y,-direction.x));
    float projected=dot(uv-start,normalize(direction));
    float dist=abs(dot(uv-start,normal));
    
    // Add jaggedness to the lightning bolt
    float jagged=0.;
    const int SEGMENTS=6;
    
    for(int i=0;i<SEGMENTS;i++){
        float t=float(i)/float(SEGMENTS);
        float scale=mix(.05,.01,t);// Wider at start, narrower at end
        
        // Create the jaggedness based on sin curves and noise
        float offset=sin(projected*40.*(1.+t)+time*10.)*scale;
        offset+=sin(projected*20.*(1.+t)+time*7.)*scale*2.;
        offset+=fbm(vec2(projected*5.,time*3.+t*10.))*scale*5.;
        
        jagged+=offset;
    }
    
    dist+=jagged;
    
    // Only draw if we're between the start and end
    float mask=step(0.,projected)*step(projected,length);
    
    // Create the electric shape
    float bolt=smoothstep(thickness,0.,dist)*mask;
    
    // Add outer glow
    float outerGlow=smoothstep(thickness+glow,thickness,dist)*mask;
    
    // Combine
    return bolt+outerGlow*.5;
}

void main(){
    // Normalized coordinates with aspect ratio correction
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Background cloud setup
    vec2 cloudUV=uv*.5;
    float time=u_time*.2;
    
    // Generate storm clouds
    float clouds=0.;
    
    // Multi-layered cloud effect
    for(int i=0;i<4;i++){
        float t=float(i)*.2;
        
        // Moving cloud layers at different speeds
        vec2 cloudOffset=vec2(time*(.1+t*.1),t*.2);
        float cloudLayer=fbm((cloudUV+cloudOffset)*(1.+t));
        
        // Make clouds denser at the top, more dispersed at bottom
        cloudLayer*=smoothstep(-.5,.5,uv.y+t*.2);
        
        clouds+=cloudLayer*(.5-t*.1);
    }
    
    // Create base cloud color with depth
    vec3 cloudColor=mix(
        vec3(.2,.2,.3),// Darker purple-blue
        vec3(.4,.4,.6),// Lighter purple-blue
        clouds
    );
    
    // Generate multiple lightning bolts
    float lightning1=0.;
    float lightning2=0.;
    float lightning3=0.;
    
    // First lightning - Main bolt
    float bolt1Time=floor(time*.5);// Creates discrete time steps for lightning
    float bolt1Duration=fract(time*.5);// Used for fading bolt in/out
    
    if(bolt1Duration<.2){// Only show bolt for a short time
        float intensity=sin(bolt1Duration*15.7);// Creates flickering
        
        // Randomize start and end positions
        vec2 bolt1Start=vec2(
            .2+.4*hash(bolt1Time+.1),
            .8
        );
        
        vec2 bolt1End=vec2(
            -.2+.4*hash(bolt1Time+.2),
            -.5+.2*hash(bolt1Time+.3)
        );
        
        lightning1=lightning(uv,bolt1Start,bolt1End,.005,.03,bolt1Time)*intensity;
        
        // Add branching bolts
        vec2 branchPoint=mix(bolt1Start,bolt1End,.3+.4*hash(bolt1Time+.4));
        vec2 branch1End=branchPoint+vec2(
            -.2-.3*hash(bolt1Time+.5),
            -.1-.2*hash(bolt1Time+.6)
        );
        
        lightning2=lightning(uv,branchPoint,branch1End,.002,.02,bolt1Time+10.)*intensity*.7;
        
        // Second branch
        branchPoint=mix(bolt1Start,bolt1End,.5+.3*hash(bolt1Time+.7));
        vec2 branch2End=branchPoint+vec2(
            .2+.3*hash(bolt1Time+.8),
            -.1-.2*hash(bolt1Time+.9)
        );
        
        lightning3=lightning(uv,branchPoint,branch2End,.002,.02,bolt1Time+20.)*intensity*.7;
    }
    
    // Secondary background bolts
    float bolt2Time=floor(time*.7+10.);
    float bolt2Duration=fract(time*.7+10.);
    
    float backgroundLightning=0.;
    
    if(bolt2Duration<.1){
        float bgIntensity=sin(bolt2Duration*31.4);
        
        // Random position for background lightning
        float bgX=-.8+1.6*hash(bolt2Time);
        float bgY=.5+.3*hash(bolt2Time+.1);
        
        // Create a glow in the clouds at that position
        float bgDist=length(uv-vec2(bgX,bgY));
        backgroundLightning=smoothstep(.5,0.,bgDist)*bgIntensity*.2;
    }
    
    // Combine lightning effects
    float combinedLightning=lightning1+lightning2+lightning3+backgroundLightning;
    
    // Create the electric colors
    vec3 boltColor=mix(
        vec3(.7,.8,1.),// Blue-white
        vec3(.8,.9,1.),// Bright white
        combinedLightning
    );
    
    // Illuminate clouds near lightning
    vec3 illuminatedClouds=mix(
        cloudColor,
        vec3(.5,.5,.7),// Highlighted clouds
        combinedLightning*.8
    );
    
    // Final composition
    vec3 finalColor=illuminatedClouds;
    finalColor+=boltColor*combinedLightning*3.;
    
    // Add subtle rain effect
    float rainStrength=.05;
    float rainDrops=vnoise(vec2(uv.x*100.,uv.y*50.-time*20.));
    rainDrops=step(.85,rainDrops)*rainStrength;
    
    finalColor+=vec3(.6,.7,.9)*rainDrops;
    
    // Overall atmospheric effect
    finalColor=mix(
        finalColor,
        vec3(.1,.1,.2),// Dark atmosphere
        .1+.1*length(uv)// Darker at edges
    );
    
    // Output
    gl_FragColor=vec4(finalColor,1.);
}