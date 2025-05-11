// Stripe Random
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

float hash(float n){return fract(sin(n)*43758.5453);}

void main(){
    vec2 uv=gl_FragCoord.xy/u_resolution.xy;
    float t=floor(u_time*2.);
    float stripe=floor(uv.x*16.);
    float rnd=hash(stripe+t);
    vec3 col=.5+.5*cos(vec3(0.,2.,4.)+rnd*6.+u_time);
    gl_FragColor=vec4(col,1.);
}