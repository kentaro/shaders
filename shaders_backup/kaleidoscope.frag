// HYPER KALEIDOSCOPE MATRIX - Advanced VJ Shader
// This shader creates an intense, audio-reactive kaleidoscopic effect with multiple layers
// and cyberpunk aesthetics for high-energy VJ performances

#ifdef GL_ES
precision highp float;
#endif

// Core uniforms
uniform float u_time;// Time in seconds since start
uniform vec2 u_resolution;// Canvas resolution
uniform vec2 u_mouse;// Mouse position (normalized 0-1)

// Audio reactive uniforms - connect these to your audio analyzer
uniform float u_bass;// Low frequency intensity (0-1)
uniform float u_mid;// Mid frequency intensity (0-1)
uniform float u_high;// High frequency intensity (0-1)
uniform float u_volume;// Overall volume (0-1)

// =======================================================
// CUSTOMIZABLE PARAMETERS - Adjust these for your VJ sets
// =======================================================

// Kaleidoscope parameters
const float BASE_SEGMENTS=8.;// Base number of kaleidoscope segments
const float SEGMENT_VARIATION=4.;// How much segments can change with audio
const float ROTATION_SPEED=.2;// Base rotation speed
const float ZOOM_SPEED=.3;// Base zoom pulsation speed
const float ZOOM_AMOUNT=.3;// How much zoom pulsates

// Pattern and shape parameters
const int SHAPE_LAYERS=7;// Number of shape layers
const float SHAPE_INTENSITY=1.2;// Intensity of shape patterns
const float SHAPE_SPEED=.5;// Animation speed of shapes
const float SHAPE_COMPLEXITY=.7;// Complexity of generated shapes

// Color parameters
const float COLOR_SATURATION=1.2;// Color saturation
const float COLOR_INTENSITY=1.3;// Overall color intensity
const float COLOR_SHIFT_SPEED=.15;// Speed of color cycling
const float COLOR_CONTRAST=1.2;// Color contrast

// Cyber effect parameters
const float GLOW_AMOUNT=.4;// Amount of glow effect
const float SCAN_INTENSITY=.15;// Intensity of scan lines
const float GLITCH_AMOUNT=.2;// Amount of glitch effect
const float EDGE_INTENSITY=.8;// Intensity of edge highlights
const float FEEDBACK_AMOUNT=.1;// Amount of feedback effect

// =======================================================

#define PI 3.14159265359
#define TWO_PI 6.28318530718

// Hash function for pseudo-random values
float hash(float n){
    return fract(sin(n)*43758.5453123);
}

// 2D hash function
vec2 hash2(vec2 p){
    p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));
    return fract(sin(p)*43758.5453);
}

// Voronoi cellular noise for cyberpunk texture
vec2 voronoi(vec2 x,float time){
    vec2 n=floor(x);
    vec2 f=fract(x);
    
    vec2 mg,mr;
    float md=8.;
    
    for(int i=-1;i<=1;i++){
        for(int j=-1;j<=1;j++){
            vec2 g=vec2(float(j),float(i));
            vec2 o=hash2(n+g);
            
            // Animate cells
            o=.5+.5*sin(time*.5+TWO_PI*o);
            
            vec2 r=g+o-f;
            float d=dot(r,r);
            
            if(d<md){
                md=d;
                mr=r;
                mg=g;
            }
        }
    }
    
    return vec2(md,dot(mg+n,vec2(1.)));
}

// Advanced color generation with cyberpunk palette
vec3 cyberpunkColor(float t,float index){
    // Create base colors for cyberpunk palette
    vec3 color1=vec3(.1,.8,.9);// Cyan
    vec3 color2=vec3(.9,.1,.9);// Magenta
    vec3 color3=vec3(.9,.8,.1);// Yellow
    vec3 color4=vec3(.1,.9,.5);// Green
    
    // Create a smooth oscillating value
    float oscValue1=.5+.5*sin(t*.3+index*.5);
    float oscValue2=.5+.5*sin(t*.5+index*1.3);
    
    // Mix between colors based on oscillation and index
    vec3 mixedColor=mix(
        mix(color1,color2,oscValue1),
        mix(color3,color4,oscValue2),
        fract(index*.27+t*.13)
    );
    
    // Add brightness variation
    float brightness=.8+.3*sin(t*.7+index*2.);
    
    return mixedColor*brightness;
}

// Rotation matrix
vec2 rotate(vec2 v,float angle){
    float c=cos(angle);
    float s=sin(angle);
    return vec2(c*v.x-s*v.y,s*v.x+c*v.y);
}

// Generate complex shape patterns
float complexShape(vec2 p,float sides,float size,float time,float complexity){
    // Base distance from center
    float d=length(p);
    
    // Get angle and create N-sided polygon
    float angle=atan(p.y,p.x)+time;
    float segmentAngle=TWO_PI/sides;
    angle=mod(angle,segmentAngle)-segmentAngle*.5;
    
    // Create star-like or flower-like pattern
    float r=size*(.7+complexity*sin(d*8.+time*2.)*.3);
    
    // Add high frequency variation along the edge for cyber look
    r+=.05*complexity*sin(angle*sides*3.)*sin(d*15.+time*4.);
    
    // Create the shape with a glowing edge
    float shape=smoothstep(.01,.1,abs(d-r));
    
    // Add circular rings
    shape*=.8+.2*sin(d*20.-time*3.);
    
    // Add radial scan lines
    float scanLine=.9+.1*sin(angle*sides*4.+time*2.);
    shape*=scanLine;
    
    return 1.-shape;
}

// Glitch effect function
float glitchEffect(vec2 uv,float time,float intensity){
    // Create horizontal glitch lines
    float horizontalGlitch=step(.96,hash(floor(uv.y*40.)+floor(time*5.)));
    
    // Distort values based on random noise
    float distortAmount=horizontalGlitch*intensity;
    
    // Create glitch noise
    float noise=hash(uv.y*100.+time*10.)*distortAmount;
    
    return noise;
}

// Main function
void main(){
    // Normalize coordinates with aspect ratio correction
    vec2 uv=(gl_FragCoord.xy-.5*u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // Create mock audio reactive values if uniforms not available
    float bass=.5+.5*sin(u_time*.4);
    float mid=.5+.5*sin(u_time*.7+1.);
    float high=.5+.5*sin(u_time*1.1+2.);
    float volume=.7+.3*sin(u_time*.8+.5);
    
    // Create time variables for animation and effects
    float time=u_time*SHAPE_SPEED;
    float colorTime=u_time*COLOR_SHIFT_SPEED;
    
    // Audio-reactive kaleidoscope segments
    float segments=BASE_SEGMENTS+SEGMENT_VARIATION*bass;
    
    // Apply zoom effect based on mid frequencies
    float zoom=1.+ZOOM_AMOUNT*sin(u_time*ZOOM_SPEED)*(.8+mid*.4);
    uv*=zoom;
    
    // Apply rotation based on time and high frequencies
    float rotation=u_time*ROTATION_SPEED*(1.+high*.5);
    uv=rotate(uv,rotation);
    
    // Convert to polar coordinates for kaleidoscope effect
    float angle=atan(uv.y,uv.x);
    float radius=length(uv);
    
    // Apply kaleidoscope symmetry
    float segmentAngle=TWO_PI/segments;
    angle=mod(angle,segmentAngle);
    angle=abs(angle-segmentAngle*.5);
    
    // Convert back to Cartesian coordinates
    vec2 kaleidoUV=vec2(cos(angle),sin(angle))*radius;
    
    // Initialize color
    vec3 color=vec3(0.);
    
    // Create multiple shape layers
    for(int i=0;i<SHAPE_LAYERS;i++){
        float fi=float(i);
        
        // Get position with various rotations and offsets
        float layerTime=time+fi*.2;
        float layerRotation=layerTime*(.1+fi*.05)*(1.+bass*.3);
        
        // Apply different rotation for each layer
        vec2 layerUV=rotate(kaleidoUV,layerRotation);
        
        // Distort coordinates based on audio/time
        float distortAmount=.1*sin(layerTime+fi)*(.5+high*1.);
        layerUV+=distortAmount*sin(layerUV*(2.+fi*.5)+layerTime);
        
        // Make shape parameters audio-reactive
        float shapeSides=3.+float(i%5)+2.*sin(time*.3+fi)*mid;
        float shapeSize=.2+.15*sin(time*.2+fi*.4)*(1.+bass*.5);
        
        // Generate the shape
        float shapePattern=complexShape(
            layerUV,
            shapeSides,
            shapeSize,
            layerTime*(1.+bass*.3),
            SHAPE_COMPLEXITY*(.8+high*.4)
        );
        
        // Get color for this layer
        vec3 layerColor=cyberpunkColor(colorTime,fi);
        
        // Make color audio-reactive
        layerColor*=.8+.5*mid;
        layerColor*=1.+high*vec3(.1,.2,.3);// Add color shift with high freqs
        
        // Apply shape to color and add to final color
        color+=shapePattern*layerColor*SHAPE_INTENSITY*(.7+.5*volume);
    }
    
    // Add voronoi cellular pattern for cyber texture
    vec2 voronoiValue=voronoi(kaleidoUV*8.,time);
    float cellNoise=smoothstep(0.,1.,voronoiValue.x);
    
    // Use the cellular pattern to create highlights
    vec3 cellColor=vec3(.9,.8,1.)*(1.-cellNoise)*GLOW_AMOUNT*high;
    color+=cellColor;
    
    // Add edge highlight effect (kaleidoscope boundary)
    float edgeGlow=smoothstep(.8-.1*bass,.82,radius)*
    smoothstep(.9+.1*mid,.85,radius);
    color+=edgeGlow*vec3(.9,.2,.5)*EDGE_INTENSITY*(.7+.3*sin(time*3.));
    
    // Apply scanlines for CRT/cyber effect
    float scanlines=1.-SCAN_INTENSITY*smoothstep(.4,.6,
        sin(gl_FragCoord.y*.5-time*2.)*sin(gl_FragCoord.x*.2));
        color*=scanlines;
        
        // Apply audio-reactive feedback effect (trails)
        vec2 feedbackUV=rotate(uv,.02*sin(time));
        feedbackUV*=.99;// Slightly zoom for trail effect
        
        // Use radius as a feedback mask to create trails from center
        float feedbackMask=smoothstep(0.,.8,radius);
        color+=feedbackMask*FEEDBACK_AMOUNT*color*bass;
        
        // Apply glitch effect
        float glitch=glitchEffect(uv,time,GLITCH_AMOUNT*high);
        color.r+=glitch*.5;// Red shift for glitch
        color.b-=glitch*.3;// Blue shift for glitch
        
        // Global color adjustments
        color=mix(vec3(length(color)*.8),color,COLOR_SATURATION);// Saturation
        color*=COLOR_INTENSITY;// Brightness
        
        // Apply contrast adjustment
        color=pow(color,vec3(COLOR_CONTRAST));
        
        // Apply audio-reactive final boost
        color*=.7+.5*volume;
        
        // Ensure colors stay in visible range with nice rolloff
        color=1.2*color/(1.+color);
        
        // Output final color
        gl_FragColor=vec4(color,1.);
    }