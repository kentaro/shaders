// Sinewave Grid
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

void main(){
    vec2 uv=gl_FragCoord.xy/u_resolution.xy;
    float t=u_time*.7;
    float grid=abs(sin(uv.x*20.+t))*abs(sin(uv.y*20.-t));
    float mask=smoothstep(.7,.9,grid);
    vec3 col=mix(vec3(.1,.1,.2),vec3(.2,.8,1.),mask);
    gl_FragColor=vec4(col,1.);
}