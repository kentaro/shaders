// Random Pattern
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 grid = floor(uv * 8.0);
    float rnd = hash(grid + floor(u_time));
    float mask = step(0.5, rnd);
    vec3 col = mix(vec3(0.1, 0.1, 0.1), vec3(1.0, 0.8, 0.2), mask);
    gl_FragColor = vec4(col, 1.0);
} 