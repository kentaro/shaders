'use client';

import { useEffect, useState } from 'react';

/**
 * GitHub Pagesでの正しいベースパスを取得するためのカスタムフック
 * 本番環境では '/shaders' を、開発環境では '' を返す
 */
export default function useBasePath() {
  // デフォルト値を環境変数から設定（SSRとCSRで同じ値になるようにする）
  const [basePath, setBasePath] = useState<string>('');

  // マウント時に環境をチェックし、本番環境と開発環境でベースパスを設定
  useEffect(() => {
    // 本番環境かチェック（location.hostはクライアントサイドのみで利用可能）
    const isProduction = 
      typeof window !== 'undefined' && 
      (window.location.host.includes('github.io') || 
       process.env.NODE_ENV === 'production');
    
    setBasePath(isProduction ? '/shaders' : '');
  }, []);

  return basePath;
} 