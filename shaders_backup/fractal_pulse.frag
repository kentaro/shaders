// Fractal Pulse
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

float mandelbrot(vec2 c){
    vec2 z=c;
    float m=0.;
    for(int i=0;i<8;i++){
        z=vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y)+c;
        m+=dot(z,z);
    }
    return exp(-m*.05);
}

void main(){
    vec2 uv=(gl_FragCoord.xy-.5*u_resolution.xy)/u_resolution.y;
    float t=u_time*.3;
    vec2 c=uv*1.5+vec2(sin(t),cos(t));
    float m=mandelbrot(c);
    float pulse=.5+.5*sin(u_time*2.+m*10.);
    vec3 col=.5+.5*cos(vec3(0.,2.,4.)+m*6.+u_time);
    gl_FragColor=vec4(col*pulse*m,1.);
}