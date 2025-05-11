// Color Explosion Shader
// Creates dynamic bursting color explosions with particle effects

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

// 2D noise
float noise(vec2 p){
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

// Fractal Brownian Motion (FBM)
float fbm(vec2 p){
    float value=0.;
    float amplitude=.5;
    float frequency=1.;
    
    // Add multiple layers of noise
    for(int i=0;i<6;i++){
        value+=amplitude*noise(p*frequency);
        amplitude*=.5;
        frequency*=2.;
    }
    
    return value;
}

// Explosion function
float explosion(vec2 uv,vec2 center,float radius,float shockwave,float time){
    float dist=length(uv-center);
    
    // Shockwave effect
    float shock=smoothstep(shockwave-.1,shockwave,dist)*smoothstep(shockwave+.1,shockwave,dist);
    shock*=1.-smoothstep(0.,1.,(dist-shockwave)*10.);
    
    // Core of explosion
    float core=smoothstep(radius,0.,dist);
    
    // Add noise to make it more organic
    float noiseDist=fbm(uv*5.+time*.5)*.2;
    float noiseShock=fbm(uv*3.-time*.3)*.3;
    
    return core*(1.+noiseDist)+shock*noiseShock;
}

void main(){
    // Normalized coordinates with aspect ratio correction
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Time variables
    float time=u_time*.5;
    
    // Background color
    vec3 bgColor=vec3(.02,.02,.05);// Dark blue background
    
    // Initialize final color
    vec3 finalColor=bgColor;
    
    // Create multiple explosions
    const int EXPLOSION_COUNT=5;
    
    for(int i=0;i<EXPLOSION_COUNT;i++){
        float fi=float(i);
        float seed=hash(fi+1.);// Unique seed for each explosion
        
        // Explosion timing
        float explosionCycle=3.;// Cycle length in seconds
        float explosionTime=mod(time+seed*explosionCycle,explosionCycle);
        float explosionPhase=explosionTime/explosionCycle;// 0 to 1 over the cycle
        
        // Only show explosion for part of the cycle
        if(explosionPhase<.6){
            // Calculate explosion parameters
            float explosionProgress=explosionPhase/.6;// Normalize to 0-1 for active phase
            
            // Position (moving slightly)
            vec2 center=vec2(
                mix(-.5,.5,hash(seed)),
                mix(-.5,.5,hash(seed+100.))
            );
            
            // Add some movement to the center
            center+=vec2(
                sin(time*(.5+seed*.5))*.1,
                cos(time*(.7+seed*.3))*.1
            )*explosionProgress;
            
            // Size parameters
            float maxRadius=.2+.3*seed;
            float radius=maxRadius*pow(explosionProgress,.3);// Grow quickly
            float shockwave=radius*1.2*explosionProgress;
            
            // Calculate explosion value
            float expl=explosion(uv,center,radius,shockwave,time+seed*10.);
            
            // Intensity fades at the end
            float fadeOut=1.-smoothstep(.4,.6,explosionPhase);
            expl*=fadeOut;
            
            // Explosion colors - vibrant and varied
            vec3 color1=.5+.5*cos(vec3(0.,2.,4.)+seed*6.28);// Random base color
            vec3 color2=.5+.5*cos(vec3(4.,2.,0.)+seed*6.28);// Complementary color
            
            // Inner color is brighter and warmer
            vec3 innerColor=mix(color1,vec3(1.,.9,.5),.7);// Bright yellow-ish core
            
            // Outer color based on the explosion seed
            vec3 outerColor=mix(color2,vec3(.5,.2,1.),seed);// Varied outer color
            
            // Mix colors based on distance from center
            float dist=length(uv-center);
            vec3 explosionColor=mix(innerColor,outerColor,smoothstep(0.,radius*1.5,dist));
            
            // Add some color variation with noise
            float colorNoise=fbm(uv*3.+time*.2)*.2;
            explosionColor=mix(explosionColor,color1,colorNoise);
            
            // Add the explosion to the scene
            finalColor=mix(finalColor,explosionColor,expl);
            
            // Add extra glow
            float glow=smoothstep(radius*2.,0.,dist)*.5*fadeOut;
            finalColor+=innerColor*glow;
            
            // Add particle effect
            const int PARTICLES=50;
            for(int j=0;j<PARTICLES;j++){
                float fj=float(j);
                float particleSeed=hash(seed*100.+fj);
                
                // Particle angle and distance
                float angle=particleSeed*6.28;
                float particleSpeed=.5+particleSeed*.5;// Random speed
                float distance=particleSpeed*radius*2.*explosionProgress;
                
                // Particle position
                vec2 particlePos=center+vec2(cos(angle),sin(angle))*distance;
                
                // Fade particle as it moves away
                float particleFade=1.-smoothstep(0.,1.,distance/(maxRadius*2.));
                
                // Particle size (smaller as it moves away)
                float particleSize=.01*(1.-.5*explosionProgress)*particleFade;
                
                // Draw particle
                float particle=smoothstep(particleSize,0.,length(uv-particlePos));
                
                // Particle color based on distance
                vec3 particleColor=mix(innerColor,outerColor,distance/(maxRadius*2.));
                particleColor=mix(particleColor,vec3(1.),.5);// Make particles brighter
                
                // Add particle to scene
                finalColor=mix(finalColor,particleColor,particle*particleFade*fadeOut);
            }
        }
    }
    
    // Add subtle background variation
    vec2 bgUV=uv*.5;
    float bgPattern=fbm(bgUV-time*.1)*.1;
    finalColor=mix(finalColor,vec3(.1,.1,.3),bgPattern*(1.-length(finalColor)));
    
    // Add vignette
    float vignette=1.-length(uv*.7);
    vignette=smoothstep(0.,1.,vignette);
    finalColor*=vignette;
    
    // Add some subtle film grain
    float grain=hash(uv+time)*.03;
    finalColor+=grain;
    
    // Output final color
    gl_FragColor=vec4(finalColor,1.);
}