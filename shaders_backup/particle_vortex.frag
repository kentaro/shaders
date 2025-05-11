// Particle Vortex Shader
// This shader creates swirling particles in a vortex pattern

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

// Pseudo-random function
float random(vec2 st){
    return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);
}

// 2D noise function
float noise(vec2 st){
    vec2 i=floor(st);
    vec2 f=fract(st);
    
    // Four corners of a tile
    float a=random(i);
    float b=random(i+vec2(1.,0.));
    float c=random(i+vec2(0.,1.));
    float d=random(i+vec2(1.,1.));
    
    // Smooth interpolation
    vec2 u=f*f*(3.-2.*f);
    
    // Mix 4 corners
    return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;
}

// Function to draw a particle
float particle(vec2 p,vec2 center,float size,float fade){
    float d=length(p-center);
    // Core + fade out edge
    return smoothstep(size,size*.5,d)*fade;
}

void main(){
    // Normalized coordinates
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Initialize color
    vec3 color=vec3(.02,.03,.04);// Dark background
    
    // Number of particles
    const int NUM_PARTICLES=100;
    
    // Vortex center
    vec2 center=vec2(0.);
    
    // Create multiple particles
    for(int i=0;i<NUM_PARTICLES;i++){
        float fi=float(i);
        
        // Particle parameters based on index
        float speed=.2+fi*.002;// Varied speeds
        float angle=fi*.063;// Initial angle spread
        float radius=.2+fi*.008;// Initial radius spread
        float particleSize=.005+fi*.0003;// Varied sizes
        
        // Time with offset for each particle
        float t=u_time*speed+fi*.1;
        
        // Spiral motion
        float spiralRadius=radius-mod(t*.1,radius);// Decreases over time then resets
        angle+=t*(1.-spiralRadius/radius);// Rotation speed increases as radius decreases
        
        // Calculate particle position on spiral
        vec2 pos=center+spiralRadius*vec2(cos(angle),sin(angle));
        
        // Add some noise to position
        float noiseAmount=.02*noise(vec2(t*.5,fi*.1));
        pos+=noiseAmount*vec2(cos(angle+1.57),sin(angle+1.57));
        
        // Calculate fade based on lifecycle
        float lifecycle=mod(t,10.);// 10-second lifecycle
        float fade=1.;
        
        if(lifecycle<.5){
            // Fade in
            fade=lifecycle/.5;
        }else if(lifecycle>9.){
            // Fade out
            fade=1.-(lifecycle-9.)/1.;
        }
        
        // Draw the particle
        float p=particle(uv,pos,particleSize,fade);
        
        // Particle color based on position and time
        vec3 particleColor=.5+.5*cos(vec3(length(pos)*5.+0.,length(pos)*5.+2.,length(pos)*5.+4.)+t*.2);
        
        // Add glow effect that increases as particles get closer to center
        float glow=.5+.5*(1.-spiralRadius/radius);
        
        // Add particle to final color
        color+=p*particleColor*glow*.5;
    }
    
    // Add center vortex glow
    float centerGlow=.1/(length(uv-center)+.1);
    color+=centerGlow*vec3(.2,.5,.8)*(.5+.5*sin(u_time*.5));
    
    // Output final color
    gl_FragColor=vec4(color,1.);
}