// Fluid Simulation Shader
// This shader simulates fluid-like motion with dynamic color transitions

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

// Utility function for smoothed noise
float random(vec2 st){
    return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);
}

// 2D simplex noise function
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

// Curl noise for more realistic fluid motion
vec2 curl(vec2 p,float t){
    float eps=.01;
    
    float n1=noise(p+vec2(eps,0.)+t*.3);
    float n2=noise(p-vec2(eps,0.)+t*.3);
    float n3=noise(p+vec2(0.,eps)+t*.3);
    float n4=noise(p-vec2(0.,eps)+t*.3);
    
    float x=(n3-n4)/(2.*eps);
    float y=-(n1-n2)/(2.*eps);
    
    return vec2(x,y);
}

void main(){
    // Normalize coordinates
    vec2 uv=gl_FragCoord.xy/u_resolution.xy;
    uv=uv*2.-1.;
    uv.x*=u_resolution.x/u_resolution.y;
    
    // Time variables for animation
    float t=u_time*.2;
    
    // Apply fluid simulation
    float scale=3.;
    vec2 velocity=curl(uv*scale,t);
    
    // Displace coordinates based on velocity
    vec2 displaced=uv+velocity*.2;
    
    // Generate patterns with multiple octaves of noise
    float pattern=0.;
    float amplitude=1.;
    float frequency=1.;
    
    for(int i=0;i<4;i++){
        // Add rotating distortion for swirling effect
        vec2 p=displaced;
        float angle=t*.1+float(i)*.2;
        p=vec2(
            p.x*cos(angle)-p.y*sin(angle),
            p.x*sin(angle)+p.y*cos(angle)
        );
        
        pattern+=amplitude*noise(p*frequency+t*.1);
        
        amplitude*=.5;
        frequency*=2.;
    }
    
    // Dynamic color palette based on position and time
    vec3 color1=vec3(.1,.5,.9);// Blue
    vec3 color2=vec3(0.,.8,.6);// Teal
    vec3 color3=vec3(.9,.3,.7);// Pink
    
    // Create smooth transitions between colors
    float colorMix1=.5+.5*sin(uv.x+t);
    float colorMix2=.5+.5*cos(uv.y+t*.7);
    
    vec3 color=mix(color1,color2,colorMix1);
    color=mix(color,color3,colorMix2);
    
    // Apply the pattern to the color
    color*=.5+pattern*1.2;
    
    // Add highlights where fluid velocity is high
    float speed=length(velocity);
    color+=vec3(.9,.9,1.)*pow(speed,2.)*.3;
    
    // Output the final color
    gl_FragColor=vec4(color,1.);
}