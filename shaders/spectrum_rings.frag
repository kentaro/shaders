// Spectrum Rings Shader
// Creates dynamic concentric rings with spectrum color cycling

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

void main(){
    // Normalized pixel coordinates with aspect ratio correction
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Center point to create circular rings
    vec2 center=vec2(0.);
    
    // Distance from center
    float dist=length(uv-center);
    
    // Create multiple ring sets
    float ringCount=15.;// Base number of rings
    float ringWidth=.05+.04*sin(u_time*.3);// Ring width animation
    
    // Primary ring set - outward expanding
    float ringSpacing1=.08+.03*sin(u_time*.2);
    float rings1=fract(dist/ringSpacing1-u_time*.5);
    rings1=smoothstep(0.,ringWidth,rings1)*smoothstep(1.,1.-ringWidth,rings1);
    
    // Secondary ring set - inward contracting
    float ringSpacing2=.1+.04*cos(u_time*.3);
    float rings2=fract(dist/ringSpacing2+u_time*.3);
    rings2=smoothstep(0.,ringWidth*.8,rings2)*smoothstep(1.,1.-ringWidth*.8,rings2);
    
    // Third ring set - slower outward
    float ringSpacing3=.15+.05*sin(u_time*.1);
    float rings3=fract(dist/ringSpacing3-u_time*.1);
    rings3=smoothstep(0.,ringWidth*1.2,rings3)*smoothstep(1.,1.-ringWidth*1.2,rings3);
    
    // Fourth ring set - very fast inward
    float ringSpacing4=.05+.02*cos(u_time*.4);
    float rings4=fract(dist/ringSpacing4+u_time*.8);
    rings4=smoothstep(0.,ringWidth*.6,rings4)*smoothstep(1.,1.-ringWidth*.6,rings4);
    
    // Combine all ring sets with different weights
    float combinedRings=
    rings1*.7+
    rings2*.6+
    rings3*.5+
    rings4*.8;
    
    // Pulse effect centered at origin
    float pulse=1.-smoothstep(0.,.5+.3*sin(u_time),dist);
    pulse=pulse*pulse*.5;
    
    // Spectrum color cycling for rings
    vec3 ringColor1=.5+.5*cos(vec3(0.,2.,4.)+dist*2.-u_time);// RGB rainbow
    vec3 ringColor2=.5+.5*cos(vec3(0.,2.,4.)+dist*3.+u_time*2.);// Shifted rainbow
    vec3 ringColor3=.5+.5*cos(vec3(5.,0.,2.)+dist*4.-u_time*3.);// Another shifted rainbow
    
    // Mix colors based on time
    float colorMix1=.5+.5*sin(u_time*.3);
    float colorMix2=.5+.5*cos(u_time*.5);
    
    vec3 ringColor=mix(ringColor1,ringColor2,colorMix1);
    ringColor=mix(ringColor,ringColor3,colorMix2);
    
    // Center pulse color
    vec3 pulseColor=vec3(1.,.5,.2)*(1.+.5*sin(u_time*2.));
    
    // Final ring color with intensity
    vec3 finalRingColor=ringColor*combinedRings;
    
    // Add pulse to the center
    finalRingColor+=pulseColor*pulse;
    
    // Add radial streaks
    float streakCount=16.;
    float streakAngle=atan(uv.y,uv.x);
    float streaks=.5+.5*sin(streakAngle*streakCount+u_time*2.);
    streaks=pow(streaks,5.)*.4;
    streaks*=(1.-smoothstep(.5,1.5,dist));// Fade streaks with distance
    
    // Add streaks with shifting color
    vec3 streakColor=.5+.5*cos(vec3(1.,3.,5.)+streakAngle*5.+u_time);
    finalRingColor+=streakColor*streaks;
    
    // Add subtle background glow
    float bgGlow=.05/(.1+dist*dist);
    vec3 bgColor=mix(vec3(.1,0.,.2),vec3(0.,.1,.2),.5+.5*sin(u_time*.2));
    
    // Final color
    vec3 finalColor=finalRingColor+bgColor*bgGlow;
    
    // Add vignette effect
    float vignette=1.-smoothstep(.5,1.5,dist);
    finalColor*=mix(.6,1.,vignette);
    
    // Add subtle noise for texture
    float noise=fract(sin(dot(uv,vec2(12.9898,78.233))*u_time*.01)*43758.5453);
    finalColor+=vec3(noise*.03);
    
    // Output final color
    gl_FragColor=vec4(finalColor,1.);
}