// Audio Wave Spectrum Shader
// Creates a responsive audio spectrum visualization with waves

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

// Hash function
float hash(float n){
    return fract(sin(n)*43758.5453123);
}

// 1D noise
float noise(float p){
    float fl=floor(p);
    float fc=fract(p);
    return mix(hash(fl),hash(fl+1.),fc);
}

// Simulated audio spectrum function - will be dynamic in a real implementation
// Real implementation would use audio input data
float audioSpectrum(float freq,float time){
    // Combine multiple sine waves to create a complex audio pattern
    float bass=sin(time*.63)*.5+.5;
    float mid=sin(time*1.23+freq*.5)*.5+.5;
    float high=sin(time*2.43+freq*1.)*.5+.5;
    
    // Add some noise for more organic feel
    float noise1=noise(freq*10.+time*.5)*.2;
    float noise2=noise(freq*5.-time*.3)*.1;
    
    // Bass has more impact on lower frequencies
    float bassMix=smoothstep(1.,0.,freq);
    // Mids are centered
    float midMix=1.-abs(freq-.5)*2.;
    // Highs have more impact on higher frequencies
    float highMix=smoothstep(0.,1.,freq);
    
    // Combine based on frequency range
    float spectrum=bass*bassMix+mid*midMix+high*highMix;
    
    // Add noise for detail
    spectrum+=noise1*bassMix+noise2*highMix;
    
    // Add sudden peaks for transients
    float transient=0.;
    float transientTime=floor(time*2.);
    float transientPhase=fract(time*2.);
    
    if(transientPhase<.1){
        transient=(1.-transientPhase/.1)*hash(transientTime)*smoothstep(.7,1.,hash(freq*5.+transientTime));
    }
    
    spectrum+=transient;
    
    // Add heartbeat-like pulses
    float pulse=pow(sin(time*1.5)*.5+.5,4.)*.5;
    spectrum+=pulse*bassMix;
    
    // Normalize between 0 and 1 with a bit of headroom
    return clamp(spectrum,0.,1.);
}

void main(){
    // Normalized coordinates with aspect ratio correction
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Time variables
    float time=u_time*.5;
    
    // Initialize final color
    vec3 finalColor=vec3(0.);
    
    // Background gradient
    vec3 bgColor=mix(
        vec3(.05,.05,.1),// Dark blue
        vec3(.1,.05,.15),// Dark purple
        uv.y*.5+.5
    );
    
    // Number of spectrum bars
    const int BARS=64;
    
    // Frequency lines (spectrum analyzer)
    for(int i=0;i<BARS;i++){
        float fi=float(i)/float(BARS);
        
        // Get simulated audio amplitude for this frequency
        float amplitude=audioSpectrum(fi,time);
        
        // Bar position
        float barPos=fi*2.-1.;// Map to -1.0 to 1.0
        float barWidth=1.8/float(BARS);
        
        // Add some variation to bar positions for a more organic look
        barPos+=sin(fi*5.+time)*.03;
        
        // Create bar shape
        float bar=smoothstep(barWidth,0.,abs(uv.x-barPos));
        bar*=smoothstep(0.,amplitude,.5+uv.y*.5);// Bar height based on amplitude
        
        // Bar color based on frequency
        vec3 barColor=mix(
            vec3(0.,.5,1.),// Blue (low frequencies)
            vec3(1.,0.,.5),// Pink (high frequencies)
            fi
        );
        
        // Add a bit of brightness variation
        barColor*=.8+.2*sin(time*2.+fi*10.);
        
        // Add bar to final color
        finalColor+=bar*barColor*.15;
    }
    
    // Wave visualization
    float waveHeight=0.;
    const int WAVE_SEGMENTS=150;
    
    for(int i=0;i<WAVE_SEGMENTS;i++){
        float fi=float(i)/float(WAVE_SEGMENTS);
        
        // Sample amplitude at this position
        float waveAmplitude=audioSpectrum(fi,time*2.)*.25;
        
        // Wave position
        float wavePos=fi*2.-1.;// Map to -1.0 to 1.0
        
        // Calculate distance to this wave segment
        float dist=abs(uv.x-wavePos);
        float waveContribution=smoothstep(.02,0.,dist);// Smooth line
        
        // Add wave point to total height at this x position
        waveHeight+=waveContribution*waveAmplitude;
    }
    
    // Create wave line
    float wave=smoothstep(.01,0.,abs(uv.y-waveHeight));
    
    // Glow around the wave
    float waveGlow=smoothstep(.2,0.,abs(uv.y-waveHeight));
    
    // Wave color pulsating with the beat
    float beat=pow(sin(time*1.5)*.5+.5,4.);
    vec3 waveColor=mix(
        vec3(0.,1.,.5),// Green
        vec3(1.,.5,0.),// Orange
        beat
    );
    
    // Add wave to final color
    finalColor+=wave*waveColor*.8;
    finalColor+=waveGlow*waveColor*.3;
    
    // Circle visualization - represent bass frequencies
    float bassAmplitude=audioSpectrum(.05,time);// Low frequency
    float midAmplitude=audioSpectrum(.5,time);// Mid frequency
    float highAmplitude=audioSpectrum(.95,time);// High frequency
    
    // Create concentric circles pulsing with different frequency bands
    float dist=length(uv);
    
    // Bass circle
    float bassCircle=smoothstep(.02,0.,abs(dist-bassAmplitude*.8));
    float bassGlow=smoothstep(.2,0.,abs(dist-bassAmplitude*.8));
    
    // Mid circle
    float midCircle=smoothstep(.02,0.,abs(dist-midAmplitude*.5));
    float midGlow=smoothstep(.1,0.,abs(dist-midAmplitude*.5));
    
    // High circle
    float highCircle=smoothstep(.01,0.,abs(dist-highAmplitude*.3));
    float highGlow=smoothstep(.05,0.,abs(dist-highAmplitude*.3));
    
    // Add circles to final color
    finalColor+=bassCircle*vec3(1.,.2,.2)*.5;// Red for bass
    finalColor+=bassGlow*vec3(1.,.2,.2)*.2;
    
    finalColor+=midCircle*vec3(.2,1.,.2)*.4;// Green for mids
    finalColor+=midGlow*vec3(.2,1.,.2)*.1;
    
    finalColor+=highCircle*vec3(.2,.2,1.)*.3;// Blue for highs
    finalColor+=highGlow*vec3(.2,.2,1.)*.1;
    
    // Add background
    finalColor+=bgColor;
    
    // Add central glow
    float centralGlow=.05/(.1+dist*dist);
    finalColor+=centralGlow*mix(waveColor,vec3(1.),.5);
    
    // Add subtle vignette
    float vignette=1.-dist;
    vignette=smoothstep(0.,.5,vignette);
    finalColor*=vignette;
    
    // Output
    gl_FragColor=vec4(finalColor,1.);
}