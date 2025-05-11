// Geometric Wave Shader
// Creates dynamic geometric waves with evolving patterns and colors

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

// Rotation matrix
mat2 rotate2D(float angle){
    return mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
}

// Hash function
float hash(float n){
    return fract(sin(n)*43758.5453123);
}

// Shape functions
float triangle(vec2 p,float size){
    vec2 q=abs(p);
    return max(q.x*.866025+p.y*.5,-p.y)-size*.5;
}

float box(vec2 p,vec2 size){
    vec2 q=abs(p)-size;
    return length(max(q,0.))+min(max(q.x,q.y),0.);
}

float rhombus(vec2 p,float size){
    return max(abs(p.x)+abs(p.y)-size,0.);
}

float circle(vec2 p,float size){
    return length(p)-size;
}

float hexagon(vec2 p,float size){
    vec2 q=abs(p);
    return max(q.x*.866025+q.y*.5,q.y)-size;
}

void main(){
    // Normalized coordinates with aspect ratio correction
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Initialize color
    vec3 finalColor=vec3(0.);
    
    // Time variables
    float time=u_time*.5;
    float slowTime=u_time*.2;
    
    // Grid parameters
    float gridSizeX=.15+.05*sin(slowTime);
    float gridSizeY=.15+.05*cos(slowTime*.7);
    
    // Wave parameters
    float waveAmp=.05+.03*sin(slowTime*.5);
    float waveFreq=6.+2.*cos(slowTime*.3);
    
    // Create cell grid with deformation
    vec2 gridUV=uv;
    
    // Apply wave deformation
    gridUV.x+=sin(gridUV.y*waveFreq+time*2.)*waveAmp;
    gridUV.y+=sin(gridUV.x*waveFreq*.7+time*1.5)*waveAmp;
    
    // Calculate cell indices and local coordinates
    vec2 cellIndex=floor(gridUV/vec2(gridSizeX,gridSizeY));
    vec2 cellUV=fract(gridUV/vec2(gridSizeX,gridSizeY))*2.-1.;
    
    // Unique seed for each cell based on its position and time
    float cellSeed=hash(dot(cellIndex,vec2(127.1,311.7))+floor(time*.2));
    
    // Dynamic shape selection based on seed and time
    float shapeSelector=floor(cellSeed*5.+slowTime*.1)/5.;
    
    // Size pulsation
    float pulsation=.3+.2*sin(time*2.+cellSeed*10.);
    
    // Shape rotation
    float rotAngle=time*(1.+cellSeed)+cellSeed*6.28;
    cellUV=rotate2D(rotAngle)*cellUV;
    
    // Shape distance field
    float shapeDist=1.;
    
    if(shapeSelector<.2){
        // Triangle
        shapeDist=triangle(cellUV,pulsation);
    }else if(shapeSelector<.4){
        // Box
        shapeDist=box(cellUV,vec2(pulsation*.5));
    }else if(shapeSelector<.6){
        // Rhombus
        shapeDist=rhombus(cellUV,pulsation*.7);
    }else if(shapeSelector<.8){
        // Circle
        shapeDist=circle(cellUV,pulsation*.5);
    }else{
        // Hexagon
        shapeDist=hexagon(cellUV,pulsation*.5);
    }
    
    // Create shape and border
    float shape=smoothstep(.01,0.,shapeDist);
    float border=smoothstep(.05,.01,abs(shapeDist));
    
    // Color for each shape based on its seed and position
    vec3 colorA=.5+.5*cos(vec3(0.,1.,2.)+cellSeed*6.28+time);
    vec3 colorB=.5+.5*sin(vec3(1.,2.,3.)+cellSeed*6.28+time*1.5);
    
    // Color mixing with dynamic gradients
    vec3 cellColor=mix(colorA,colorB,.5+.5*sin(time+uv.x+uv.y));
    
    // Shape and border colors
    vec3 shapeColor=cellColor;
    vec3 borderColor=vec3(1.)-cellColor;// Complementary color
    
    // Layer multiple shapes at different sizes for complex patterns
    float shape2=smoothstep(.01,0.,shapeDist+.1*sin(time*3.+cellSeed*10.));
    float shape3=smoothstep(.01,0.,shapeDist+.2*cos(time*2.+cellSeed*5.));
    
    // Add shapes to final color
    finalColor+=shapeColor*shape;
    finalColor+=borderColor*border*.7;
    finalColor+=cellColor*.3*shape2*(1.-shape);
    finalColor+=cellColor*.2*shape3*(1.-shape)*(1.-shape2);
    
    // Background grid lines
    vec2 gridLines=1.-abs(fract(gridUV/vec2(gridSizeX,gridSizeY))*2.-1.);
    float line=smoothstep(.98,1.,max(gridLines.x,gridLines.y));
    
    // Add subtle grid to background
    finalColor+=vec3(.2,.3,.5)*line*.1;
    
    // Add subtle noise texture to break up solid areas
    float noise=hash(dot(gl_FragCoord.xy,vec2(12.9898,78.233))+time)*.03;
    finalColor+=vec3(noise);
    
    // Background color
    vec3 bgColor=vec3(.05,.07,.1);
    
    // Combine with subtle background
    finalColor=mix(bgColor,finalColor,shape+border*.7+shape2*.3+shape3*.2+line*.1);
    
    // Add vignette
    float vignette=1.-length(uv*.5);
    finalColor*=.7+.3*vignette;
    
    // Output
    gl_FragColor=vec4(finalColor,1.);
}