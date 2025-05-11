// Random Shapes
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}

void main(){
    vec2 uv=gl_FragCoord.xy/u_resolution.xy;
    float t=u_time*.5;
    vec2 grid=floor(uv*8.);
    float rnd=hash(grid+floor(t));
    float shape=step(.5,rnd);
    float mask=smoothstep(.45,.55,fract(uv.x*8.)*shape+fract(uv.y*8.)*(1.-shape));
    vec3 col=mix(vec3(.2,.1,.3),vec3(.9,.8,.2),mask);
    gl_FragColor=vec4(col,1.);
}