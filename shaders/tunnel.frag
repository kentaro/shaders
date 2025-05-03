// HYPER DIMENSION VORTEX v2.0
// Advanced audio-reactive hyperspace tunnel with multiple dimensional layers and digital distortions
// Designed for professional VJ performances with extensive customization options

#ifdef GL_ES
precision highp float;
#endif

// Core uniforms
uniform float u_time;// Time in seconds since start
uniform vec2 u_resolution;// Canvas resolution
uniform vec2 u_mouse;// Mouse position (normalized 0-1)

// Audio reactive uniforms - connect these to your audio analyzer
uniform float u_bass;// Low frequency intensity (0-1)
uniform float u_mid;// Mid frequency intensity (0-1)
uniform float u_high;// High frequency intensity (0-1)
uniform float u_volume;// Overall volume (0-1)
uniform float u_intensity;// Master intensity control (0-1) for transitions

// =======================================================
// CUSTOMIZATION PARAMETERS - Adjust these for your VJ sets
// =======================================================

// Tunnel parameters
#define TUNNEL_SPEED 2.0// Base tunnel forward speed
#define TUNNEL_ROTATION .8// Tunnel rotation speed
#define TUNNEL_DEPTH 10.0// Tunnel depth effect
#define TUNNEL_DISTORTION .3// Amount of tunnel warping
#define TUNNEL_LAYERS 3// Number of overlapping tunnel layers (1-5)

// Stripe parameters
#define STRIPE_COUNT 12.0// Number of radial stripes
#define STRIPE_WIDTH .7// Width of stripes (0-1)
#define STRIPE_SHARPNESS 4.0// Sharpness of stripe edges
#define STRIPE_SPEED 1.5// Rotation speed of stripes

// Ring parameters
#define RING_COUNT 10.0// Number of concentric rings
#define RING_WIDTH .3// Width of the rings (0-1)
#define RING_SPEED 1.2// Speed of ring movement
#define RING_FRACTAL_ITERATIONS 3// Fractal iterations for rings
#define RING_COMPLEXITY 2.0// Visual complexity of rings (1.0-4.0)

// Color parameters
#define COLOR_SCHEME 0// 0: Cyberpunk, 1: Synthwave, 2: Matrix, 3: Rainbow, 4: Custom
#define COLOR_CYCLE_SPEED .4// Color cycling speed
#define COLOR_INTENSITY 1.5// Overall color intensity
#define COLOR_SATURATION 1.2// Color saturation
#define HUE_OFFSET .7// Base hue offset

// Effect parameters
#define GLOW_AMOUNT .4// Amount of center glow
#define EDGE_GLOW .2// Amount of edge glow
#define WARP_AMOUNT .2// Coordinate warping amount
#define FEEDBACK_AMOUNT .15// Visual feedback effect amount
#define FLARE_INTENSITY .5// Lens flare intensity

// Cyber effects
#define ENABLE_GRID true// Enable grid overlay
#define GRID_INTENSITY .15// Grid overlay intensity
#define ENABLE_GLITCH true// Enable glitch effect
#define GLITCH_AMOUNT .3// Amount of glitch effect
#define ENABLE_SCAN_LINES true// Enable scan lines
#define SCAN_INTENSITY .1// Scanline intensity
#define ENABLE_DATA_FLOW true// Enable data flow visualization
#define DATA_FLOW_COMPLEXITY 2.0// Complexity of data flow (1.0-3.0)

// Dimensional effects
#define ENABLE_PORTAL_RINGS true// Enable portal ring flash effects
#define ENABLE_DEPTH_PULSE true// Enable tunnel depth pulsation
#define ENABLE_FRACTAL_NOISE true// Enable fractal noise distortion
#define ENABLE_SHOCKWAVE true// Enable audio-triggered shockwaves

// =======================================================

#define PI 3.14159265359
#define TWO_PI 6.28318530718

// Hash function for pseudo-random values
float hash(float n){
    return fract(sin(n)*43758.5453123);
}

// 2D hash
vec2 hash2(vec2 p){
    p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));
    return fract(sin(p)*43758.5453);
}

// Improved noise function
float noise(vec2 p){
    vec2 i=floor(p);
    vec2 f=fract(p);
    
    // Improved smoothing - cubic Hermite curve
    f=f*f*(3.-2.*f);
    
    // Mix 4 corners
    float a=hash(dot(i,vec2(1.,157.)));
    float b=hash(dot(i+vec2(1.,0.),vec2(1.,157.)));
    float c=hash(dot(i+vec2(0.,1.),vec2(1.,157.)));
    float d=hash(dot(i+vec2(1.,1.),vec2(1.,157.)));
    
    return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
}

// Fractal Brownian Motion with domain warping
float fbm(vec2 p,float time,float complexity){
    float value=0.;
    float amplitude=.5;
    float frequency=1.;
    float lacunarity=2.;
    float gain=.5;
    vec2 shift=vec2(100.);
    
    // Domain warping makes the noise more interesting
    for(int i=0;i<2;i++){
        value+=amplitude*noise(p*frequency);
        // Rotate to avoid axial bias
        p=mat2(cos(.5),sin(.5),-sin(.5),cos(.5))*p;
        frequency*=lacunarity;
        amplitude*=gain;
    }
    
    // Add more octaves for higher complexity
    if(complexity>1.5){
        for(int i=0;i<2;i++){
            value+=amplitude*noise(p*frequency+time*.1);
            p=mat2(cos(.4),sin(.4),-sin(.4),cos(.4))*p;
            frequency*=lacunarity;
            amplitude*=gain;
        }
    }
    
    if(complexity>2.5){
        value+=amplitude*noise(p*frequency+vec2(sin(time*.3),cos(time*.2)));
    }
    
    return value;
}

// Voronoi cellular noise for cyberpunk texturing
vec2 voronoi(vec2 x,float time){
    vec2 n=floor(x);
    vec2 f=fract(x);
    
    vec2 mg,mr;
    float md=8.;
    
    for(int i=-1;i<=1;i++){
        for(int j=-1;j<=1;j++){
            vec2 g=vec2(float(j),float(i));
            vec2 o=hash2(n+g);
            
            // Animate cells
            o=.5+.5*sin(time*.3+TWO_PI*o);
            
            vec2 r=g+o-f;
            float d=dot(r,r);
            
            if(d<md){
                md=d;
                mr=r;
                mg=g;
            }
        }
    }
    
    return vec2(md,dot(mg+n,vec2(1.)));
}

// Function to convert HSV to RGB
vec3 hsv2rgb(vec3 c){
    vec4 K=vec4(1.,2./3.,1./3.,3.);
    vec3 p=abs(fract(c.xxx+K.xyz)*6.-K.www);
    return c.z*mix(K.xxx,clamp(p-K.xxx,0.,1.),c.y);
}

// Function to get color scheme based on parameter
vec3 getColorScheme(int scheme,float value,float time){
    if(scheme==0){
        // Cyberpunk - neon blue/pink
        return mix(vec3(.1,0.,.3),vec3(.9,.2,.9),value);
    }else if(scheme==1){
        // Synthwave - purple/orange
        return mix(vec3(.3,0.,.5),vec3(1.,.5,.1),value);
    }else if(scheme==2){
        // Matrix - dark/bright green
        return mix(vec3(0.,.1,0.),vec3(0.,.8,.2),value);
    }else if(scheme==3){
        // Rainbow cycle
        float t=time*.1;
        vec3 a=vec3(.5+.5*sin(t),.5+.5*sin(t+2.094),.5+.5*sin(t+4.188));
        vec3 b=vec3(.5+.5*sin(t+3.141),.5+.5*sin(t+5.235),.5+.5*sin(t+1.047));
        return mix(a*.2,b,value);
    }else{
        // Custom - edit these colors for your own scheme
        return mix(vec3(0.,.2,.4),vec3(.7,0.,.6),value);
    }
}

// Create tunnel pattern with multiple layers and effects
float tunnelPattern(vec2 uv,float r,float angle,float time,float bass,float high,float mid){
    float pattern=0.;
    
    // Radial stripes with audio reactivity
    float stripeAngle=angle*STRIPE_COUNT-time*STRIPE_SPEED*(1.+bass*.5);
    float stripeWidth=STRIPE_WIDTH*(1.+high*.3);// Width changes with high freqs
    float stripes=pow(.5+.5*sin(stripeAngle),STRIPE_SHARPNESS);
    stripes=smoothstep(1.-stripeWidth,1.,stripes);
    
    // Concentric rings with audio-reactive speed
    float ringOffset=time*RING_SPEED*(1.+high*.3);
    float ringDistance=-1./r*TUNNEL_DEPTH;
    float rings=0.;
    
    // Create fractal ring pattern
    for(int i=0;i<RING_FRACTAL_ITERATIONS;i++){
        float fi=float(i);
        float ringScale=1.+fi*.4;
        float ringMod=mod(ringDistance*ringScale+ringOffset*(1.-fi*.2),RING_COUNT);
        
        // Add audio-reactive ring width
        float ringWidth=RING_WIDTH*(1.+bass*.4*sin(time+fi));
        float ring=smoothstep(ringWidth,0.,abs(ringMod-RING_COUNT/2.)/RING_COUNT);
        
        // Make outer iterations fainter
        rings+=ring/(1.+fi);
    }
    
    // Add complexity to rings if enabled
    if(RING_COMPLEXITY>1.){
        float complexRings=0.;
        for(int i=0;i<2;i++){
            float fi=float(i);
            float freq=3.+fi*2.;
            float phase=time*(1.+fi*.2)*(1.+mid*.3);
            complexRings+=.2*(.5+.5*sin(angle*freq+phase));
        }
        rings*=1.+complexRings*(RING_COMPLEXITY-1.)*.3;
    }
    
    // Combine patterns
    pattern=stripes*.7+rings*1.2;
    
    // Add noise texture if fractal noise is enabled
    if(ENABLE_FRACTAL_NOISE){
        float noisePattern=fbm(vec2(r*10.,angle*5.)+time*.1,time,DATA_FLOW_COMPLEXITY);
        pattern*=.85+.15*noisePattern;
    }
    
    return pattern;
}

// Data flow visualization for cyber effect
float dataFlow(vec2 uv,float time,float complexity,float audio){
    if(!ENABLE_DATA_FLOW)return 0.;
    
    float flow=0.;
    
    // Create data flow along specific paths
    for(int i=0;i<5;i++){
        if(float(i)>=complexity*2.)break;
        
        float fi=float(i);
        float speed=1.+fi*.2;
        float width=.05-fi*.01;
        
        // Create flowing data packets
        float pathPos=mod(time*speed+fi*1.23,2.)-1.;
        float thickness=width*(1.+audio*.5);
        
        // Different path shapes
        vec2 pathOffset;
        if(i%3==0){
            // Spiral path
            float angle=fi*.5+time*.2;
            float dist=.3+.2*fi/5.;
            pathOffset=vec2(cos(angle),sin(angle))*dist;
        }else if(i%3==1){
            // Horizontal path
            pathOffset=vec2(pathPos,.3-fi*.1);
        }else{
            // Vertical path
            pathOffset=vec2(.2-fi*.1,pathPos);
        }
        
        float dataPacket=smoothstep(thickness,0.,length(uv-pathOffset));
        
        // Make data packet blink
        float blink=.7+.3*sin(time*10.+fi*5.);
        
        flow+=dataPacket*blink;
    }
    
    return flow*.3;
}

// Glitch effect with audio reactivity
float glitchEffect(vec2 uv,float time,float intensity,float high){
    if(!ENABLE_GLITCH)return 0.;
    
    // Audio-reactive glitch intensity
    float audioIntensity=intensity*(1.+high*2.);
    
    // Create blocks that might glitch
    float blockX=floor(uv.x*10.);
    float blockY=floor(uv.y*10.);
    
    // Create glitch timing
    float glitchTime=floor(time*5.);
    
    // Random glitch per block based on audio
    float random=hash(blockX+blockY*100.+glitchTime);
    float glitchChance=.03+high*audioIntensity;
    
    if(random<glitchChance){
        float glitchAmount=hash(blockY+glitchTime)*.5;
        
        // More intense glitches on audio peaks
        if(high>.7){
            glitchAmount*=2.;
        }
        
        return glitchAmount;
    }
    
    return 0.;
}

// Grid pattern for cyber effect
float gridPattern(vec2 uv,float time,float bass){
    if(!ENABLE_GRID)return 0.;
    
    // Audio-reactive grid scale
    float gridScale=10.*(1.+bass*.5);
    
    // Create shifting grid
    vec2 grid=abs(fract(uv*gridScale+time*.1)-.5);
    float lines=smoothstep(.45,.5,max(grid.x,grid.y));
    
    // Add perspective to the grid (fade with distance)
    float fadeWithDepth=.3+.7/(1.+length(uv)*5.);
    
    return lines*fadeWithDepth;
}

// Shockwave effect triggered by audio peaks
float shockwave(vec2 uv,float time,float audio){
    if(!ENABLE_SHOCKWAVE)return 0.;
    
    float wave=0.;
    
    // Create occasional shockwaves based on audio peaks
    for(int i=0;i<3;i++){
        float fi=float(i);
        float triggerThreshold=.7-fi*.1;
        
        // Wave properties
        float waveTriggerTime=floor(time*(2.-fi*.5));
        float waveAge=fract(time*(2.-fi*.5));
        float waveActive=step(triggerThreshold,audio);
        
        // Only show wave when audio exceeds threshold
        if(waveActive>.5||waveAge<.5){
            float radius=waveAge*(1.+audio*.5);
            float thickness=.05*(1.-waveAge);
            
            wave+=smoothstep(thickness,0.,abs(length(uv)-radius))*(1.-waveAge);
        }
    }
    
    return wave*.3;
}

// Portal ring effect
float portalRings(vec2 uv,float time,float audio){
    if(!ENABLE_PORTAL_RINGS)return 0.;
    
    float rings=0.;
    float r=length(uv);
    
    // Multiple portal rings at different frequencies
    for(int i=0;i<3;i++){
        float fi=float(i);
        float speed=.3+fi*.2;
        float size=10.+fi*5.;
        float thickness=.1+audio*.1;
        
        float ring=smoothstep(thickness,0.,abs(mod(r*size+time*speed,3.)-1.5));
        
        // Audio-reactive intensity
        rings+=ring*(.2-fi*.05)*(1.+audio);
    }
    
    return rings;
}

void main(){
    // Center and normalize coordinates
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Create mock audio reactive values if uniforms not available
    float bass=max(u_bass,.5+.5*sin(u_time*.4));
    float mid=max(u_mid,.5+.5*sin(u_time*.7+1.));
    float high=max(u_high,.5+.5*sin(u_time*1.1+2.));
    float volume=max(u_volume,.7+.3*sin(u_time*.8+.5));
    
    // Master intensity for fades (default to visible value)
    float intensity=max(u_intensity,.8);
    
    // Time variables
    float time=u_time;
    float tunnelTime=time*TUNNEL_SPEED;
    
    // Create base distortion based on audio
    float distortion=TUNNEL_DISTORTION*(1.+mid*.5);
    
    // Apply audio-reactive coordinate distortion
    vec2 distortedUV=uv;
    
    // Warp coordinates based on noise and audio
    float warpNoise=fbm(uv+time*.1,time,1.);
    float warpAmount=WARP_AMOUNT*(1.+bass*2.);
    distortedUV+=warpNoise*warpAmount*vec2(sin(time),cos(time*.7));
    
    // Apply tunnel rotation that reacts to mid frequencies
    float rotation=time*TUNNEL_ROTATION*(1.+mid*.3);
    mat2 rotMat=mat2(cos(rotation),-sin(rotation),sin(rotation),cos(rotation));
    distortedUV=rotMat*distortedUV;
    
    // Create zoom effect based on bass
    float zoom=1.;
    if(ENABLE_DEPTH_PULSE){
        zoom+=bass*.2*sin(time*.5);
    }
    distortedUV/=zoom;
    
    // Apply glitch effect based on high frequencies
    vec2 glitchOffset=vec2(glitchEffect(uv,time,GLITCH_AMOUNT,high),0.);
    distortedUV+=glitchOffset;
    
    // Convert to polar coordinates for tunnel
    float angle=atan(distortedUV.y,distortedUV.x);
    float radius=length(distortedUV);
    
    // Initialize color
    vec3 color=vec3(0.);
    
    // Create multiple tunnel layers
    for(int i=0;i<5;i++){
        if(i>=TUNNEL_LAYERS)break;
        
        float fi=float(i);
        float layerOffset=fi*.1;
        float layerDepth=1./(1.+fi*.3);
        
        // Tunnel depth calculation with audio-reactive distortion
        float tunnelRadius=1./(radius+layerOffset)*layerDepth;
        
        // Apply distortion to tunnel shape
        tunnelRadius+=distortion*sin(angle*(6.+fi)+time)*sin(radius*(5.+fi)+time*2.);
        
        // Get tunnel pattern for this layer
        float pattern=tunnelPattern(distortedUV,radius+layerOffset,angle,tunnelTime+fi*.2,bass,high,mid);
        
        // Apply depth fade effect
        float depthFade=1./(1.+(radius+layerOffset)*8.);
        
        // Layer-specific color using HSV for easier color cycling
        float hueOffset=fi*.05;
        float hue=fract(angle/TWO_PI+time*COLOR_CYCLE_SPEED+HUE_OFFSET+hueOffset);
        
        // Make saturation audio-reactive
        float saturation=COLOR_SATURATION*(.8+high*.4);
        
        // Make brightness depth-dependent and audio-reactive
        float brightness=COLOR_INTENSITY*depthFade*(.7+volume*.5)*layerDepth;
        
        // Get color based on color scheme
        vec3 layerColor;
        if(COLOR_SCHEME>=0&&COLOR_SCHEME<=4){
            layerColor=getColorScheme(COLOR_SCHEME,brightness,time);
        }else{
            // Fallback to HSV if invalid scheme
            layerColor=hsv2rgb(vec3(hue,saturation,brightness));
        }
        
        // Apply the pattern
        layerColor*=pattern;
        
        // Add to final color with layer opacity
        float layerOpacity=1.-fi*.2;
        color+=layerColor*layerOpacity;
    }
    
    // Add data flow visualization
    float dataFlowPattern=dataFlow(distortedUV,time,DATA_FLOW_COMPLEXITY,high);
    color+=dataFlowPattern*getColorScheme(COLOR_SCHEME,1.,time);
    
    // Add shockwave effect
    float shockwaveEffect=shockwave(distortedUV,time,bass);
    color+=shockwaveEffect*getColorScheme(COLOR_SCHEME,.8,time)*2.;
    
    // Add portal rings
    float portals=portalRings(distortedUV,time,mid);
    color+=portals*getColorScheme(COLOR_SCHEME,.9,time)*2.;
    
    // Add grid overlay for cyber effect
    float grid=gridPattern(distortedUV,time,bass)*GRID_INTENSITY*(.5+high*.5);
    color=mix(color,getColorScheme(COLOR_SCHEME,.9,time),grid*.7);
    
    // Add center glow
    float centerGlow=GLOW_AMOUNT/(radius*10.+.01);
    // Make glow color shift with time
    vec3 glowColor=getColorScheme(COLOR_SCHEME,.7,time*.5);
    color+=centerGlow*glowColor*(1.+bass);
    
    // Add edge highlight that pulses with mid frequencies
    float edge=smoothstep(0.,.5,radius)*smoothstep(1.,.8,radius);
    color+=edge*EDGE_GLOW*getColorScheme(COLOR_SCHEME,.5,time)*mid;
    
    // Add lens flare effect
    if(FLARE_INTENSITY>0.){
        float flare=pow(max(0.,1.-length(uv*vec2(.5,1.))),5.);
        flare*=.5+.5*sin(time*3.+bass*5.);
        color+=flare*getColorScheme(COLOR_SCHEME,.9,time)*FLARE_INTENSITY*high;
    }
    
    // Add scanlines for CRT effect
    if(ENABLE_SCAN_LINES){
        float scanline=1.-SCAN_INTENSITY*smoothstep(.4,.6,sin(gl_FragCoord.y*.1-time*2.));
        color*=scanline;
    }
    
    // Create pulse flashes on beat
    float flash=bass*.2*sin(time*3.);
    color+=flash*getColorScheme(COLOR_SCHEME,.8,time);
    
    // Apply final audio-reactive boost
    color*=.8+volume*.4;
    
    // Apply master intensity for fade in/out
    color*=intensity;
    
    // Ensure colors stay in visible range with nice rolloff
    color=1.1*color/(1.+color);
    
    // Output final color
    gl_FragColor=vec4(color,1.);
}

// ======== VJ PERFORMANCE USAGE NOTES ========
// - Connect audio analysis to u_bass, u_mid, u_high, and u_volume uniforms
// - Use u_intensity for fade in/out during performance
// - Change COLOR_SCHEME for different visual themes
// - Adjust TUNNEL_SPEED to match your music BPM
// - TUNNEL_LAYERS and DATA_FLOW_COMPLEXITY control visual density
// - Toggle effect booleans for different visual styles
//
// RECOMMENDED CONTROLLER MAPPINGS:
// - Knob 1: u_intensity (master brightness)
// - Knob 2: TUNNEL_SPEED (animation speed)
// - Button 1: COLOR_SCHEME cycling
// - Button 2: ENABLE_GLITCH toggle
// - Button 3: ENABLE_SHOCKWAVE toggle
// - Button 4: ENABLE_DATA_FLOW toggle
// - Slider 1: DATA_FLOW_COMPLEXITY (visual density)
// - Slider 2: TUNNEL_DISTORTION (shape warping)
// ==============================================