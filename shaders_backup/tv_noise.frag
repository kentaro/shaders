// TV Noise
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

float noise(vec2 p){
    return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);
}

void main(){
    vec2 uv=gl_FragCoord.xy/u_resolution.xy;
    float n=noise(uv*100.+u_time*10.);
    vec3 col=vec3(n);
    gl_FragColor=vec4(col,1.);
}