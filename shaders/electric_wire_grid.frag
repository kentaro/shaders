// ELECTRIC WIRE GRID - Advanced VJ Shader
// This shader creates an animated grid of electric wires with pulse effects
// Designed for high-energy cyberpunk visuals in VJ performances

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

// Grid parameters
const float GRID_SIZE=10.;// Base size of grid cells
const float GRID_THICKNESS=.04;// Thickness of grid lines
const float GRID_PERSPECTIVE=8.;// Perspective distortion amount
const float GRID_DEPTH=40.;// Depth of the grid
const float GRID_ROTATION_SPEED=.2;// Rotation speed of the grid

// Electric pulse parameters
const float PULSE_SPEED=1.5;// Speed of pulses along grid lines
const float PULSE_WIDTH=.15;// Width of pulse effect
const float PULSE_BRIGHTNESS=1.2;// Brightness of pulse effect
const float PULSE_COUNT=4.;// Number of pulse waves

// Color parameters
const vec3 GRID_COLOR=vec3(.1,.5,.8);// Base color of grid
const vec3 PULSE_COLOR=vec3(.9,.2,1.);// Color of pulse effect
const float COLOR_CYCLE_SPEED=.3;// Speed of color cycling
const float COLOR_CYCLE_AMOUNT=.5;// Amount of color cycling

// Effect parameters
const float FLICKER_AMOUNT=.1;// Amount of electric flicker
const float DISTORTION_AMOUNT=.15;// Amount of wave distortion
const float GLOW_INTENSITY=.8;// Intensity of glow effects
const float POWER_SURGE_AMOUNT=.6;// Intensity of power surge effects

// =======================================================

// Hash function for pseudo-random values
float hash(float n){
    return fract(sin(n)*43758.5453123);
}

// 2D Hash
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

// Function to create perspective grid
vec2 createGrid(vec2 uv,float z,float rotation){
    // Apply rotation
    float s=sin(rotation);
    float c=cos(rotation);
    uv=vec2(uv.x*c-uv.y*s,uv.x*s+uv.y*c);
    
    // Apply perspective
    uv*=GRID_PERSPECTIVE;
    uv.y-=.2;// Offset to create more dramatic perspective
    
    // Scale with depth
    float scale=GRID_PERSPECTIVE/(GRID_PERSPECTIVE+z);
    uv*=scale;
    
    return uv;
}

// Electric pulse function
float electricPulse(float pos,float time,float width,float speed){
    float phase=mod(pos-time*speed,1.);
    return smoothstep(0.,width,phase)*smoothstep(width*2.,width,phase);
}

// Function to create grid pattern with electric pulses
float gridPattern(vec2 uv,float time,float bass,float high){
    // Separate grid into x and y components
    vec2 gridPos=abs(fract(uv*GRID_SIZE)-.5)/GRID_SIZE;
    
    // Apply thickness based on distance from grid line
    float xLine=smoothstep(0.,GRID_THICKNESS*(1.+high*.5),gridPos.x);
    float yLine=smoothstep(0.,GRID_THICKNESS*(1.+high*.5),gridPos.y);
    
    // Combine for grid pattern
    float grid=min(xLine,yLine);
    
    // Generate pulses along grid lines
    float xPulse=0.;
    float yPulse=0.;
    
    for(float i=0.;i<PULSE_COUNT;i++){
        float offset=i/PULSE_COUNT;
        float pulseTime=time*PULSE_SPEED*(.8+bass*.4)+offset;
        
        // X direction pulses
        if(gridPos.y<GRID_THICKNESS*(1.+high*.5)){
            float xPhase=fract(uv.x*GRID_SIZE);
            xPulse+=electricPulse(xPhase,pulseTime,PULSE_WIDTH,1.)*(1.-gridPos.y/GRID_THICKNESS);
        }
        
        // Y direction pulses
        if(gridPos.x<GRID_THICKNESS*(1.+high*.5)){
            float yPhase=fract(uv.y*GRID_SIZE);
            yPulse+=electricPulse(yPhase,pulseTime*.7,PULSE_WIDTH,1.)*(1.-gridPos.x/GRID_THICKNESS);
        }
    }
    
    // Combine grid and pulses
    float pattern=grid;
    float pulse=(xPulse+yPulse)*(1.-grid)*PULSE_BRIGHTNESS;
    
    return pattern+pulse;
}

// Power surge effect
float powerSurge(float time,float bass){
    return POWER_SURGE_AMOUNT*bass*sin(time*4.)*sin(time*7.);
}

// Electric flicker effect
float flicker(float time,float intensity){
    return 1.-intensity*(.5+.5*sin(time*70.))*(.5+.5*sin(time*50.));
}

void main(){
    // Normalized coordinates
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Create mock audio reactive values if uniforms not available
    float bass=.5+.5*sin(u_time*.4);
    float mid=.5+.5*sin(u_time*.7+1.);
    float high=.5+.5*sin(u_time*1.1+2.);
    float volume=.7+.3*sin(u_time*.8+.5);
    
    // Time variables
    float time=u_time;
    
    // Apply coordinate distortion based on noise
    float noise1=noise(uv*2.+time*.1);
    float noise2=noise(uv*3.-time*.2);
    
    // Apply wave distortion controlled by mid frequencies
    vec2 distortedUV=uv;
    distortedUV.x+=sin(uv.y*8.+time)*DISTORTION_AMOUNT*mid;
    distortedUV.y+=sin(uv.x*6.+time*.8)*DISTORTION_AMOUNT*mid;
    
    // Apply additional bass-controlled distortion
    distortedUV+=(noise1-.5)*DISTORTION_AMOUNT*bass;
    
    // Calculate grid with perspective and rotation
    float rotation=time*GRID_ROTATION_SPEED;
    float z=GRID_DEPTH;
    vec2 gridUV=createGrid(distortedUV,z,rotation);
    
    // Get grid pattern with pulses
    float pattern=gridPattern(gridUV,time,bass,high);
    
    // Calculate depth based on Y position for fog effect
    float depth=(gridUV.y+.5)*.5;// 0 at bottom, 0.5 at top
    
    // Apply fog/depth fade
    float fog=1.-depth*.8;
    
    // Create base color with cycling
    float colorCycle=time*COLOR_CYCLE_SPEED;
    vec3 baseColor=GRID_COLOR;
    baseColor=mix(baseColor,vec3(baseColor.b,baseColor.r,baseColor.g),
    COLOR_CYCLE_AMOUNT*(.5+.5*sin(colorCycle)));
    
    // Apply pattern to color
    vec3 color=mix(vec3(0.),baseColor,pattern*fog);
    
    // Add electric pulse highlights
    float pulseBrightness=pattern*(1.-min(1.,pattern*5.))*PULSE_BRIGHTNESS;
    color+=PULSE_COLOR*pulseBrightness*fog*(1.+high*.5);
    
    // Apply power surge effect on beat
    float surge=powerSurge(time,bass);
    color+=surge*GRID_COLOR*2.;
    
    // Add glow effect based on intensity
    float glow=max(0.,1.-pattern*3.)*GLOW_INTENSITY*(.5+high*.5);
    color+=glow*PULSE_COLOR*fog*.3;
    
    // Add noise-based electric arc effect
    float arcNoise=noise(gridUV*20.+time*5.);
    float arc=step(.98-high*.1,arcNoise)*fog;
    color+=arc*PULSE_COLOR*2.;
    
    // Apply electric flicker
    color*=flicker(time,FLICKER_AMOUNT);
    
    // Apply volume-based intensity
    color*=.7+volume*.5;
    
    // Add scanline effect
    float scanline=.95+.05*sin(gl_FragCoord.y*.25);
    color*=scanline;
    
    // Ensure colors stay in visible range with nice rolloff
    color=1.1*color/(1.+color);
    
    // Output final color
    gl_FragColor=vec4(color,1.);
}