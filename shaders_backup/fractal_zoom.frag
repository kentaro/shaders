// フラクタルズームシェーダー
// マンデルブロ集合をベースにしたダイナミックなビジュアル効果

#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

#define MAX_ITERATIONS 100
#define ZOOM_SPEED .5

void main(){
    // 画面の中心を原点とした正規化座標
    vec2 uv=(gl_FragCoord.xy-.5*u_resolution.xy)/min(u_resolution.x,u_resolution.y);
    
    // 時間に応じたズーム効果
    float zoom=exp(u_time*ZOOM_SPEED);
    
    // ズームの中心座標
    vec2 center=vec2(
        -.745+.2*sin(u_time*.1),
        .186+.1*cos(u_time*.15)
    );
    
    // ズームと位置調整
    vec2 c=center+uv/zoom;
    
    // マンデルブロ集合計算の初期値
    vec2 z=vec2(0.);
    
    // 色の基本値
    vec3 color=vec3(0.);
    
    // フラクタル計算
    int iterations=0;
    for(int i=0;i<MAX_ITERATIONS;i++){
        // z = z^2 + c (複素数演算)
        z=vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y)+c;
        
        if(dot(z,z)>4.)break;
        iterations=i;
    }
    
    // エスケープタイムを正規化して色を計算
    if(iterations<MAX_ITERATIONS-1){
        float smoothColor=float(iterations)+1.-log(log(dot(z,z)))/log(2.);
        smoothColor=smoothColor/float(MAX_ITERATIONS);
        
        // 時間によって変化するカラーパレット
        float angle=u_time*.2;
        vec3 colorA=vec3(.5+.5*sin(angle),.5+.5*sin(angle+2.1),.5+.5*sin(angle+4.2));
        vec3 colorB=vec3(.5+.5*sin(angle+1.),.5+.5*sin(angle+3.1),.5+.5*sin(angle+5.2));
        
        color=mix(colorA,colorB,smoothColor);
        
        // フラクタルのエッジを強調
        float edge=abs(sin(smoothColor*50.+u_time*2.));
        color=mix(color,vec3(1.),edge*.3);
    }
    
    // 最終的な色を出力
    gl_FragColor=vec4(color,1.);
}