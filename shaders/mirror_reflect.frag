// Mirror Reflect
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

void main(){
    vec2 uv=(gl_FragCoord.xy-.5*u_resolution.xy)/u_resolution.y;
    uv=abs(uv);
    float r=length(uv);
    float reflect=sin(20.*r-u_time*2.);
    float mask=smoothstep(.3,.7,reflect*.5+.5);
    vec3 col=.5+.5*cos(vec3(0.,2.,4.)+reflect*6.+u_time);
    gl_FragColor=vec4(col*mask,1.);
}