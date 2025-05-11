// 📺 Chroma Glitch
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

void main(){
    vec2 uv=gl_FragCoord.xy/u_resolution.xy;
    float offset=sin(u_time*5.+uv.y*40.)*.01;
    float r=smoothstep(.4,.6,fract(uv.x+offset));
    float g=smoothstep(.4,.6,fract(uv.x));
    float b=smoothstep(.4,.6,fract(uv.x-offset));
    float glitch=step(.95,fract(sin(dot(uv,vec2(12.9898,78.233)))*43758.5453+u_time));
    vec3 col=vec3(r,g,b)*(1.-glitch)+glitch*vec3(1.,0.,0.);
    gl_FragColor=vec4(col,1.);
}