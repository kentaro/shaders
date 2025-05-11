// エレクトリックプラズマシェーダー
// 電気的な動きのあるプラズマエフェクト

#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

// ノイズ関数
float hash(vec2 p){
    p=fract(p*vec2(123.34,456.21));
    p+=dot(p,p+45.32);
    return fract(p.x*p.y);
}

// 複雑な値ノイズ
float valueNoise(vec2 p){
    vec2 i=floor(p);
    vec2 f=fract(p);
    f=f*f*(3.-2.*f);
    
    float n00=hash(i);
    float n01=hash(i+vec2(0.,1.));
    float n10=hash(i+vec2(1.,0.));
    float n11=hash(i+vec2(1.,1.));
    
    float n0=mix(n00,n01,f.y);
    float n1=mix(n10,n11,f.y);
    
    return mix(n0,n1,f.x);
}

float fbm(vec2 p){
    float sum=0.;
    float amp=.5;
    float freq=1.;
    
    // 複数のノイズレイヤーを重ねる
    for(int i=0;i<6;i++){
        sum+=valueNoise(p*freq)*amp;
        freq*=2.;
        amp*=.5;
        p=vec2(p.y-p.x*.5,p.x+p.y*.5);
    }
    
    return sum;
}

void main(){
    // 正規化された座標
    vec2 uv=gl_FragCoord.xy/u_resolution.xy;
    uv=uv*2.-1.;
    uv.x*=u_resolution.x/u_resolution.y;
    
    // 中心からの距離
    float d=length(uv);
    
    // 時間によって変化する乱流
    float t=u_time*.3;
    vec2 p=uv*3.;
    
    // 複雑なプラズマパターン
    float plasma=fbm(p+vec2(cos(t*.7),sin(t*.6))*2.);
    plasma+=fbm(p*2.5+vec2(cos(t*.3),sin(t*.5))*1.)*.5;
    
    // 電気的な閃光効果
    float flash=pow(max(0.,.7-d),2.)*(.5+.5*sin(u_time*5.));
    
    // エッジに沿った電光
    float edge=pow(max(0.,1.-abs(d-.6)*5.),5.);
    edge*=(.5+.5*sin(plasma*10.+u_time*3.));
    
    // カラーミックス
    vec3 color1=vec3(.1,.3,1.);// 青
    vec3 color2=vec3(.8,.1,1.);// 紫
    vec3 color3=vec3(1.,.9,.1);// 黄
    
    // プラズマカラー
    vec3 plasmaColor=mix(color1,color2,plasma);
    
    // フラッシュと電光エフェクト
    vec3 flashColor=mix(plasmaColor,color3,flash+edge);
    
    // 最終的な色の調整（コントラストと彩度を上げる）
    flashColor=pow(flashColor,vec3(.8));// コントラスト調整
    
    // 最終的な色を出力
    gl_FragColor=vec4(flashColor,1.);
}