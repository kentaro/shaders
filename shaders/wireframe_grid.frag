// Wireframe Grid
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

float grid(vec2 uv, float scale) {
    vec2 gv = fract(uv * scale) - 0.5;
    float d = min(abs(gv.x), abs(gv.y));
    return smoothstep(0.02, 0.01, d);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float t = u_time * 0.5;
    float g = grid(uv + vec2(sin(t), cos(t)), 10.0 + 5.0 * sin(t));
    vec3 col = mix(vec3(0.1, 0.1, 0.1), vec3(0.8, 1.0, 0.2), g);
    gl_FragColor = vec4(col, 1.0);
} 