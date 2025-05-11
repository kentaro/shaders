// Energy Field Shader
// Creates a dynamic electric energy field with bursts and pulses

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

// Noise functions
float hash(float n){
    return fract(sin(n)*43758.5453);
}

float noise(vec2 p){
    vec2 i=floor(p);
    vec2 f=fract(p);
    f=f*f*(3.-2.*f);
    float n=i.x+i.y*57.;
    return mix(
        mix(hash(n),hash(n+1.),f.x),
        mix(hash(n+57.),hash(n+58.),f.x),
        f.y
    );
}

float fbm(vec2 p){
    float f=0.;
    float w=.5;
    for(int i=0;i<5;i++){
        f+=w*noise(p);
        p*=2.;
        w*=.5;
    }
    return f;
}

void main(){
    // Normalized coordinates with aspect ratio correction
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Base electric field pattern
    float timeScale=u_time*.5;
    vec2 offsetUV=uv+vec2(sin(timeScale*.7),cos(timeScale*.5))*.2;
    
    // Multiple layers of electric patterns
    float noiseScale1=6.;
    float noiseScale2=12.;
    float noiseScale3=18.;
    
    float pattern1=fbm(offsetUV*noiseScale1+u_time*.1);
    float pattern2=fbm(offsetUV*noiseScale2-u_time*.15);
    float pattern3=fbm(offsetUV*noiseScale3+u_time*.2);
    
    // Combine patterns for a dynamic effect
    float combined=pattern1*pattern2*pattern3;
    combined=pow(combined,1.5)*3.;
    
    // Energy pulses from center
    float dist=length(uv);
    float pulse=sin(dist*8.-u_time*3.)*.5+.5;
    pulse=pow(pulse,3.)*(1.-smoothstep(0.,1.,dist));
    
    // Energy bursts
    float burstCount=5.;
    float burstStrength=0.;
    
    for(float i=0.;i<burstCount;i++){
        float t=i/burstCount;
        float burstTime=mod(u_time*.5+t*3.,3.);
        float burstPhase=0.;
        
        // Burst animation cycle
        if(burstTime<.5){
            // Quick expansion
            burstPhase=pow(burstTime/.5,2.);
        }else if(burstTime<1.5){
            // Hold
            burstPhase=1.;
        }else{
            // Fade out
            burstPhase=1.-pow((burstTime-1.5)/1.5,2.);
        }
        
        // Burst position
        float burstAngle=t*6.28+u_time*(.2+.1*sin(i*5.));
        vec2 burstPos=vec2(cos(burstAngle),sin(burstAngle))*.5;
        
        // Burst shape
        float burstDist=distance(uv,burstPos);
        float burstSize=.3*burstPhase;
        float burst=(1.-smoothstep(burstSize-.1,burstSize,burstDist))*burstPhase;
        
        burstStrength+=burst;
    }
    
    // Combine all elements
    float energy=combined+pulse*.3+burstStrength*.4;
    
    // Dynamic color mapping
    vec3 color1=vec3(.1,.4,1.);// Blue
    vec3 color2=vec3(1.,.4,.1);// Orange
    vec3 color3=vec3(.1,1.,.6);// Cyan
    
    vec3 color=mix(color1,color2,sin(u_time*.3)*.5+.5);
    color=mix(color,color3,sin(u_time*.5+2.)*.5+.5);
    
    // Apply energy field
    vec3 finalColor=color*energy;
    
    // Add subtle background glow
    finalColor+=vec3(0.,.1,.2)*(1.-energy)*.5;
    
    // Add extra highlights
    finalColor+=vec3(1.)*pow(energy,5.);
    
    // Output final color
    gl_FragColor=vec4(finalColor,1.);
}