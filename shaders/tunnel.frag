// CYBER HYPERSPACE TUNNEL - Advanced VJ Shader
// This shader creates a dynamic, audio-reactive hyperspace tunnel effect
// with multiple layers, distortions, and cyberpunk aesthetics

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

// =======================================================
// CUSTOMIZATION PARAMETERS - Adjust these for your VJ sets
// =======================================================

// Tunnel parameters
const float TUNNEL_SPEED=2.;// Base tunnel forward speed
const float TUNNEL_ROTATION=.8;// Tunnel rotation speed
const float TUNNEL_DEPTH=10.;// Tunnel depth effect
const float TUNNEL_DISTORTION=.3;// Amount of tunnel warping

// Stripe parameters
const float STRIPE_COUNT=12.;// Number of radial stripes
const float STRIPE_WIDTH=.7;// Width of stripes (0-1)
const float STRIPE_SHARPNESS=4.;// Sharpness of stripe edges
const float STRIPE_SPEED=1.5;// Rotation speed of stripes

// Ring parameters
const float RING_COUNT=10.;// Number of concentric rings
const float RING_WIDTH=.3;// Width of the rings (0-1)
const float RING_SPEED=1.2;// Speed of ring movement
const int RING_FRACTAL_ITERATIONS=3;// Fractal iterations for rings

// Color parameters
const float COLOR_CYCLE_SPEED=.4;// Color cycling speed
const float COLOR_INTENSITY=1.5;// Overall color intensity
const float COLOR_SATURATION=1.2;// Color saturation
const float HUE_OFFSET=.7;// Base hue offset

// Effect parameters
const float GLOW_AMOUNT=.4;// Amount of center glow
const float EDGE_GLOW=.2;// Amount of edge glow
const float WARP_AMOUNT=.2;// Coordinate warping amount
const float FEEDBACK_AMOUNT=.15;// Visual feedback effect amount

// Cyber effects
const float GRID_INTENSITY=.15;// Grid overlay intensity
const float GLITCH_AMOUNT=.3;// Amount of glitch effect
const float SCAN_INTENSITY=.1;// Scanline intensity

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

// Noise function
float noise(vec2 p){
    vec2 i=floor(p);
    vec2 f=fract(p);
    
    // Cubic interpolation
    vec2 u=f*f*(3.-2.*f);
    
    // Mix 4 corners
    float a=hash(i.x+i.y*57.);
    float b=hash(i.x+1.+i.y*57.);
    float c=hash(i.x+(i.y+1.)*57.);
    float d=hash(i.x+1.+(i.y+1.)*57.);
    
    return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}

// FBM (Fractal Brownian Motion)
float fbm(vec2 p){
    float value=0.;
    float amplitude=.5;
    float frequency=1.;
    
    // Add several noise octaves
    for(int i=0;i<4;i++){
        value+=amplitude*noise(p*frequency);
        amplitude*=.5;
        frequency*=2.;
    }
    
    return value;
}

// Function to convert HSV to RGB
vec3 hsv2rgb(vec3 c){
    vec4 K=vec4(1.,2./3.,1./3.,3.);
    vec3 p=abs(fract(c.xxx+K.xyz)*6.-K.www);
    return c.z*mix(K.xxx,clamp(p-K.xxx,0.,1.),c.y);
}

// Create tunnel pattern with multiple layers
float tunnelPattern(vec2 uv,float r,float angle,float time,float bass,float high){
    float pattern=0.;
    
    // Radial stripes
    float stripeAngle=angle*STRIPE_COUNT-time*STRIPE_SPEED*(1.+bass*.5);
    float stripes=pow(.5+.5*sin(stripeAngle),STRIPE_SHARPNESS);
    stripes=smoothstep(1.-STRIPE_WIDTH,1.,stripes);
    
    // Concentric rings
    float ringOffset=time*RING_SPEED*(1.+high*.3);
    float ringDistance=-1./r*TUNNEL_DEPTH;
    float rings=0.;
    
    // Create fractal ring pattern
    for(int i=0;i<RING_FRACTAL_ITERATIONS;i++){
        float fi=float(i);
        float ringScale=1.+fi*.4;
        float ringMod=mod(ringDistance*ringScale+ringOffset*(1.-fi*.2),RING_COUNT);
        float ring=smoothstep(RING_WIDTH,0.,abs(ringMod-RING_COUNT/2.)/RING_COUNT);
        
        // Make outer iterations fainter
        rings+=ring/(1.+fi);
    }
    
    // Combine patterns
    pattern=stripes*.7+rings*1.2;
    
    // Add noise texture
    float noisePattern=fbm(vec2(r*10.,angle*5.)+time*.1);
    pattern*=.85+.15*noisePattern;
    
    return pattern;
}

// Glitch effect
float glitchEffect(vec2 uv,float time,float intensity,float high){
    // Create blocks that might glitch
    float blockX=floor(uv.x*10.);
    float blockY=floor(uv.y*10.);
    
    // Create glitch timing
    float glitchTime=floor(time*5.);
    
    // Random glitch per block based on audio
    float random=hash(blockX+blockY*100.+glitchTime);
    float glitchChance=.03+high*intensity;
    
    if(random<glitchChance){
        float glitchAmount=hash(blockY+glitchTime)*.5;
        return glitchAmount;
    }
    
    return 0.;
}

// Grid pattern
float gridPattern(vec2 uv,float time){
    // Create shifting grid
    vec2 grid=abs(fract(uv*10.+time*.1)-.5);
    float lines=smoothstep(.45,.5,max(grid.x,grid.y));
    
    // Add perspective to the grid (fade with distance)
    float fadeWithDepth=.3+.7/(1.+length(uv)*5.);
    
    return lines*fadeWithDepth;
}

void main(){
    // Center and normalize coordinates
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Create mock audio reactive values if uniforms not available
    float bass=.5+.5*sin(u_time*.4);
    float mid=.5+.5*sin(u_time*.7+1.);
    float high=.5+.5*sin(u_time*1.1+2.);
    float volume=.7+.3*sin(u_time*.8+.5);
    
    // Time variables
    float time=u_time;
    float tunnelTime=time*TUNNEL_SPEED;
    
    // Create base distortion based on audio
    float distortion=TUNNEL_DISTORTION*(1.+mid*.5);
    
    // Apply audio-reactive coordinate distortion
    vec2 distortedUV=uv;
    
    // Warp coordinates based on noise and audio
    float warpNoise=fbm(uv+time*.1);
    float warpAmount=WARP_AMOUNT*(1.+bass*2.);
    distortedUV+=warpNoise*warpAmount*vec2(sin(time),cos(time*.7));
    
    // Apply tunnel rotation that reacts to mid frequencies
    float rotation=time*TUNNEL_ROTATION*(1.+mid*.3);
    mat2 rotMat=mat2(cos(rotation),-sin(rotation),sin(rotation),cos(rotation));
    distortedUV=rotMat*distortedUV;
    
    // Create zoom effect based on bass
    float zoom=1.+bass*.2*sin(time*.5);
    distortedUV/=zoom;
    
    // Apply glitch effect based on high frequencies
    vec2 glitchOffset=vec2(glitchEffect(uv,time,GLITCH_AMOUNT,high),0.);
    distortedUV+=glitchOffset;
    
    // Convert to polar coordinates for tunnel
    float angle=atan(distortedUV.y,distortedUV.x);
    float radius=length(distortedUV);
    
    // Tunnel depth calculation with audio-reactive distortion
    float tunnelRadius=1./radius;
    
    // Apply distortion to tunnel shape
    tunnelRadius+=distortion*sin(angle*6.+time)*sin(radius*5.+time*2.);
    
    // Get main tunnel pattern
    float pattern=tunnelPattern(distortedUV,radius,angle,tunnelTime,bass,high);
    
    // Apply depth fade effect
    float depthFade=1./(1.+radius*8.);
    
    // Create base color using HSV for easier color cycling
    // Use angle and radius to create color variation across the tunnel
    float hue=fract(angle/TWO_PI+time*COLOR_CYCLE_SPEED+HUE_OFFSET);
    // Make saturation audio-reactive
    float saturation=COLOR_SATURATION*(.8+high*.4);
    // Make brightness depth-dependent and audio-reactive
    float brightness=COLOR_INTENSITY*depthFade*(.7+volume*.5);
    
    // Convert HSV to RGB
    vec3 color=hsv2rgb(vec3(hue,saturation,brightness));
    
    // Apply the pattern
    color*=pattern;
    
    // Add grid overlay for cyber effect
    float grid=gridPattern(distortedUV,time)*GRID_INTENSITY*(.5+high*.5);
    color=mix(color,vec3(.9,.9,1.),grid*pattern);
    
    // Add center glow
    float centerGlow=GLOW_AMOUNT/(radius*10.+.01);
    // Make glow color shift with time
    vec3 glowColor=hsv2rgb(vec3(fract(time*.1),.5,1.));
    color+=centerGlow*glowColor*(1.+bass);
    
    // Add edge highlight that pulses with mid frequencies
    float edge=smoothstep(0.,.5,radius)*smoothstep(1.,.8,radius);
    color+=edge*EDGE_GLOW*vec3(.1,.5,.9)*mid;
    
    // Add scanlines for CRT effect
    float scanline=1.-SCAN_INTENSITY*smoothstep(.4,.6,
        sin(gl_FragCoord.y*.1-time*2.));
        color*=scanline;
        
        // Add subtle visual feedback for trail effect
        vec2 feedbackUV=uv*.99;// Slightly zoom for persistence effect
        float feedback=FEEDBACK_AMOUNT*(.5+bass*.5);
        
        // Create pulse flashes on beat
        float flash=bass*.2*sin(time*3.);
        color+=flash*vec3(.7,.3,.9);
        
        // Apply final audio-reactive boost
        color*=.8+volume*.4;
        
        // Ensure colors stay in visible range with nice rolloff
        color=1.1*color/(1.+color);
        
        // Output final color
        gl_FragColor=vec4(color,1.);
    }