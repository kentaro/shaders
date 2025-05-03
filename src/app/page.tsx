import Link from "next/link";
import { listShaders } from "@/lib/shaders";
import ShaderCard from "@/components/ShaderCard";
import HeroShell from "@/components/HeroShell";
import { generatePreloadedStore } from "@/lib/preload-shaders";
import { getBasePath } from "@/lib/basePath";

export default async function Home() {
  const shaders = await listShaders();
  // シェーダーコードをJSで利用できるようにシリアライズ
  const preloadedStore = generatePreloadedStore(shaders);
  const basePath = getBasePath();

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
      <main className="flex flex-wrap justify-center gap-8 p-6 md:gap-10 md:p-8 max-w-screen-xl mx-auto">
        {shaders.map((s) => (
          <Link key={s.slug} href={`/shader/${s.slug}`} className="w-full sm:w-72 md:w-80 space-y-3 mb-4">
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
