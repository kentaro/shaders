// Strobe Flash
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

void main(){
    vec2 uv=gl_FragCoord.xy/u_resolution.xy;
    float strobe=step(.5,fract(u_time*8.));
    float flash=smoothstep(.45,.55,sin(u_time*20.));
    vec3 col=mix(vec3(0.),vec3(1.,1.,1.),strobe*flash);
    gl_FragColor=vec4(col,1.);
}