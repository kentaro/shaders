// Kaleidoscope Burst Shader
// This shader creates kaleidoscopic patterns that burst and rotate

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

// Function to create repeating kaleidoscope effect
vec2 kaleidoscope(vec2 p,float segments){
    float angle=atan(p.y,p.x);
    float radius=length(p);
    
    // Divide into segments and mirror
    angle=mod(angle,3.14159*2./segments)-3.14159/segments;
    
    // Convert back to Cartesian
    return vec2(cos(angle),sin(angle))*radius;
}

// Noise function for texture
float noise(vec2 p){
    vec2 i=floor(p);
    vec2 f=fract(p);
    
    // Cubic interpolation
    vec2 u=f*f*(3.-2.*f);
    
    // Mix random values at the corners of the cell using bilinear interpolation
    float a=fract(sin(dot(i,vec2(127.1,311.7)))*43758.5453);
    float b=fract(sin(dot(i+vec2(1.,0.),vec2(127.1,311.7)))*43758.5453);
    float c=fract(sin(dot(i+vec2(0.,1.),vec2(127.1,311.7)))*43758.5453);
    float d=fract(sin(dot(i+vec2(1.,1.),vec2(127.1,311.7)))*43758.5453);
    
    return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}

// Fractal Brownian Motion
float fbm(vec2 p){
    float value=0.;
    float amplitude=.5;
    float frequency=3.;
    
    // Add multiple layers of noise
    for(int i=0;i<5;i++){
        value+=amplitude*noise(p*frequency);
        amplitude*=.5;
        frequency*=2.;
    }
    
    return value;
}

void main(){
    // Normalized coordinates with aspect ratio correction
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Initialize color
    vec3 color=vec3(0.);
    
    // Animation parameters
    float t=u_time*.3;
    
    // Create multiple layers of kaleidoscope patterns
    for(float i=0.;i<3.;i++){
        float fi=i;
        
        // Time with offset for each layer
        float layerTime=t+fi*.5;
        
        // Burst effect parameters
        float burstCycle=mod(layerTime,4.);// 4-second cycle
        float burst;
        
        if(burstCycle<1.5){
            // Expand
            burst=pow(burstCycle/1.5,1.2);
        }else if(burstCycle<3.){
            // Hold
            burst=1.;
        }else{
            // Contract
            burst=pow(1.-(burstCycle-3.),.8);
        }
        
        // Rotation and scaling
        float rotation=layerTime*(.1+fi*.05);
        float scale=1.+burst*2.+fi*.5;
        
        // Rotate and scale coordinates
        vec2 pos=vec2(
            uv.x*cos(rotation)-uv.y*sin(rotation),
            uv.x*sin(rotation)+uv.y*cos(rotation)
        );
        pos*=scale;
        
        // Number of kaleidoscope segments varies with layer
        float segments=6.+fi*2.;
        
        // Apply kaleidoscope effect
        vec2 kPos=kaleidoscope(pos,segments);
        
        // Generate fractal pattern
        float pattern=fbm(kPos*(1.+.2*sin(layerTime*.5)));
        
        // Add radial variation
        pattern*=(.7+.3*sin(length(pos)*5.-layerTime*2.));
        
        // Add circular bands
        float bands=sin(length(pos)*10.-layerTime*3.)*.5+.5;
        pattern=mix(pattern,bands,.5);
        
        // Color varies with layer and time
        vec3 layerColor=.5+.5*cos(vec3(fi*.7+0.,fi*.7+2.,fi*.7+4.)+layerTime);
        
        // Enhance color saturation
        layerColor=mix(vec3(length(layerColor)),layerColor,1.5);
        
        // Add layer to final color with burst animation
        color+=pattern*layerColor*(.3+.7*burst);
    }
    
    // Add spotlight effect at the center
    float spotlight=.2/(length(uv)+.1);
    color+=spotlight*vec3(.7,.9,1.)*(.5+.5*sin(t*2.))*.3;
    
    // Add subtle glow
    float glow=length(color)*.2;
    color+=glow*vec3(.3,.5,.8);
    
    // Output final color
    gl_FragColor=vec4(color,1.);
}