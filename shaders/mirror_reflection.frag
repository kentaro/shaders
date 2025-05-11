// Mirror Reflection
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

void main(){
    vec2 uv=(gl_FragCoord.xy-.5*u_resolution.xy)/u_resolution.y;
    uv.y=abs(uv.y);
    float r=length(uv);
    float a=atan(uv.y,uv.x);
    float pattern=.5+.5*cos(10.*r-u_time*2.+6.*a);
    vec3 col=.5+.5*cos(vec3(0.,2.,4.)+pattern*6.+u_time);
    gl_FragColor=vec4(col,1.);
}