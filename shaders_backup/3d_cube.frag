// 3D Cube
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

float box(vec2 uv,float size){
    vec2 b=step(size,abs(uv));
    return 1.-max(b.x,b.y);
}

void main(){
    vec2 uv=(gl_FragCoord.xy-.5*u_resolution.xy)/u_resolution.y;
    float t=u_time*.5;
    float angle=t;
    mat2 rot=mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
    uv=rot*uv;
    float cube=box(uv,.3);
    float shade=.5+.5*sin(u_time+uv.x*8.+uv.y*8.);
    vec3 col=mix(vec3(.1,.1,.2),vec3(1.,.8,.2),cube*shade);
    gl_FragColor=vec4(col,1.);
}