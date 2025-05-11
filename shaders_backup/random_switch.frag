// Random Switch
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

float hash(float n){return fract(sin(n)*43758.5453);}

void main(){
    vec2 uv=gl_FragCoord.xy/u_resolution.xy;
    float t=floor(u_time*2.);
    float rnd=hash(t+floor(uv.x*8.)+floor(uv.y*8.)*8.);
    float mask=step(.5,rnd);
    vec3 col=mix(vec3(.2,.1,.3),vec3(.9,.8,.2),mask);
    gl_FragColor=vec4(col,1.);
}