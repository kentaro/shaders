"use client";

import { useCallback } from "react";
import Editor from "@monaco-editor/react";
import { useShaderStore } from "./store";

interface Props {
    initialCode: string;
    slug: string;
}

export default function ShaderEditor({ initialCode, slug }: Props) {
    const setCode = useShaderStore((s) => s.setCode);

    const handleChange = useCallback(
        (value?: string) => {
            if (typeof value === "string") setCode(slug, value);
        },
        [setCode, slug]
    );

    return (
        <Editor
            defaultLanguage="cpp" /* GLSL close to C-like */
            defaultValue={initialCode}
            theme="vs-dark"
            onChange={handleChange}
            options={{
                fontLigatures: true,
                minimap: { enabled: false },
                scrollbar: {
                    verticalScrollbarSize: 4,
                    horizontalScrollbarSize: 4,
                },
                wordWrap: "on",
            }}
            height="100%"
        />
    );
} 