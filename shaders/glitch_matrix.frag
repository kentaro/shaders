// Glitch Matrix
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

float hash(vec2 p){
    return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);
}

void main(){
    vec2 uv=gl_FragCoord.xy/u_resolution.xy;
    uv.y+=sin(u_time*2.+uv.x*40.)*.02;
    float glitch=step(.95,hash(floor(uv*40.+u_time*5.)));
    vec3 col=mix(vec3(.1,1.,.2),vec3(1.,.1,.3),glitch);
    col*=.5+.5*sin(u_time*10.+uv.y*40.);
    gl_FragColor=vec4(col,1.);
}