// Aurora Lights Shader
// Creates flowing aurora borealis effect with subtle motion

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

// Hash function
float hash(float n){
    return fract(sin(n)*43758.5453123);
}

// 2D noise
float noise(vec2 p){
    vec2 i=floor(p);
    vec2 f=fract(p);
    
    // Cubic Hermite curve
    vec2 u=f*f*(3.-2.*f);
    
    // Four corners
    float a=hash(dot(i,vec2(127.1,311.7)));
    float b=hash(dot(i+vec2(1.,0.),vec2(127.1,311.7)));
    float c=hash(dot(i+vec2(0.,1.),vec2(127.1,311.7)));
    float d=hash(dot(i+vec2(1.,1.),vec2(127.1,311.7)));
    
    return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}

// Fractal Brownian Motion
float fbm(vec2 p){
    float sum=0.;
    float amp=.5;
    float freq=1.;
    
    // Loop of octaves
    for(int i=0;i<6;i++){
        sum+=amp*noise(p*freq);
        amp*=.5;
        freq*=2.;
    }
    
    return sum;
}

void main(){
    // Normalized coordinates with aspect ratio correction
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Scale UV for aurora effect
    uv.y*=1.5;// Stretch vertically
    
    // Time variables
    float time=u_time*.1;
    
    // Sky gradient
    vec3 skyColor=mix(
        vec3(0.,.02,.05),// Dark blue at bottom
        vec3(0.,.05,.1),// Slightly lighter blue at top
        smoothstep(-1.,1.,uv.y)
    );
    
    // Create stars
    float stars=0.;
    vec2 starUV=uv*50.;
    stars=noise(floor(starUV))*smoothstep(.95,1.,noise(floor(starUV)*.5+floor(time*.5)));
    
    // Create aurora base shape with multiple layers
    float auroraShape=0.;
    
    // Multiple layers of aurora with different speeds and scales
    const int AURORA_LAYERS=5;
    for(int i=0;i<AURORA_LAYERS;i++){
        float t=float(i)/float(AURORA_LAYERS-1);
        float layerSpeed=mix(.5,2.,t);
        float layerScale=mix(1.,3.,t);
        
        // Create the base shape using noise
        float baseNoise=fbm(vec2(uv.x*layerScale+time*layerSpeed,time*layerSpeed*.5));
        
        // Create oscillating height for the aurora
        float heightMod=sin(uv.x*2.+time+baseNoise*5.)*.15;
        heightMod+=sin(uv.x*5.-time*1.5+baseNoise*2.)*.05;
        
        // Aurora height curve
        float auroraHeight=.1+heightMod+t*.4;// Higher layers are higher up
        
        // Create each layer of the aurora
        float layerIntensity=smoothstep(auroraHeight,auroraHeight-.3-baseNoise*.2,uv.y);
        layerIntensity*=smoothstep(-1.,-.5,uv.y);// Fade out towards bottom
        
        // Add detail variation to each layer
        float detailNoise=fbm(vec2(uv.x*10.*layerScale+time*layerSpeed*2.,uv.y*20.));
        layerIntensity*=(.8+detailNoise*.4);
        
        // Add vertical rays
        float rays=sin(uv.x*20.+baseNoise*10.+time*2.)*.5+.5;
        rays=pow(rays,5.)*.5;
        
        // Combine with main shape
        layerIntensity+=rays*layerIntensity;
        
        // Weight layers
        float layerWeight=mix(.3,1.,t);// Higher layers are more prominent
        auroraShape+=layerIntensity*layerWeight;
    }
    
    // Clamp the shape intensity
    auroraShape=min(auroraShape,1.);
    
    // Aurora color palette
    vec3 color1=vec3(0.,.8,.2);// Green
    vec3 color2=vec3(0.,.5,.8);// Blue
    vec3 color3=vec3(.5,0.,.8);// Purple
    vec3 color4=vec3(.8,0.,.3);// Pink
    
    // Color mixing based on position and time
    float colorMix1=sin(uv.x*2.+time)*.5+.5;
    float colorMix2=cos(uv.x*3.-time*1.5)*.5+.5;
    
    // Create dynamic color shift
    vec3 auroraColor=mix(color1,color2,colorMix1);
    auroraColor=mix(auroraColor,color3,colorMix2*.5);
    
    // Add pink edge for more vibrant look
    float pinkEdge=smoothstep(.5,.8,auroraShape);
    auroraColor=mix(auroraColor,color4,pinkEdge*.3);
    
    // Add brightness variation
    float brightness=1.+.5*sin(uv.x*5.+time*3.);
    auroraColor*=brightness;
    
    // Apply aurora shape to the color
    vec3 finalColor=skyColor;
    
    // Add stars to the sky
    finalColor+=stars*vec3(.8,.9,1.);
    
    // Add subtle background haze for the aurora
    float auroraHaze=auroraShape*.2;
    finalColor+=auroraColor*auroraHaze;
    
    // Add main aurora with glow
    float glow=auroraShape*auroraShape*1.;
    finalColor+=auroraColor*glow;
    
    // Create pulsing intensity
    float pulse=.8+.2*sin(time*.5);
    finalColor*=pulse;
    
    // Add subtle volumetric light rays at the top
    float rays=pow(max(0.,uv.y),5.)*.2;
    rays*=(.5+.5*sin(uv.x*10.+time));
    finalColor+=auroraColor*rays;
    
    // Add subtle vignette
    float vignette=1.-length(uv*vec2(.7,.5));
    vignette=smoothstep(0.,1.,vignette);
    finalColor*=vignette;
    
    // Output final color
    gl_FragColor=vec4(finalColor,1.);
}