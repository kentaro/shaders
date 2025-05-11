// RGB Scanline
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

void main(){
    vec2 uv=gl_FragCoord.xy/u_resolution.xy;
    float scan=step(.5,fract(uv.y*100.+u_time*10.));
    float shift=sin(u_time*2.+uv.y*40.)*.01;
    float r=smoothstep(.4,.6,fract(uv.x+shift));
    float g=smoothstep(.4,.6,fract(uv.x));
    float b=smoothstep(.4,.6,fract(uv.x-shift));
    vec3 col=vec3(r,g,b)*scan;
    gl_FragColor=vec4(col,1.);
}