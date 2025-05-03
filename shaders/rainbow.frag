// CYBER RAINBOW PULSE - Advanced VJ Shader
// This shader creates a dynamic, audio-reactive cyber rainbow effect with multiple layers
// Designed for VJ performances with high customizability

#ifdef GL_ES
precision highp float;// Use high precision for smoother gradients
#endif

// Core uniforms
uniform float u_time;// Time in seconds since start
uniform vec2 u_resolution;// Canvas resolution
uniform vec2 u_mouse;// Mouse position (normalized 0-1)

// Audio reactive uniforms - connect these to your audio analyzer
// NOTE: These need to be passed from your application
uniform float u_bass;// Low frequency intensity (0-1)
uniform float u_mid;// Mid frequency intensity (0-1)
uniform float u_high;// High frequency intensity (0-1)
uniform float u_volume;// Overall volume (0-1)

// CUSTOMIZATION PARAMETERS
// ----------------------------------------------------------
// Adjust these values to customize the visual output

// Color parameters
const float COLOR_INTENSITY=1.2;// Overall color intensity
const float COLOR_SATURATION=1.5;// Color saturation multiplier
const float COLOR_SPEED=.5;// Base rainbow cycling speed
const float COLOR_BANDS=3.;// Number of color bands

// Wave parameters
const float WAVE_AMPLITUDE=.2;// Wave distortion amount
const float WAVE_FREQUENCY=5.;// Wave frequency
const float WAVE_SPEED=.7;// Wave movement speed

// Pulse parameters
const float PULSE_RADIUS=.4;// Base pulse radius
const float PULSE_WIDTH=.1;// Pulse ring width
const float PULSE_SPEED=.8;// Pulse expansion speed
const int PULSE_COUNT=3;// Number of pulse rings

// Grid parameters
const float GRID_SIZE=20.;// Size of grid cells
const float GRID_WIDTH=.02;// Width of grid lines
const float GRID_BRIGHTNESS=.5;// Grid brightness

// Glitch parameters
const float GLITCH_INTENSITY=.3;// Intensity of glitch effect
const float GLITCH_SPEED=3.;// Speed of glitch changes
const float GLITCH_CHANCE=.2;// Probability of glitch effect

// ----------------------------------------------------------

// Hash function for pseudo-random values
float hash(float n){
    return fract(sin(n)*43758.5453123);
}

// 2D hash
vec2 hash2(vec2 p){
    p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));
    return fract(sin(p)*43758.5453);
}

// Simplex-style smooth noise
float noise(vec2 p){
    vec2 i=floor(p);
    vec2 f=fract(p);
    
    // Cubic interpolation curve
    vec2 u=f*f*(3.-2.*f);
    
    // Mix 4 corner values
    float a=hash(i.x+i.y*57.);
    float b=hash(i.x+1.+i.y*57.);
    float c=hash(i.x+(i.y+1.)*57.);
    float d=hash(i.x+1.+(i.y+1.)*57.);
    
    return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}

// Fractional Brownian Motion (layered noise)
float fbm(vec2 p){
    float value=0.;
    float amplitude=.5;
    float frequency=1.;
    
    // Add 5 octaves of noise
    for(int i=0;i<5;i++){
        value+=amplitude*noise(p*frequency);
        amplitude*=.5;
        frequency*=2.;
    }
    
    return value;
}

// Pulse ring function
float pulseRing(vec2 uv,vec2 center,float radius,float width){
    float dist=length(uv-center);
    return smoothstep(radius-width,radius,dist)*
    smoothstep(radius+width,radius,dist);
}

// Grid pattern
float grid(vec2 uv,float size,float lineWidth){
    vec2 grid=abs(fract(uv*size)-.5);
    vec2 lines=smoothstep(.5-lineWidth,.5,grid);
    return max(lines.x,lines.y);
}

// Glitch effect
vec2 glitchOffset(vec2 uv,float time,float intensity){
    // Create time-based blocks
    float blockX=floor(uv.x*10.);
    float blockY=floor(uv.y*10.);
    
    // Create glitch timing
    float glitchTime=floor(time*GLITCH_SPEED);
    
    // Random glitch chance per block
    float random=hash(blockX+blockY*100.+glitchTime);
    
    // Apply horizontal glitch offset only to some blocks
    vec2 offset=vec2(0.);
    if(random<GLITCH_CHANCE){
        float glitchAmount=hash(blockY+glitchTime)*2.-1.;
        offset.x=glitchAmount*intensity;
    }
    
    return offset;
}

// Main function
void main(){
    // Center and normalize coordinates for better effects
    vec2 uv=gl_FragCoord.xy/u_resolution.xy;
    vec2 centered=(uv*2.-1.)*vec2(u_resolution.x/u_resolution.y,1.);
    
    // Create time variables for animation control
    float time=u_time*COLOR_SPEED;
    float glitchTime=floor(u_time*GLITCH_SPEED);
    
    // Add audio reactivity - If no audio input, fallback to animated values
    // Replace these with actual uniforms when connecting to audio
    float bass=.5+.5*sin(u_time*.5);// Fake bass if u_bass not available
    float mid=.5+.5*sin(u_time*1.2+1.);// Fake mid if u_mid not available
    float high=.5+.5*sin(u_time*2.+2.);// Fake high if u_high not available
    float volume=.6+.4*sin(u_time);// Fake volume if u_volume not available
    
    // Apply audio-reactive or time-based distortion to the coordinates
    // This creates a wave-like movement that reacts to bass
    float distortionAmount=WAVE_AMPLITUDE*(1.+bass*2.);
    float distortionFreq=WAVE_FREQUENCY*(1.+mid*.5);
    float waveX=sin(centered.y*distortionFreq+time*WAVE_SPEED)*distortionAmount;
    float waveY=cos(centered.x*distortionFreq+time*WAVE_SPEED)*distortionAmount;
    
    // Apply coordinate distortion
    vec2 distortedUV=centered;
    distortedUV.x+=waveX;
    distortedUV.y+=waveY;
    
    // Apply glitch effect based on high frequencies
    vec2 glitchUV=distortedUV+glitchOffset(distortedUV,time,GLITCH_INTENSITY*high);
    
    // Generate FBM noise pattern for texture
    float noisePattern=fbm(glitchUV*3.+time*.2);
    
    // Apply dynamic rainbow gradient with enhanced colors
    // Base colors cycle over time, and position affects hue
    vec3 baseColor=.5+.5*cos(time+
        vec3(length(glitchUV)*COLOR_BANDS+centered.x,
        length(glitchUV)*COLOR_BANDS+centered.y,
        length(glitchUV)*COLOR_BANDS)+
        vec3(0.,2.,4.));
        
        // Enhance colors with noise and saturation
        vec3 enhancedColor=mix(baseColor,baseColor*(.5+.5*noisePattern),.3);
        enhancedColor=mix(vec3(length(enhancedColor)),enhancedColor,COLOR_SATURATION);
        enhancedColor*=COLOR_INTENSITY;
        
        // Add pulsing rings that react to mid frequencies
        float pulseIntensity=0.;
        float pulseScale=1.+mid*2.;// Pulses grow with mid frequencies
        
        for(int i=0;i<PULSE_COUNT;i++){
            float pulsePhase=float(i)/float(PULSE_COUNT);
            float pulseTime=time*PULSE_SPEED+pulsePhase*3.1415*2.;
            float pulseRadius=(.2+PULSE_RADIUS*pulseScale)*(.5+.5*sin(pulseTime));
            
            pulseIntensity+=pulseRing(centered,vec2(0.),pulseRadius,PULSE_WIDTH*(1.+high));
        }
        
        // Add grid pattern that reacts to high frequencies
        float gridPattern=grid(distortedUV,GRID_SIZE,GRID_WIDTH*(1.+high*2.));
        
        // Combine all elements
        vec3 finalColor=enhancedColor;
        
        // Add pulse rings with bloom effect
        finalColor+=pulseIntensity*enhancedColor*2.*(1.+high);
        
        // Add grid with color variation
        vec3 gridColor=vec3(.9,.9,1.)*enhancedColor;// Make grid inherit base colors
        finalColor=mix(finalColor,gridColor,gridPattern*GRID_BRIGHTNESS*(.5+high*.5));
        
        // Add audio-reactive brightness boost
        finalColor*=1.+volume*.5;
        
        // Add vignette effect (darker edges)
        float vignette=1.-length(centered*.7);
        vignette=smoothstep(0.,1.,vignette);
        finalColor*=vignette;
        
        // Add subtle scanlines for cyber effect
        float scanline=.95+.05*sin(gl_FragCoord.y*.5);
        finalColor*=scanline;
        
        // Apply global intensity controlled by volume
        finalColor*=.8+volume*.5;
        
        // Output final color
        gl_FragColor=vec4(finalColor,1.);
    }