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
    }, [slug, code, setCode]);
    return (
        <div className="flex flex-col md:flex-row h-dvh">
            <div className="md:w-1/2 h-64 md:h-full border-r">
                <Editor initialCode={code} slug={slug} />
            </div>
            <div className="relative md:w-1/2 grow">
                <Canvas slug={slug} />
            </div>
        </div>
    );
} 