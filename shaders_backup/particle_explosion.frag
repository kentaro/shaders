// Particle Explosion
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

float hash(float n) { return fract(sin(n) * 43758.5453); }

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    float t = u_time * 0.8;
    float colSum = 0.0;
    for (int i = 0; i < 16; i++) {
        float fi = float(i);
        float angle = fi * 6.28318 / 16.0 + t;
        float dist = 0.3 + 0.5 * hash(fi + floor(t));
        vec2 p = vec2(cos(angle), sin(angle)) * dist;
        float d = length(uv - p);
        colSum += exp(-d * 40.0);
    }
    vec3 col = 0.5 + 0.5 * cos(vec3(0.0, 2.0, 4.0) + u_time + colSum * 2.0);
    gl_FragColor = vec4(col * colSum, 1.0);
} 