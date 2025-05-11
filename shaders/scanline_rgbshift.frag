// Scanline RGB Shift
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float scan = 0.5 + 0.5 * sin(uv.y * 400.0 + u_time * 8.0);
    float shift = 0.01 * sin(u_time * 2.0 + uv.y * 40.0);
    float r = smoothstep(0.4, 0.6, fract(uv.x + shift));
    float g = smoothstep(0.4, 0.6, fract(uv.x));
    float b = smoothstep(0.4, 0.6, fract(uv.x - shift));
    vec3 col = vec3(r, g, b) * scan;
    gl_FragColor = vec4(col, 1.0);
} 