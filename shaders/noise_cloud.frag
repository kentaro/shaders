// Noise Cloud
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float t = u_time * 0.2;
    float n = noise(uv * 8.0 + t) + noise(uv * 16.0 - t) * 0.5;
    vec3 col = mix(vec3(0.1, 0.1, 0.2), vec3(1.0, 0.8, 0.2), n);
    gl_FragColor = vec4(col, 1.0);
} 