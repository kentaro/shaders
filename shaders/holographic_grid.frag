// Holographic Grid Shader
// This shader creates a futuristic holographic grid with scanning lines and data flow effects

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

// Hash function for random values
float hash(vec2 p){
    float h=dot(p,vec2(127.1,311.7));
    return fract(sin(h)*43758.5453123);
}

// Function to create grid pattern
float grid(vec2 p,float width){
    vec2 grid=abs(fract(p-.5)-.5)/width;
    float line=min(grid.x,grid.y);
    return 1.-min(line,1.);
}

// Line pattern for data flow effect
float lineScan(vec2 uv,float time){
    // Create a line that moves across the screen
    float scan=mod(uv.y*5.-time*.5,5.);
    // Make it pulsate
    float scanWidth=.05+.05*sin(time*.2);
    // Create sharp lines
    scan=smoothstep(scanWidth,0.,abs(scan-.5));
    return scan*.3;
}

// Function to create circular scanlines
float circleScan(vec2 uv,float time){
    float dist=length(uv);
    float ring=mod(dist*10.-time*.5,5.);
    ring=smoothstep(.1,0.,abs(ring-.5));
    return ring*.15;
}

// Function to create hexagonal pattern
float hexGrid(vec2 p,float scale){
    p*=scale;
    vec2 r=vec2(1.,1.73);// Hexagon spacing (sqrt(3))
    vec2 h=r*.5;
    vec2 a=mod(p,r)-h;
    vec2 b=mod(p+h,r)-h;
    
    return min(dot(a,a),dot(b,b));
}

void main(){
    // Normalize coordinates with aspect ratio correction
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Animation time
    float time=u_time*.8;
    
    // Initialize color
    vec3 color=vec3(0.);
    
    // Base dark color with slight gradient
    color=vec3(.05,.07,.1)+uv.y*.03;
    
    // Add subtle noise pattern for texture
    float noise=hash(uv*100.+time);
    color+=noise*.03;
    
    // Main grid pattern
    float mainGrid=grid(uv*10.,.05);
    
    // Secondary fine grid
    float fineGrid=grid(uv*40.,.02);
    
    // Hexagonal grid pattern for tech feel
    float hex=hexGrid(uv,10.);
    float hexPattern=smoothstep(.05,0.,hex)*.2+
    smoothstep(.02,0.,hex)*.3;
    
    // Combine grid patterns
    float gridPattern=mainGrid*.2+fineGrid*.1;
    
    // Create a base color for the holographic effect - cyan/blue
    vec3 hologColor=vec3(0.,.8,1.);
    
    // Add the grid to the base color
    color+=gridPattern*hologColor*.8;
    color+=hexPattern*hologColor;
    
    // Add scanning line effects
    float scan=lineScan(uv,time);
    color+=scan*hologColor;
    
    // Add circular scan effect from center
    float circlePulse=circleScan(uv,time);
    color+=circlePulse*hologColor;
    
    // Add data flow effect (random blocks lighting up)
    for(int i=0;i<10;i++){
        float fi=float(i);
        vec2 dataPos=vec2(
            mod(hash(vec2(fi,0.))*10.+time*.2,2.)-1.,
            mod(hash(vec2(0.,fi))*10.-time*.3,2.)-1.
        );
        
        float dataBlock=smoothstep(.2,.1,length(uv-dataPos));
        float dataPulse=.5+.5*sin(time*2.+fi);
        
        color+=dataBlock*hologColor*.2*dataPulse;
    }
    
    // Edge glow effect
    float edge=abs(uv.x)*abs(uv.y);
    float edgeGlow=pow(1.-edge,1.)*.05;
    color+=edgeGlow*vec3(0.,.5,1.);
    
    // Add horizontal scan lines for CRT/hologram effect
    float scanlines=.5+.5*sin(gl_FragCoord.y*.8);
    color*=.8+.2*scanlines;
    
    // Add some color variation based on position
    color*=1.+.1*vec3(sin(uv.x*5.),sin(uv.y*5.),cos(uv.x*uv.y*2.));
    
    // Add a pulsing glow to the entire effect
    float pulse=.95+.05*sin(time*1.5);
    color*=pulse;
    
    // Add chromatic aberration at the edges
    float aberration=length(uv)*.05;
    float red=grid((uv-aberration)*10.,.05);
    float blue=grid((uv+aberration)*10.,.05);
    color.r+=red*.03;
    color.b+=blue*.03;
    
    // Output final color
    gl_FragColor=vec4(color,1.);
}