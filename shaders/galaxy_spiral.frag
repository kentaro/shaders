// Galaxy Spiral Shader
// This shader simulates a spiral galaxy with rotating arms and star particles

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

// Random hash function
float hash(vec2 p){
    p=fract(p*vec2(123.34,456.21));
    p+=dot(p,p+45.32);
    return fract(p.x*p.y);
}

// Star field generation
float starField(vec2 uv,float scale,float brightness){
    vec2 pos=floor(uv*scale);
    float starValue=hash(pos);
    
    // Threshold for star visibility
    if(starValue>.97){
        // Flicker effect for some stars
        float flickerSpeed=hash(pos+1.)*6.;
        float flicker=.8+.2*sin(u_time*flickerSpeed);
        
        // Adjust brightness
        starValue=brightness*flicker*(starValue-.96)*30.;
        
        // Create circular stars with soft edges
        vec2 center=pos+.5;
        float dist=distance(uv*scale,center);
        return starValue*smoothstep(.25,0.,dist);
    }
    return 0.;
}

// Function to create spiral arms
float spiralArm(vec2 uv,float rotation,float tightness,float width){
    // Convert to polar coordinates
    float distance=length(uv);
    float angle=atan(uv.y,uv.x);
    
    // Calculate spiral function
    float spiral=angle+distance*tightness+rotation;
    
    // Create arm width
    float arm=smoothstep(0.,width,.5+.5*sin(spiral*2.));
    
    // Fade with distance from center
    arm*=smoothstep(1.2,.1,distance);
    
    return arm;
}

void main(){
    // Normalize coordinates with aspect ratio correction
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Animation parameters
    float time=u_time*.1;
    float rotation=time*.5;
    
    // Initialize color
    vec3 color=vec3(0.);
    
    // Background deep space color
    color=mix(color,vec3(.015,0.,.03),1.);
    
    // Generate distant star field (multiple layers)
    for(float i=1.;i<=3.;i++){
        float scale=100.*i;
        float brightness=1./i;
        color+=vec3(.8,.9,1.)*starField(uv+i*.1,scale,brightness);
    }
    
    // Galaxy center glow
    float centerGlow=.07/(.01+length(uv)*2.5);
    color+=vec3(.9,.8,.7)*centerGlow*.6;
    
    // Create spiral arms
    float arm1=spiralArm(uv,rotation,4.,.8);
    float arm2=spiralArm(uv,rotation+3.14159,4.,.8);
    
    // Combine arms with different colors
    vec3 armColor1=vec3(.7,.5,.3);
    vec3 armColor2=vec3(.5,.5,.8);
    
    color+=arm1*armColor1*.4;
    color+=arm2*armColor2*.4;
    
    // Add stars along spiral arms
    vec2 rotatedUV=vec2(
        uv.x*cos(rotation)-uv.y*sin(rotation),
        uv.x*sin(rotation)+uv.y*cos(rotation)
    );
    
    float armStars1=arm1*starField(rotatedUV,200.,2.);
    float armStars2=arm2*starField(rotatedUV+5.,200.,2.);
    
    color+=vec3(.9,.9,1.)*(armStars1+armStars2)*.5;
    
    // Add bright core
    float core=.5/(.1+length(uv)*10.);
    color+=vec3(1.,.9,.7)*core*1.5;
    
    // Dust lanes in spiral arms
    float dust=spiralArm(uv,rotation+.1,5.,.3)*
    spiralArm(uv,rotation+3.14159+.1,5.,.3);
    color=mix(color,color*.8,dust*.5);
    
    // Add some color variation based on position
    color=mix(color,color*vec3(.9,1.,1.1),.5+.5*sin(uv.x*2.+time));
    
    // Output final color
    gl_FragColor=vec4(color,1.);
}