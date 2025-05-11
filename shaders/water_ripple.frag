// Water Ripple
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

void main(){
    vec2 uv=(gl_FragCoord.xy-.5*u_resolution.xy)/u_resolution.y;
    float r=length(uv);
    float ripple=.5+.5*sin(20.*r-u_time*4.);
    float mask=smoothstep(.4,.6,ripple);
    vec3 col=mix(vec3(.1,.2,.5),vec3(.7,.9,1.),mask);
    gl_FragColor=vec4(col,1.);
}