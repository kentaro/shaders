// ⚛️ Plasma Pulse
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

void main(){
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    float r=length(uv);
    float a=atan(uv.y,uv.x);
    float v=sin(10.*r-u_time*4.)+cos(8.*a+u_time*2.);
    float pulse=smoothstep(1.2,1.5,abs(v));
    vec3 col=.5+.5*cos(u_time+vec3(0.,2.,4.)+v*2.);
    gl_FragColor=vec4(col*pulse,1.);
}