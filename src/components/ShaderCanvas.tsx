"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { useShaderStore } from "./store";
import { Video, Square, Download, Loader2 } from "lucide-react";

function Plane({ frag }: { frag: string }) {
    const material = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                u_time: { value: 0 },
                u_resolution: { value: new THREE.Vector2(1, 1) },
            },
            vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
            fragmentShader: frag || "void main(){gl_FragColor=vec4(1.0);}",
        });
    }, [frag]);

    useFrame(({ clock, size }) => {
        material.uniforms.u_time.value = clock.elapsedTime;
        material.uniforms.u_resolution.value.set(size.width, size.height);
    });

    return (
        <mesh>
            <planeGeometry args={[2, 2]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
}

// シェーダーレンダラー (フックを使わない純粋な関数)
function createShaderRenderer(code: string): {
    render: (time: number) => HTMLCanvasElement
} {
    // Three.jsオブジェクトを作成
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(1920, 1080);

    // マテリアル作成
    const material = new THREE.ShaderMaterial({
        uniforms: {
            u_time: { value: 0 },
            u_resolution: { value: new THREE.Vector2(1920, 1080) },
        },
        vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
        fragmentShader: code || "void main(){gl_FragColor=vec4(1.0);}",
    });

    // メッシュ作成
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        material
    );
    scene.add(mesh);

    // レンダリング関数を返す
    return {
        render: (time: number) => {
            material.uniforms.u_time.value = time;
            renderer.render(scene, camera);
            return renderer.domElement;
        }
    };
}

export default function ShaderCanvas({ slug }: { slug: string }) {
    const codes = useShaderStore((s) => s.codes);
    const code = codes[slug] || '';
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timeRef = useRef<number>(0);
    const videoCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const rendererRef = useRef<{ render: (time: number) => HTMLCanvasElement } | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);

    const [recording, setRecording] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    // レンダラーの初期化
    useEffect(() => {
        rendererRef.current = createShaderRenderer(code);
    }, [code]);

    // 録画用オフスクリーンキャンバスの初期化
    useEffect(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        videoCanvasRef.current = canvas;

        return () => {
            videoCanvasRef.current = null;
        };
    }, []);

    // アニメーションループ
    useEffect(() => {
        let animationId: number;
        let startTime: number = 0;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsedTime = (timestamp - startTime) / 1000; // 秒単位
            timeRef.current = elapsedTime;

            if (recording && rendererRef.current && videoCanvasRef.current) {
                setRecordingTime(elapsedTime);

                // シェーダーをレンダリングして録画用キャンバスに描画
                const shaderCanvas = rendererRef.current.render(elapsedTime);
                const ctx = videoCanvasRef.current.getContext('2d');
                if (ctx) {
                    ctx.drawImage(shaderCanvas, 0, 0, 1920, 1080);
                }
            }

            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [code, recording]);

    // サポートされているMIMEタイプを確認
    const getSupportedMimeType = useCallback(() => {
        const types = [
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8',
            'video/webm',
            'video/mp4'
        ];

        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                console.log(`サポートされているMIMEタイプ: ${type}`);
                return type;
            }
        }

        console.warn('サポートされているMIMEタイプが見つかりません。デフォルトを使用');
        return '';
    }, []);

    // 録画開始
    const startRecording = useCallback(() => {
        if (!videoCanvasRef.current) {
            console.error('videoCanvasRef.current が null です');
            return;
        }

        // 古いダウンロードURLをクリア
        if (downloadUrl) {
            URL.revokeObjectURL(downloadUrl);
            setDownloadUrl(null);
        }

        try {
            // チャンク配列をクリア
            chunksRef.current = [];

            console.log("録画開始...");
            console.log("録画キャンバスサイズ:", videoCanvasRef.current.width, videoCanvasRef.current.height);

            // オフスクリーンキャンバスからストリーム取得
            const stream = videoCanvasRef.current.captureStream(30);

            // ストリーム情報をログ
            console.log("ビデオトラック:", stream.getVideoTracks().length);

            // MediaRecorder設定
            const options = {
                mimeType: getSupportedMimeType(),
                videoBitsPerSecond: 5000000  // 5Mbps
            };

            console.log("MediaRecorder オプション:", options);
            const mediaRecorder = new MediaRecorder(stream, options);

            mediaRecorderRef.current = mediaRecorder;

            // ondataavailableハンドラ
            mediaRecorder.ondataavailable = (e) => {
                console.log(`データ取得: サイズ ${e.data?.size || 0} bytes`);
                if (e.data && e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            // エラーハンドラ
            mediaRecorder.onerror = (event) => {
                console.error('MediaRecorder エラー:', event);
            };

            // 録画停止時の処理
            mediaRecorder.onstop = () => {
                console.log(`録画停止: ${chunksRef.current.length}チャンク`);
                setProcessing(true);

                try {
                    if (chunksRef.current.length === 0) {
                        console.error('録画データなし');
                        setProcessing(false);
                        return;
                    }

                    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                    console.log(`Blob作成: ${blob.size} bytes`);

                    if (blob.size === 0) {
                        console.error('Blobサイズが0です');
                        setProcessing(false);
                        return;
                    }

                    const url = URL.createObjectURL(blob);
                    setDownloadUrl(url);
                } catch (error) {
                    console.error('Blob作成エラー:', error);
                } finally {
                    setProcessing(false);
                }
            };

            // 500msごとにデータ取得
            mediaRecorder.start(500);
            setRecording(true);

            // 8秒間の録画に制限
            recordingTimeoutRef.current = setTimeout(() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                    console.log('録画タイムアウト - 自動停止');
                    stopRecording();
                }
            }, 8000);

        } catch (error) {
            console.error('録画開始エラー:', error);
            setRecording(false);
            setProcessing(false);
        }
    }, [downloadUrl, getSupportedMimeType]);

    // 録画停止
    const stopRecording = useCallback(() => {
        console.log("録画停止処理開始");
        try {
            if (recordingTimeoutRef.current) {
                clearTimeout(recordingTimeoutRef.current);
                recordingTimeoutRef.current = null;
            }

            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                // 最後のデータを要求
                mediaRecorderRef.current.requestData();

                // 少し待ってから停止
                setTimeout(() => {
                    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                        mediaRecorderRef.current.stop();
                        console.log("MediaRecorder停止完了");
                    }
                }, 200);
            }
        } catch (error) {
            console.error('録画停止エラー:', error);
            setProcessing(false);
        } finally {
            setRecording(false);
        }
    }, []);

    // クリーンアップ
    useEffect(() => {
        return () => {
            if (recordingTimeoutRef.current) {
                clearTimeout(recordingTimeoutRef.current);
            }
            if (downloadUrl) {
                URL.revokeObjectURL(downloadUrl);
            }
        };
    }, [downloadUrl]);

    // シェーダーコードがまだロードされていない場合
    if (!code) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-black">
                <div className="text-neonCyan">Loading...</div>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full">
            <Canvas
                className="bg-black h-full w-full"
                gl={{ preserveDrawingBuffer: true, alpha: false, antialias: true }}
                frameloop="always"
                ref={canvasRef}
            >
                <Plane frag={code || "void main(){gl_FragColor=vec4(0.0);}"} />
            </Canvas>

            <div className="absolute bottom-6 right-6 flex gap-3 z-10">
                {processing ? (
                    <button
                        className="p-2.5 bg-white rounded-full shadow-lg flex items-center justify-center opacity-80 cursor-wait"
                        disabled
                        title="処理中..."
                    >
                        <Loader2 className="h-5 w-5 text-gray-600 animate-spin" />
                    </button>
                ) : recording ? (
                    <button
                        className="p-2.5 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                        onClick={stopRecording}
                        title="録画停止"
                    >
                        <Square className="h-5 w-5 text-red-600" strokeWidth={2.5} />
                    </button>
                ) : (
                    <button
                        className="p-2.5 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                        onClick={startRecording}
                        title="録画開始 (1920x1080)"
                    >
                        <Video className="h-5 w-5 text-red-600" strokeWidth={2.5} />
                    </button>
                )}

                {downloadUrl && !processing && (
                    <a
                        href={downloadUrl}
                        download={`${slug}.webm`}
                        className="p-2.5 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                        title="ダウンロード"
                    >
                        <Download className="h-5 w-5 text-blue-600" strokeWidth={2.5} />
                    </a>
                )}
            </div>
        </div>
    );
} 