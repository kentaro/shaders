// Cyber Neon Shader
// This shader creates a cyberpunk cityscape with glowing neon effects

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

// Hash function for random but stable values
float hash(float n){
    return fract(sin(n)*43758.5453123);
}

// Noise function
float noise(vec2 p){
    vec2 ip=floor(p);
    vec2 u=fract(p);
    u=u*u*(3.-2.*u);
    
    float res=mix(
        mix(hash(dot(ip,vec2(1.,157.))),hash(dot(ip+vec2(1.,0.),vec2(1.,157.))),u.x),
        mix(hash(dot(ip+vec2(0.,1.),vec2(1.,157.))),hash(dot(ip+vec2(1.,1.),vec2(1.,157.))),u.x),
    u.y);
    return res*res;
}

// Function to create building silhouettes
float buildings(vec2 p,float seed){
    float height=0.;
    
    // Create random heights for buildings
    for(int i=0;i<30;i++){
        float w=float(i)*.1+seed;
        float h=.1+hash(w)*.8;// Random height
        float bx=mod(p.x+w,3.)-1.5;// Building x position
        
        if(abs(bx)<(.1+hash(w+5.)*.1)){// Building width
            height=max(height,h-p.y);
        }
    }
    
    return clamp(height,0.,1.);
}

// Function to create simple line
float line(vec2 p,vec2 a,vec2 b,float width){
    vec2 pa=p-a;
    vec2 ba=b-a;
    float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);
    float dist=length(pa-ba*h);
    
    return smoothstep(width,0.,dist);
}

// Function to create a neon sign
float neonSign(vec2 p,float time){
    // Create a dynamic neon path
    float sign=0.;
    
    // Several segments to form a neon sign
    vec2 offset=vec2(.6,.4);// Position the sign
    vec2 scale=vec2(.25);// Scale the sign
    p=(p-offset)/scale;
    
    // Animate the neon segments
    float t=time*.5;
    float flicker=.8+.2*sin(time*10.);
    
    // Create pulsing circles
    float c1=length(p-vec2(-.5,0.))-.4;
    float c2=length(p-vec2(.5,0.))-.4;
    
    // Create lines between points
    sign+=line(p,vec2(-.5,.4),vec2(.5,.4),.05);
    sign+=line(p,vec2(-.5,-.4),vec2(.5,-.4),.05);
    sign+=line(p,vec2(-.5,.4),vec2(-.5,-.4),.05);
    sign+=line(p,vec2(.5,.4),vec2(.5,-.4),.05);
    
    // Add diagonal line
    sign+=line(p,vec2(-.5,.4),vec2(.5,-.4),.05)*(.5+.5*sin(t*2.));
    
    // Add glowing effect
    sign=smoothstep(.2,.9,sign)*flicker;
    
    return sign;
}

void main(){
    // Normalized coordinates with aspect ratio correction
    vec2 uv=gl_FragCoord.xy/u_resolution.xy;
    vec2 p=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Animation time
    float time=u_time*.5;
    
    // Initialize color
    vec3 color=vec3(0.);
    
    // Create sky gradient
    vec3 skyTop=vec3(.02,0.,.05);// Dark purple
    vec3 skyBottom=vec3(.1,.01,.15);// Lighter purple
    vec3 sky=mix(skyBottom,skyTop,uv.y);
    
    // Add subtle stars in the sky
    for(int i=0;i<3;i++){
        float fi=float(i);
        float starSize=200.+fi*50.;
        float starBrightness=.4-fi*.1;
        
        vec2 rp=vec2(p.x*1.7,p.y);
        float stars=smoothstep(.95,1.,noise(rp*starSize+time*(.5+fi*.1)));
        sky+=stars*starBrightness*vec3(.8,.9,1.)*(p.y*.5+.5);
    }
    
    // Add color to the sky to mimic light pollution
    sky+=vec3(.1,0.,.05)*(1.-uv.y);
    
    // Create buildings in the distance (city silhouette)
    float buildingsMask=buildings(vec2(p.x*1.5,p.y+.5),0.);
    vec3 buildingsColor=vec3(.02,.02,.04)*(.8+.2*p.y);
    
    // Add windows to buildings
    float windows=0.;
    vec2 windowPos=vec2(p.x*20.,p.y*20.);
    vec2 windowId=floor(windowPos);
    
    // Create a grid of windows
    for(int i=-1;i<=1;i++){
        for(int j=-1;j<=1;j++){
            vec2 offset=vec2(float(i),float(j));
            vec2 id=windowId+offset;
            
            // Random window state (on/off)
            float windowOn=step(.6,hash(id.x+id.y*100.));
            
            // Window flicker
            float flicker=.8+.2*sin(time*5.+hash(id.y)*10.);
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
    buildingsColor+=windows*vec3(.7,.3,.1)*buildingsMask;
    
    // Add closer large buildings
    float frontBuildings=buildings(vec2(p.x*.8,p.y+.3),123.45);
    frontBuildings=smoothstep(0.,.8,frontBuildings);
    vec3 frontBuildingsColor=vec3(0.,0.,.01);// Almost black
    
    // Add the neon sign to one of the buildings
    float neon=neonSign(p,time)*step(.2,frontBuildings);
    vec3 neonColor=vec3(.9,.2,.8);// Pink neon
    
    // Combine elements
    color=sky;
    color=mix(color,buildingsColor,buildingsMask);
    color=mix(color,frontBuildingsColor,frontBuildings);
    
    // Add neon sign with bloom effect
    float bloomIntensity=.6;
    float bloomSize=.04;
    float bloom=smoothstep(bloomSize,0.,abs(p.x-.6)*abs(p.y-.4)*4.);
    color+=neon*neonColor+bloom*neonColor*bloomIntensity;
    
    // Add horizontal fog bands for atmosphere
    float fogBands=.03*(.5+.5*sin(p.y*20.+time));
    color+=fogBands*vec3(.1,0.,.2)*(1.-uv.y);
    
    // Add vertical light streaks (light pollution from the city)
    float lightStreaks=smoothstep(.95,1.,.5+.5*sin(p.x*20.));
    color+=lightStreaks*vec3(.1,.02,.05)*(1.-uv.y)*.2;
    
    // Add a subtle vignette effect
    float vignette=1.-dot(p*.5,p*.5);
    color*=vignette;
    
    // Output final color
    gl_FragColor=vec4(color,1.);
}