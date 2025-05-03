// Geometric Dance Shader
// This shader creates geometric shapes that dance and transform

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

// SDF functions for various shapes
float sdCircle(vec2 p,float r){
    return length(p)-r;
}

float sdBox(vec2 p,vec2 b){
    vec2 d=abs(p)-b;
    return length(max(d,0.))+min(max(d.x,d.y),0.);
}

float sdTriangle(vec2 p,float size){
    const float k=sqrt(3.);
    p.x=abs(p.x)-size;
    p.y=p.y+size/k;
    if(p.x+k*p.y>0.)p=vec2(p.x-k*p.y,-k*p.x-p.y)/2.;
    p.x-=clamp(p.x,-2.*size,0.);
    return-length(p)*sign(p.y);
}

// Smooth min for shape blending
float smin(float a,float b,float k){
    float h=clamp(.5+.5*(b-a)/k,0.,1.);
    return mix(b,a,h)-k*h*(1.-h);
}

// Rotation function
vec2 rotate(vec2 p,float angle){
    float s=sin(angle);
    float c=cos(angle);
    return vec2(p.x*c-p.y*s,p.x*s+p.y*c);
}

void main(){
    // Normalized coordinates with aspect ratio correction
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Initialize color
    vec3 color=vec3(.02,.03,.04);// Dark background
    
    // Create multiple dancing shapes
    for(int i=0;i<5;i++){
        float fi=float(i);
        
        // Time variables with offset for each shape
        float t=u_time*.5+fi*.7;
        float cycle=mod(t,6.);// 6-second cycle
        
        // Shape position
        float posRadius=.3+.1*sin(t*.7);
        float posAngle=t*.2+fi*1.256;
        vec2 pos=posRadius*vec2(cos(posAngle),sin(posAngle));
        
        // Rotation and scale animation
        float rotation=t*(.3+fi*.1);
        float scale=.1+.05*sin(t*.5+fi);
        
        // Shape transformations
        vec2 shapePos=uv-pos;
        shapePos=rotate(shapePos,rotation);
        
        // Morph between different shapes based on cycle
        float morphFactor=fract(cycle/3.)*3.;// 0-1 range for each third of the cycle
        float shape1,shape2;
        
        if(cycle<2.){
            // Morph between circle and square
            shape1=sdCircle(shapePos,scale);
            shape2=sdBox(shapePos,vec2(scale*.8));
            
        }else if(cycle<4.){
            // Morph between square and triangle
            shape1=sdBox(shapePos,vec2(scale*.8));
            shape2=sdTriangle(shapePos,scale*1.2);
            
        }else{
            // Morph between triangle and circle
            shape1=sdTriangle(shapePos,scale*1.2);
            shape2=sdCircle(shapePos,scale);
        }
        
        // Blend between shapes
        float blend=.5+.5*sin(morphFactor*3.14159);
        float shapeDist=mix(shape1,shape2,blend);
        
        // Create borders with glowing effect
        float border=1.-smoothstep(0.,.02+.01*sin(t*2.),abs(shapeDist));
        
        // Add pulsating effect
        float pulse=.5+.5*sin(t*3.+fi);
        
        // Shape color based on index and time
        vec3 shapeColor=.5+.5*cos(vec3(fi*.4+0.,fi*.4+2.,fi*.4+4.)+t*.7);
        
        // Highlight the centers of the shapes
        float center=1.-smoothstep(0.,.05,length(shapePos));
        
        // Add shapes to final color
        color+=(border*.7+center*pulse*.5)*shapeColor;
        
        // Add trailing effect
        float trail=1.-smoothstep(0.,.1,abs(shapeDist)-.02-.05*pulse);
        color+=trail*shapeColor*.2;
    }
    
    // Add subtle glow
    float glow=length(color)*.15;
    color+=glow*vec3(.3,.4,.6);
    
    // Output final color
    gl_FragColor=vec4(color,1.);
}