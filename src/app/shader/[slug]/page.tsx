import { notFound } from "next/navigation";
import { getShader } from "@/lib/shaders";
import Viewer from "@/components/ShaderViewerClient";
import type { Metadata } from "next";
import { getBasePath, getFullUrl } from "@/lib/basePath";

export async function generateStaticParams() {
    const { listShaders } = await import("@/lib/shaders");
    const shaders = await listShaders();
    return shaders.map((s) => ({ slug: s.slug }));
}

type Params = { slug: string };

export async function generateMetadata({
    params
}: {
    params: Promise<Params>
}): Promise<Metadata> {
    const { slug } = await params;
    const shader = await getShader(slug);
    if (!shader) return {};

    const description = `${shader.title} - インタラクティブなGLSLシェーダー`;
    const thumbnailUrl = getFullUrl(`/thumbnails/${shader.slug}.png`);
    const pageUrl = getFullUrl(`/shader/${shader.slug}`);

    return {
        title: `${shader.title} | Shader VJ`,
        description: description,
        openGraph: {
            title: shader.title,
            description: description,
            url: pageUrl,
            images: [{
                url: thumbnailUrl,
                width: 1200,
                height: 630,
                alt: shader.title,
            }],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: shader.title,
            description: description,
            images: [thumbnailUrl],
        }
    };
}

export default async function ShaderPage({
    params
}: {
    params: Promise<Params>
}) {
    const { slug } = await params;
    const shader = await getShader(slug);
    if (!shader) notFound();
    return <Viewer code={shader.code} slug={shader.slug} />;
} 