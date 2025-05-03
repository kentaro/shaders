// Cosmic Rays Shader
// This shader creates a visual of cosmic rays and energy beams in space

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

// Random hash function
float hash(float n) {
    return fract(sin(n) * 43758.5453);
}

// 1D noise
float noise(float p) {
    float fl = floor(p);
    float fc = fract(p);
    return mix(hash(fl), hash(fl + 1.0), fc);
}

// Function to create ray effect
float ray(vec2 uv, vec2 origin, float angle, float width, float fade) {
    // Convert ray direction to vector
    vec2 dir = vec2(cos(angle), sin(angle));
    
    // Get perpendicular distance from point to ray
    float dist = abs(dot(uv - origin, vec2(dir.y, -dir.x)));
    
    // Calculate dot product for fade along ray length
    float rayLength = dot(uv - origin, dir);
    
    // Create ray with smooth edges
    float ray = smoothstep(width, 0.0, dist);
    
    // Fade ray based on distance from origin
    ray *= smoothstep(0.0, fade, rayLength);
    
    // Add pulsing effect
    ray *= 0.5 + 0.5 * sin(rayLength * 10.0 - u_time * 5.0);
    
    return ray;
}

// Nebula background effect
vec3 nebula(vec2 uv, float time) {
    // Initialize color
    vec3 color = vec3(0.0);
    
    // Create multiple layers of noise
    for (int i = 0; i < 5; i++) {
        float fi = float(i);
        
        // Offset and rotate uvs
        vec2 offset = vec2(cos(time * 0.1 + fi), sin(time * 0.1 + fi)) * 0.3;
        
        // Create rotation matrix
        float angle = time * 0.05 + fi * 0.5;
        vec2 rotatedUV = vec2(
            uv.x * cos(angle) - uv.y * sin(angle),
            uv.x * sin(angle) + uv.y * cos(angle)
        );
        
        rotatedUV += offset;
        
        // Create cloud-like patterns
        float n = noise(rotatedUV.x * (3.0 + fi) + time * 0.2) * 
                 noise(rotatedUV.y * (2.0 + fi) - time * 0.1);
        n = pow(n, 1.5) * (0.4 + 0.6 * sin(time * 0.2 + fi));
        
        // Add colors - different for each layer
        vec3 layerColor = vec3(0.0);
        if (i == 0) layerColor = vec3(0.1, 0.0, 0.2); // Purple
        if (i == 1) layerColor = vec3(0.2, 0.0, 0.1); // Red-purple
        if (i == 2) layerColor = vec3(0.0, 0.1, 0.2); // Blue
        if (i == 3) layerColor = vec3(0.1, 0.2, 0.3); // Cyan
        if (i == 4) layerColor = vec3(0.2, 0.1, 0.0); // Orange
        
        color += n * layerColor * (0.6 + 0.4 * sin(time * 0.2 + fi * 2.0));
    }
    
    return color;
}

// Star field
float starField(vec2 uv, float time) {
    // Initialize star value
    float stars = 0.0;
    
    // Create multiple star layers
    for (int i = 0; i < 3; i++) {
        float scale = 500.0 + float(i) * 200.0;
        vec2 scaled = uv * scale;
        vec2 cell = floor(scaled);
        vec2 fract = fract(scaled);
        
        // Create twinkling effect
        for (int y = -1; y <= 1; y++) {
            for (int x = -1; x <= 1; x++) {
                vec2 cellOffset = vec2(float(x), float(y));
                vec2 cellPos = cell + cellOffset;
                
                // Get random position within cell
                float random = hash(cellPos.x * 123.4 + cellPos.y * 456.7);
                float size = fract(random * 345.7) * 0.04 + 0.004;
                
                // Random star brightness variation
                float brightness = pow(fract(random * 786.3), 10.0);
                brightness *= step(0.95, brightness); // Only keep the brightest stars
                
                // Flicker effect
                float flicker = sin(time * (random * 5.0) + random * 10.0) * 0.5 + 0.5;
                brightness *= pow(flicker, 3.0) * 0.6 + 0.4;
                
                // Calculate star
                vec2 pos = cellOffset + vec2(random, fract(random * 43.8)) - fract;
                float dist = length(pos);
                float star = brightness * smoothstep(size, 0.0, dist);
                
                stars += star;
            }
        }
    }
    
    return stars;
}

void main() {
    // Normalize coordinates with aspect ratio correction
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    
    // Animation time
    float time = u_time * 0.5;
    
    // Initialize color with deep space
    vec3 color = vec3(0.01, 0.0, 0.03);
    
    // Add nebula background
    color += nebula(uv, time) * 0.5;
    
    // Add stars
    color += vec3(0.8, 0.9, 1.0) * starField(uv, time);
    
    // Define cosmic ray parameters
    int rayCount = 15;
    for (int i = 0; i < rayCount; i++) {
        float fi = float(i);
        float randomOffset = hash(fi * 1234.5);
        
        // Create ray parameters with variation
        float rayTime = time + randomOffset * 10.0;
        float raySpeed = 0.3 + hash(fi * 45.6) * 0.7;
        float rayAngle = 2.0 * 3.14159 * hash(fi * 789.0) + rayTime * raySpeed * 0.2;
        float rayWidth = 0.01 + 0.02 * hash(fi * 123.4);
        float rayFade = 2.0 + hash(fi * 567.8) * 2.0;
        
        // Calculate ray origin (off-screen)
        float originDist = 2.0 + hash(fi * 91.2) * 1.0;
        vec2 origin = vec2(cos(rayAngle + 3.14159), sin(rayAngle + 3.14159)) * originDist;
        
        // Create different colored rays
        vec3 rayColor;
        float colorSeed = hash(fi * 333.7);
        if (colorSeed < 0.2) {
            rayColor = vec3(0.8, 0.2, 0.1); // Red
        } else if (colorSeed < 0.4) {
            rayColor = vec3(0.1, 0.3, 0.9); // Blue
        } else if (colorSeed < 0.6) {
            rayColor = vec3(0.9, 0.5, 0.1); // Orange
        } else if (colorSeed < 0.8) {
            rayColor = vec3(0.6, 0.2, 0.9); // Purple
        } else {
            rayColor = vec3(0.2, 0.9, 0.8); // Cyan
        }
        
        // Add glow effect along ray
        float r = ray(uv, origin, rayAngle, rayWidth, rayFade);
        
        // Add ray to final color
        color += rayColor * r * (0.5 + 0.5 * sin(rayTime));
        
        // Add small energy bursts along ray path
        int burstCount = 3;
        for (int b = 0; b < burstCount; b++) {
            float fb = float(b);
            float burstPos = hash(fi * 56.7 + fb * 89.1);
            float burstTime = time * 2.0 + hash(fi * 12.3 + fb * 45.6) * 10.0;
            
            // Position burst along ray
            vec2 burstOrigin = origin + vec2(cos(rayAngle), sin(rayAngle)) * rayFade * burstPos;
            
            // Create pulsing burst
            float burstSize = 0.05 + 0.05 * sin(burstTime);
            float burst = 0.0;
            
            // Only show burst if it's within screen bounds
            if (abs(burstOrigin.x) < 1.5 && abs(burstOrigin.y) < 1.5) {
                burst = burstSize / length(uv - burstOrigin);
                burst *= 0.5 + 0.5 * sin(burstTime * 5.0);
                
                // Add burst to final color
                color += rayColor * burst * 0.1;
            }
        }
    }
    
    // Add central glow effect
    float center = 0.1 / length(uv);
    color += vec3(0.5, 0.3, 0.9) * center * 0.2 * (0.8 + 0.2 * sin(time));
    
    // Output final color
    gl_FragColor = vec4(color, 1.0);
} 