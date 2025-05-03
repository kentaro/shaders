// Polygon Burst Shader
// This shader creates shapes that burst outward and rotate

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

float shape(vec2 pos,float sides,float size,float edge){
    // Convert to polar coordinates
    float angle=atan(pos.y,pos.x);
    float radius=length(pos);
    
    // Calculate angular step for the given number of sides
    float slice=3.14159*2./sides;
    
    // Calculate distance to edge
    float dist=abs(mod(angle+slice/2.,slice)-slice/2.);
    dist=min(dist,edge);
    
    // Create the shape
    float shape=1.-smoothstep(size-edge,size,radius);
    shape*=smoothstep(dist-.01,dist,.1);
    
    return shape;
}

void main(){
    // Normalized coordinates
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Initialize color
    vec3 color=vec3(0.);
    
    // Create multiple bursting shapes
    for(float i=0.;i<5.;i++){
        // Time offset for each shape
        float t=u_time*(.5+i*.1)+i*1.5;
        
        // Calculate position with outward movement and rotation
        float burst=pow(mod(t,3.)/3.,.5);// Bursting effect
        float rot=t*.5;// Rotation
        
        vec2 pos=vec2(
            uv.x*cos(rot)-uv.y*sin(rot),
            uv.x*sin(rot)+uv.y*cos(rot)
        );
        
        // Apply outward movement
        pos/=.2+burst*1.5;
        
        // Create shape with sides based on index
        float sides=3.+i;
        float s=shape(pos,sides,.4,.1);
        
        // Color based on index and time
        vec3 shapeColor=.5+.5*cos(vec3(i*.5+0.,i*.5+.4,i*.5+1.)+t);
        
        // Add shape to final color
        color+=s*shapeColor*(1.-burst*.5);
    }
    
    // Output final color
    gl_FragColor=vec4(color,1.);
}