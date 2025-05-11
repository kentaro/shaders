// Matrix Rain Shader
// Creates digital rain/falling code effect with glowing symbols

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

// Hash function
float hash(float n){
    return fract(sin(n)*43758.5453123);
}

// 2D Hash
float hash(vec2 p){
    return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);
}

// Function to generate random character pattern
float character(vec2 p,float n){
    // Create an 8x8 grid for the character
    p=floor(p*8.);
    float d=hash(vec2(p.x+n,p.y+n*100.));
    
    // Threshold to create a pattern of dots (simulating characters)
    return step(.5,d);
}

void main(){
    // Normalized coordinates
    vec2 uv=gl_FragCoord.xy/u_resolution.xy;
    
    // Scaling - how many columns of rain
    float columns=50.;
    float rows=columns*(u_resolution.y/u_resolution.x);
    
    // Scale UVs
    vec2 pixelUV=vec2(uv.x*columns,uv.y*rows);
    
    // Get integer cell position
    vec2 cell=floor(pixelUV);
    
    // Get local position within cell
    vec2 cellUV=fract(pixelUV);
    
    // Initialize color
    vec3 finalColor=vec3(0.);
    
    // Column properties - each column has a different speed and starting time
    float columnSeed=hash(cell.x);// Unique seed for each column
    float columnSpeed=4.+8.*columnSeed;// Different speeds
    float columnOffset=10.*columnSeed;// Offset starting times
    
    // Flowing time for this column
    float time=u_time*columnSpeed+columnOffset;
    
    // Calculate the position of the rain drops in this column
    float rainPos=fract((cell.y-time)/rows);
    
    // Create multiple drops per column with different brightnesses
    const int DROP_COUNT=6;
    float drops=0.;
    
    for(int i=0;i<DROP_COUNT;i++){
        // Each drop has its own properties
        float fi=float(i);
        float dropSeed=hash(cell.x+fi*100.);
        float dropLength=.1+.2*dropSeed;// Length of the bright trail
        float dropOffset=dropSeed*rows;// Offset in the column
        
        // Calculate position of this drop
        float dropPos=fract((cell.y-time-dropOffset)/rows);
        
        // Brightness of drop based on its position (trail effect)
        float dropBrightness=1.-smoothstep(0.,dropLength,dropPos);
        dropBrightness*=dropBrightness;// Make falloff more pronounced
        
        // Brightness based on drop's position in the trail
        if(dropPos<dropLength){
            // Head of the drop is brightest
            if(dropPos<.05){
                dropBrightness*=2.;// Brightest at the head
            }
            
            // Add to overall drops effect
            drops+=dropBrightness;
        }
    }
    
    // Clamp the brightness
    drops=min(drops,1.);
    
    // Generate character pattern that changes over time
    float charPattern=0.;
    
    // Make characters change over time
    float charChangeSpeed=u_time*1.+cell.y*.5;// Different change rates
    float charIndex=floor(charChangeSpeed);
    
    // Interpolate between two characters for a smoother transition
    float char1=character(cellUV,charIndex);
    float char2=character(cellUV,charIndex+1.);
    float charMix=smoothstep(0.,1.,fract(charChangeSpeed));
    
    charPattern=mix(char1,char2,charMix);
    
    // Combine character with the rain drop effect
    float finalPattern=charPattern*drops;
    
    // Create color based on the pattern
    vec3 green=vec3(0.,1.,.4);// Matrix green
    vec3 brightGreen=vec3(.4,1.,.8);// Brighter green for heads
    
    // Color variation - slightly different color for each column
    vec3 columnColor=mix(
        green,
        brightGreen,
        columnSeed*.5
    );
    
    // Add color to the pattern
    finalColor=columnColor*finalPattern;
    
    // Glow effect
    float glow=drops*.5;// Subtle glow based on drop brightness
    finalColor+=columnColor*glow*.5;
    
    // Add background color
    vec3 bgColor=vec3(0.,.05,.02);// Dark green/black
    finalColor+=bgColor;
    
    // Add scan lines
    float scanLine=sin(gl_FragCoord.y*.5)*.5+.5;
    scanLine=pow(scanLine,8.)*.04;
    finalColor+=vec3(0.,scanLine,scanLine*.5);
    
    // Add vertical screen gradient
    finalColor*=.85+.15*smoothstep(0.,1.,1.-uv.y);
    
    // Add slight CRT effect with edge darkening
    float vignetteX=abs(uv.x-.5)*2.;
    float vignetteY=abs(uv.y-.5)*2.;
    float vignette=1.-pow(vignetteX,2.)-pow(vignetteY,2.)*.5;
    vignette=smoothstep(0.,.5,vignette);
    
    finalColor*=vignette;
    
    // Add slight aberration near the edges
    float aberration=(1.-vignette)*.05;
    finalColor.r+=aberration;
    finalColor.b-=aberration;
    
    // Add randomly triggered glitches
    float glitchTime=floor(u_time*2.);
    float glitchSeed=hash(glitchTime);
    
    if(glitchSeed>.9){// 10% chance of glitch
        float glitchPos=hash(glitchTime+1.);
        float glitchWidth=hash(glitchTime+2.)*.2;
        
        if(abs(uv.y-glitchPos)<glitchWidth){
            // Offset the x position for a horizontal glitch
            uv.x+=(hash(uv.y+glitchTime)-.5)*.1;
            // Re-calculate the cell position with the new UV
            vec2 glitchCellUV=fract(vec2(uv.x*columns,uv.y*rows));
            // Generate a new character pattern
            float glitchChar=character(glitchCellUV,glitchTime*10.);
            // Apply the glitch
            finalColor=mix(finalColor,vec3(1.,1.,1.)*glitchChar,.5);
        }
    }
    
    // Output final color
    gl_FragColor=vec4(finalColor,1.);
}