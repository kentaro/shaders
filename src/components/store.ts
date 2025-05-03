import { create } from "zustand";

interface ShaderState {
  codes: Record<string, string>;
  setCode: (slug: string, code: string) => void;
  preloadCodes: (codes: Record<string, string>) => void;
  isLoaded: boolean;
}

// プリロードされたデータを読み込む
const loadPreloadedCodes = (): Record<string, string> => {
  if (typeof document === 'undefined') return {};
  
  const scriptElement = document.getElementById('shader-data');
  if (!scriptElement?.textContent) {
    return {};
  }
  
  try {
    const data = JSON.parse(scriptElement.textContent);
    return data;
  } catch (_) {
    return {};
  }
};

// 初期データの読み込み
const initialCodes = typeof window !== 'undefined' ? loadPreloadedCodes() : {};

export const useShaderStore = create<ShaderState>((set) => ({
  // 初期化時にプリロードされたデータを読み込む
  codes: initialCodes,
  isLoaded: typeof window !== 'undefined' && !!document.getElementById('shader-data'),
  setCode: (slug, code) => set((s) => ({ 
    codes: { ...s.codes, [slug]: code } 
  })),
  preloadCodes: (codes) => set({ 
    codes, 
    isLoaded: true 
  }),
})); 