// Neon Pulse Shader
// This shader creates a pulsating circular wave effect with neon colors

#ifdef GL_ES
// Sets the floating point precision for better performance on mobile devices
precision mediump float;
#endif

// Uniforms are values passed from the CPU to the GPU
uniform float u_time;// Time in seconds since the shader started
uniform vec2 u_resolution;// Width and height of the canvas in pixels

void main(){
    // Calculate normalized device coordinates (NDC) centered at (0,0)
    // - Divide by resolution to normalize coordinates to 0.0-1.0 range
    // - Subtract 0.5 to move the origin to the center of the screen
    vec2 uv=(gl_FragCoord.xy/u_resolution.xy)-.5;
    
    // Calculate the distance from the center of the screen
    // - This creates a circular gradient from center (0) to edges (0.5+)
    float d=length(uv);
    
    // Create a pulsating wave effect
    // - u_time*4 controls the speed of the pulse
    // - d*20 creates multiple concentric rings that move outward
    // - The sine function creates the wave pattern (-1 to 1)
    float pulse=sin(u_time*4.-d*20.);
    
    // Blend between dark blue and pink colors based on the pulse value
    // - pulse*.5+.5 converts the -1 to 1 range to 0 to 1 for color blending
    // - Dark blue (0,0,.2) represents the "off" state
    // - Bright pink (1,0,.6) represents the "on" state
    vec3 col=mix(vec3(0.,0.,.2),vec3(1.,0.,.6),pulse*.5+.5);
    
    // Output the final color with alpha=1 (fully opaque)
    gl_FragColor=vec4(col,1.);
}