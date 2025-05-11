// HYPER CYBER NEON CITY v2.0
// Advanced cyberpunk cityscape with dynamic neon effects and audio reactivity
// Perfect for VJ sets and live performances

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_audio_level;// Audio input level (0.0-1.0) - can be connected to audio analyzer
uniform float u_intensity;// Overall effect intensity (0.0-1.0) - for live control

// ======== CUSTOMIZATION PARAMETERS - ADJUST THESE FOR YOUR VJ PERFORMANCE ========
#define COLOR_SCHEME 0// 0: neon pink/blue, 1: green/yellow, 2: red/orange, 3: multicolor
#define ANIMATION_SPEED 1.0// Speed multiplier for all animations
#define BUILDINGS_DENSITY 30// Number of buildings in the cityscape
#define ENABLE_GLITCH true// Enable glitch effects
#define SCAN_LINES true// Enable horizontal scan lines
#define ENABLE_3D_EFFECT true// Enable 3D depth effect
// ==============================================================================

// Hash function for random but stable values
float hash(float n){
    return fract(sin(n)*43758.5453123);
}

// 2D hash function
vec2 hash2(vec2 p){
    p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));
    return fract(sin(p)*43758.5453);
}

// Improved noise function
float noise(vec2 p){
    vec2 ip=floor(p);
    vec2 u=fract(p);
    
    // Smoother interpolation
    u=u*u*u*(u*(u*6.-15.)+10.);
    
    float res=mix(
        mix(hash(dot(ip,vec2(1.,157.))),hash(dot(ip+vec2(1.,0.),vec2(1.,157.))),u.x),
        mix(hash(dot(ip+vec2(0.,1.),vec2(1.,157.))),hash(dot(ip+vec2(1.,1.),vec2(1.,157.))),u.x),
    u.y);
    return res*res;
}

// Voronoi noise for more complex patterns
float voronoi(vec2 p){
    vec2 n=floor(p);
    vec2 f=fract(p);
    
    float md=1.;
    
    for(int i=-1;i<=1;i++){
        for(int j=-1;j<=1;j++){
            vec2 g=vec2(float(i),float(j));
            vec2 o=hash2(n+g);
            o=.5+.5*sin(u_time*ANIMATION_SPEED*.5+6.2831*o);
            
            vec2 r=g+o-f;
            float d=dot(r,r);
            
            md=min(md,d);
        }
    }
    
    return sqrt(md);
}

// Function to create dynamic building silhouettes
float buildings(vec2 p,float seed){
    float height=0.;
    
    // Create random heights for buildings with audio reactivity
    for(int i=0;i<BUILDINGS_DENSITY;i++){
        float audio_factor=1.+u_audio_level*.5;
        float w=float(i)*.1+seed;
        float h=.1+hash(w)*.8*audio_factor;// Random height affected by audio
        float bx=mod(p.x+w+u_time*ANIMATION_SPEED*.05,3.)-1.5;// Building x position with slight movement
        
        if(abs(bx)<(.1+hash(w+5.)*.1)){// Building width
            height=max(height,h-p.y);
            
            // Add windows that react to the beat
            if(hash(w+u_time*.1)>.7){
                height+=.02*step(.95,sin(p.y*50.+u_time*3.))*step(0.,h-p.y);
            }
        }
    }
    
    return clamp(height,0.,1.);
}

// Function to create line with glow
float line(vec2 p,vec2 a,vec2 b,float width,float glow){
    vec2 pa=p-a;
    vec2 ba=b-a;
    float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);
    float dist=length(pa-ba*h);
    
    // Core line
    float core=smoothstep(width,0.,dist);
    // Outer glow
    float halo=smoothstep(width+glow,width,dist)*.5;
    
    return core+halo;
}

// Function to create dynamic neon signs with audio reactivity
float neonSign(vec2 p,float time){
    // Audio-reactive positioning
    float audio_displacement=u_audio_level*.1*sin(time*2.);
    vec2 offset=vec2(.6+audio_displacement,.4);
    vec2 scale=vec2(.25+u_audio_level*.1);// Size reacts to audio
    p=(p-offset)/scale;
    
    // Animate the neon with more complex patterns
    float t=time*.5;
    float flicker=.8+.2*sin(time*10.)*(.8+.2*noise(vec2(time*5.)));
    
    // Create more complex neon pattern
    float sign=0.;
    
    // Base pattern
    sign+=line(p,vec2(-.5,.4),vec2(.5,.4),.05,.2);
    sign+=line(p,vec2(-.5,-.4),vec2(.5,-.4),.05,.2);
    sign+=line(p,vec2(-.5,.4),vec2(-.5,-.4),.05,.2);
    sign+=line(p,vec2(.5,.4),vec2(.5,-.4),.05,.2);
    
    // Audio-reactive diagonal patterns
    float audio_reaction=.5+.5*u_audio_level;
    sign+=line(p,vec2(-.5,.4),vec2(.5,-.4),.05,.2)*(.5+.5*sin(t*2.))*audio_reaction;
    sign+=line(p,vec2(-.5,-.4),vec2(.5,.4),.05,.2)*(.5+.5*sin(t*3.+1.))*audio_reaction;
    
    // Add pulsing circles at corners that react to audio
    float c1=smoothstep(.2*(1.+u_audio_level*.3),0.,length(p-vec2(-.5,.4))-.1-.05*sin(time*3.));
    float c2=smoothstep(.2*(1.+u_audio_level*.3),0.,length(p-vec2(.5,.4))-.1-.05*sin(time*3.+1.));
    float c3=smoothstep(.2*(1.+u_audio_level*.3),0.,length(p-vec2(-.5,-.4))-.1-.05*sin(time*3.+2.));
    float c4=smoothstep(.2*(1.+u_audio_level*.3),0.,length(p-vec2(.5,-.4))-.1-.05*sin(time*3.+3.));
    
    sign+=(c1+c2+c3+c4)*.5;
    
    // Add glowing effect with more dynamic flicker
    sign=smoothstep(.2,.9,sign)*flicker;
    
    return sign;
}

// Glitch effect without using texture2D
vec3 glitch(vec3 color,vec2 uv,float time){
    if(!ENABLE_GLITCH)return color;
    
    // Create occasional glitch bands
    float glitch_intensity=step(.96-u_audio_level*.1,sin(time*5.)*.5+.5);
    float glitch_y=floor(uv.y*20.)/20.;
    float glitch_amount=hash(glitch_y+time)*.1*glitch_intensity;
    
    if(glitch_intensity>.01){
        // Create glitch effect without texture2D
        vec3 glitched=color;
        
        // Use proper hash function with proper arguments
        float rNoise=hash(uv.x+glitch_amount+time*10.);
        float bNoise=hash(uv.y+time*5.);
        
        // Mix the original color with the glitched version
        glitched.r=mix(color.r,color.r*(.8+rNoise*1.2),glitch_intensity);
        glitched.b=mix(color.b,color.b*(.8+bNoise*1.2),glitch_intensity);
        
        // Add digital noise
        float noise=hash(uv.x*100.+uv.y*100.+time*10.)*.1;
        glitched+=noise*glitch_intensity;
        
        return glitched;
    }
    
    return color;
}

// Scan line effect
float scanLines(vec2 uv,float time){
    if(!SCAN_LINES)return 1.;
    
    float scan=.95+.05*sin(uv.y*200.+time*5.);
    return scan;
}

// Function to return color scheme based on parameter
vec3 getColorScheme(int scheme,float value){
    if(scheme==0){
        // Neon pink/blue
        return mix(vec3(0.,.1,.2),vec3(.9,.2,.8),value);
    }else if(scheme==1){
        // Green/yellow
        return mix(vec3(0.,.2,.1),vec3(.1,.9,.3),value);
    }else if(scheme==2){
        // Red/orange
        return mix(vec3(.2,0.,0.),vec3(.9,.3,.1),value);
    }else{
        // Multicolor - time-based cycling
        float t=u_time*.1;
        vec3 a=vec3(.5+.5*sin(t),.5+.5*sin(t+2.),.5+.5*sin(t+4.));
        vec3 b=vec3(.5+.5*sin(t+6.),.5+.5*sin(t+8.),.5+.5*sin(t+10.));
        return mix(a,b,value);
    }
}

// 3D effect
vec2 get3DOffset(vec2 uv,float depth,float time){
    if(!ENABLE_3D_EFFECT)return vec2(0.);
    
    // Offset based on distance from center and simulated depth
    vec2 center=vec2(.5);
    vec2 dir=normalize(uv-center);
    float dist=length(uv-center);
    
    // Add some movement to the 3D effect
    float movement=sin(time*.5)*.2;
    
    return dir*dist*depth*.1*(1.+movement);
}

void main(){
    // Normalized coordinates with aspect ratio correction
    vec2 uv=gl_FragCoord.xy/u_resolution.xy;
    vec2 p=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Animation time with control
    float time=u_time*ANIMATION_SPEED;
    
    // Apply intensity control to all effects - デフォルト値を設定
    float intensity=max(u_intensity,.8);// 少なくとも0.8の強度を保証
    
    // Initialize color
    vec3 color=vec3(0.);
    
    // Create sky gradient
    vec3 skyTop=vec3(.02,0.,.05);// Dark purple
    vec3 skyBottom=vec3(.1,.01,.15);// Lighter purple
    vec3 sky=mix(skyBottom,skyTop,uv.y);
    
    // Add more dynamic stars in the sky with audio reactivity
    for(int i=0;i<3;i++){
        float fi=float(i);
        float starSize=200.+fi*50.*(1.+u_audio_level);
        float starBrightness=.4-fi*.1+u_audio_level*.2;
        
        vec2 rp=vec2(p.x*1.7,p.y);
        float stars=smoothstep(.95,1.,noise(rp*starSize+time*(.5+fi*.1)));
        sky+=stars*starBrightness*vec3(.8,.9,1.)*(p.y*.5+.5);
    }
    
    // Add color to the sky to mimic light pollution with audio reactivity
    sky+=getColorScheme(COLOR_SCHEME,.2)*(1.-uv.y)*(1.+u_audio_level*.5);
    
    // Add subtle voronoi patterns in the sky for more complexity
    float voro=voronoi(p*5.+time*.1)*.1;
    sky=mix(sky,getColorScheme(COLOR_SCHEME,.3),voro*.2);
    
    // Create buildings in the distance (city silhouette)
    float buildingsMask=buildings(vec2(p.x*1.5,p.y+.5),0.);
    vec3 buildingsColor=vec3(.02,.02,.04)*(.8+.2*p.y);
    
    // Add windows to buildings with more dynamic behavior
    float windows=0.;
    vec2 windowPos=vec2(p.x*20.,p.y*20.);
    vec2 windowId=floor(windowPos);
    
    // Create a grid of windows
    for(int i=-1;i<=1;i++){
        for(int j=-1;j<=1;j++){
            vec2 offset=vec2(float(i),float(j));
            vec2 id=windowId+offset;
            
            // Random window state (on/off)
            float windowOn=step(.6-u_audio_level*.2,hash(id.x+id.y*100.+floor(time*.2)*10.));
            
            // Window flicker with audio reactivity
            float flicker=.8+.2*sin(time*5.+hash(id.y)*10.)*(1.+u_audio_level);
            windowOn*=flicker*step(.5,hash(id.x*.3));
            
            // Window shape
            vec2 windowCenter=id+.5;
            float windowSize=.2+.1*hash(id.x*id.y);
            float window=smoothstep(windowSize,windowSize*.8,length(windowPos-windowCenter));
            
            // Add to windows
            windows+=window*windowOn;
        }
    }
    
    // Apply windows to buildings
    buildingsColor+=windows*getColorScheme(COLOR_SCHEME,.7)*buildingsMask*(1.+u_audio_level*.5);
    
    // Add closer large buildings
    float frontBuildings=buildings(vec2(p.x*.8,p.y+.3),123.45);
    frontBuildings=smoothstep(0.,.8,frontBuildings);
    vec3 frontBuildingsColor=vec3(0.,0.,.01);// Almost black
    
    // Add the neon sign to one of the buildings
    float neon=neonSign(p,time)*step(.2,frontBuildings);
    vec3 neonColor=getColorScheme(COLOR_SCHEME,.9);// Neon color from scheme
    
    // Combine elements
    color=sky;
    color=mix(color,buildingsColor,buildingsMask);
    color=mix(color,frontBuildingsColor,frontBuildings);
    
    // Add neon sign with enhanced bloom effect
    float bloomIntensity=.6+u_audio_level*.4;
    float bloomSize=.04+u_audio_level*.02;
    float bloom=smoothstep(bloomSize,0.,abs(p.x-.6)*abs(p.y-.4)*4.);
    color+=neon*neonColor+bloom*neonColor*bloomIntensity;
    
    // Add horizontal fog bands for atmosphere with audio reactivity
    float fogBands=.03*(.5+.5*sin(p.y*20.+time))*(1.+u_audio_level*.5);
    color+=fogBands*getColorScheme(COLOR_SCHEME,.3)*(1.-uv.y);
    
    // Add vertical light streaks (light pollution from the city)
    float lightStreaks=smoothstep(.95,1.,.5+.5*sin(p.x*20.));
    color+=lightStreaks*getColorScheme(COLOR_SCHEME,.2)*(1.-uv.y)*.2;
    
    // Add more complexity with dynamic patterns
    float pattern=noise(p*50.+time*.5)*.05;
    color+=pattern*getColorScheme(COLOR_SCHEME,.5);
    
    // Apply scan lines
    color*=scanLines(uv,time);
    
    // Apply glitch effect for more cyber feel
    color=glitch(color,uv,time);
    
    // Add a subtle vignette effect
    float vignette=1.-dot(p*.5,p*.5);
    color*=vignette;
    
    // Apply overall intensity control
    color*=intensity;
    
    // Output final color
    gl_FragColor=vec4(color,1.);
}

// ======== VJ PERFORMANCE USAGE NOTES ========
// - Connect u_audio_level to your audio analyzer (bass works best)
// - Use u_intensity for fade in/out during performance
// - Change COLOR_SCHEME for different visual themes
// - Adjust ANIMATION_SPEED to match your music BPM
// - BUILDINGS_DENSITY controls visual complexity
// - Toggle ENABLE_GLITCH and SCAN_LINES for different visual styles
// - ENABLE_3D_EFFECT adds depth to the visuals
//
// RECOMMENDED MAPPINGS FOR VJ CONTROLLERS:
// - Knob 1: u_intensity (overall brightness)
// - Knob 2: u_audio_level multiplier (if not using audio input)
// - Button 1: COLOR_SCHEME cycling
// - Button 2: ENABLE_GLITCH toggle
// - Button 3: SCAN_LINES toggle
// - Slider 1: ANIMATION_SPEED
// ==============================================