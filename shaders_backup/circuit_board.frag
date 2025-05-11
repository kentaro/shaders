// Circuit Board
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

float box(vec2 uv,vec2 size){
    vec2 b=step(size,abs(uv));
    return 1.-max(b.x,b.y);
}

void main(){
    vec2 uv=(gl_FragCoord.xy/u_resolution.xy)*2.-1.;
    float t=u_time*.5;
    float grid=step(.95,abs(sin(uv.x*20.+t))*abs(sin(uv.y*20.-t)));
    float trace=box(fract(uv*5.+t),vec2(.1,.02));
    vec3 col=mix(vec3(.1,.2,.1),vec3(.2,1.,.2),grid*trace);
    gl_FragColor=vec4(col,1.);
}