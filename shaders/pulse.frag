// HYPER PULSE REACTOR v2.0
// Advanced audio-reactive pulsating energy system with multiple layers and dynamic effects
// Perfect for high-energy VJ performances, beat synchronization, and transitions

#ifdef GL_ES
// Sets the floating point precision for better performance on mobile devices
precision mediump float;
#endif

// Uniforms are values passed from the CPU to the GPU
uniform float u_time;// Time in seconds since the shader started
uniform vec2 u_resolution;// Width and height of the canvas in pixels
uniform float u_audio_level;// Audio input level (0.0-1.0) - connect to audio analyzer
uniform float u_intensity;// Overall intensity control (0.0-1.0) - for transitions

// ======== CUSTOMIZATION PARAMETERS - ADJUST FOR YOUR VJ PERFORMANCE ========
// Change these values to customize the visual appearance and behavior
#define COLOR_SCHEME 0// 0: neon pink/blue, 1: cyber green, 2: electric orange, 3: rainbow cycle
#define PULSE_SPEED 1.0// Animation speed multiplier (0.5-2.0 recommended)
#define PULSE_LAYERS 3// Number of pulse layers (1-5) - higher values = more complex visuals
#define PULSE_COMPLEXITY 3.0// Visual complexity multiplier (1.0-5.0) - affects number of rings
#define ENABLE_SHOCK_WAVES true// Enable expanding shock waves on audio peaks (true/false)
#define ENABLE_PARTICLE_SYSTEM true// Enable particle burst effects (true/false)
#define ENABLE_GLITCH true// Enable digital glitch effects (true/false)
// =========================================================================

// ======== UTILITY FUNCTIONS ========

// Hash function for random values
// Controls the randomness of particle positions and noise textures
// Higher multiplier = more chaotic randomness
float hash(float n){
    return fract(sin(n)*43758.5453123);
}

// 2D hash function
// Used for 2D noise generation and pattern randomization
vec2 hash2(vec2 p){
    p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));
    return fract(sin(p)*43758.5453);
}

// Noise function for organic movements
// Creates smooth, natural-looking variations
// Adjust the cubic smoothing to change the noise characteristics
float noise(vec2 p){
    vec2 i=floor(p);
    vec2 f=fract(p);
    
    // Cubic Hermite smoothing - makes noise appear more organic
    // For sharper noise, replace with linear interpolation: f = f
    f=f*f*(3.-2.*f);
    
    float a=hash(dot(i,vec2(1.,157.)));
    float b=hash(dot(i+vec2(1.,0.),vec2(1.,157.)));
    float c=hash(dot(i+vec2(0.,1.),vec2(1.,157.)));
    float d=hash(dot(i+vec2(1.,1.),vec2(1.,157.)));
    
    return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
}

// ======== VISUAL EFFECT FUNCTIONS ========

// Function to generate pulsating waves
// Creates the main circular pulse rings
// Parameters:
// - radius: distance from center (0.0-1.0)
// - width: thickness of the ring (0.0-0.1)
// - phase: animation timing parameter
float pulseWave(vec2 uv,float radius,float width,float phase){
    float dist=length(uv);
    float ring=smoothstep(width,0.,abs(dist-radius));
    return ring;
}

// Function to create shock waves that respond to audio peaks
// Creates expanding circular waves triggered by audio
// Increase wave_speed for faster waves, width for thicker rings
float shockWave(vec2 uv,float time,float audio){
    if(!ENABLE_SHOCK_WAVES)return 0.;
    
    float intensity=0.;
    
    // Create shock waves based on audio peaks
    for(int i=0;i<3;i++){
        float fi=float(i);
        
        // Trigger a new wave when audio exceeds a threshold
        float trigger_time=floor(time*(.5+fi*.1));
        float wave_age=time-trigger_time/(.5+fi*.1);
        
        // Wave properties
        float wave_speed=.3+audio*.7;
        float radius=wave_age*wave_speed;
        float width=.05+audio*.05;
        float fade=max(0.,1.-wave_age*1.);// Fade out with age
        
        // Wave shape with audio-reactive thickness
        float wave=smoothstep(width+audio*.05,0.,abs(length(uv)-radius))*fade;
        
        intensity+=wave*.3;
    }
    
    return intensity;
}

// Particle system for energy bursts
// Creates flying particles that emanate from the center
// Parameters to customize:
// - particle_count: number of particles (higher = more CPU intensive)
// - size: particle size (0.01-0.1)
// - speed: movement speed
float particles(vec2 uv,float time,float audio){
    if(!ENABLE_PARTICLE_SYSTEM)return 0.;
    
    float particles=0.;
    
    // Number of particles based on audio level
    int particle_count=int(10.+audio*20.);
    
    for(int i=0;i<30;i++){
        if(i>=particle_count)break;
        
        float fi=float(i);
        
        // Particle properties
        float seed=hash(fi*.123);
        float speed=(.3+seed*.7)*(1.+audio);
        float angle=seed*6.28;// Random direction
        
        // Position with outward movement
        float lifetime=mod(time*speed+seed*10.,2.);
        float size=.03*(1.-lifetime*.5)*(1.+audio);
        float distance=lifetime*(.5+seed*.5);
        
        vec2 pos=vec2(cos(angle),sin(angle))*distance;
        
        // Particle shape
        float particle=smoothstep(size,0.,length(uv-pos));
        
        // Fade out as particles move outward
        float fade=max(0.,1.-lifetime/2.);
        
        particles+=particle*fade*(.5+audio*.5);
    }
    
    return particles;
}

// Glitch effect for digital distortion
// Creates digital artifacts and RGB channel shifting
// For more intense glitching:
// - Increase trigger threshold (0.75 to 0.5)
// - Increase offset multiplier (20.0 to 40.0)
// - Add more distortion types
vec3 glitchEffect(vec3 color,vec2 uv,float time,float audio){
    if(!ENABLE_GLITCH)return color;
    
    // Create occasional glitch based on audio peaks
    float glitch_trigger=step(.75-audio*.3,hash(floor(time*5.)));
    
    if(glitch_trigger>.5){
        // Horizontal glitch bands
        float line_pos=floor(uv.y*10.)/10.;
        float hash_value=hash(line_pos+floor(time*20.));
        
        if(hash_value>.95){
            // Shift rgb channels horizontally
            float offset=(hash_value-.95)*20.*audio;
            
            // Modified RGB channel shifting without using texture2D
            vec2 uv_r=vec2(uv.x+offset*.05,uv.y);
            vec2 uv_b=vec2(uv.x-offset*.05,uv.y);
            
            // Store original color
            vec3 orig_color=color;
            
            // Recalculate base glow for offset coordinates
            float centerGlow_r=smoothstep(.2+.1*sin(time),0.,length(uv_r));
            float centerGlow_b=smoothstep(.2+.1*sin(time),0.,length(uv_b));
            
            // Apply the color shift
            color.r=mix(color.r,orig_color.r*(1.+centerGlow_r*.5),.5);
            // color.g remains unchanged
            color.b=mix(color.b,orig_color.b*(1.+centerGlow_b*.5),.5);
            
            // Add digital noise
            color+=(hash(uv.x*100.+uv.y*100.+time*10.)-.5)*.2;
        }
    }
    
    return color;
}

// Function to return color scheme based on parameter
// Defines the color palettes for different visual themes
// You can modify the color values to create custom palettes
vec3 getColorScheme(int scheme,float value,float time){
    if(scheme==0){
        // Neon pink/blue - cyberpunk style
        return mix(vec3(.1,0.,.3),vec3(1.,0.,.8),value);
    }else if(scheme==1){
        // Cyber green - matrix style
        return mix(vec3(0.,.1,0.),vec3(0.,.9,.3),value);
    }else if(scheme==2){
        // Electric orange - energetic style
        return mix(vec3(.2,0.,0.),vec3(1.,.5,0.),value);
    }else{
        // Rainbow cycle - psychedelic style
        float t=time*.1;
        vec3 a=vec3(.5+.5*sin(t),.5+.5*sin(t+2.094),.5+.5*sin(t+4.188));
        vec3 b=vec3(.5+.5*sin(t+3.141),.5+.5*sin(t+5.235),.5+.5*sin(t+1.047));
        return mix(a*.2,b,value);
    }
}

void main(){
    // Normalize coordinates to center (0,0) with aspect ratio correction
    vec2 uv=(gl_FragCoord.xy-.5*u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Animation time with speed control
    float time=u_time*PULSE_SPEED;
    
    // Audio level with reactive boost
    float audio=max(u_audio_level,.2);// Minimum value of 0.2 ensures visuals even with no audio
    float audio_reactive=audio*(1.+audio*2.);// Non-linear response for more dramatic effect
    
    // Initialize color
    vec3 color=vec3(0.);
    
    // Create base glow at center
    float centerGlow=smoothstep(.2+.1*sin(time),0.,length(uv));
    centerGlow*=.5+.5*(sin(time*3.)*.5+.5);
    centerGlow*=1.+audio*2.;// Audio reactive center
    
    // Add base color from center glow
    color+=centerGlow*getColorScheme(COLOR_SCHEME,.8,time);
    
    // Add multiple pulsating rings with audio reactivity
    for(int i=0;i<5;i++){
        if(i>=PULSE_LAYERS)break;
        
        float fi=float(i);
        
        // Create expanding rings with varying speeds
        float speed=.5+fi*.1;// Different speed for each ring
        float phase=time*speed;// Time-based phase
        
        // Ring properties
        float ring_count=5.*PULSE_COMPLEXITY;// Number of concentric rings
        float width=.02+.01*audio;// Ring width affected by audio
        
        // Audio-reactive amplitude
        float amplitude=.3+.2*sin(time*.5+fi)+.2*audio_reactive;
        
        // Multiple rings with audio-reactive properties
        for(int j=0;j<10;j++){
            float fj=float(j);
            if(fj>=ring_count)break;
            
            // Ring radius with audio-reactive speed
            float radius=mod(phase*(1.+audio*.3)+fj/ring_count,1.)*.8;
            
            // Pulsating waves
            float ring=pulseWave(uv,radius,width,phase);
            
            // Apply color with intensity falloff for outer rings
            float intensity=amplitude*(1.-radius*.5);
            color+=ring*getColorScheme(COLOR_SCHEME,.5+fi*.1,time)*intensity*(1.+audio*.5);
        }
        
        // Add distortion to rings based on noise
        vec2 distortion=vec2(
            noise(uv*5.+time*.2)*.1,
            noise(uv*5.+vec2(100.)+time*.2)*.1
        );
        
        // Apply distortion with audio reactivity
        distortion*=audio*.5;
        uv+=distortion;
    }
    
    // Add shock waves triggered by audio peaks
    float shockWaveEffect=shockWave(uv,time,audio_reactive);
    color+=shockWaveEffect*getColorScheme(COLOR_SCHEME,.9,time);
    
    // Add particle system
    float particleEffect=particles(uv,time,audio_reactive);
    color+=particleEffect*getColorScheme(COLOR_SCHEME,.7,time);
    
    // Add subtle noise texture
    float noise_tex=noise(uv*20.+time*.5)*.05;
    color+=noise_tex*getColorScheme(COLOR_SCHEME,.3,time);
    
    // Add subtle vignette
    float vignette=1.-dot(uv*1.5,uv*1.5);
    color*=vignette;
    
    // Apply glitch effect
    color=glitchEffect(color,uv+.5,time,audio);
    
    // Add highlight flashes based on audio peaks
    if(audio>.8){
        float flash=audio-.8;
        color+=flash*getColorScheme(COLOR_SCHEME,.9,time)*2.;
    }
    
    // Apply master intensity with minimum threshold
    color*=max(u_intensity,.5);// Guarantees minimum brightness for better visibility
    
    // Ensure minimum brightness to prevent completely black output
    color=max(color,vec3(.01));// Set a minimum color value to prevent complete darkness
    
    // Output the final color with alpha=1 (fully opaque)
    gl_FragColor=vec4(color,1.);
}

// ======== VJ PERFORMANCE USAGE NOTES ========
// - Connect u_audio_level to your audio analyzer (bass drum works best)
// - Use u_intensity for fade in/out during performance
// - Adjust COLOR_SCHEME for different visual themes
// - Modify PULSE_SPEED to match your music BPM
// - PULSE_LAYERS and PULSE_COMPLEXITY control visual density
// - Toggle effect booleans for different visual styles
//
// RECOMMENDED MAPPINGS FOR VJ CONTROLLERS:
// - Knob 1: u_intensity (overall brightness)
// - Knob 2: PULSE_SPEED (animation speed)
// - Button 1: COLOR_SCHEME cycling
// - Button 2: ENABLE_GLITCH toggle
// - Button 3: ENABLE_SHOCK_WAVES toggle
// - Button 4: ENABLE_PARTICLE_SYSTEM toggle
// - Slider 1: PULSE_COMPLEXITY (visual density)
// - Slider 2: Audio sensitivity multiplier
//
// ADVANCED CUSTOMIZATION TIPS:
// - For slower, more ambient visuals: decrease PULSE_SPEED to 0.5, set PULSE_COMPLEXITY to 2.0
// - For high-energy drops: increase PULSE_LAYERS to 5, enable all effects, use COLOR_SCHEME 0 or 2
// - For clean, minimal look: disable ENABLE_GLITCH, set PULSE_LAYERS to 2
// - For psychedelic rainbow patterns: use COLOR_SCHEME 3, increase PULSE_COMPLEXITY to 4.0
// - For better performance on mobile: reduce PULSE_LAYERS and PULSE_COMPLEXITY
//
// TROUBLESHOOTING:
// - If visuals appear black: ensure u_intensity is set above 0.5
// - If animation is too fast/slow: adjust PULSE_SPEED to match your tempo
// - If audio reactivity is weak: increase the audio input gain or modify the audio multipliers
// - If effects are too intense: reduce PULSE_COMPLEXITY or disable individual effects
// ==============================================