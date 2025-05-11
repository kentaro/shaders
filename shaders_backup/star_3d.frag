// 3D Star
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

float star(vec2 p, float t) {
    float a = atan(p.y, p.x);
    float r = length(p);
    float s = abs(sin(5.0 * a + t));
    return smoothstep(0.3, 0.28, abs(r - 0.4 * s));
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    float t = u_time * 0.7;
    float s = star(uv, t);
    vec3 col = mix(vec3(0.1, 0.1, 0.2), vec3(1.0, 0.8, 0.2), s);
    gl_FragColor = vec4(col, 1.0);
} 