// 3D Polygon
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

float polygon(vec2 p,float n,float r){
    float a=atan(p.y,p.x);
    float d=cos(floor(.5+a/(6.28318/n))*(6.28318/n)-a)*length(p);
    return smoothstep(r,r-.02,d);
}

void main(){
    vec2 uv=(gl_FragCoord.xy-.5*u_resolution.xy)/u_resolution.y;
    float t=u_time*.5;
    float n=3.+5.*abs(sin(t));
    float poly=polygon(uv,n,.4);
    vec3 col=mix(vec3(.1,.1,.2),vec3(1.,.8,.2),poly);
    gl_FragColor=vec4(col,1.);
}