// Tunnel Vortex
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

void main(){
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    float t=u_time*.7;
    float r=length(uv);
    float a=atan(uv.y,uv.x);
    float tunnel=.5+.5*cos(10.*log(r+.2)-t*4.+4.*a);
    float spin=.5+.5*cos(a*8.-t*2.+r*8.);
    float mask=smoothstep(.2,.8,tunnel*spin);
    float glow=exp(-r*3.)*1.5;
    vec3 col=.5+.5*cos(vec3(0.,2.,4.)+t+a*2.+r*6.);
    gl_FragColor=vec4(col*mask*glow,1.);
}