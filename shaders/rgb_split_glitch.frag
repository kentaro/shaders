// RGB Split Glitch
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

float noise(vec2 p){
    return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);
}

void main(){
    vec2 uv=gl_FragCoord.xy/u_resolution.xy;
    float t=u_time*1.5;
    float n=noise(uv*10.+t);
    float glitch=step(.92,noise(floor(uv*40.+t*2.)));
    float offset=glitch*.03*n;
    
    float r=smoothstep(.4,.6,fract(uv.x+offset));
    float g=smoothstep(.4,.6,fract(uv.x));
    float b=smoothstep(.4,.6,fract(uv.x-offset));
    vec3 col=vec3(r,g,b);
    
    // ノイズで色を揺らす
    col*=.7+.3*n;
    gl_FragColor=vec4(col,1.);
}