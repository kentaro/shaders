// Neon Cityscape Shader
// Creates a dynamic neon cityscape with parallax layers

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

// Random and noise functions
float random(vec2 st){
    return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);
}

float noise(vec2 st){
    vec2 i=floor(st);
    vec2 f=fract(st);
    
    // Four corners in 2D of a tile
    float a=random(i);
    float b=random(i+vec2(1.,0.));
    float c=random(i+vec2(0.,1.));
    float d=random(i+vec2(1.,1.));
    
    // Smooth interpolation
    vec2 u=f*f*(3.-2.*f);
    
    // Mix 4 corners percentages
    return mix(a,b,u.x)+
    (c-a)*u.y*(1.-u.x)+
    (d-b)*u.x*u.y;
}

// Building function
float building(vec2 uv,float seed){
    float r=random(vec2(seed));
    float height=.1+r*.4;
    float width=.03+r*.02;
    
    // Building shape
    float building=step(abs(uv.x-seed),width)*step(0.,uv.y)*step(uv.y,height);
    
    // Window grid
    vec2 windowUV=fract((uv-vec2(seed-width,0.))*vec2(8.,15.));
    float windowGrid=step(.8,windowUV.x)+step(.8,windowUV.y);
    
    // Random windows
    float windowSeed=floor(uv.x*30.)+floor(uv.y*50.)*30.;
    float windowRandom=step(.5,random(vec2(windowSeed,seed)));
    
    // Time-based blinking for some windows
    float blink=step(.93,sin(u_time*1.5+random(vec2(windowSeed))*10.)*.5+.5);
    
    // Combine windows and building
    float windows=(windowGrid*windowRandom+blink*.5)*building;
    
    return building*.1+windows;
}

// Create cityscape layer
float cityscape(vec2 uv,float layerOffset){
    float buildings=0.;
    
    // Generate multiple buildings
    for(float i=0.;i<30.;i++){
        float offset=i/30.;
        buildings+=building(vec2(uv.x+offset+layerOffset,uv.y),offset);
    }
    
    return buildings;
}

void main(){
    // Normalized coordinates
    vec2 uv=gl_FragCoord.xy/u_resolution.xy;
    uv.x*=u_resolution.x/u_resolution.y;// Aspect ratio correction
    
    // Sky gradient
    vec3 skyColor=mix(
        vec3(.02,.02,.05),// Dark blue at top
        vec3(.1,0.,.2),// Purple at horizon
        pow(uv.y,2.)
    );
    
    // Stars
    float stars=0.;
    vec2 starUV=uv*50.;
    stars+=step(.98,random(floor(starUV)))*step(.3,sin(u_time+random(floor(starUV))*10.)*.5+.5);
    
    // Add cityscape layers with parallax effect
    float cityLayer1=cityscape(uv*vec2(1.,2.)+vec2(u_time*.05,0.),0.);
    float cityLayer2=cityscape(uv*vec2(1.5,1.8)+vec2(u_time*.1,0.),.3);
    float cityLayer3=cityscape(uv*vec2(2.,1.5)+vec2(u_time*.2,0.),.6);
    
    // City glow
    float cityGlow=(
        smoothstep(0.,.5,cityLayer1)*.5+
        smoothstep(0.,.3,cityLayer2)*.3+
        smoothstep(0.,.2,cityLayer3)*.2
    )*(1.-uv.y);
    
    // Sun/moon
    vec2 sunPos=vec2(mod(u_time*.05,1.5)-.25,.3);
    float sun=smoothstep(.1,.09,length(uv-sunPos));
    
    // Color layers
    vec3 sunColor=vec3(1.,.8,.5);
    vec3 layer1Color=vec3(0.,.5,1.);// Blue
    vec3 layer2Color=vec3(1.,.1,.5);// Pink
    vec3 layer3Color=vec3(1.,.5,0.);// Orange
    
    // Combine all elements
    vec3 finalColor=skyColor;
    finalColor+=stars*vec3(1.,1.,1.);
    finalColor+=sun*sunColor;
    
    finalColor+=cityLayer1*layer1Color;
    finalColor+=cityLayer2*layer2Color;
    finalColor+=cityLayer3*layer3Color;
    
    // Add city glow
    finalColor+=cityGlow*vec3(.5,.1,.5);
    
    // Add scanlines
    float scanline=sin(uv.y*100.+u_time*5.)*.5+.5;
    finalColor*=.95+.05*scanline;
    
    // Add vignette
    float vignette=1.-length(uv-vec2(.5,.3))*.5;
    finalColor*=vignette;
    
    // Output final color
    gl_FragColor=vec4(finalColor,1.);
}