// HYPER FLUX FLUID DYNAMICS v2.0
// Advanced audio-reactive fluid simulation shader with complex dynamics and color transitions
// Perfect for immersive VJ performances and liquid visualizations

#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_audio_level;// Audio input level (0.0-1.0)
uniform float u_bass;// Bass frequency level (0.0-1.0)
uniform float u_mid;// Mid frequency level (0.0-1.0)
uniform float u_high;// High frequency level (0.0-1.0)
uniform float u_intensity;// Master intensity control (0.0-1.0)

// ======== CUSTOMIZATION PARAMETERS - ADJUST FOR YOUR VJ PERFORMANCE ========
#define COLOR_SCHEME 0// 0: Cyan/Pink, 1: Fire, 2: Spectral, 3: Neon, 4: Monochrome
#define FLUID_SPEED 1.0// Base animation speed multiplier
#define FLUID_VISCOSITY 1.0// Fluid thickness/viscosity (0.5-2.0)
#define FLUID_SCALE 3.0// Scale of the fluid patterns
#define FLUID_DETAIL 5// Number of octaves for fluid detail (1-7)
#define FLUID_TURBULENCE 1.0// Amount of turbulence in the flow (0.0-2.0)

// Effect parameters
#define ENABLE_VORTEX true// Enable swirling vortex effect
#define VORTEX_STRENGTH .7// Strength of vortex effect (0.0-1.0)
#define ENABLE_RIPPLES true// Enable ripple effects triggered by audio
#define RIPPLE_INTENSITY .8// Intensity of ripple effects (0.0-1.0)
#define ENABLE_DISTORTION true// Enable audio-reactive distortion
#define DISTORTION_AMOUNT .8// Amount of distortion (0.0-1.0)

// Color parameters
#define COLOR_DIVERSITY 1.2// Color variation multiplier (0.0-2.0)
#define COLOR_BRIGHTNESS 1.2// Overall brightness multiplier
#define COLOR_SATURATION 1.1// Color saturation multiplier
#define HIGHLIGHT_INTENSITY 1.3// Intensity of fluid highlights
// =========================================================================

// Improved random function
float random(vec2 st){
    return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);
}

// Value noise function with smooth interpolation
float noise(vec2 st){
    vec2 i=floor(st);
    vec2 f=fract(st);
    
    // Improved smoothing with cubic Hermite curve
    vec2 u=f*f*(3.-2.*f);
    
    // Four corners of the tile
    float a=random(i);
    float b=random(i+vec2(1.,0.));
    float c=random(i+vec2(0.,1.));
    float d=random(i+vec2(1.,1.));
    
    // Mix corners using cubic interpolation
    return mix(mix(a,b,u.x),
    mix(c,d,u.x),
u.y);
}

// Fractal Brownian Motion - layered noise for more complex patterns
float fbm(vec2 p,float time,int octaves,float lacunarity,float gain){
float value=0.;
float amplitude=.5;
float frequency=1.;

// Sum multiple noise layers
for(int i=0;i<7;i++){
    if(i>=octaves)break;
    
    // Add time-based animation to each octave
    float noiseValue=noise(p*frequency+time*.1*float(i+1));
    value+=amplitude*noiseValue;
    
    // Scale frequency and amplitude for next octave
    frequency*=lacunarity;
    amplitude*=gain;
}

return value;
}

// Curl noise function for divergence-free fluid motion
vec2 curl(vec2 p,float t,float scale){
float eps=.01*scale;

// Sample noise gradient
float n1=fbm(p+vec2(eps,0.)+t*.3,t,FLUID_DETAIL,2.,.5);
float n2=fbm(p-vec2(eps,0.)+t*.3,t,FLUID_DETAIL,2.,.5);
float n3=fbm(p+vec2(0.,eps)+t*.3,t,FLUID_DETAIL,2.,.5);
float n4=fbm(p-vec2(0.,eps)+t*.3,t,FLUID_DETAIL,2.,.5);

// Compute curl
float x=(n3-n4)/(2.*eps);
float y=-(n1-n2)/(2.*eps);

return vec2(x,y);
}

// Vortex effect function
vec2 vortex(vec2 uv,float time,float strength,float audio){
if(!ENABLE_VORTEX)return uv;

// Calculate distance from center
vec2 center=vec2(
    .5+.2*sin(time*.5),
    .5+.2*cos(time*.4)
);

vec2 centered=uv-center;
float dist=length(centered);

// Calculate angle for rotation
float angle=strength*(1./(dist+.1)-1.)*audio;

// Apply rotation
float s=sin(angle);
float c=cos(angle);
mat2 rot=mat2(c,-s,s,c);

return center+rot*centered;
}

// Ripple effect function
float ripples(vec2 uv,float time,float bass,float intensity){
if(!ENABLE_RIPPLES)return 0.;

float ripple=0.;

// Create multiple ripples triggered by audio
for(int i=0;i<3;i++){
    float fi=float(i);
    float timeOffset=fi*.5;
    
    // Base timing - slow continuous ripples
    float rippleTime=mod(time*(.2+fi*.05),5.);
    
    // Additional ripples triggered by bass
    float audioPulse=step(.7,bass*intensity);
    float audioRippleTime=mod(time+audioPulse*timeOffset,5.);
    
    // Combine timing
    float activeTime=mix(rippleTime,audioRippleTime,audioPulse);
    
    // Ripple shape
    float dist=length(uv-vec2(.5+.3*sin(fi+time*.2),.5+.3*cos(fi*2.+time*.3)));
    ripple+=.02*sin((dist*20.-activeTime*3.)*(1.+bass))/(1.+fi*.5);
}

return ripple*intensity;
}

// Function to get color scheme based on parameter
vec3 getColorScheme(int scheme,float value,float time,float audio){
// Audio-reactive color cycling
float audioCycle=audio*.2;

if(scheme==0){
    // Cyan/Pink scheme
    vec3 color1=vec3(0.,.8,1.);// Cyan
    vec3 color2=vec3(1.,.2,.8);// Pink
    vec3 color3=vec3(0.,.5,1.);// Blue
    
    float t=fract(value+time*.1+audioCycle);
    if(t<.33){
        return mix(color1,color2,t*3.);
    }else if(t<.66){
        return mix(color2,color3,(t-.33)*3.);
    }else{
        return mix(color3,color1,(t-.66)*3.);
    }
}else if(scheme==1){
    // Fire scheme
    vec3 color1=vec3(.5,0.,0.);// Dark red
    vec3 color2=vec3(1.,.5,0.);// Orange
    vec3 color3=vec3(1.,.8,0.);// Yellow
    
    float t=value;
    if(t<.33){
        return mix(color1,color2,t*3.);
    }else if(t<.66){
        return mix(color2,color3,(t-.33)*3.);
    }else{
        return mix(color3,color1,(t-.66)*3.);
    }
}else if(scheme==2){
    // Spectral scheme
    vec3 color1=vec3(0.,0.,.8);// Blue
    vec3 color2=vec3(0.,.8,0.);// Green
    vec3 color3=vec3(.8,0.,0.);// Red
    
    float t=fract(value+time*.05);
    if(t<.33){
        return mix(color1,color2,t*3.);
    }else if(t<.66){
        return mix(color2,color3,(t-.33)*3.);
    }else{
        return mix(color3,color1,(t-.66)*3.);
    }
}else if(scheme==3){
    // Neon scheme
    vec3 color1=vec3(1.,.1,1.);// Magenta
    vec3 color2=vec3(.1,1.,1.);// Cyan
    vec3 color3=vec3(1.,1.,.1);// Yellow
    
    float t=fract(value+time*.2+audio);
    if(t<.33){
        return mix(color1,color2,t*3.);
    }else if(t<.66){
        return mix(color2,color3,(t-.33)*3.);
    }else{
        return mix(color3,color1,(t-.66)*3.);
    }
}else{
    // Monochrome scheme
    float brightness=.5+.5*sin(value*5.+time+audio);
    return vec3(brightness);
}
}

void main(){
// Normalize coordinates
vec2 uv=gl_FragCoord.xy/u_resolution.xy;
vec2 p=uv*2.-1.;
p.x*=u_resolution.x/u_resolution.y;// Aspect ratio correction

// Create mock audio values if uniforms not connected
float audio=u_audio_level>0.?u_audio_level:.5+.5*sin(u_time*.4);
float bass=u_bass>0.?u_bass:.5+.5*sin(u_time*.3);
float mid=u_mid>0.?u_mid:.5+.5*sin(u_time*.5);
float high=u_high>0.?u_high:.5+.5*sin(u_time*.7);

// Time variables for animation with speed control
float time=u_time*FLUID_SPEED;

// Apply audio-reactive vortex effect
vec2 vortexUV=vortex(uv,time,VORTEX_STRENGTH,.5+.5*bass);

// Add ripple distortion
float rippleEffect=ripples(uv,time,bass,RIPPLE_INTENSITY);

// Apply fluid simulation with audio reactivity
float fluidScale=FLUID_SCALE*(1.+audio*.5);// Scale changes with audio
float viscosity=FLUID_VISCOSITY*(1.-bass*.3);// Viscosity changes with bass

// Generate fluid flow field
vec2 velocity=curl(p*fluidScale,time,viscosity)*(1.+bass*FLUID_TURBULENCE);

// Audio-reactive distortion
if(ENABLE_DISTORTION){
    velocity+=vec2(
        sin(uv.y*10.+time)*high*DISTORTION_AMOUNT*.1,
        cos(uv.x*10.+time*.7)*mid*DISTORTION_AMOUNT*.1
    );
}

// Apply ripple displacement
velocity+=vec2(rippleEffect*2.);

// Displace coordinates based on velocity and audio
vec2 displaced=p+velocity*(.2+.1*audio);

// Generate fluid patterns with multiple octaves of noise
float pattern=0.;
float amplitude=.5;
float frequency=1.;

// Add rotational distortion for swirling effect
for(int i=0;i<FLUID_DETAIL;i++){
    // Audio-reactive rotation speed
    float rotSpeed=.1+.05*mid;
    float angle=time*rotSpeed+float(i)*.2;
    
    // Apply rotation to create swirling
    vec2 rotated=vec2(
        displaced.x*cos(angle)-displaced.y*sin(angle),
        displaced.x*sin(angle)+displaced.y*cos(angle)
    );
    
    // Add audio-reactive noise
    pattern+=amplitude*fbm(rotated*frequency+time*.1,time,3,2.,.5);
    
    // Scale for next octave
    amplitude*=.5;
    frequency*=2.;
}

// Enhance pattern with more contrast and audio reactivity
pattern=.5+.5*pattern;
pattern=pow(pattern,1./(1.+audio*.5));// Audio-reactive contrast

// Calculate fluid flow speed for highlights
float speed=length(velocity)*(1.+high*.5);

// Color mapping based on pattern and position
float colorValue=pattern*COLOR_DIVERSITY+uv.x*uv.y*.5+time*.05;

// Get color from scheme
vec3 color=getColorScheme(COLOR_SCHEME,colorValue,time,audio);

// Apply pattern and audio reactivity to color
color*=(.5+pattern*.8)*COLOR_BRIGHTNESS;

// Add highlights where fluid velocity is high
vec3 highlight=getColorScheme(COLOR_SCHEME,fract(colorValue+.5),time,audio);
highlight=mix(vec3(1.),highlight,COLOR_SATURATION);// Whiten the highlights a bit

// Audio-reactive highlights
color+=highlight*pow(speed,2.)*HIGHLIGHT_INTENSITY*(1.+high*.5);

// Add subtle pulsing based on bass
color*=1.+bass*.1*sin(time*2.);

// Add ripple highlights
color+=abs(rippleEffect)*highlight*2.;

// Apply master intensity
color*=u_intensity;

// Ensure colors are in visible range with nice rolloff
color=1.2*color/(1.+color);

// Output the final color
gl_FragColor=vec4(color,1.);
}

// ======== VJ PERFORMANCE USAGE NOTES ========
// - Connect audio reactive uniforms to your audio analyzer
// - Use u_intensity for fade in/out during performance
// - Adjust COLOR_SCHEME for different visual themes
// - Modify FLUID_SPEED to match your music tempo
// - Increase FLUID_DETAIL for more complex patterns
// - FLUID_TURBULENCE controls chaotic movement
//
// RECOMMENDED MAPPINGS FOR VJ CONTROLLERS:
// - Knob 1: u_intensity (overall brightness)
// - Knob 2: FLUID_SPEED (animation speed)
// - Button 1: COLOR_SCHEME cycling
// - Button 2: ENABLE_VORTEX toggle
// - Button 3: ENABLE_RIPPLES toggle
// - Button 4: ENABLE_DISTORTION toggle
// - Slider 1: FLUID_TURBULENCE (chaos amount)
// - Slider 2: FLUID_SCALE (pattern size)
// ==============================================