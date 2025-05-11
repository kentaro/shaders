// 3D Spiral
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

void main(){
    vec2 uv=(gl_FragCoord.xy-.5*u_resolution.xy)/u_resolution.y;
    float r=length(uv);
    float a=atan(uv.y,uv.x);
    float spiral=sin(12.*r-8.*a-u_time*2.);
    float mask=smoothstep(.3,.7,spiral*.5+.5);
    vec3 col=.5+.5*cos(vec3(0.,2.,4.)+spiral*6.+u_time);
    gl_FragColor=vec4(col*mask,1.);
}