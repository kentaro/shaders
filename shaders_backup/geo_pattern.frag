// Geo Pattern
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}

void main(){
    vec2 uv=gl_FragCoord.xy/u_resolution.xy;
    vec2 grid=floor(uv*10.);
    float rnd=hash(grid+floor(u_time));
    float shape=step(.5,rnd);
    float mask=smoothstep(.45,.55,fract(uv.x*10.+uv.y*10.+u_time));
    vec3 col=mix(vec3(.2,.2,.2),vec3(1.,.5,.2),shape*mask);
    gl_FragColor=vec4(col,1.);
}