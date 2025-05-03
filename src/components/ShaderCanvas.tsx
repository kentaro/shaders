"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { useShaderStore } from "./store";
import { Video, Square, Download, Loader2 } from "lucide-react";
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

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
    const ffmpegRef = useRef<FFmpeg | null>(null);

    const [recording, setRecording] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [isMP4Format, setIsMP4Format] = useState(false);
    const [ffmpegLoaded, setFFmpegLoaded] = useState(false);
    const [processingStatus, setProcessingStatus] = useState('');

    // FFmpegロード
    useEffect(() => {
        const loadFFmpeg = async () => {
            try {
                const ffmpeg = new FFmpeg();

                // 進捗ログ
                ffmpeg.on('log', ({ message }) => {
                    console.log(`FFmpeg: ${message}`);
                });

                // ロードエラーを回避するために直接URLを使用
                await ffmpeg.load();

                // スレッド無効化
                await ffmpeg.exec(['-threads', '1']);

                ffmpegRef.current = ffmpeg;
                setFFmpegLoaded(true);
                console.log('FFmpeg loaded');
            } catch (error) {
                console.error('FFmpeg load error:', error);
                // エラーがあってもサイレント失敗（WebMのままダウンロード提供）
            }
        };

        // ブラウザ環境のみでロード試行
        if (typeof window !== 'undefined') {
            loadFFmpeg();
        }

        return () => {
            if (ffmpegRef.current) {
                ffmpegRef.current.terminate();
                ffmpegRef.current = null;
            }
        };
    }, []);

    // WebM to MP4 変換関数
    const convertWebMtoMP4 = async (webmBlob: Blob): Promise<Blob | null> => {
        if (!ffmpegRef.current || !ffmpegLoaded) {
            console.warn('FFmpeg not loaded yet');
            return null;
        }

        try {
            const ffmpeg = ffmpegRef.current;

            // ファイルをFFmpegにロード
            await ffmpeg.writeFile('input.webm', await fetchFile(webmBlob));

            // WebM → MP4変換実行
            await ffmpeg.exec([
                '-i', 'input.webm',
                '-c:v', 'libx264',
                '-preset', 'fast',
                '-crf', '22',
                '-pix_fmt', 'yuv420p',
                'output.mp4'
            ]);

            // 結果を取得
            const data = await ffmpeg.readFile('output.mp4');

            // ArrayBufferからBlobに変換 (型の問題を修正)
            const uint8Array = data as Uint8Array;
            return new Blob([uint8Array], { type: 'video/mp4' });
        } catch (error) {
            console.error('Conversion error:', error);
            return null;
        }
    };

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
        // MP4を優先順位の最上位に変更
        const types = [
            'video/mp4',
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8',
            'video/webm'
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
            const mimeType = getSupportedMimeType();
            const options = {
                mimeType,
                videoBitsPerSecond: 5000000  // 5Mbps
            };

            console.log("MediaRecorder オプション:", options);
            const mediaRecorder = new MediaRecorder(stream, options);

            mediaRecorderRef.current = mediaRecorder;

            // 使用するMIMEタイプを記録
            const isRecordingMP4 = mimeType.includes('mp4');
            console.log(`録画形式: ${isRecordingMP4 ? 'MP4' : 'WebM'}`);

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
            mediaRecorder.onstop = async () => {
                console.log(`録画停止: ${chunksRef.current.length}チャンク`);
                setProcessing(true);
                setProcessingStatus('録画データを処理中...');

                try {
                    if (chunksRef.current.length === 0) {
                        console.error('録画データなし');
                        setProcessing(false);
                        return;
                    }

                    // 録画時のMIMEタイプを使用
                    const blobType = isRecordingMP4 ? 'video/mp4' : 'video/webm';
                    const blob = new Blob(chunksRef.current, { type: blobType });
                    console.log(`Blob作成: ${blob.size} bytes, タイプ: ${blobType}`);

                    if (blob.size === 0) {
                        console.error('Blobサイズが0です');
                        setProcessing(false);
                        return;
                    }

                    // MP4で直接録画できた場合
                    if (isRecordingMP4) {
                        const url = URL.createObjectURL(blob);
                        setDownloadUrl(url);
                        setIsMP4Format(true);
                        setProcessingStatus('');
                        return;
                    }

                    // WebMの場合はFFmpegでの変換を試みる
                    // MP4変換を試みる (ブラウザのサポート状況をチェック)
                    let hasAttemptedConversion = false;

                    // FFmpegによる変換を試みる
                    if (ffmpegLoaded && ffmpegRef.current) {
                        try {
                            hasAttemptedConversion = true;
                            console.log('FFmpegでMP4変換を試みています...');
                            setProcessingStatus('MP4に変換中...');
                            const mp4Blob = await convertWebMtoMP4(blob);
                            if (mp4Blob) {
                                const url = URL.createObjectURL(mp4Blob);
                                setDownloadUrl(url);
                                setIsMP4Format(true);
                                setProcessingStatus('');
                                return;
                            }
                        } catch (convError) {
                            console.error('MP4変換エラー:', convError);
                            setProcessingStatus('変換に失敗しました');
                        }
                    }

                    // 変換に失敗した場合は代替方法のメッセージを表示
                    if (hasAttemptedConversion) {
                        console.log('変換が失敗しました。WebM形式でダウンロードします。');
                        console.log('ヒント: WebM → MP4変換には以下の外部ツールが使えます:');
                        console.log('- CloudConvert (https://cloudconvert.com/webm-to-mp4)');
                        console.log('- FFmpeg (https://ffmpeg.org/)');
                        console.log('- VLC Media Player');
                    }

                    // 変換失敗またはFFmpegが利用できない場合はWebMのまま提供
                    setProcessingStatus('');
                    const url = URL.createObjectURL(blob);
                    setDownloadUrl(url);
                    setIsMP4Format(false);
                } catch (error) {
                    console.error('Blob作成エラー:', error);
                    setProcessingStatus('エラーが発生しました');
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
    }, [downloadUrl, getSupportedMimeType, stopRecording, ffmpegLoaded]);

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

            <div className="absolute top-2 right-2 md:top-6 md:right-6 flex gap-3 z-20 bg-black/30 md:bg-transparent px-2 py-1 md:p-0 rounded-full md:rounded-none">
                {processing ? (
                    <div className="flex items-center gap-2">
                        <div className="text-white text-xs bg-black/70 px-2 py-1 rounded">
                            {processingStatus || '処理中...'}
                        </div>
                        <button
                            className="p-2.5 bg-white rounded-full shadow-lg flex items-center justify-center opacity-80 cursor-wait"
                            disabled
                            title="処理中..."
                        >
                            <Loader2 className="h-5 w-5 text-gray-600 animate-spin" />
                        </button>
                    </div>
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
                    <div className="flex items-center gap-2">
                        <a
                            href={downloadUrl}
                            download={`${slug}${isMP4Format ? '.mp4' : '.webm'}`}
                            className="p-2.5 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                            title={`ダウンロード (${isMP4Format ? 'MP4' : 'WebM'})`}
                        >
                            <Download className="h-5 w-5 text-blue-600" strokeWidth={2.5} />
                        </a>
                        {!isMP4Format && (
                            <div className="text-white text-xs bg-black/70 px-2 py-1 rounded max-w-xs">
                                WebM形式で保存されます。MP4に変換するには
                                <a href="https://cloudconvert.com/webm-to-mp4" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-1">
                                    外部ツール
                                </a>
                                をご利用ください。
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
} 