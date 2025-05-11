// Liquid Metal Shader
// Creates flowing liquid metal with dynamic reflections

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
    for(int i=0;i<6;i++){
        value+=amplitude*noise(p*frequency);
        amplitude*=.5;
        frequency*=2.;
    }
    
    return value;
}

// Environment map function - creates a pattern for reflection
vec3 envMap(vec2 uv,float time){
    // Create a shifting pattern using multiple layers of noise
    float pattern1=fbm(uv*2.+vec2(time*.1,0.));
    float pattern2=fbm(uv*3.-vec2(time*.15,0.));
    float pattern3=fbm(uv*5.+vec2(0.,time*.05));
    
    // Combine patterns
    float finalPattern=pattern1*pattern2*pattern3*4.;
    
    // Create color bands
    vec3 color1=vec3(.2,.1,0.);// Dark bronze
    vec3 color2=vec3(.6,.4,.2);// Medium gold
    vec3 color3=vec3(.9,.8,.7);// Bright silver
    
    // Mix colors based on pattern
    vec3 finalColor=mix(color1,color2,finalPattern);
    finalColor=mix(finalColor,color3,pow(finalPattern,2.));
    
    return finalColor;
}

void main(){
    // Normalized coordinates with aspect ratio correction
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Time variables
    float time=u_time*.2;
    
    // Create liquid metal surface
    // Use multiple layers of noise for a dynamic flow effect
    float flow1=fbm(uv*3.+vec2(time*.5,time*.3));
    float flow2=fbm(uv*2.+vec2(-time*.4,time*.2));
    float flow3=fbm(uv*4.+vec2(time*.3,-time*.4));
    
    // Combine flow layers
    float combinedFlow=flow1*.5+flow2*.3+flow3*.2;
    
    // Create height map for the liquid surface
    float heightMap=combinedFlow*.1;// Scale down for subtle effect
    
    // Normal calculation from height map (approximation of derivatives)
    vec2 eps=vec2(.01,0.);
    float heightX1=fbm((uv+eps)*3.+vec2(time*.5,time*.3));
    float heightX2=fbm((uv-eps)*3.+vec2(time*.5,time*.3));
    float dx=(heightX1-heightX2)/(2.*eps.x);
    
    float heightY1=fbm((uv+eps.yx)*3.+vec2(time*.5,time*.3));
    float heightY2=fbm((uv-eps.yx)*3.+vec2(time*.5,time*.3));
    float dy=(heightY1-heightY2)/(2.*eps.x);
    
    // Construct surface normal
    vec3 normal=normalize(vec3(-dx*2.,-dy*2.,1.));
    
    // Reflection vector (assuming view from above)
    vec3 viewDir=normalize(vec3(0.,0.,1.));
    vec3 reflectDir=reflect(viewDir,normal);
    
    // Use reflection vector to sample environment
    vec2 reflectUV=reflectDir.xy*.5+.5;
    vec3 reflection=envMap(reflectUV,time);
    
    // Fresnel effect for metal
    float fresnel=pow(1.-max(0.,dot(normal,viewDir)),5.);
    
    // Metal base color (simulating different metal types)
    vec3 metalType=mix(
        vec3(.8,.7,.2),// Gold
        vec3(.8,.8,.9),// Silver
        sin(time*.2)*.5+.5// Gradually shift between metal types
    );
    
    // Combine base color with reflection
    vec3 baseColor=metalType*.2+reflection*.8;
    
    // Apply Fresnel effect for more realistic metal look
    vec3 finalColor=mix(baseColor,reflection,fresnel);
    
    // Add specular highlights
    vec3 lightDir=normalize(vec3(.5,.5,1.));
    float specular=pow(max(0.,dot(reflect(-lightDir,normal),viewDir)),50.);
    finalColor+=vec3(specular);
    
    // Add flowing ripples
    float ripples=sin((uv.x+uv.y)*20.+time*5.)*.5+.5;
    ripples*=sin((uv.x-uv.y)*15.-time*3.)*.5+.5;
    ripples=smoothstep(.3,.7,ripples)*.1;
    finalColor+=ripples*metalType;
    
    // Add light distortion at the edges
    float edgeGlow=1.-length(uv)*.7;
    edgeGlow=max(0.,edgeGlow);
    edgeGlow*=edgeGlow;
    
    finalColor+=edgeGlow*metalType*.2;
    
    // Apply vignette
    float vignette=1.-length(uv*.7);
    vignette=smoothstep(0.,1.,vignette);
    finalColor*=vignette;
    
    // Output final color
    gl_FragColor=vec4(finalColor,1.);
}