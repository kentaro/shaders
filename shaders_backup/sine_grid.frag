// Sine Grid
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float gx = sin(uv.x * 20.0 + u_time * 2.0);
    float gy = sin(uv.y * 20.0 - u_time * 2.0);
    float grid = abs(gx) + abs(gy);
    float mask = smoothstep(1.8, 2.0, grid);
    vec3 col = mix(vec3(0.0, 0.2, 0.8), vec3(1.0, 0.8, 0.2), mask);
    gl_FragColor = vec4(col, 1.0);
} 