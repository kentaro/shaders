// Kaleido Star
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

void main(){
    vec2 uv=(gl_FragCoord.xy-.5*u_resolution.xy)/u_resolution.y;
    float r=length(uv);
    float a=atan(uv.y,uv.x);
    float k=abs(sin(6.*a+u_time*1.5));
    float star=smoothstep(.3,.7,k*(1.-r));
    vec3 col=.5+.5*cos(vec3(0.,2.,4.)+k*8.+u_time);
    gl_FragColor=vec4(col*star,1.);
}