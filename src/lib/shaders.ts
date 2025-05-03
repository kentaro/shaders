import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

const yamlPath = path.join(process.cwd(), "data", "shaders.yaml");

export type ShaderMeta = { slug: string; title: string; code: string };

export const loadIndex = async (): Promise<ShaderMeta[]> => {
  const raw = await fs.readFile(yamlPath, "utf8");
  return YAML.parse(raw) as ShaderMeta[];
};

export const listShaders = async () => {
  const shaders = await loadIndex();
  // ビルド時にコードを含める
  return Promise.all(
    shaders.map(async (shader) => {
      const codePath = path.join(process.cwd(), shader.code);
      const code = await fs.readFile(codePath, "utf8");
      return { ...shader, code };
    })
  );
};

export const getShader = async (slug: string) => {
  const shaders = await listShaders();
  return shaders.find((s) => s.slug === slug) || null;
}; 