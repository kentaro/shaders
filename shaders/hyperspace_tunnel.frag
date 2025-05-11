// Hyperspace Tunnel Shader
// Creates a dynamic hyperspace tunnel effect with vibrant colors and motion

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

// Rotation matrix
mat2 rotate2D(float angle){
    return mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
}

void main(){
    // Normalized coordinates with aspect ratio correction
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Center point
    vec2 center=vec2(0.);
    
    // Dynamic rotation of coordinates
    float rotSpeed=u_time*.2;
    uv=rotate2D(rotSpeed)*uv;
    
    // Tunnel effect parameters
    float speed=u_time*2.;
    float tunnelRadius=1.5+sin(u_time*.5)*.5;
    
    // Polar coordinates
    float angle=atan(uv.y,uv.x);
    float dist=length(uv);
    
    // Tunnel distortion
    float distortion=sin(angle*8.+u_time*3.)*.1;
    dist+=distortion;
    
    // Tunnel walls pattern
    float tunnelPattern=fract(1./dist*.5+speed);
    float brighterLines=smoothstep(0.,.1,tunnelPattern)*smoothstep(1.,.9,tunnelPattern);
    
    // Create multiple tunnel layers for a more complex effect
    float tunnelLayer1=fract(1./dist*.5+speed*.5);
    float tunnelLayer2=fract(1./dist*.25+speed*1.5);
    float tunnelLayer3=fract(1./dist*.125+speed*3.);
    
    float combinedLayers=
    smoothstep(0.,.1,tunnelLayer1)*smoothstep(1.,.9,tunnelLayer1)*.5+
    smoothstep(0.,.05,tunnelLayer2)*smoothstep(1.,.95,tunnelLayer2)*.3+
    smoothstep(0.,.03,tunnelLayer3)*smoothstep(1.,.97,tunnelLayer3)*.2;
    
    // Side streak effects
    float streaks=0.;
    float streakCount=16.;
    
    for(float i=0.;i<streakCount;i++){
        float t=i/streakCount;
        float streakAngle=t*6.28;// 2π
        float streakWidth=.02+.02*sin(u_time+i*.5);
        float streak=smoothstep(streakWidth,0.,abs(mod(angle+u_time*.1,6.28)-streakAngle));
        streaks+=streak*(.5+.5*sin(u_time*2.+i));
    }
    
    streaks*=(1.-smoothstep(.5,1.5,dist));// Fade streaks with distance
    
    // Central warp effect
    float warp=smoothstep(.4,0.,dist);
    
    // Combine all layers
    float finalPattern=combinedLayers+streaks*.3+warp;
    
    // Dynamic color palette
    vec3 color1=vec3(.1,.5,1.);// Blue
    vec3 color2=vec3(1.,.1,.8);// Magenta
    vec3 color3=vec3(0.,.9,1.);// Cyan
    vec3 color4=vec3(1.,.5,0.);// Orange
    
    // Create dynamic color gradients
    float colorMix1=sin(u_time*.2)*.5+.5;
    float colorMix2=cos(u_time*.3)*.5+.5;
    
    vec3 innerColor=mix(color1,color2,colorMix1);
    vec3 outerColor=mix(color3,color4,colorMix2);
    
    // Color based on distance and pattern
    vec3 tunnelColor=mix(innerColor,outerColor,dist);
    tunnelColor=mix(tunnelColor,vec3(1.),brighterLines*.8);// Add bright lines
    
    // Final color
    vec3 finalColor=tunnelColor*finalPattern;
    
    // Add center glow
    vec3 centerGlow=vec3(1.,.8,.4)*warp*3.;
    finalColor+=centerGlow;
    
    // Add subtle background
    vec3 bgColor=innerColor*.05;
    finalColor+=bgColor;
    
    // Output
    gl_FragColor=vec4(finalColor,1.);
}