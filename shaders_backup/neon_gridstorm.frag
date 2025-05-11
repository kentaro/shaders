// 🌩️ Neon Gridstorm
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

void main(){
    vec2 uv=(gl_FragCoord.xy*2.-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    float grid=abs(sin(uv.x*20.+u_time*2.))+abs(sin(uv.y*20.-u_time*2.));
    float flash=smoothstep(1.8,2.,grid+sin(u_time*10.));
    vec3 col=mix(vec3(0.,.8,1.),vec3(1.,0.,1.),flash);
    gl_FragColor=vec4(col,1.);
}