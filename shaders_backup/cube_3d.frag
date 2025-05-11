// 3D Cube
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

float box(vec2 p, float size) {
    vec2 d = abs(p) - size;
    return 1.0 - step(0.0, max(d.x, d.y));
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    float t = u_time * 0.5;
    float angle = t;
    mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    uv = rot * uv;
    float cube = box(uv, 0.3);
    vec3 col = mix(vec3(0.1, 0.1, 0.2), vec3(0.8, 0.9, 1.0), cube);
    gl_FragColor = vec4(col, 1.0);
} 