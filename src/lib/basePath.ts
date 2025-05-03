/**
 * サーバーコンポーネント用のベースパス取得関数
 * 本番環境では '/shaders' を、開発環境では '' を返す
 */
export function getBasePath(): string {
  // Next.js環境変数を使用
  return process.env.NODE_ENV === 'production' ? '/shaders' : '';
}

// OpenGraph用などの完全URLの構築
export function getFullUrl(path: string): string {
  const basePath = getBasePath();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kentaro.github.io';
  
  // パスが既に/で始まっている場合は調整
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${basePath}${normalizedPath}`;
} 