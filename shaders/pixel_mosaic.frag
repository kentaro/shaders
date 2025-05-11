// Pixel Mosaic
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

void main(){
    float scale=32.+16.*sin(u_time*.7);
    vec2 uv=floor(gl_FragCoord.xy/u_resolution.xy*scale)/scale;
    float t=u_time*.8;
    vec3 col=.5+.5*cos(vec3(0.,2.,4.)+uv.x*8.+uv.y*8.+t);
    gl_FragColor=vec4(col,1.);
}