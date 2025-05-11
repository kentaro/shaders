// 3D Sphere
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

void main(){
    vec2 uv=(gl_FragCoord.xy-.5*u_resolution.xy)/u_resolution.y;
    float r=length(uv);
    float sphere=smoothstep(.5,.48,r);
    float shade=.5+.5*dot(normalize(vec3(uv,sqrt(1.-r*r))),normalize(vec3(-.5,.5,1.)));
    vec3 col=mix(vec3(.1,.1,.2),vec3(.8,.9,1.),sphere*shade);
    gl_FragColor=vec4(col,1.);
}