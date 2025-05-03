// Burst Spiral Shader 5
// This shader creates hexagonal grid patterns that burst and rotate

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

// Hexagonal grid function
vec2 hexCoords(vec2 uv) {
    // Constants for hexagonal grid
    const float hexRatio = 0.866025; // sqrt(3)/2
    
    // Convert to hex grid space
    vec2 r = vec2(1.0, hexRatio);
    vec2 h = r * 0.5;
    
    vec2 a = mod(uv, r) - h;
    vec2 b = mod(uv - h, r) - h;
    
    // Select the closest hexagon center
    vec2 gv = length(a) < length(b) ? a : b;
    
    // Calculate hex position and local coordinates
    vec2 id = uv - gv;
    
    return vec2(gv.x, gv.y); // Local coordinates within the hex
}

// Distance to hexagon edge
float hexDist(vec2 p) {
    p = abs(p);
    return max(p.x, p.y * 1.15);
}

void main() {
    // Normalized coordinates
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    
    // Initialize color
    vec3 color = vec3(0.03, 0.04, 0.1); // Dark background
    
    // Number of burst layers
    const int numLayers = 6;
    
    // Create multiple bursting hexagon grids
    for(int i = 0; i < numLayers; i++) {
        float fi = float(i);
        
        // Time variables with phase offset
        float t = u_time * 0.6 + fi * 0.7;
        float cycle = mod(t, 3.0); // 3-second burst cycle
        
        // Burst effect
        float burst = 0.0;
        if(cycle < 1.5) {
            burst = pow(cycle / 1.5, 1.2); // Expanding
        } else {
            burst = pow(1.0 - (cycle - 1.5) / 1.5, 0.8); // Contracting
        }
        
        // Rotation angle
        float angle = t * (0.2 + fi * 0.05);
        
        // Rotate coordinates
        vec2 pos = vec2(
            uv.x * cos(angle) - uv.y * sin(angle),
            uv.x * sin(angle) + uv.y * cos(angle)
        );
        
        // Scale based on burst
        float zoom = 2.0 + burst * 5.0 + fi * 0.5;
        pos *= zoom;
        
        // Apply hex grid
        vec2 hex = hexCoords(pos);
        float d = hexDist(hex);
        
        // Create hexagonal cells with pulsing edges
        float pulse = sin(burst * 3.14159 * 2.0) * 0.5 + 0.5;
        float cell = smoothstep(0.2 + pulse * 0.1, 0.15 + pulse * 0.1, d);
        
        // Inner cutout for ring effect
        cell *= smoothstep(0.05, 0.1, d);
        
        // Color based on layer and time
        vec3 hexColor = 0.5 + 0.5 * cos(vec3(fi * 0.3 + 0.0, fi * 0.3 + 2.0, fi * 0.3 + 4.0) + t * 0.5);
        
        // Brightness falls off with expansion
        float brightness = 1.0 - (burst * 0.5);
        
        // Add to final color
        color += cell * hexColor * brightness * 0.6;
    }
    
    // Add bloom/glow effect
    float glow = pow(length(color), 2.0) * 0.25;
    color += glow * vec3(0.3, 0.4, 0.9);
    
    // Output final color
    gl_FragColor = vec4(color, 1.0);
} 