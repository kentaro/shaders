// ULTRA HOLOGRAPHIC GRID SYSTEM v2.0
// Advanced futuristic holographic grid with dynamic data visualization and audio reactivity
// Designed for high-impact VJ performances and cyberpunk visual experiences

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_audio_level;// Audio input level (0.0-1.0) - connect to audio analyzer
uniform float u_intensity;// Overall intensity control (0.0-1.0) - for live performance

// ======== CUSTOMIZATION PARAMETERS - ADJUST FOR YOUR VJ PERFORMANCE ========
#define COLOR_SCHEME 0// 0: cyan/blue, 1: green/yellow, 2: magenta/purple, 3: rainbow cycle
#define ANIMATION_SPEED 1.0// Master speed multiplier
#define GRID_DENSITY 10.0// Grid line density
#define ENABLE_DATA_FLOW true// Enable random data flow visualization
#define ENABLE_GLITCH true// Enable digital glitch effects
#define ENABLE_SCAN_LINES true// Enable CRT/hologram scan lines
#define ENABLE_3D_EFFECT true// Enable parallax/depth effect
// =========================================================================

// Hash function for random but deterministic values
float hash(vec2 p){
    float h=dot(p,vec2(127.1,311.7));
    return fract(sin(h)*43758.5453123);
}

// Improved noise function for organic movement
float noise(vec2 p){
    vec2 i=floor(p);
    vec2 f=fract(p);
    
    // Improved smoothing
    f=f*f*(3.-2.*f);
    
    float a=hash(i);
    float b=hash(i+vec2(1.,0.));
    float c=hash(i+vec2(0.,1.));
    float d=hash(i+vec2(1.,1.));
    
    return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
}

// Fractal noise for more complex patterns
float fbm(vec2 p){
    float value=0.;
    float amplitude=.5;
    float frequency=1.;
    
    // Add multiple noise octaves
    for(int i=0;i<5;i++){
        value+=amplitude*noise(p*frequency);
        frequency*=2.;
        amplitude*=.5;
    }
    
    return value;
}

// Function to create dynamic grid pattern
float grid(vec2 p,float width,float time,float audio){
    // Add subtle movement to grid based on audio
    float movement=time*ANIMATION_SPEED*.2;
    p.x+=sin(p.y*.5+movement)*.05*audio;
    p.y+=cos(p.x*.5+movement)*.05*audio;
    
    // Create grid lines with audio-responsive width
    vec2 grid=abs(fract(p-.5)-.5)/(width*(1.+audio*.3));
    float line=min(grid.x,grid.y);
    
    // Add pulsing effect to the grid
    float pulse=.95+.05*sin(time*2.);
    
    return 1.-min(line,1.)*pulse;
}

// Dynamic line pattern for data flow effect
float lineScan(vec2 uv,float time,float audio){
    if(!ENABLE_DATA_FLOW)return 0.;
    
    // Create multiple lines that move across the screen at different speeds
    float scan=0.;
    
    for(int i=0;i<3;i++){
        float fi=float(i);
        float speed=.5+fi*.2+audio*.5;
        float pos=mod(uv.y*(5.+fi)-time*speed,5.);
        
        // Make line width audio-reactive
        float width=.05+.05*sin(time*.2)+.05*audio;
        
        // Create sharp lines with audio-reactive intensity
        float line=smoothstep(width,0.,abs(pos-.5));
        scan+=line*(.3-fi*.05)*(1.+audio);
    }
    
    return scan;
}

// Function to create circular scanlines with audio reactivity
float circleScan(vec2 uv,float time,float audio){
    float dist=length(uv);
    float intensity=0.;
    
    // Multiple rings with different speeds and sizes
    for(int i=0;i<3;i++){
        float fi=float(i);
        float speed=.3+fi*.2;
        float size=10.+fi*5.;
        float width=.1+audio*.1;
        
        float ring=mod(dist*size-time*speed,5.);
        ring=smoothstep(width,0.,abs(ring-.5));
        
        // Audio-reactive intensity
        intensity+=ring*(.15-fi*.03)*(1.+audio*.5);
    }
    
    return intensity;
}

// Function to create hexagonal pattern with animation
float hexGrid(vec2 p,float scale,float time,float audio){
    // Add movement to hexagons
    p.x+=sin(time*.5)*.1*audio;
    p.y+=cos(time*.3)*.1*audio;
    
    p*=scale;
    vec2 r=vec2(1.,1.73);// Hexagon spacing (sqrt(3))
    vec2 h=r*.5;
    vec2 a=mod(p,r)-h;
    vec2 b=mod(p+h,r)-h;
    
    return min(dot(a,a),dot(b,b));
}

// Improved glitch effect for digital distortion without texture2D
vec3 glitchEffect(vec3 color,vec2 uv,float time,float audio){
    if(!ENABLE_GLITCH)return color;
    
    // Create occasional glitch based on audio peaks
    float glitch_trigger=step(.6,hash(vec2(floor(time*4.),.5))*(1.+audio));
    
    if(glitch_trigger>.5){
        // Horizontal glitch lines
        float line_pos=floor(uv.y*20.)/20.;
        float hash_value=hash(vec2(line_pos,floor(time*20.)));
        
        if(hash_value>.95){
            // Create glitch effect without texture2D
            float offset=(hash_value-.95)*20.*audio;
            
            // Shift red and blue channels horizontally in opposite directions
            float rNoise=hash(vec2(uv.x+offset*.05,uv.y)*100.+time);
            float bNoise=hash(vec2(uv.x-offset*.05,uv.y)*100.+time);
            
            // Mix the original color with the glitched version
            vec3 glitched=color;
            glitched.r=mix(color.r,color.r*rNoise*1.5,.5);
            glitched.b=mix(color.b,color.b*bNoise*1.5,.5);
            
            // Add noise to glitched areas
            glitched+=(hash(uv*100.+vec2(time,0.))-.5)*.2*audio;
            
            return glitched;
        }
    }
    
    return color;
}

// Function to create digital scan lines
float scanLines(vec2 uv,float time){
    if(!ENABLE_SCAN_LINES)return 1.;
    
    // Horizontal scan lines
    float scan_h=.95+.05*sin(uv.y*100.+time);
    
    // Occasional vertical scan
    float scan_v=1.;
    if(mod(time,10.)>8.){
        scan_v=.95+.05*sin(uv.x*50.-time*5.);
    }
    
    return scan_h*scan_v;
}

// Function to create 3D parallax effect
vec2 parallaxOffset(vec2 uv,float time,float audio){
    if(!ENABLE_3D_EFFECT)return vec2(0.);
    
    // Calculate offset based on position and time
    vec2 center=vec2(.5);
    vec2 dir=normalize(uv-center);
    float dist=length(uv-center);
    
    // Add subtle movement to the 3D effect
    float movement=sin(time*.2)*.1+audio*.05;
    
    return dir*dist*.1*movement;
}

// Function to return color scheme based on parameter
vec3 getColorScheme(int scheme,float value,float time){
    if(scheme==0){
        // Cyan/blue scheme
        return mix(vec3(0.,.2,.3),vec3(0.,.8,1.),value);
    }else if(scheme==1){
        // Green/yellow scheme
        return mix(vec3(0.,.2,0.),vec3(.2,.8,.1),value);
    }else if(scheme==2){
        // Magenta/purple scheme
        return mix(vec3(.2,0.,.2),vec3(.8,0.,.8),value);
    }else{
        // Rainbow cycle
        float t=time*.1;
        vec3 a=vec3(.5+.5*sin(t),.5+.5*sin(t+2.094),.5+.5*sin(t+4.188));
        vec3 b=vec3(.5+.5*sin(t+3.141),.5+.5*sin(t+5.235),.5+.5*sin(t+1.047));
        return mix(a,b,value);
    }
}

// Data visualization blocks
float dataBlocks(vec2 uv,float time,float audio){
    if(!ENABLE_DATA_FLOW)return 0.;
    
    float blocks=0.;
    
    // Create dynamic data blocks
    for(int i=0;i<15;i++){
        float fi=float(i);
        
        // Positions animated by time and audio
        float speed_x=hash(vec2(fi,0.))*.2-.1;
        float speed_y=hash(vec2(0.,fi))*.2-.1;
        
        vec2 pos=vec2(
            mod(hash(vec2(fi,10.))*2.+time*speed_x,2.)-1.,
            mod(hash(vec2(20.,fi))*2.+time*speed_y,2.)-1.
        );
        
        // Dynamic sizes based on audio
        float size=.02+.03*hash(vec2(fi,fi))*(1.+audio);
        
        // Block shape with animated corners
        vec2 q=abs(uv-pos);
        float corner_roundness=.01+.01*sin(time+fi);
        float block=length(max(q-size+corner_roundness,0.))-corner_roundness;
        
        // Pulse effect synced to audio
        float pulse=.5+.5*sin(time*2.+fi*1.5)*(.8+.2*audio);
        
        blocks+=smoothstep(.01,-.01,block)*pulse*.15;
    }
    
    return blocks;
}

void main(){
    // Normalize coordinates with aspect ratio correction
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    vec2 uv01=gl_FragCoord.xy/u_resolution.xy;// 0 to 1 range
    
    // Animation time
    float time=u_time*ANIMATION_SPEED;
    
    // Apply intensity control to audio level
    float audio=u_audio_level*u_intensity;
    
    // デフォルトの強度値を設定（u_intensityがない場合に使用）
    float intensity=max(u_intensity,.8);// 少なくとも0.8の強度を保証
    
    // Apply parallax/3D effect
    vec2 offset=parallaxOffset(uv01,time,audio);
    uv+=offset;
    uv01+=offset;
    
    // Initialize color
    vec3 color=vec3(0.);
    
    // Base dark color with gradient
    color=mix(vec3(.05,.07,.1),vec3(.1,.12,.15),uv01.y)*intensity;
    
    // Add subtle noise pattern for texture with audio reactivity
    float noise_tex=noise(uv*100.+time)*(.03+audio*.02);
    color+=noise_tex*getColorScheme(COLOR_SCHEME,.5,time);
    
    // Add subtle fbm noise for organic feel
    float fbm_pattern=fbm(uv*3.+time*.1)*.1;
    color=mix(color,getColorScheme(COLOR_SCHEME,.3,time),fbm_pattern*audio);
    
    // Main grid pattern with audio reactivity
    float mainGrid=grid(uv*GRID_DENSITY,.05,time,audio);
    
    // Secondary fine grid
    float fineGrid=grid(uv*GRID_DENSITY*4.,.02,time*1.5,audio*.5);
    
    // Hexagonal grid pattern for tech feel
    float hex=hexGrid(uv,GRID_DENSITY,time,audio);
    float hexPattern=smoothstep(.05,0.,hex)*.2+
    smoothstep(.02,0.,hex)*.3;
    
    // Combine grid patterns with pulsing based on audio
    float pulse=.8+.2*sin(time*2.)*(1.+audio*.5);
    float gridPattern=(mainGrid*.2+fineGrid*.1)*pulse;
    
    // Create a base color for the holographic effect based on chosen color scheme
    vec3 hologColor=getColorScheme(COLOR_SCHEME,.8,time);
    
    // Add the grid to the base color
    color+=gridPattern*hologColor*.8;
    color+=hexPattern*hologColor*(1.+audio*.5);
    
    // Add scanning line effects with audio reactivity
    float scan=lineScan(uv01,time,audio);
    color+=scan*hologColor*(1.+audio*.5);
    
    // Add circular scan effect from center
    float circlePulse=circleScan(uv,time,audio);
    color+=circlePulse*hologColor*(1.+audio*.3);
    
    // Add data block visualization
    float data=dataBlocks(uv,time,audio);
    color+=data*hologColor*2.;
    
    // Add data flow effect (random blocks lighting up)
    for(int i=0;i<10;i++){
        float fi=float(i);
        
        // Random position with movement
        vec2 dataPos=vec2(
            mod(hash(vec2(fi,0.))*10.+time*.2*(1.+audio*.5),2.)-1.,
            mod(hash(vec2(0.,fi))*10.-time*.3*(1.+audio*.5),2.)-1.
        );
        
        // Audio-reactive size and brightness
        float dataSize=.1+.1*audio;
        float dataBlock=smoothstep(dataSize,dataSize-.1,length(uv-dataPos));
        float dataPulse=.5+.5*sin(time*2.+fi)*(.5+.5*audio);
        
        color+=dataBlock*hologColor*.2*dataPulse;
    }
    
    // Edge glow effect that reacts to audio
    float edge=abs(uv.x)*abs(uv.y);
    float edgeGlow=pow(1.-edge,1.)*.05*(1.+audio);
    color+=edgeGlow*hologColor;
    
    // Add scan lines for CRT/hologram effect
    color*=scanLines(uv01,time);
    
    // Add some color variation based on position
    color*=1.+.1*vec3(sin(uv.x*5.),sin(uv.y*5.),cos(uv.x*uv.y*2.));
    
    // Add a pulsing glow to the entire effect that syncs with audio
    float basePulse=.95+.05*sin(time*1.5);
    float audioPulse=.9+.1*audio;
    color*=basePulse*audioPulse;
    
    // Add chromatic aberration at the edges
    float aberration=length(uv)*.05*(1.+audio*.5);
    float red=grid((uv-aberration)*GRID_DENSITY,.05,time,audio);
    float blue=grid((uv+aberration)*GRID_DENSITY,.05,time,audio);
    color.r+=red*.03*hologColor.r;
    color.b+=blue*.03*hologColor.b;
    
    // Apply glitch effect
    color=glitchEffect(color,uv01,time,audio);
    
    // 最終的な強度を適用
    color*=intensity;
    
    // Output final color
    gl_FragColor=vec4(color,1.);
}

// ======== VJ PERFORMANCE USAGE NOTES ========
// - Connect u_audio_level to your audio analyzer (bass frequencies work best)
// - Use u_intensity for fade in/out transitions during performance
// - Adjust COLOR_SCHEME for different visual themes (0-3)
// - Modify ANIMATION_SPEED to match your music BPM
// - GRID_DENSITY controls visual complexity
// - Toggle effect booleans for different visual styles
//
// RECOMMENDED MAPPINGS FOR VJ CONTROLLERS:
// - Knob 1: u_intensity (master brightness)
// - Knob 2: u_audio_level multiplier or manual control
// - Button 1: COLOR_SCHEME cycling
// - Button 2: ENABLE_GLITCH toggle
// - Button 3: ENABLE_SCAN_LINES toggle
// - Button 4: ENABLE_DATA_FLOW toggle
// - Slider 1: ANIMATION_SPEED
// - Slider 2: GRID_DENSITY
// ==============================================