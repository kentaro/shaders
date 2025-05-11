// オーディオリアクティブグリッドシェーダー
// 音楽のビートに反応するグリッドパターン

#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
// 本来はオーディオ入力があるべきだが、デモのためにu_timeで代用
// uniform sampler2D u_audio; // オーディオテクスチャ

// 擬似ランダム関数
float random(vec2 st){
    return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);
}

// グリッドセルの生成関数
float cell(vec2 st,float size){
    return step(.1+size,fract(st.x))*step(.1+size,fract(st.y));
}

void main(){
    // 画面の解像度に合わせたアスペクト比の調整
    vec2 uv=gl_FragCoord.xy/u_resolution.xy;
    uv.x*=u_resolution.x/u_resolution.y;
    
    // ビートの周波数と強度（通常はオーディオデータから取得）
    // ここではu_timeを使用して擬似的なビート生成
    float bassBeat=pow(.5+.5*sin(u_time*2.),8.);
    float midBeat=pow(.5+.5*sin(u_time*4.+.2),4.);
    float highBeat=pow(.5+.5*sin(u_time*8.+.5),2.);
    
    // グリッドパターンの生成
    vec2 grid=uv*20.;
    vec2 gridId=floor(grid);
    vec2 gridUv=fract(grid);
    
    // 各グリッドセルにランダム値を割り当て
    float cellRandom=random(gridId);
    
    // ビートに反応する変形グリッドパターン
    float gridPattern=1.;
    
    // ベースビートに反応する大きいグリッドセル
    float bassCellSize=.05+bassBeat*.3;
    gridPattern*=1.-cell(grid*.5+vec2(u_time*.2,0.),bassCellSize);
    
    // ミッドビートに反応する中サイズのグリッドセル
    float midCellSize=.05+midBeat*.2;
    gridPattern*=1.-cell(grid*1.+vec2(0.,u_time*.3),midCellSize);
    
    // ハイビートに反応する小さいグリッドセル
    float highCellSize=.05+highBeat*.1;
    gridPattern*=1.-cell(grid*2.+vec2(u_time*-.4,u_time*.4),highCellSize);
    
    // 複雑なエフェクト
    // グリッドライン
    vec2 gridLine=smoothstep(0.,.05,gridUv)*smoothstep(0.,.05,1.-gridUv);
    float line=max(gridLine.x,gridLine.y);
    line=pow(line,1.-bassBeat*.8);// ベースビートでラインの太さが変化
    
    // ビートに反応する円形波紋
    float wave=length(uv-.5);
    wave=sin(wave*50.-u_time*4.)*.5+.5;
    wave*=midBeat;// ミッドビートで波紋の強度が変化
    
    // グリッドパターンの色
    vec3 gridColor=mix(
        vec3(.2,.6,.9),// 青色（ベース）
        vec3(.9,.2,.6),// マゼンタ（ミッド）
        sin(cellRandom*6.28+u_time)*.5+.5
    );
    
    // ラインの色
    vec3 lineColor=mix(
        vec3(.1,.9,1.),// シアン
        vec3(1.,.9,.1),// 黄色
        sin(u_time*2.)*.5+.5
    );
    
    // 波紋の色
    vec3 waveColor=vec3(1.,1.,1.);// 白
    
    // 最終的な色の計算
    vec3 finalColor=mix(
        gridColor*gridPattern,
        lineColor,
        line*(.3+highBeat*.7)
    );
    
    // 波紋を加える
    finalColor=mix(finalColor,waveColor,wave*.3);
    
    // ビートに合わせた全体の明るさ変調
    finalColor*=.8+bassBeat*.5;
    
    // 中心からの光彩効果
    float glow=1.-length(uv-.5)*1.;
    finalColor+=vec3(.8,.2,.6)*glow*midBeat*.3;
    
    // 最終的な色を出力
    gl_FragColor=vec4(finalColor,1.);
}