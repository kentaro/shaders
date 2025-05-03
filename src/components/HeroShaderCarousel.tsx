"use client";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useShaderStore } from "./store";

interface Props {
    slugs: string[];
}

// キャンバスを基にしたシェーダーシミュレーション
function Canvas2DShader({ slug }: { slug: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);
    const startTimeRef = useRef<number>(Date.now());
    const codes = useShaderStore(s => s.codes);
    const shaderCode = codes[slug] || "";

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // ウィンドウサイズ変更時にキャンバスサイズも更新
        const handleResize = () => {
            if (!canvas) return;
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        const animate = () => {
            if (!canvas || !ctx) return;

            // 経過時間を計算
            const elapsedTime = (Date.now() - startTimeRef.current) / 1000;

            // シェーダーのレンダリング
            // 既存のハードコードされたシェーダーはそのまま使用
            if (slug === 'rainbow' || shaderCode.includes('Rainbow Flow')) {
                renderRainbowShader(ctx, canvas.width, canvas.height, elapsedTime);
            } else if (slug === 'tunnel' || shaderCode.includes('Tunnel Drive')) {
                renderTunnelShader(ctx, canvas.width, canvas.height, elapsedTime);
            } else if (slug === 'pulse' || shaderCode.includes('Neon Pulse')) {
                renderPulseShader(ctx, canvas.width, canvas.height, elapsedTime);
            }
            // 追加のシェーダー処理（シェーダータイプごとに識別）
            else if (slug === 'fractal_zoom' || shaderCode.includes('Fractal Zoom')) {
                renderFractalZoomShader(ctx, canvas.width, canvas.height, elapsedTime);
            } else if (slug === 'electric_plasma' || shaderCode.includes('Electric Plasma')) {
                renderElectricPlasmaShader(ctx, canvas.width, canvas.height, elapsedTime);
            } else if (slug === 'audio_reactive_grid' || shaderCode.includes('Audio Grid')) {
                renderAudioGridShader(ctx, canvas.width, canvas.height, elapsedTime);
            } else if (slug === 'kaleidoscope' || shaderCode.includes('Kaleidoscope')) {
                renderKaleidoscopeShader(ctx, canvas.width, canvas.height, elapsedTime);
            } else if (slug === 'voronoi_warp' || shaderCode.includes('Voronoi Warp')) {
                renderVoronoiWarpShader(ctx, canvas.width, canvas.height, elapsedTime);
            } else {
                // その他の未知のシェーダー - カラフルなデモをレンダリング
                renderGenericShader(ctx, canvas.width, canvas.height, elapsedTime, slug);
            }

            rafRef.current = requestAnimationFrame(animate);
        };

        // Rainbow シェーダーのレンダリング
        function renderRainbowShader(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
            const imageData = ctx.createImageData(width, height);
            const data = imageData.data;

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const pixelIndex = (y * width + x) * 4;
                    const uvX = x / width;
                    const uvY = y / height;

                    const r = 0.5 + 0.5 * Math.cos(time + uvX + 0);
                    const g = 0.5 + 0.5 * Math.cos(time + uvY + 2);
                    const b = 0.5 + 0.5 * Math.cos(time + 0 + 4);

                    data[pixelIndex] = r * 255;
                    data[pixelIndex + 1] = g * 255;
                    data[pixelIndex + 2] = b * 255;
                    data[pixelIndex + 3] = 255;
                }
            }

            ctx.putImageData(imageData, 0, 0);
        }

        // Tunnel シェーダーのレンダリング
        function renderTunnelShader(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
            const imageData = ctx.createImageData(width, height);
            const data = imageData.data;

            const centerX = width / 2;
            const centerY = height / 2;

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const pixelIndex = (y * width + x) * 4;

                    const uvX = (x - centerX) / (height / 2);
                    const uvY = (y - centerY) / (height / 2);

                    const angle = Math.atan2(uvY, uvX);
                    const radius = Math.sqrt(uvX * uvX + uvY * uvY);

                    const stripes = Math.sin(10 * angle + time * 2);
                    const glow = 1 / (radius * 20 + 1);

                    const r = 0.1 * stripes * glow;
                    const g = 0.3 * stripes * glow;
                    const b = 0.8 * stripes * glow;

                    data[pixelIndex] = Math.max(0, Math.min(255, r * 255));
                    data[pixelIndex + 1] = Math.max(0, Math.min(255, g * 255));
                    data[pixelIndex + 2] = Math.max(0, Math.min(255, b * 255));
                    data[pixelIndex + 3] = 255;
                }
            }

            ctx.putImageData(imageData, 0, 0);
        }

        // Pulse シェーダーのレンダリング
        function renderPulseShader(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
            const imageData = ctx.createImageData(width, height);
            const data = imageData.data;

            const centerX = width / 2;
            const centerY = height / 2;

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const pixelIndex = (y * width + x) * 4;

                    const dx = (x - centerX) / width;
                    const dy = (y - centerY) / height;
                    const d = Math.sqrt(dx * dx + dy * dy) * 2;

                    const pulse = Math.sin(time * 4 - d * 20);

                    const mixFactor = pulse * 0.5 + 0.5;
                    const r = (0.0 * (1 - mixFactor)) + (1.0 * mixFactor);
                    const g = (0.0 * (1 - mixFactor)) + (0.0 * mixFactor);
                    const b = (0.2 * (1 - mixFactor)) + (0.6 * mixFactor);

                    data[pixelIndex] = r * 255;
                    data[pixelIndex + 1] = g * 255;
                    data[pixelIndex + 2] = b * 255;
                    data[pixelIndex + 3] = 255;
                }
            }

            ctx.putImageData(imageData, 0, 0);
        }

        // 新しいシェーダー実装
        // Fractal Zoom シェーダー
        function renderFractalZoomShader(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
            const imageData = ctx.createImageData(width, height);
            const data = imageData.data;
            const centerX = width / 2;
            const centerY = height / 2;
            const zoom = 0.5 + 0.5 * Math.sin(time * 0.2) * 0.5;

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const pixelIndex = (y * width + x) * 4;

                    let zx = 1.5 * (x - centerX) / (0.5 * zoom * width);
                    let zy = (y - centerY) / (0.5 * zoom * height);

                    const maxIter = 100;
                    let iter = 0;

                    const cx = zx;
                    const cy = zy;

                    while (iter < maxIter && zx * zx + zy * zy < 4) {
                        const tmp = zx * zx - zy * zy + cx;
                        zy = 2 * zx * zy + cy;
                        zx = tmp;
                        iter++;
                    }

                    if (iter === maxIter) {
                        data[pixelIndex] = 0;
                        data[pixelIndex + 1] = 0;
                        data[pixelIndex + 2] = 0;
                    } else {
                        const color = iter / maxIter;
                        data[pixelIndex] = (Math.sin(color * 5 + time) * 0.5 + 0.5) * 255;
                        data[pixelIndex + 1] = (Math.sin(color * 7 + time) * 0.5 + 0.5) * 255;
                        data[pixelIndex + 2] = (Math.sin(color * 9 + time) * 0.5 + 0.5) * 255;
                    }
                    data[pixelIndex + 3] = 255;
                }
            }

            ctx.putImageData(imageData, 0, 0);
        }

        // Electric Plasma シェーダー
        function renderElectricPlasmaShader(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
            const imageData = ctx.createImageData(width, height);
            const data = imageData.data;

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const pixelIndex = (y * width + x) * 4;
                    const uvX = x / width;
                    const uvY = y / height;

                    const v1 = Math.sin((uvX * 10 + time));
                    const v2 = Math.sin((uvY * 10 + time));
                    const v3 = Math.sin((uvX * 10 + uvY * 10 + time));

                    const cx = uvX + 0.5 * Math.sin(time / 2);
                    const cy = uvY + 0.5 * Math.cos(time / 3);

                    const v4 = Math.sin(Math.sqrt(100 * ((cx * cx) + (cy * cy)) + 1) + time);

                    const v = v1 + v2 + v3 + v4;

                    const r = Math.sin(v * Math.PI) * 0.5 + 0.5;
                    const g = Math.sin(v * Math.PI + 2 * Math.PI / 3) * 0.5 + 0.5;
                    const b = Math.sin(v * Math.PI + 4 * Math.PI / 3) * 0.5 + 0.5;

                    data[pixelIndex] = r * 255;
                    data[pixelIndex + 1] = g * 255;
                    data[pixelIndex + 2] = b * 255;
                    data[pixelIndex + 3] = 255;
                }
            }

            ctx.putImageData(imageData, 0, 0);
        }

        // Audio Grid シェーダー
        function renderAudioGridShader(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
            const imageData = ctx.createImageData(width, height);
            const data = imageData.data;
            const gridSize = 12;

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const pixelIndex = (y * width + x) * 4;

                    // グリッド座標
                    const gx = Math.floor(x / width * gridSize);
                    const gy = Math.floor(y / height * gridSize);

                    // 各グリッドセルの高さをシミュレート
                    const cellHeight = 0.5 + 0.5 * Math.sin(gx + time * 4) * Math.sin(gy + time * 3);
                    const normalizedYPos = (y / height * gridSize) % 1;

                    // グリッドラインの描画
                    const gridLine = (x / width * gridSize) % 1 < 0.03 || normalizedYPos < 0.03;

                    if (gridLine) {
                        // グリッドライン
                        data[pixelIndex] = 0;
                        data[pixelIndex + 1] = 100;
                        data[pixelIndex + 2] = 200;
                        data[pixelIndex + 3] = 255;
                    } else if (normalizedYPos < cellHeight) {
                        // アクティブセル
                        const brightness = 0.8 - normalizedYPos * 0.5;
                        data[pixelIndex] = 0;
                        data[pixelIndex + 1] = 100 + 155 * brightness;
                        data[pixelIndex + 2] = 200 + 55 * brightness;
                        data[pixelIndex + 3] = 255;
                    } else {
                        // 非アクティブセル
                        data[pixelIndex] = 0;
                        data[pixelIndex + 1] = 20;
                        data[pixelIndex + 2] = 40;
                        data[pixelIndex + 3] = 255;
                    }
                }
            }

            ctx.putImageData(imageData, 0, 0);
        }

        // Kaleidoscope シェーダー
        function renderKaleidoscopeShader(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
            const imageData = ctx.createImageData(width, height);
            const data = imageData.data;
            const segments = 8;
            const centerX = width / 2;
            const centerY = height / 2;

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const pixelIndex = (y * width + x) * 4;

                    // 中心からの相対座標
                    const dx = x - centerX;
                    const dy = y - centerY;

                    // 極座標に変換
                    let angle = Math.atan2(dy, dx);
                    let radius = Math.sqrt(dx * dx + dy * dy);

                    // 万華鏡効果
                    angle = Math.abs(((angle % (2 * Math.PI / segments)) - Math.PI / segments) / (Math.PI / segments));

                    // 時間によるアニメーション
                    radius += 20 * Math.sin(angle * 5 + time);
                    radius = radius / width;

                    // 色を生成
                    const r = 0.5 + 0.5 * Math.sin(radius * 10 + time);
                    const g = 0.5 + 0.5 * Math.sin(radius * 20 + time + 2);
                    const b = 0.5 + 0.5 * Math.sin(angle * 5 + time + 4);

                    data[pixelIndex] = r * 255;
                    data[pixelIndex + 1] = g * 255;
                    data[pixelIndex + 2] = b * 255;
                    data[pixelIndex + 3] = 255;
                }
            }

            ctx.putImageData(imageData, 0, 0);
        }

        // Voronoi Warp シェーダー
        function renderVoronoiWarpShader(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
            const imageData = ctx.createImageData(width, height);
            const data = imageData.data;

            // ボロノイセルの数
            const numCells = 12;
            const points = [];

            // 時間によって動くセルの中心点を生成
            for (let i = 0; i < numCells; i++) {
                points.push({
                    x: 0.5 + 0.3 * Math.cos(time * 0.5 + i * 0.8) * Math.sin(time * 0.4 + i * 0.3),
                    y: 0.5 + 0.3 * Math.sin(time * 0.4 + i * 0.7) * Math.cos(time * 0.3 + i * 0.2),
                    c: [Math.sin(i * 0.35 + time * 0.2) * 0.5 + 0.5,
                    Math.sin(i * 0.35 + 2 + time * 0.1) * 0.5 + 0.5,
                    Math.sin(i * 0.35 + 4 + time * 0.3) * 0.5 + 0.5]
                });
            }

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const pixelIndex = (y * width + x) * 4;
                    const uvX = x / width;
                    const uvY = y / height;

                    // 最も近いセルを見つける
                    let minDist = 2.0;
                    let cellColor = [0, 0, 0];

                    for (let i = 0; i < numCells; i++) {
                        const dx = uvX - points[i].x;
                        const dy = uvY - points[i].y;
                        const dist = Math.sqrt(dx * dx + dy * dy) +
                            0.1 * Math.sin(dx * 10 + time) * Math.sin(dy * 10 + time); // ワープ効果

                        if (dist < minDist) {
                            minDist = dist;
                            cellColor = points[i].c;
                        }
                    }

                    // エッジ検出
                    const edge = minDist < 0.05 ? 0.0 : 1.0;

                    data[pixelIndex] = cellColor[0] * 255 * edge;
                    data[pixelIndex + 1] = cellColor[1] * 255 * edge;
                    data[pixelIndex + 2] = cellColor[2] * 255 * edge;
                    data[pixelIndex + 3] = 255;
                }
            }

            ctx.putImageData(imageData, 0, 0);
        }

        // 汎用シェーダー（名前に基づいて色を生成）
        function renderGenericShader(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, slug: string) {
            const imageData = ctx.createImageData(width, height);
            const data = imageData.data;

            // スラグから一貫したカラースキームを生成
            let hash = 0;
            for (let i = 0; i < slug.length; i++) {
                hash = ((hash << 5) - hash) + slug.charCodeAt(i);
                hash = hash & hash; // 32bit整数にする
            }

            const colorOffset1 = Math.abs(hash % 6);
            const colorOffset2 = Math.abs((hash >> 8) % 6);
            const patternType = Math.abs((hash >> 16) % 4);

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const pixelIndex = (y * width + x) * 4;
                    const uvX = x / width;
                    const uvY = y / height;

                    let color;

                    // パターンのバリエーション
                    switch (patternType) {
                        case 0: // 同心円
                            const dx1 = uvX - 0.5;
                            const dy1 = uvY - 0.5;
                            const dist = Math.sqrt(dx1 * dx1 + dy1 * dy1);
                            color = Math.sin(dist * 20 - time * 2);
                            break;
                        case 1: // 格子パターン
                            color = Math.sin(uvX * 10 + time) * Math.sin(uvY * 10 + time);
                            break;
                        case 2: // 渦巻き
                            const dx2 = uvX - 0.5;
                            const dy2 = uvY - 0.5;
                            const angle = Math.atan2(dy2, dx2);
                            const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                            color = Math.sin(angle * 5 + dist2 * 10 - time * 2);
                            break;
                        case 3: // ノイズパターン
                            color = Math.sin(uvX * 15 + time) + Math.sin(uvY * 15 + time * 0.7);
                            break;
                        default:
                            color = Math.sin(uvX * 20 + time) * Math.cos(uvY * 20 + time);
                    }

                    // 正規化
                    color = color * 0.5 + 0.5;

                    // スラグからの特性に基づいてカラーマッピング
                    data[pixelIndex] = (Math.sin(color * Math.PI * 2 + colorOffset1) * 0.5 + 0.5) * 255;
                    data[pixelIndex + 1] = (Math.sin(color * Math.PI * 2 + colorOffset1 + 2) * 0.5 + 0.5) * 255;
                    data[pixelIndex + 2] = (Math.sin(color * Math.PI * 2 + colorOffset2 + 4) * 0.5 + 0.5) * 255;
                    data[pixelIndex + 3] = 255;
                }
            }

            ctx.putImageData(imageData, 0, 0);
        }

        // アニメーション開始
        animate();

        // クリーンアップ
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(rafRef.current);
        };
    }, [slug, shaderCode]);

    return <canvas ref={canvasRef} className="w-full h-full bg-black" />;
}

// 配列をシャッフルするヘルパー関数
function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

export default function HeroShaderCarousel({ slugs }: Props) {
    const [idx, setIdx] = useState(0);
    const [randomizedSlugs, setRandomizedSlugs] = useState<string[]>([]);

    // マウント時にシェーダーをランダムな順番にシャッフル
    useEffect(() => {
        if (slugs.length === 0) return;
        // シェーダーの順番をランダム化
        setRandomizedSlugs(shuffleArray(slugs));
    }, [slugs]);

    // シェーダー切り替えのインターバル
    useEffect(() => {
        if (randomizedSlugs.length === 0) return;

        const id = setInterval(() => {
            setIdx((i) => (i + 1) % randomizedSlugs.length);
        }, 10000);

        return () => clearInterval(id);
    }, [randomizedSlugs.length]);

    if (randomizedSlugs.length === 0) {
        return null;
    }

    return (
        <div className="relative h-[70vh] w-full overflow-hidden border-b border-white/10">
            <AnimatePresence mode="wait">
                <motion.div
                    key={randomizedSlugs[idx]}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2 }}
                    className="absolute inset-0"
                >
                    <Canvas2DShader slug={randomizedSlugs[idx]} />
                </motion.div>
            </AnimatePresence>
            <div className="absolute bottom-4 right-4 z-10">
                <div className="flex gap-1">
                    {randomizedSlugs.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setIdx(i)}
                            className={`w-2 h-2 rounded-full ${i === idx ? "bg-neonPink" : "bg-white/30"}`}
                            aria-label={`シェーダー ${i + 1}`}
                        />
                    ))}
                </div>
            </div>
            <div className="relative z-10 flex h-full w-full items-center justify-center pointer-events-none">
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight select-none">
                    <div className="logo-wrapper" style={{ fontSize: 'inherit' }}>
                        <span className="logo-text" style={{ color: '#00ffff', textShadow: '0 0 5px #00ffff, 0 0 10px #00ffff' }}>SHADER</span><span className="logo-text" style={{ color: '#ff00ff', textShadow: '0 0 5px #ff00ff, 0 0 10px #ff00ff' }}>NEXUS</span>
                    </div>
                </h1>
            </div>
        </div>
    );
} 