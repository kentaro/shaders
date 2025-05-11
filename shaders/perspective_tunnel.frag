// Perspective Tunnel
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

void main(){
    vec2 uv=(gl_FragCoord.xy-.5*u_resolution.xy)/u_resolution.y;
    float t=u_time*.7;
    float r=length(uv);
    float a=atan(uv.y,uv.x);
    float tunnel=.5+.5*cos(20.*r-t*4.+8.*a);
    float mask=smoothstep(.3,.7,tunnel);
    vec3 col=.5+.5*cos(vec3(0.,2.,4.)+t+a*2.+r*6.);
    gl_FragColor=vec4(col*mask,1.);
}