import Link from "next/link";
import { listShaders } from "@/lib/shaders";
import ShaderCard from "@/components/ShaderCard";
import HeroShell from "@/components/HeroShell";
import { generatePreloadedStore } from "@/lib/preload-shaders";

export default async function Home() {
  const shaders = await listShaders();
  // シェーダーコードをJSで利用できるようにシリアライズ
  const preloadedStore = generatePreloadedStore(shaders);

  return (
    <>
      <script
        id="shader-data"
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: preloadedStore,
        }}
      />
      <HeroShell slugs={shaders.map((s) => s.slug)} />
      <main className="grid gap-6 p-8 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
        {shaders.map((s) => (
          <Link key={s.slug} href={`/shader/${s.slug}`} className="space-y-2">
            <ShaderCard slug={s.slug} title={s.title} />
            <h2 className="text-neonCyan font-mono text-sm tracking-wide">
              {s.title}
            </h2>
          </Link>
        ))}
      </main>
    </>
  );
}
