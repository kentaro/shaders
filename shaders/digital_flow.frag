// Digital Flow Shader
// Creates a flowing pattern of digital lines and pulses

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

// Value noise function
float vnoise(vec2 p){
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
    // Normalized coordinates
    vec2 uv=gl_FragCoord.xy/u_resolution.xy;
    uv.x*=u_resolution.x/u_resolution.y;// Aspect ratio correction
    
    // Initialize final color
    vec3 finalColor=vec3(0.);
    
    // Digital flow parameters
    float flowSpeed=u_time*.5;
    float flowZoom=2.+sin(u_time*.1)*.5;
    float flowDirection=sin(u_time*.2)*.5;
    
    // Create flowing distortion
    vec2 flow=vec2(
        vnoise(uv*flowZoom+vec2(0.,flowSpeed)),
        vnoise(uv*flowZoom+vec2(flowSpeed,0.))
    );
    
    // Apply flow to coordinates
    vec2 distortedUV=uv+flow*.1;
    
    // Grid pattern
    float gridSize=15.+5.*sin(u_time*.3);
    vec2 grid=fract(distortedUV*gridSize)-.5;
    float gridLines=smoothstep(.05,0.,abs(grid.x))+smoothstep(.05,0.,abs(grid.y));
    
    // Create layered patterns of different sizes
    float gridPattern1=smoothstep(.05,0.,abs(grid.x))+smoothstep(.05,0.,abs(grid.y));
    
    vec2 grid2=fract(distortedUV*gridSize*.5)-.5;
    float gridPattern2=smoothstep(.1,0.,abs(grid2.x))+smoothstep(.1,0.,abs(grid2.y));
    
    vec2 grid3=fract(distortedUV*gridSize*2.)-.5;
    float gridPattern3=smoothstep(.03,0.,abs(grid3.x))+smoothstep(.03,0.,abs(grid3.y));
    
    // Create pulsing circles at grid intersections
    float pulseSize=.05+.03*sin(u_time*2.);
    float pulseStrength=0.;
    
    for(int i=0;i<5;i++){
        for(int j=0;j<5;j++){
            vec2 center=vec2(float(i),float(j))/5.;
            
            // Animate each circle with different phase
            float pulseFactor=.5+.5*sin(u_time*1.5+float(i)*.5+float(j)*.7);
            
            // Calculate distance to grid point
            float dist=length(distortedUV-center);
            
            // Create pulsing circle
            float pulse=smoothstep(pulseSize*pulseFactor,0.,dist);
            
            // Add to total pulse strength
            pulseStrength+=pulse*.2;// Scale down to avoid oversaturation
        }
    }
    
    // Digital pulse lines
    float lineCount=10.;
    float linePattern=0.;
    
    for(int i=0;i<10;i++){// Generate several moving lines
        float t=float(i)/lineCount;
        float yPos=fract(t+flowSpeed*(.1+.1*hash(float(i))));
        float lineWidth=.01+.02*hash(float(i)+43.21);
        
        // Line with dropout effect
        float dropout=step(.3,hash(floor(u_time*5.)+float(i)));
        float line=smoothstep(lineWidth,0.,abs(distortedUV.y-yPos))*dropout;
        
        // Line color based on position
        vec3 lineColor=.5+.5*cos(vec3(0.,2.,4.)+yPos*5.+u_time+float(i));
        
        // Add to final color
        finalColor+=lineColor*line*.3;
        
        // Add to line pattern
        linePattern+=line;
    }
    
    // Create pixelated noise blocks
    float blockSize=20.;
    vec2 blockUV=floor(uv*blockSize)/blockSize;
    float noise=hash(blockUV+floor(u_time*3.));
    
    // Random digital blocks
    float digitalBlock=0.;
    if(noise>.9){// Only show some blocks
        digitalBlock=hash(blockUV*100.+floor(u_time*10.));
    }
    
    // Color for grid lines
    vec3 gridColor1=vec3(0.,.5,1.);// Blue
    vec3 gridColor2=vec3(0.,1.,.5);// Cyan
    vec3 gridColor3=vec3(.5,0.,1.);// Purple
    
    // Mix grid colors based on time and position
    vec3 gridColor=mix(gridColor1,gridColor2,.5+.5*sin(u_time+uv.x*5.));
    gridColor=mix(gridColor,gridColor3,.5+.5*sin(u_time*.5+uv.y*3.));
    
    // Add grid pattern to final color
    finalColor+=gridColor*gridPattern1*.3;
    finalColor+=gridColor*gridPattern2*.2;
    finalColor+=gridColor*gridPattern3*.1;
    
    // Add pulses
    vec3 pulseColor=vec3(1.,.8,.2);// Yellow-orange
    finalColor+=pulseColor*pulseStrength;
    
    // Add digital blocks
    finalColor+=vec3(.9,.9,1.)*digitalBlock*.5;
    
    // Dark blue background
    vec3 bgColor=vec3(.02,.03,.08);
    
    // Combine all elements
    finalColor=mix(bgColor,finalColor,.8);
    
    // Add subtle scan lines
    float scanLine=.95+.05*sin(gl_FragCoord.y*.5+u_time*10.);
    finalColor*=scanLine;
    
    // Add vignette
    float vignette=1.-length((uv-.5)*1.2);
    finalColor*=vignette;
    
    // Output
    gl_FragColor=vec4(finalColor,1.);
}