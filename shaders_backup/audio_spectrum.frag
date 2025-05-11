// Audio Spectrum
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

float spectrum(vec2 uv,float t){
    float band=floor(uv.x*16.);
    float y=.5+.5*sin(u_time*2.+band*.5+t*3.);
    return step(uv.y,y);
}

void main(){
    vec2 uv=gl_FragCoord.xy/u_resolution.xy;
    float t=u_time*.5;
    float s=spectrum(uv,t);
    vec3 col=mix(vec3(.1,.1,.2),vec3(.2,1.,.5),s);
    col*=.7+.3*sin(u_time+uv.x*10.);
    gl_FragColor=vec4(col,1.);
}