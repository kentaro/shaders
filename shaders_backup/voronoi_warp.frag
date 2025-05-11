// ボロノイワープシェーダー
// 時間に応じて変化するボロノイパターンとワープ効果

#ifdef GL_ES
precision highp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

#define PI 3.14159265359
#define CELLS 12.

// 2D乱数関数
vec2 random2(vec2 p){
    return fract(sin(vec2(
                dot(p,vec2(127.1,311.7)),
                dot(p,vec2(269.5,183.3))
            ))*43758.5453);
        }
        
        // ボロノイパターン生成関数
        float voronoi(vec2 p){
            vec2 i_st=floor(p);
            vec2 f_st=fract(p);
            
            float m_dist=1.;// 最小距離の初期値
            vec2 m_point;// 最近セルのポイント
            
            // 隣接セルを調査
            for(int j=-1;j<=1;j++){
                for(int i=-1;i<=1;i++){
                    vec2 neighbor=vec2(float(i),float(j));
                    
                    // ランダムポイントの位置
                    vec2 point=random2(i_st+neighbor);
                    
                    // アニメーション：ポイントを時間に応じて動かす
                    point=.5+.5*sin(u_time*.7+6.2831*point);
                    
                    // 現在の点との距離を計算
                    vec2 diff=neighbor+point-f_st;
                    float dist=length(diff);
                    
                    // 最短距離を更新
                    if(dist<m_dist){
                        m_dist=dist;
                        m_point=point;
                    }
                }
            }
            
            return m_dist;
        }
        
        // ワープ関数
        vec2 warp(vec2 p,float strength){
            // 複数の異なるスケールでボロノイパターンを生成
            float n1=voronoi(p*1.);
            float n2=voronoi(p*2.+.5);
            
            // ボロノイノイズを使ってUV座標をワープ
            vec2 warpedUV=p+strength*vec2(
                sin(n1*PI*2.+u_time),
                cos(n2*PI*2.+u_time*.8)
            );
            
            return warpedUV;
        }
        
        void main(){
            // アスペクト比を考慮した座標系
            vec2 uv=gl_FragCoord.xy/u_resolution.xy;
            uv.x*=u_resolution.x/u_resolution.y;
            
            // 時間によるアニメーションコントロール
            float t=u_time*.2;
            
            // 複数回のワープ効果適用
            float warpStrength=.1+.05*sin(t);
            vec2 warpedUV=uv;
            
            // 段階的なワープ適用でより複雑な動きを生成
            for(int i=0;i<3;i++){
                float scale=6.+float(i)*3.;
                warpedUV=warp(warpedUV,warpStrength/float(i+1));
            }
            
            // ボロノイセルを計算
            vec2 st=warpedUV*CELLS;
            
            // 主要なボロノイパターン（異なるスケール）
            float v1=voronoi(st);
            float v2=voronoi(st*2.);
            float v3=voronoi(st*.5);
            
            // エッジを強調したボロノイパターン
            float cells=smoothstep(0.,.3,v1);
            float edges=1.-smoothstep(.05,.1,v1);
            
            // ダイナミックなカラーグラデーション
            vec3 color1=mix(
                vec3(0.,.4,.8),// 青
                vec3(.8,0.,.7),// マゼンタ
                sin(v2*5.+t)*.5+.5
            );
            
            vec3 color2=mix(
                vec3(.9,.7,.1),// 黄
                vec3(0.,.8,.5),// ターコイズ
                cos(v3*4.-t*2.)*.5+.5
            );
            
            // エッジと内部の色を組み合わせる
            vec3 finalColor=mix(
                color1*cells,
                color2,
                edges
            );
            
            // 波紋効果を加える
            float ripple=sin(length(uv-.5)*15.-u_time*2.)*.5+.5;
            ripple*=.15*(1.-length(uv-.5));
            
            // 光彩効果
            float glow=.06/length(uv-.5);
            glow*=.15*(.5+.5*sin(u_time));
            
            // 最終カラー合成
            finalColor+=color2*ripple;
            finalColor+=vec3(.9,.4,.1)*glow;
            
            // トーンマッピング（HDR風に見せる効果）
            finalColor=finalColor/(1.+finalColor);
            
            // ビネット（周辺減光）効果
            float vignette=1.-length(uv-.5)*.8;
            vignette=smoothstep(0.,1.,vignette);
            finalColor*=vignette;
            
            // ガンマ補正
            finalColor=pow(finalColor,vec3(.8));
            
            // 最終的な色を出力
            gl_FragColor=vec4(finalColor,1.);
        }