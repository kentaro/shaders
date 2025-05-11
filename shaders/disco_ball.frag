// Disco Ball Shader
// Creates a spinning disco ball effect with dynamic light reflections

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

float random(vec2 st){
    return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);
}

// Generates a hexagonal grid pattern
float hexGrid(vec2 p,float scale){
    p*=scale;
    vec2 q=vec2(p.x*2.*.5773503,p.y+p.x*.5773503);
    vec2 pi=floor(q);
    vec2 pf=fract(q);
    
    float v=mod(pi.x+pi.y,3.);
    float ca=step(1.,v);
    float cb=step(2.,v);
    vec2 ma=step(pf.xy,pf.yx);
    
    // hexagonal distance
    float e=dot(ma,1.-pf.yx)+(1.-ma.x)*(1.-ma.y);
    return smoothstep(.95,1.,e);
}

void main(){
    // Normalized pixel coordinates
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Create disco ball shape
    float radius=.8;
    float dist=length(uv);
    float circle=smoothstep(radius,radius-.03,dist);
    
    // Rotating UVs for spinning effect
    float angle=atan(uv.y,uv.x)+u_time*.5;
    float spin=u_time*.3;
    vec2 rotatedUV=vec2(
        uv.x*cos(spin)-uv.y*sin(spin),
        uv.x*sin(spin)+uv.y*cos(spin)
    );
    
    // Spinning facets on the ball
    float facets=hexGrid(rotatedUV,20.+5.*sin(u_time*.2));
    facets*=circle;
    
    // Light reflections
    float reflectionCount=12.;
    float reflection=0.;
    
    for(float i=0.;i<reflectionCount;i++){
        float t=i/reflectionCount;
        float reflectionAngle=t*6.28+u_time*(.2+.1*sin(i));
        vec2 reflectPos=vec2(cos(reflectionAngle),sin(reflectionAngle))*(.3+.2*sin(u_time*.5+i));
        float glow=smoothstep(.1,0.,length(uv-reflectPos))*(.5+.5*sin(u_time*2.+i*2.));
        reflection+=glow;
    }
    
    // Color calculation
    vec3 baseColor=vec3(.4,.4,.6)*circle;
    
    // Dynamic color for facets
    vec3 facetColor=.5+.5*cos(vec3(0,2,4)+angle*3.+u_time);
    
    // Bright white reflections
    vec3 reflectionColor=vec3(1.,1.,1.)*reflection*2.;
    
    // Combine all elements
    vec3 finalColor=baseColor;
    finalColor=mix(finalColor,facetColor,facets*.7);
    finalColor+=reflectionColor;
    
    // Add outer glow
    float outerGlow=smoothstep(radius+.1,radius,dist)*(1.-circle)*.5;
    finalColor+=vec3(.6,.8,1.)*outerGlow;
    
    // Output final color
    gl_FragColor=vec4(finalColor,1.);
}