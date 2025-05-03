import type { ShaderMeta } from "./shaders";

interface ShaderCodeMap {
  [slug: string]: string;
}

/**
 * シェーダーデータをJSON文字列に変換して、フロントエンド側で使用できるようにする
 */
export function generatePreloadedStore(shaders: ShaderMeta[]): string {
  const codeMap: ShaderCodeMap = {};
  
  for (const shader of shaders) {
    codeMap[shader.slug] = shader.code;
  }
  
  // HTMLエスケープして安全にスクリプトタグに埋め込めるようにする
  return JSON.stringify(codeMap).replace(/</g, '\\u003c');
} 