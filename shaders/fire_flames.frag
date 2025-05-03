// Fire Flames Shader
// This shader creates a realistic fire effect with dynamic flames

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

// Noise functions based on cellular noise techniques
float random(vec2 p){
    return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);
}

// Value noise
float noise(vec2 p){
    vec2 i=floor(p);
    vec2 f=fract(p);
    
    // Smoothstep interpolation
    vec2 u=f*f*(3.-2.*f);
    
    float a=random(i);
    float b=random(i+vec2(1.,0.));
    float c=random(i+vec2(0.,1.));
    float d=random(i+vec2(1.,1.));
    
    return mix(a,b,u.x)+
    (c-a)*u.y*(1.-u.x)+
    (d-b)*u.x*u.y;
}

// Fractional Brownian Motion
float fbm(vec2 p){
    float sum=0.;
    float amp=.5;
    float freq=1.;
    
    // Multiple noise layers
    for(int i=0;i<6;i++){
        sum+=amp*noise(p*freq);
        amp*=.5;
        freq*=2.;
    }
    
    return sum;
}

// Shape function for the flame
float flameShape(vec2 p,float time){
    // Base shape - decrease y value as we go up (p.y is -1 at bottom, +1 at top)
    float shape=1.-p.y;
    
    // Apply noise deformation for flame edges
    float noiseVal=fbm(vec2(p.x*4.,p.y*2.-time*2.));
    
    // Perturb the flame shape with noise
    shape+=noiseVal*.3;
    
    // Create turbulence in the center for more natural look
    float turbulence=fbm(vec2(p.x*2.+sin(time*.5),p.y*5.+time*3.));
    shape+=turbulence*.1*(1.-p.y);
    
    // Shape edges - wider at bottom, narrower at top
    float edge=abs(p.x)*(1.5+p.y);
    shape-=edge*1.5;
    
    // Add some flicker
    shape+=.1*sin(time*5.+p.y*5.);
    
    return shape;
}

void main(){
    // Normalize coordinates
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Flip y for better flame orientation (flames rise up)
    uv.y=-uv.y;
    
    // Scale for better flame shape
    uv.y*=1.2;
    uv.y-=.3;// Move origin
    
    // Animation time
    float time=u_time*.7;
    
    // Calculate flame intensity
    float flame=flameShape(uv,time);
    
    // Color gradient for the flame
    vec3 orangeColor=vec3(1.,.6,.1);// Orange
    vec3 yellowColor=vec3(1.,.9,.3);// Yellow
    vec3 redColor=vec3(.9,.2,.1);// Red
    vec3 blueColor=vec3(.1,.3,.9);// Blue (for hottest part)
    
    // Initialize color
    vec3 color=vec3(0.);
    
    // Base flame color
    if(flame>0.){
        // Map flame intensity to colors
        float intensity=clamp(flame,0.,1.);
        
        // Create gradient based on height and intensity
        if(intensity>.9){
            // Hottest part (core) - blend between yellow and white
            color=mix(yellowColor,vec3(1.),(intensity-.9)*10.);
            // Add blue to the very hottest parts
            if(intensity>.95&&uv.y>.2){
                color=mix(color,blueColor,(intensity-.95)*20.*(uv.y-.2));
            }
        }else if(intensity>.6){
            // Hot part - orange to yellow
            color=mix(orangeColor,yellowColor,(intensity-.6)*3.33);
        }else{
            // Cooler part - red to orange
            color=mix(redColor,orangeColor,intensity*1.67);
        }
        
        // Add some color variation based on noise
        float colorNoise=fbm(uv*3.+time*.2);
        color=mix(color,color*(.8+.4*colorNoise),.2);
    }
    
    // Add subtle glow around flame
    float glow=max(0.,flame-.1)*.5;
    color+=glow*redColor*.6;
    
    // Add embers
    if(uv.y>0.){
        for(int i=0;i<20;i++){
            float fi=float(i)*1.2;
            
            // Random position based on time
            vec2 emberPos=vec2(
                sin(fi*5.+time)*.3,
                mod(fi*.1+time*(.5+random(vec2(fi))),1.5)-.2
            );
            
            // Small, rising embers
            float ember=.01/distance(uv,emberPos);
            color+=ember*mix(orangeColor,yellowColor,random(vec2(fi*.3)))*.015;
        }
    }
    
    // Smoke effect above flame
    if(uv.y>.5){
        float smokeIntensity=(uv.y-.5)*.4;
        float smokePattern=fbm(vec2(uv.x*2.,(uv.y-.5)*1.-time));
        vec3 smokeColor=vec3(.2,.2,.2)*smokePattern;
        smokeColor*=1.-(uv.y-.5)*.8;// Fade out higher up
        
        // Add smoke only outside the bright flame
        if(flame<.5){
            color=mix(color,smokeColor,min(smokeIntensity,.8)*(1.-flame));
        }
    }
    
    // Output final color
    gl_FragColor=vec4(color,1.);
}