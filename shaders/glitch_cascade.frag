// Glitch Cascade Shader
// Creates a dynamic digital glitch effect with RGB color shifts and blocks

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

// Hash function
float hash(float n){
    return fract(sin(n)*43758.5453);
}

// 2D Hash function
float hash(vec2 p){
    return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);
}

// Noise function
float noise(vec2 p){
    vec2 i=floor(p);
    vec2 f=fract(p);
    
    // Cubic Hermite curve
    vec2 u=f*f*(3.-2.*f);
    
    // Four corners
    float a=hash(i);
    float b=hash(i+vec2(1.,0.));
    float c=hash(i+vec2(0.,1.));
    float d=hash(i+vec2(1.,1.));
    
    return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}

void main(){
    // Normalized pixel coordinates
    vec2 uv=gl_FragCoord.xy/u_resolution.xy;
    
    // Original pixel color (will be distorted)
    vec3 finalColor=vec3(uv.x,uv.y,.5+.5*sin(u_time));
    
    // Time variables for different glitch effects
    float glitchTime=floor(u_time*2.7);
    float blockGlitchTime=floor(u_time*1.3);
    float lineGlitchTime=floor(u_time*5.3);
    
    // Add sudden digital noise blocks
    float blockStrength=pow(hash(blockGlitchTime),5.)*.8;
    
    // Random block positions
    float blockSeed1=hash(blockGlitchTime+.1);
    float blockSeed2=hash(blockGlitchTime+.2);
    float blockSeed3=hash(blockGlitchTime+.3);
    
    // Generate block glitches
    vec2 blockPos1=vec2(blockSeed1,blockSeed2);
    float blockSize1=.05+.1*hash(blockGlitchTime+.4);
    
    if(length(uv-blockPos1)<blockSize1&&blockStrength>.2){
        // Create digital noise blocks
        vec2 blockUV=floor(uv*50.*hash(blockGlitchTime+.5))/50.;
        finalColor=vec3(hash(blockUV+blockGlitchTime),
        hash(blockUV+blockGlitchTime+.1),
        hash(blockUV+blockGlitchTime+.2));
    }
    
    // Horizontal line glitches
    float lineCount=10.+hash(lineGlitchTime)*20.;
    float lineSize=.02*hash(lineGlitchTime+.1);
    float linePos=hash(lineGlitchTime+.2);
    
    if(abs(fract(uv.y*lineCount)-.5)<lineSize&&
    hash(lineGlitchTime+.3)>.3){
        // Offset the lines horizontally
        uv.x+=(hash(lineGlitchTime+.4)-.5)*.2;
        finalColor=vec3(hash(uv+lineGlitchTime+.5),
        hash(uv+lineGlitchTime+.6),
        hash(uv+lineGlitchTime+.7));
    }
    
    // RGB channel shifting
    float rgbShiftTime=u_time*.5;
    float rgbShiftStrength=.01+.03*pow(sin(rgbShiftTime*.5)*.5+.5,2.);
    
    // Random direction for the RGB shift
    float shiftAngle=hash(glitchTime)*6.28;
    vec2 shiftDir=vec2(cos(shiftAngle),sin(shiftAngle));
    
    // Apply RGB channel separation (simulated without texture)
    vec3 colorShift;
    vec2 uvR=uv+shiftDir*rgbShiftStrength;
    vec2 uvB=uv-shiftDir*rgbShiftStrength;
    
    colorShift.r=mix(uvR.x,uvR.y,hash(glitchTime));
    colorShift.g=mix(uv.x,uv.y,hash(glitchTime+.1));
    colorShift.b=mix(uvB.x,uvB.y,hash(glitchTime+.2));
    
    // Blend RGB shift with the original color
    float rgbMix=.5+.5*sin(u_time*1.5);
    finalColor=mix(finalColor,colorShift,rgbMix);
    
    // Create scan lines
    float scanLineIntensity=.1+.1*sin(u_time*.5);
    float scanLine=.5+.5*sin(uv.y*100.+u_time*10.);
    finalColor*=1.-scanLine*scanLineIntensity;
    
    // Random color blocks
    if(hash(floor(uv.x*20.)+blockGlitchTime)>.95&&
    hash(floor(uv.y*20.)+blockGlitchTime)>.95){
        finalColor=vec3(hash(glitchTime),hash(glitchTime+.1),hash(glitchTime+.2));
    }
    
    // Vertical tear effect
    float tearTime=floor(u_time*3.7);
    float tearSeed=hash(tearTime);
    if(tearSeed>.85){
        float tearPos=hash(tearTime+.1)*.8+.1;
        float tearWidth=.01+.02*hash(tearTime+.2);
        if(abs(uv.x-tearPos)<tearWidth){
            // Tear displacement
            finalColor=vec3(
                noise(vec2(uv.y*10.,tearTime)),
                noise(vec2(uv.y*10.,tearTime+.1)),
                noise(vec2(uv.y*10.,tearTime+.2))
            );
        }
    }
    
    // Add flickering
    float flicker=.95+.05*hash(floor(u_time*20.));
    finalColor*=flicker;
    
    // Output final color
    gl_FragColor=vec4(finalColor,1.);
}