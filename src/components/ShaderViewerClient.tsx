"use client";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useShaderStore } from "./store";

const Editor = dynamic(() => import("@/components/ShaderEditor"), { ssr: false });
const Canvas = dynamic(() => import("@/components/ShaderCanvas"), { ssr: false });

interface Props {
    code: string;
    slug: string;
}

export default function ShaderViewerClient({ code, slug }: Props) {
    const setCode = useShaderStore((s) => s.setCode);

    useEffect(() => {
        setCode(slug, code);

        // ページ遷移時にスクロール位置を最上部にリセット
        window.scrollTo(0, 0);
    }, [slug, code, setCode]);

    return (
        <div className="flex flex-col-reverse md:flex-row h-[100dvh] w-full">
            <div className="h-[40vh] md:h-full md:w-1/2 border-t md:border-t-0 md:border-r">
                <Editor initialCode={code} slug={slug} />
            </div>
            <div className="h-[60vh] md:h-full md:w-1/2 relative">
                <Canvas slug={slug} />
            </div>
        </div>
    );
} 