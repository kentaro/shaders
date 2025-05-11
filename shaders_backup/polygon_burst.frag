// Polygon Burst Shader
// This shader creates shapes that burst outward and rotate

#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

float shape(vec2 pos, float sides, float size, float edge) {
    float angle = atan(pos.y, pos.x);
    float radius = length(pos);
    float slice = 3.14159 * 2.0 / sides;
    float dist = abs(mod(angle + slice / 2.0, slice) - slice / 2.0);
    dist = min(dist, edge);
    float s = 1.0 - smoothstep(size - edge, size, radius);
    s *= smoothstep(dist - 0.01, dist, 0.1);
    return s;
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    vec3 color = vec3(0.0);
    for (float i = 0.0; i < 5.0; i++) {
        float t = u_time * (0.5 + i * 0.1) + i * 1.5;
        float burst = pow(mod(t, 3.0) / 3.0, 0.5);
        float rot = t * 0.5;
        vec2 pos = vec2(
            uv.x * cos(rot) - uv.y * sin(rot),
            uv.x * sin(rot) + uv.y * cos(rot)
        );
        pos /= 0.2 + burst * 1.5;
        float sides = 3.0 + i;
        float s = shape(pos, sides, 0.4, 0.1);
        vec3 shapeColor = 0.5 + 0.5 * cos(vec3(i * 0.5 + 0.0, i * 0.5 + 0.4, i * 0.5 + 1.0) + t);
        color += s * shapeColor * (1.0 - burst * 0.5);
    }
    gl_FragColor = vec4(color, 1.0);
}