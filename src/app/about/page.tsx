import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About | SHADER NEXUS",
    description: "Discover the creative vision behind SHADER NEXUS and its artistic exploration",
};

export default function AboutPage() {
    return (
        <main className="container mx-auto px-4 py-10 max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-8">
                About <span className="logo-wrapper">
                    <span className="logo-text text-neonCyan">SHADER</span><span className="logo-text text-neonPink">NEXUS</span>
                </span>
            </h1>

            <div className="space-y-8 text-lg">
                <section>
                    <h2 className="text-2xl font-bold mb-4 text-white">プロジェクトについて</h2>
                    <p className="mb-4">
                        SHADER NEXUSは、リアルタイムグラフィックスとビジュアルプログラミングの探求プロジェクトです。
                        パフォーマンス、インスタレーション、ライブイベント向けに設計された様々なシェーダーエフェクトのコレクションを提供しています。
                    </p>
                    <p>
                        このポートフォリオは、WebGLとフラグメントシェーダーの力を活用して、複雑なビジュアルエフェクトを
                        ブラウザ上で直接実行可能にします。各シェーダーは独自のスタイルと表現を持ち、
                        さまざまなビジュアル体験を生み出します。
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-white">技術</h2>
                    <p className="mb-4">
                        このプロジェクトはNext.jsを基盤としており、モダンなウェブ技術を活用してシェーダーアートを実現しています。
                        フラグメントシェーダーは、詳細な数学的アルゴリズムを使用して複雑なパターン、動き、色彩効果を生成します。
                    </p>
                    <p>使用技術：</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Next.js</li>
                        <li>TypeScript</li>
                        <li>WebGL / Canvas API</li>
                        <li>GLSL (OpenGL Shading Language)</li>
                        <li>TailwindCSS</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-white">利用について</h2>
                    <p className="mb-4">
                        このポートフォリオ内のすべてのシェーダーは、クリエイティブなプロジェクトで自由に利用できます。
                        ライブビジュアルパフォーマンス、デジタルアート作品、インスタレーションなどに最適です。
                    </p>
                    <p className="mb-4">
                        各シェーダーのコードはカスタマイズ可能で、独自のプロジェクトに合わせて調整できます。
                        シェーダーを利用する際は、クレジット表記を添えていただけると幸いです。
                    </p>

                    <p className="mb-4">
                        SHADER NEXUSには動画としての録画機能が搭載されています。各シェーダーページで録画ボタンを押すことで、
                        現在表示されているシェーダーアニメーションをMP4形式の動画として保存できます。録画したデータも
                        元のシェーダーコードと同様に、CC BY-SA 4.0ライセンスの下で利用可能です。VJ素材やメディアアート作品の
                        一部として自由に活用いただけます。
                    </p>

                    <div className="p-4 bg-black/30 border border-white/10 rounded-md">
                        <h3 className="text-xl font-semibold mb-2 text-neonCyan">ライセンス</h3>
                        <p className="mb-2">
                            本作品（シェーダーコード、生成される映像、および録画データを含む）はクリエイティブ・コモンズ 表示-継承 4.0 国際
                            (CC BY-SA 4.0) ライセンスの下に提供されています。
                        </p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>表示 — 適切なクレジットを表示し、ライセンスへのリンクを提供し、変更があったらその旨を示す必要があります</li>
                            <li>継承 — 元の作品と同じライセンスの下に、あなたの貢献を頒布する必要があります</li>
                        </ul>
                        <div className="mt-4 flex items-center gap-3">
                            <Image
                                src="https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by-sa.svg"
                                alt="CC BY-SA License"
                                className="h-8 w-auto"
                                width={88}
                                height={31}
                            />
                            <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.ja" className="text-neonCyan hover:underline" target="_blank" rel="noopener noreferrer">
                                ライセンスの詳細を見る
                            </a>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-white">作者について</h2>
                    <div className="flex flex-col md:flex-row gap-6 items-start mb-6">
                        <div className="max-w-[120px]">
                            <div className="w-[120px] h-[120px] rounded-full border-2 border-neonCyan overflow-hidden bg-black/30">
                                <Image
                                    src="https://pbs.twimg.com/profile_images/1893532407988367361/5EfifO80_400x400.jpg"
                                    alt="栗林健太郎"
                                    className="w-full h-full object-cover"
                                    width={120}
                                    height={120}
                                />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2">栗林健太郎（Kentaro Kuribayashi）</h3>
                            <p className="mb-3">
                                GMOペパボ株式会社取締役CTO / 一般社団法人日本CTO協会理事 / 博士（情報科学）
                            </p>
                            <p className="mb-3">
                                VJ・シェーダーアート・WebGL・音楽制作など、テクノロジーとクリエイティブの融合に興味を持つ。
                                技術と知見で未来を創造することをモットーに、様々な分野で活動中。
                            </p>
                            <p className="mb-4">
                                質問、フィードバック、コラボレーションの提案などがありましたら、
                                以下のリンクからご連絡ください。
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <a href="https://kentarokuribayashi.com/" className="px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors rounded-md text-neonCyan">
                                    ホームページ
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="border-t border-white/10 pt-8 mt-10">
                    <Link href="/" className="text-neonCyan hover:text-neonPink transition-colors">
                        ← ホームに戻る
                    </Link>
                </div>
            </div>
        </main>
    );
} 