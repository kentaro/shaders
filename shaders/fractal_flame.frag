// Fractal Flame Shader
// Creates dynamic fractal flame patterns with vibrant colors

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

// Complex number operations
vec2 cmul(vec2 a,vec2 b){
    return vec2(a.x*b.x-a.y*b.y,a.x*b.y+a.y*b.x);
}

vec2 cdiv(vec2 a,vec2 b){
    float denominator=b.x*b.x+b.y*b.y;
    return vec2(
        (a.x*b.x+a.y*b.y)/denominator,
        (a.y*b.x-a.x*b.y)/denominator
    );
}

float cmod(vec2 z){
    return length(z);
}

// Fractal variations
vec2 sinusoidal(vec2 p){
    return vec2(sin(p.x),sin(p.y));
}

vec2 spherical(vec2 p){
    float r2=dot(p,p);
    return p/(r2+1e-6);
}

vec2 swirl(vec2 p){
    float r2=dot(p,p);
    return vec2(
        p.x*sin(r2)-p.y*cos(r2),
        p.x*cos(r2)+p.y*sin(r2)
    );
}

vec2 horseshoe(vec2 p){
    float r=length(p);
    float theta=atan(p.y,p.x);
    return vec2(cos(theta)/r,sin(theta)/r);
}

vec2 polar(vec2 p){
    float r=length(p);
    float theta=atan(p.y,p.x);
    return vec2(theta/3.14159,r-1.);
}

vec2 handkerchief(vec2 p){
    float r=length(p);
    float theta=atan(p.y,p.x);
    return r*vec2(sin(theta+r),cos(theta-r));
}

void main(){
    // Normalized pixel coordinates
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Animation parameters
    float time=u_time*.3;
    
    // Fractal parameters
    vec2 z=uv;
    vec2 c=vec2(
        .7885*sin(time*.2),
        .7885*cos(time*.3)
    );
    
    // Initialize colors
    vec3 col1=vec3(.5,0.,.9);// Purple
    vec3 col2=vec3(1.,.1,0.);// Red
    vec3 col3=vec3(1.,.6,0.);// Orange
    vec3 col4=vec3(0.,.4,1.);// Blue
    
    // Dynamic color cycling
    float colorCycle=sin(time)*.5+.5;
    col1=mix(col1,col4,colorCycle);
    col2=mix(col2,col1,colorCycle);
    col3=mix(col3,col2,colorCycle);
    
    // Fractal iterations
    const int ITERATIONS=12;
    float intensity=0.;
    float damping=.7;
    
    for(int i=0;i<ITERATIONS;i++){
        float fi=float(i);
        float weight=1.-fi/float(ITERATIONS);
        
        // Escape radius check
        if(length(z)>4.)break;
        
        // Apply different variations based on time
        float t1=sin(time*.1+fi*.2)*.5+.5;
        float t2=sin(time*.15+fi*.3)*.5+.5;
        float t3=sin(time*.2+fi*.4)*.5+.5;
        float t4=sin(time*.25+fi*.5)*.5+.5;
        
        // Apply fractal transformations
        vec2 z1=sinusoidal(z);
        vec2 z2=swirl(z);
        vec2 z3=spherical(z);
        vec2 z4=horseshoe(z);
        vec2 z5=polar(z);
        vec2 z6=handkerchief(z);
        
        // Mix different transformations
        z=mix(z1,z2,t1);
        z=mix(z,z3,t2);
        z=mix(z,z4,t3);
        z=mix(z,z5,t4);
        z=mix(z,z6,t4*t3);
        
        // Apply fractal formula
        z=cmul(z,z)+c;
        
        // Accumulate intensity
        intensity+=weight*damping/(.1+length(z));
    }
    
    // Normalize intensity
    intensity=clamp(intensity,0.,1.);
    
    // Create vibrant color patterns
    float angle=atan(uv.y,uv.x);
    float dist=length(uv);
    
    // Color mapping
    vec3 color=mix(col1,col2,intensity);
    color=mix(color,col3,sin(angle*5.+time)*.5+.5);
    
    // Add glow
    color+=vec3(intensity*intensity*.5);
    
    // Add dark background
    vec3 bgColor=vec3(0.,0.,.05)*(1.-intensity);
    
    // Final color
    vec3 finalColor=color+bgColor;
    
    // Add vignette
    finalColor*=1.-dist*.5;
    
    // Output
    gl_FragColor=vec4(finalColor,1.);
}