// Pulse Ring
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

void main(){
    vec2 uv=(gl_FragCoord.xy-.5*u_resolution.xy)/u_resolution.y;
    float r=length(uv);
    float pulse=.5+.5*sin(u_time*4.-r*12.);
    float ring=smoothstep(.4,.42,abs(r-.5+.1*pulse));
    vec3 col=mix(vec3(.1,.1,.2),vec3(1.,.8,.2),ring);
    gl_FragColor=vec4(col,1.);
}