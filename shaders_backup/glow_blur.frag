// Glow Blur
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

float blur(vec2 uv,float t){
    float sum=0.;
    for(int i=-2;i<=2;i++){
        for(int j=-2;j<=2;j++){
            vec2 offset=vec2(float(i),float(j))*.005;
            sum+=exp(-length(offset)*10.)*(.5+.5*sin(uv.x*10.+uv.y*10.+t));
        }
    }
    return sum/25.;
}

void main(){
    vec2 uv=gl_FragCoord.xy/u_resolution.xy;
    float t=u_time*.7;
    float g=blur(uv,t);
    vec3 col=mix(vec3(.1,.1,.2),vec3(1.,.8,.2),g);
    gl_FragColor=vec4(col,1.);
}