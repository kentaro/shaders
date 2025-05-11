// Pixelated Fire Shader
// Creates dynamic pixelated fire effect with bright colors

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

// Hash function
float hash(float n){
    return fract(sin(n)*43758.5453123);
}

// 2D noise
float noise(vec2 p){
    vec2 i=floor(p);
    vec2 f=fract(p);
    
    // Cubic Hermite curve
    vec2 u=f*f*(3.-2.*f);
    
    // Four corners
    float a=hash(dot(i,vec2(127.1,311.7)));
    float b=hash(dot(i+vec2(1.,0.),vec2(127.1,311.7)));
    float c=hash(dot(i+vec2(0.,1.),vec2(127.1,311.7)));
    float d=hash(dot(i+vec2(1.,1.),vec2(127.1,311.7)));
    
    return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}

// FBM (Fractal Brownian Motion)
float fbm(vec2 p){
    float value=0.;
    float amplitude=.5;
    float frequency=1.;
    
    // Add multiple layers of noise
    for(int i=0;i<5;i++){
        value+=amplitude*noise(p*frequency);
        amplitude*=.5;
        frequency*=2.;
    }
    
    return value;
}

void main(){
    // Normalized pixel coordinates
    vec2 uv=gl_FragCoord.xy/u_resolution.xy;
    
    // Pixelation factor
    float pixelSize=.02+.01*sin(u_time*.2);// Animating pixel size
    
    // Create pixelated coordinates
    vec2 pixelUV=floor(uv/pixelSize)*pixelSize;
    
    // Fire parameters
    float time=u_time*.8;
    float fireHeight=.4+.1*sin(time*.3);
    float fireWidth=.7+.1*cos(time*.4);
    
    // Create fire base with moving flames
    vec2 fireUV=pixelUV;
    fireUV.y=1.-fireUV.y;// Flip Y so fire grows from bottom
    
    // Add distortion to the fire
    float distortion=.1*sin(fireUV.x*10.+time);
    fireUV.x+=distortion*fireUV.y;
    
    // Create noise for flame pattern
    float noise1=fbm(fireUV*vec2(2.,5.)+vec2(0.,-time*2.));
    float noise2=fbm(fireUV*vec2(3.,6.)+vec2(time*.5,-time*2.5));
    float noise3=fbm(fireUV*vec2(5.,3.)+vec2(-time*.7,-time*1.5));
    
    // Combine noise patterns
    float combinedNoise=noise1*.5+noise2*.3+noise3*.2;
    
    // Create the fire shape
    float fireShape=smoothstep(0.,fireHeight,fireUV.y+combinedNoise*.5);
    fireShape*=smoothstep(0.,fireWidth*.5,fireUV.x)*smoothstep(0.,fireWidth*.5,1.-fireUV.x);
    
    // Fire color
    vec3 color1=vec3(1.,.1,0.);// Deep red
    vec3 color2=vec3(1.,.5,0.);// Orange
    vec3 color3=vec3(1.,.9,.2);// Yellow
    
    // Create color gradient based on height and noise
    vec3 fireColor=mix(color1,color2,fireUV.y);
    fireColor=mix(fireColor,color3,pow(combinedNoise,2.));
    
    // Add extra bright color for core
    float fireBrightness=1.-fireShape;
    fireBrightness=pow(fireBrightness,1.5);// Adjust fire brightness curve
    
    // Add extra hot spots
    float hotSpots=smoothstep(.7,1.,noise2*2.*(1.-fireUV.y));
    
    // Combine fire elements
    vec3 finalColor=mix(vec3(0.),fireColor,fireBrightness);
    finalColor+=vec3(1.,.9,.5)*hotSpots*.5;
    
    // Create embers/sparks
    for(int i=0;i<10;i++){
        float fi=float(i);
        float sparkTime=mod(time*(.7+hash(fi*.1)*.5)+hash(fi),1.);
        
        // Spark position
        vec2 sparkPos=vec2(
            .5+(hash(fi*2.1)-.5)*fireWidth,
            sparkTime*1.2
        );
        
        // Add random movement
        sparkPos.x+=.1*sin(sparkTime*6.28*(1.+hash(fi*.3)));
        
        // Distance to spark
        float sparkDist=distance(pixelUV,sparkPos)*(20.+10.*hash(fi));
        
        // Create spark
        float spark=smoothstep(.02,0.,sparkDist);
        
        // Add spark to final color with color based on brightness
        finalColor+=mix(color2,color3,hash(fi))*spark*(1.-sparkTime);
    }
    
    // Add smoke on top of fire
    float smokeIntensity=0.;
    if(pixelUV.y<.5){
        vec2 smokeUV=pixelUV;
        smokeUV.y=1.-smokeUV.y+time*.1;
        
        float smokeNoise=fbm(smokeUV*vec2(3.,2.)+vec2(time*.2,0.));
        smokeIntensity=smoothstep(.4,0.,smokeUV.y)*smokeNoise*.3;
        smokeIntensity*=smoothstep(0.,.4,pixelUV.x)*smoothstep(0.,.4,1.-pixelUV.x);
    }
    
    // Add smoke color
    vec3 smokeColor=vec3(.2,.2,.2);
    finalColor=mix(finalColor,smokeColor,smokeIntensity);
    
    // Pixelated noise as embers
    float pixelNoise=noise(floor(uv*50.)+floor(time*5.))*noise(floor(uv*30.)-floor(time*3.));
    float embers=step(.93,pixelNoise)*step(fireBrightness,.8)*step(.4,fireUV.y);
    
    // Add embers
    finalColor+=vec3(1.,.5,.1)*embers;
    
    // Add glow around fire
    float glow=smoothstep(.5,0.,fireShape)*.1;
    finalColor+=color1*glow;
    
    // Output final color
    gl_FragColor=vec4(finalColor,1.);
}