// Crystal Growth Shader
// This shader creates crystal-like shapes that grow and rotate

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

// Voronoi function for crystal-like cells
vec2 voronoi(vec2 uv,float time){
    vec2 cell=floor(uv);
    vec2 fract_uv=fract(uv);
    
    vec2 closest=vec2(8.);
    vec2 second=vec2(8.);
    
    // Search neighboring cells for Voronoi points
    for(int i=-1;i<=1;i++){
        for(int j=-1;j<=1;j++){
            vec2 neighbor=vec2(float(i),float(j));
            
            // Generate a pseudo-random point in each cell
            vec2 point=neighbor+vec2(
                .5+.5*sin(time*.5+dot(cell+neighbor,vec2(123.45,78.91))),
                .5+.5*cos(time*.3+dot(cell+neighbor,vec2(63.71,127.83)))
            );
            
            // Calculate distance to the point
            float dist=length(fract_uv-point);
            
            // Update closest and second closest points
            if(dist<closest.x){
                second=closest;
                closest=vec2(dist,length(neighbor));
            }else if(dist<second.x){
                second=vec2(dist,length(neighbor));
            }
        }
    }
    
    return vec2(closest.x,second.x-closest.x);
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
    vec3 color=vec3(.02,.03,.05);// Dark background
    
    // Create multiple layers of crystal patterns
    for(float i=0.;i<3.;i++){
        // Time variables with offset for each layer
        float t=u_time*.2+i*1.5;
        float cycle=mod(t,10.);// 10-second cycle
        
        // Growth parameters
        float growth=0.;
        if(cycle<4.){
            // Growing phase
            growth=pow(cycle/4.,1.3);
        }else if(cycle<8.){
            // Stable phase
            growth=1.;
        }else{
            // Shrinking phase
            growth=pow(1.-(cycle-8.)/2.,.5);
        }
        
        // Rotation and scaling
        float angle=t*.1+i*2.;
        float scale=2.+i*2.+growth*6.;
        
        // Rotate and scale coordinates
        vec2 pos=rotate(uv,angle);
        pos*=scale;
        
        // Voronoi pattern
        vec2 v=voronoi(pos,t);
        
        // Edges of Voronoi cells for crystal effect
        float edge=1.-smoothstep(.02,.05,v.y);
        
        // Cell centers for glowing effect
        float center=1.-smoothstep(0.,.2,v.x);
        
        // Combine edge and center with varying intensity
        float pattern=edge*.6+center*.4;
        
        // Crystal color based on layer and time
        vec3 crystalColor=.5+.5*cos(vec3(i*.5+0.,i*.5+2.,i*.5+4.)+t*.3);
        
        // Add crystal pattern to final color with growth animation
        color+=pattern*crystalColor*growth*.7;
    }
    
    // Add glow effect
    float glow=length(color)*.2;
    color+=glow*vec3(.3,.5,.8);
    
    // Enhance colors
    color=pow(color,vec3(.8));// Brighten
    
    // Output final color
    gl_FragColor=vec4(color,1.);
}