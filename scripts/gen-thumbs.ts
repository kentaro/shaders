import fs from 'fs/promises';
import path from 'path';
import { createCanvas } from 'canvas';
import YAML from 'yaml';

// OGイメージサイズに対応
const THUMBNAIL_WIDTH = 1200;
const THUMBNAIL_HEIGHT = 630;
const THUMBNAIL_DIR = path.join(process.cwd(), 'public', 'thumbnails');

// シェーダータイプの定義
type ShaderStyle = 
  | 'rainbow' 
  | 'gradient' 
  | 'radial'
  | 'tunnel'
  | 'wave' 
  | 'pulse'
  | 'fractal'
  | 'noise'
  | 'voronoi'
  | 'pixelated'
  | 'symmetry'
  | 'audio';

// シェーダー名を解析してスタイルを推測
function getShaderStyleFromName(slug: string): ShaderStyle {
  slug = slug.toLowerCase();
  
  // キーワードでマッチング
  if (slug.includes('rainbow')) return 'rainbow';
  if (slug.includes('tunnel')) return 'tunnel';
  if (slug.includes('pulse')) return 'pulse';
  if (slug.includes('wave')) return 'wave';
  if (slug.includes('ripple')) return 'wave';
  if (slug.includes('fractal')) return 'fractal';
  if (slug.includes('noise')) return 'noise';
  if (slug.includes('pixel')) return 'pixelated';
  if (slug.includes('voronoi')) return 'voronoi';
  if (slug.includes('cell')) return 'voronoi';
  if (slug.includes('audio')) return 'audio';
  if (slug.includes('symmetry')) return 'symmetry';
  if (slug.includes('kaleidoscope')) return 'symmetry';
  
  // 特別なケース
  const specialCases: Record<string, ShaderStyle> = {
    'polygon_burst': 'voronoi',
    'star_radiation': 'radial',
    'circle_ripple': 'wave',
    'fractal_burst': 'fractal',
    'neon_explosion': 'pulse',
    'crystal_growth': 'voronoi',
    'particle_vortex': 'radial',
    'geometric_dance': 'symmetry',
    'wave_interference': 'wave',
    'kaleidoscope_burst': 'symmetry',
    'rainbow_flow': 'rainbow',
    'electric_plasma': 'pulse',
    'audio_grid': 'audio'
  };
  
  if (slug in specialCases) {
    return specialCases[slug];
  }
  
  // デフォルトはスラッグのハッシュから決定
  const hash = simpleHash(slug);
  const styles: ShaderStyle[] = [
    'gradient', 'radial', 'wave', 'fractal', 
    'noise', 'pixelated', 'symmetry', 'audio'
  ];
  
  return styles[hash % styles.length];
}

// シェーダーコードからデフォルト色を抽出
function extractColorsFromShader(shaderCode: string, slug: string): string[] {
  const colors: string[] = [];
  
  // vec3/vec4 色定義を検索
  const vecColorRegex = /vec[34]\s*\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)/g;
  let match;
  
  while ((match = vecColorRegex.exec(shaderCode)) !== null) {
    const r = Math.min(255, Math.floor(parseFloat(match[1]) * 255));
    const g = Math.min(255, Math.floor(parseFloat(match[2]) * 255));
    const b = Math.min(255, Math.floor(parseFloat(match[3]) * 255));
    colors.push(`rgb(${r}, ${g}, ${b})`);
  }
  
  // ハッシュカラー定義を検索
  const hexColorRegex = /#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})/g;
  while ((match = hexColorRegex.exec(shaderCode)) !== null) {
    colors.push(match[0]);
  }
  
  // スタイルに基づいたデフォルト色を提供
  if (colors.length === 0) {
    const style = getShaderStyleFromName(slug);
    const hash = simpleHash(slug); // 同じスラグでも一貫した色になるよう
    
    // スタイルごとのデフォルト色
    const styleColors: Record<ShaderStyle, string[]> = {
      'rainbow': ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
      'gradient': [`hsl(${hash % 360}, 70%, 50%)`, `hsl(${(hash + 120) % 360}, 70%, 50%)`],
      'radial': ['#4A90E2', '#C0C0FF', '#E0E0FF'],
      'tunnel': ['#1E3A8A', '#3B82F6', '#93C5FD'],
      'wave': ['#3B82F6', '#60A5FA', '#93C5FD'],
      'pulse': ['#BE185D', '#EC4899', '#F9A8D4'],
      'fractal': ['#6D28D9', '#8B5CF6', '#A78BFA'],
      'noise': ['#1F2937', '#374151', '#4B5563'],
      'voronoi': ['#059669', '#10B981', '#34D399'],
      'pixelated': [`hsl(${hash % 360}, 70%, 50%)`, `hsl(${(hash + 60) % 360}, 70%, 50%)`, `hsl(${(hash + 180) % 360}, 70%, 50%)`],
      'symmetry': ['#6D28D9', '#8B5CF6', '#C4B5FD'],
      'audio': ['#0284C7', '#0EA5E9', '#38BDF8']
    };
    
    return styleColors[style];
  }
  
  return colors;
}

// サムネイルを生成する関数
async function generateThumbnail(shaderCode: string, slug: string): Promise<Buffer> {
  const canvas = createCanvas(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
  const ctx = canvas.getContext('2d');
  
  // シェーダースタイルとカラーを取得
  const style = getShaderStyleFromName(slug);
  const colors = extractColorsFromShader(shaderCode, slug);
  
  // スタイルに基づいてサムネイルをレンダリング
  switch (style) {
    case 'rainbow':
      renderRainbowStyle(ctx, colors, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
      break;
    case 'gradient':
      renderGradientStyle(ctx, colors, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
      break;
    case 'radial':
      renderRadialStyle(ctx, colors, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, slug);
      break;
    case 'tunnel':
      renderTunnelStyle(ctx, colors, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
      break;
    case 'wave':
      renderWaveStyle(ctx, colors, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, slug);
      break;
    case 'pulse':
      renderPulseStyle(ctx, colors, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
      break;
    case 'fractal':
      renderFractalStyle(ctx, colors, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, slug);
      break;
    case 'noise':
      renderNoiseStyle(ctx, colors, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
      break;
    case 'voronoi':
      renderVoronoiStyle(ctx, colors, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, slug);
      break;
    case 'pixelated':
      renderPixelatedStyle(ctx, colors, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
      break;
    case 'symmetry':
      renderSymmetryStyle(ctx, colors, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, slug);
      break;
    case 'audio':
      renderAudioStyle(ctx, colors, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
      break;
  }
  
  return canvas.toBuffer('image/png');
}

// 文字列から一貫性のあるハッシュを生成
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit整数に変換
  }
  // 負の値を避ける
  return Math.abs(hash);
}

// レインボースタイルのレンダリング
function renderRainbowStyle(ctx: any, colors: string[], width: number, height: number) {
  // 虹色のグラデーション
  const usedColors = colors.length >= 5 ? colors : 
    ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
  
  for (let i = 0; i < usedColors.length; i++) {
    const segmentWidth = width / usedColors.length;
    ctx.fillStyle = usedColors[i];
    ctx.fillRect(i * segmentWidth, 0, segmentWidth, height);
  }
  
  // 流れる波のオーバーレイ
  ctx.globalCompositeOperation = 'overlay';
  for (let y = 50; y < height; y += 100) {
    ctx.beginPath();
    for (let x = 0; x <= width; x += 5) {
      const waveHeight = Math.sin(x / 50) * 25;
      if (x === 0) {
        ctx.moveTo(x, y + waveHeight);
      } else {
        ctx.lineTo(x, y + waveHeight);
      }
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  
  // きらきらエフェクト
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 2 + Math.random() * 4;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
  }
}

// グラデーションスタイルのレンダリング
function renderGradientStyle(ctx: any, colors: string[], width: number, height: number) {
  // バリエーションを作成するためにスライドのハッシュ値を使用
  const variation = Math.floor(Math.random() * 4);
  
  switch (variation) {
    // 多色グラデーション
    case 0: {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      colors.forEach((color, i) => {
        gradient.addColorStop(i / (colors.length - 1 || 1), color);
      });
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // 重ね合わせグラデーション
      const overlayGradient = ctx.createLinearGradient(width, 0, 0, height);
      ctx.globalCompositeOperation = 'overlay';
      
      colors.slice().reverse().forEach((color, i) => {
        const stop = i / (colors.length - 1 || 1);
        overlayGradient.addColorStop(stop, color.replace('rgb', 'rgba').replace(')', ', 0.3)'));
      });
      
      ctx.fillStyle = overlayGradient;
      ctx.fillRect(0, 0, width, height);
      break;
    }
    
    // 垂直グラデーション（色相変化）
    case 1: {
      const baseColor = colors[0] || '#3B82F6';
      let hue = 0;
      
      // 色からHSLを抽出
      if (baseColor.startsWith('#')) {
        const r = parseInt(baseColor.slice(1, 3), 16) / 255;
        const g = parseInt(baseColor.slice(3, 5), 16) / 255;
        const b = parseInt(baseColor.slice(5, 7), 16) / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        
        if (max === min) {
          hue = 0;
        } else if (max === r) {
          hue = 60 * ((g - b) / (max - min));
        } else if (max === g) {
          hue = 60 * (2 + (b - r) / (max - min));
        } else {
          hue = 60 * (4 + (r - g) / (max - min));
        }
        
        if (hue < 0) hue += 360;
      }
      
      // 縦線を描画し色相を変化させる
      for (let x = 0; x < width; x++) {
        const normalizedX = x / width;
        const currentHue = (hue + normalizedX * 60) % 360;
        
        ctx.fillStyle = `hsl(${currentHue}, 70%, 60%)`;
        ctx.fillRect(x, 0, 1, height);
      }
      
      // オーバーレイパターン
      ctx.globalCompositeOperation = 'overlay';
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      break;
    }
    
    // 対角グラデーション
    case 2: {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      
      // 最低2色のグラデーションを確保
      const gradColors = colors.length >= 2 ? colors : 
        [...colors, colors[0] || '#3B82F6', '#FFFFFF'];
      
      gradColors.forEach((color, i) => {
        gradient.addColorStop(i / (gradColors.length - 1), color);
      });
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // 斜めの線を重ねる
      ctx.globalCompositeOperation = 'overlay';
      for (let i = -height; i < width + height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + height, height);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      break;
    }
    
    // 放射状グラデーション
    case 3: {
      const centerX = width / 2;
      const centerY = height / 2;
      
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, Math.hypot(width, height) / 2
      );
      
      colors.forEach((color, i) => {
        gradient.addColorStop(i / (colors.length - 1 || 1), color);
      });
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // 中心から放射状の線
      ctx.globalCompositeOperation = 'overlay';
      const lineCount = 36;
      for (let i = 0; i < lineCount; i++) {
        const angle = (i / lineCount) * Math.PI * 2;
        const x2 = centerX + Math.cos(angle) * Math.max(width, height);
        const y2 = centerY + Math.sin(angle) * Math.max(width, height);
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      break;
    }
  }
  
  // グローエフェクト
  addGlowEffect(ctx, colors, width, height);
}

// ノイズスタイルのレンダリング
function renderNoiseStyle(ctx: any, colors: string[], width: number, height: number) {
  // ベースの背景色
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  colors.forEach((color, i) => {
    bgGradient.addColorStop(i / (colors.length - 1 || 1), color);
  });
  
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);
  
  // ノイズ効果
  const pixelSize = 4 + Math.floor(Math.random() * 6);
  for (let x = 0; x < width; x += pixelSize) {
    for (let y = 0; y < height; y += pixelSize) {
      if (Math.random() > 0.5) continue; // 半分のピクセルだけ描画
      
      const brightness = 0.5 + Math.random() * 0.5;
      const color = colors[Math.floor(Math.random() * colors.length)] || '#FFFFFF';
      
      // 色をHSLに変換して明るさを調整
      let r, g, b;
      if (color.startsWith('#')) {
        r = parseInt(color.slice(1, 3), 16);
        g = parseInt(color.slice(3, 5), 16);
        b = parseInt(color.slice(5, 7), 16);
      } else if (color.startsWith('rgb')) {
        const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
          r = parseInt(rgbMatch[1]);
          g = parseInt(rgbMatch[2]);
          b = parseInt(rgbMatch[3]);
        } else {
          r = g = b = 128;
        }
      } else {
        r = g = b = 128;
      }
      
      // 明るさ調整
      r = Math.min(255, Math.floor(r * brightness));
      g = Math.min(255, Math.floor(g * brightness));
      b = Math.min(255, Math.floor(b * brightness));
      
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(x, y, pixelSize, pixelSize);
    }
  }
  
  // オーバーレイグロー
  const centerX = width / 2;
  const centerY = height / 2;
  
  ctx.globalCompositeOperation = 'lighter';
  const glow = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, width / 2
  );
  glow.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
}

// ピクセル化スタイルのレンダリング
function renderPixelatedStyle(ctx: any, colors: string[], width: number, height: number) {
  // 黒背景
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);
  
  // 色のマップを作成
  const pixelColors = [...colors];
  if (pixelColors.length < 4) {
    pixelColors.push('#FFFFFF', '#000000');
  }
  
  // ピクセルグリッドを描画
  const gridSize = 20 + Math.floor(Math.random() * 20);
  
  for (let x = 0; x < width; x += gridSize) {
    for (let y = 0; y < height; y += gridSize) {
      // ランダムに色を選択
      const colorIndex = Math.floor(Math.random() * pixelColors.length);
      
      ctx.fillStyle = pixelColors[colorIndex];
      ctx.fillRect(x, y, gridSize, gridSize);
    }
  }
}

// オーディオビジュアライザースタイルのレンダリング
function renderAudioStyle(ctx: any, colors: string[], width: number, height: number) {
  // 背景グラデーション
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, colors[0] || '#0284C7');
  gradient.addColorStop(1, colors[1] || '#0EA5E9');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  const centerY = height / 2;
  
  // オーディオバーを描画
  const barCount = 50;
  const barWidth = Math.floor(width / barCount) - 4;
  const maxBarHeight = height * 0.6;
  
  for (let i = 0; i < barCount; i++) {
    // サイン波に基づいて高さを変化させる
    const normalizedPos = i / barCount;
    const sineValue = Math.sin(normalizedPos * Math.PI * 8) * 0.5 + 0.5;
    const barHeight = sineValue * maxBarHeight;
    
    const x = (width / barCount) * i;
    const y = centerY - barHeight / 2;
    
    // バーグラデーション
    const barGradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
    barGradient.addColorStop(0, colors[2] || '#38BDF8');
    barGradient.addColorStop(1, 'rgba(255, 255, 255, 0.5)');
    
    ctx.fillStyle = barGradient;
    ctx.fillRect(x, y, barWidth, barHeight);
  }
  
  // 波形ライン
  ctx.beginPath();
  for (let x = 0; x < width; x += 2) {
    const normalizedX = x / width;
    const y = centerY + 
      Math.sin(normalizedX * Math.PI * 12) * (height * 0.15) + 
      Math.sin(normalizedX * Math.PI * 7) * (height * 0.1);
    
    if (x === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // 周波数ドットをオーバーレイ
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * width;
    const normalizedX = x / width;
    const sineValue = Math.sin(normalizedX * Math.PI * 8) * 0.5 + 0.5;
    
    // ドットをサイン波に沿って配置
    const y = centerY + (Math.random() * 2 - 1) * (sineValue * height * 0.3);
    const size = 2 + Math.random() * 3;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
  }
}

// 放射状スタイルのレンダリング
function renderRadialStyle(ctx: any, colors: string[], width: number, height: number, slug: string) {
  const centerX = width / 2;
  const centerY = height / 2;
  
  // スラッグからバリエーションを決定
  const hash = simpleHash(slug);
  const variation = hash % 3;
  
  // 背景
  ctx.fillStyle = colors[colors.length - 1] || '#000000';
  ctx.fillRect(0, 0, width, height);
  
  switch (variation) {
    // 同心円バリエーション
    case 0: {
      const ringCount = 8 + (hash % 10);
      const maxRadius = Math.min(width, height) * 0.9;
      
      for (let i = 0; i < ringCount; i++) {
        const normalizedPos = i / (ringCount - 1);
        const radius = maxRadius * normalizedPos;
        
        const colorIndex = i % colors.length;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = colors[colorIndex] || '#FFFFFF';
        ctx.globalAlpha = 0.7 - (normalizedPos * 0.3);
        ctx.fill();
      }
      break;
    }
    
    // スターバースト
    case 1: {
      const rayCount = 12 + (hash % 12);
      
      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2;
        const radius = Math.min(width, height) * 0.8;
        
        const x2 = centerX + Math.cos(angle) * radius;
        const y2 = centerY + Math.sin(angle) * radius;
        
        const colorIndex = i % colors.length;
        
        const gradient = ctx.createLinearGradient(centerX, centerY, x2, y2);
        gradient.addColorStop(0, colors[colorIndex] || '#FFFFFF');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = 30 + (hash % 40);
        ctx.strokeStyle = gradient;
        ctx.stroke();
      }
      break;
    }
    
    // 円形グラデーション
    case 2: {
      const radius = Math.min(width, height) * 0.8;
      
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius
      );
      
      colors.forEach((color, i) => {
        gradient.addColorStop(i / (colors.length - 1 || 1), color);
      });
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // 同心円をオーバーレイで描画
      ctx.globalCompositeOperation = 'overlay';
      
      const circleCount = 5 + (hash % 5);
      for (let i = 0; i < circleCount; i++) {
        const normalizedPos = i / (circleCount - 1);
        const circleRadius = radius * normalizedPos;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      break;
    }
  }
  
  // すべてのバリエーションに明るいパーティクルを追加
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 1;
  
  for (let i = 0; i < 50; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * Math.min(width, height) * 0.8;
    
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    const size = 1 + Math.random() * 3;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
  }
}

// トンネルスタイルのレンダリング
function renderTunnelStyle(ctx: any, colors: string[], width: number, height: number) {
  const centerX = width / 2;
  const centerY = height / 2;
  
  // 暗い背景
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);
  
  // 奥行き感のある円を複数描画
  const circleCount = 15;
  
  for (let i = 0; i < circleCount; i++) {
    const normalizedDepth = i / (circleCount - 1);
    const radius = Math.min(width, height) * (0.1 + normalizedDepth * 0.9);
    const offset = 50 * Math.sin(normalizedDepth * Math.PI * 2);
    
    // 深さによって円の位置をずらす
    const cx = centerX + offset * (1 - normalizedDepth);
    const cy = centerY + offset * (1 - normalizedDepth) * 0.5;
    
    // グラデーションを作成
    const innerRadius = radius * 0.7;
    const gradient = ctx.createRadialGradient(
      cx, cy, innerRadius,
      cx, cy, radius
    );
    
    const colorIndex = (circleCount - i - 1) % colors.length;
    gradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
    gradient.addColorStop(0.7, colors[colorIndex] || '#3B82F6');
    gradient.addColorStop(1, `rgba(0, 0, 0, 0.8)`);
    
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }
  
  // 中心に光るエフェクト
  const glowGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, 100
  );
  glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
  glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = glowGradient;
  ctx.fillRect(0, 0, width, height);
  
  // スターライン効果
  ctx.globalCompositeOperation = 'screen';
  const lineCount = 40;
  
  for (let i = 0; i < lineCount; i++) {
    const angle = (i / lineCount) * Math.PI * 2;
    const length = 30 + Math.random() * 100;
    
    const startX = centerX + Math.cos(angle) * 20;
    const startY = centerY + Math.sin(angle) * 20;
    const endX = centerX + Math.cos(angle) * (20 + length);
    const endY = centerY + Math.sin(angle) * (20 + length);
    
    const lineGradient = ctx.createLinearGradient(startX, startY, endX, endY);
    lineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    lineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

// 波スタイルのレンダリング
function renderWaveStyle(ctx: any, colors: string[], width: number, height: number, slug: string) {
  const hash = simpleHash(slug);
  const variation = hash % 3;
  
  // 背景グラデーション
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, colors[0] || '#3B82F6');
  gradient.addColorStop(1, colors[1] || '#60A5FA');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // バリエーションに基づいて波を描画
  switch (variation) {
    // サイン波
    case 0: {
      const waveCount = 3 + (hash % 3);
      const amplitude = height / (waveCount * 4);
      
      for (let w = 0; w < waveCount; w++) {
        const frequency = 1 + (w * 0.5);
        const phaseShift = w * (Math.PI / 4);
        const waveColor = colors[(w + 2) % colors.length] || '#93C5FD';
        
        ctx.beginPath();
        
        for (let x = 0; x <= width; x += 2) {
          const normalizedX = x / width;
          const y = (height / 2) + 
            amplitude * Math.sin(normalizedX * Math.PI * frequency * 8 + phaseShift) + 
            (w * amplitude * 2);
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.strokeStyle = waveColor;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      break;
    }
    
    // 水の波紋
    case 1: {
      const rippleCount = 5 + (hash % 5);
      const centerX = width / 2;
      const centerY = height / 2;
      
      for (let i = 0; i < rippleCount; i++) {
        const normalizedI = i / (rippleCount - 1);
        const radius = Math.min(width, height) * normalizedI * 0.9;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 - normalizedI * 0.6})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // 波紋効果
      ctx.globalCompositeOperation = 'overlay';
      for (let i = 0; i < 3; i++) {
        const normalizedI = i / 2;
        const radius = Math.min(width, height) * (0.4 + normalizedI * 0.5);
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = colors[(i + 2) % colors.length] || '#93C5FD';
        ctx.lineWidth = 8;
        ctx.stroke();
      }
      break;
    }
    
    // 複合波形
    case 2: {
      const centerY = height / 2;
      
      // 波形を複数重ねる
      for (let layer = 0; layer < 3; layer++) {
        ctx.beginPath();
        
        for (let x = 0; x <= width; x += 2) {
          const normalizedX = x / width;
          
          // 複数の周波数を組み合わせた波形
          const y = centerY + 
            Math.sin(normalizedX * Math.PI * 4) * (height * 0.1) +
            Math.sin(normalizedX * Math.PI * 8) * (height * 0.05) +
            Math.sin(normalizedX * Math.PI * 16) * (height * 0.025) +
            (layer - 1) * (height * 0.15);
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        const colorIndex = (layer + 2) % colors.length;
        ctx.strokeStyle = colors[colorIndex] || '#93C5FD';
        ctx.lineWidth = 4;
        ctx.stroke();
      }
      
      // 横線のオーバーレイ
      ctx.globalCompositeOperation = 'overlay';
      for (let y = 0; y < height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      break;
    }
  }
  
  // 波形の上にパーティクル
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 1 + Math.random() * 3;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fill();
  }
}

// パルススタイルのレンダリング
function renderPulseStyle(ctx: any, colors: string[], width: number, height: number) {
  const centerX = width / 2;
  const centerY = height / 2;
  
  // 背景グラデーション
  const bgGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, Math.max(width, height)
  );
  bgGradient.addColorStop(0, colors[0] || '#BE185D');
  bgGradient.addColorStop(0.5, colors[1] || '#EC4899');
  bgGradient.addColorStop(1, colors[0] || '#BE185D');
  
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);
  
  // パルスリング
  const pulseCount = 7;
  const maxRadius = Math.max(width, height) * 0.8;
  
  for (let i = 0; i < pulseCount; i++) {
    const normalizedRadius = i / pulseCount;
    const radius = maxRadius * normalizedRadius;
    
    const alpha = 0.7 - normalizedRadius * 0.6;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = 3 + (1 - normalizedRadius) * 5;
    ctx.stroke();
  }
  
  // 中心にグロー効果
  const glowGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, Math.min(width, height) * 0.3
  );
  glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = glowGradient;
  ctx.fillRect(0, 0, width, height);
  
  // エネルギー線
  ctx.globalCompositeOperation = 'screen';
  const lineCount = 24;
  
  for (let i = 0; i < lineCount; i++) {
    const angle = (i / lineCount) * Math.PI * 2;
    const length = Math.min(width, height) * 0.4;
    
    const startX = centerX + Math.cos(angle) * 20;
    const startY = centerY + Math.sin(angle) * 20;
    const endX = centerX + Math.cos(angle) * (20 + length);
    const endY = centerY + Math.sin(angle) * (20 + length);
    
    const lineGradient = ctx.createLinearGradient(startX, startY, endX, endY);
    lineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    lineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  // パーティクル
  for (let i = 0; i < 60; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * Math.min(width, height) * 0.5;
    
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    const size = 1 + Math.random() * 3;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
  }
}

// フラクタルスタイルのレンダリング
function renderFractalStyle(ctx: any, colors: string[], width: number, height: number, slug: string) {
  const centerX = width / 2;
  const centerY = height / 2;
  const hash = simpleHash(slug);
  const variation = hash % 3;
  
  // 背景グラデーション
  const gradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, Math.max(width, height) / 2
  );
  gradient.addColorStop(0, colors[0] || '#6D28D9');
  gradient.addColorStop(1, colors[1] || '#8B5CF6');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  switch (variation) {
    // シェルピンスキーの三角形風
    case 0: {
      const iterations = 5;
      const size = Math.min(width, height) * 0.8;
      
      function drawTriangle(x: number, y: number, size: number, depth: number) {
        if (depth === 0) return;
        
        const height = size * Math.sqrt(3) / 2;
        
        ctx.beginPath();
        ctx.moveTo(x, y - height / 2);
        ctx.lineTo(x - size / 2, y + height / 2);
        ctx.lineTo(x + size / 2, y + height / 2);
        ctx.closePath();
        
        // 深さによって色を変える
        const colorIndex = depth % colors.length;
        ctx.fillStyle = `rgba(${hexToRgb(colors[colorIndex] || '#A78BFA')}, ${0.4 + depth * 0.1})`;
        ctx.fill();
        
        const newSize = size / 2;
        
        // 再帰的に小さい三角形を描画
        if (depth > 1) {
          drawTriangle(x, y - height / 4, newSize, depth - 1);
          drawTriangle(x - size / 4, y + height / 4, newSize, depth - 1);
          drawTriangle(x + size / 4, y + height / 4, newSize, depth - 1);
        }
      }
      
      drawTriangle(centerX, centerY, size, iterations);
      break;
    }
    
    // マンデルブロ風パターン
    case 1: {
      // マンデルブロ集合を完全に計算するのは複雑なので、単純化したバージョン
      const size = Math.min(width, height) * 0.5;
      const iterations = 5;
      
      for (let i = 0; i < iterations; i++) {
        const scale = 1 - (i / iterations);
        const angle = i * (Math.PI / 8);
        
        const bubblesCount = 3 + i;
        for (let j = 0; j < bubblesCount; j++) {
          const bubbleAngle = angle + (j * Math.PI * 2 / bubblesCount);
          const distance = size * scale * 0.5;
          
          const x = centerX + Math.cos(bubbleAngle) * distance;
          const y = centerY + Math.sin(bubbleAngle) * distance;
          const bubbleSize = size * scale * 0.4;
          
          ctx.beginPath();
          ctx.arc(x, y, bubbleSize, 0, Math.PI * 2);
          
          const colorIndex = (i + j) % colors.length;
          ctx.fillStyle = colors[colorIndex] || '#A78BFA';
          ctx.globalAlpha = 0.6;
          ctx.fill();
        }
      }
      
      ctx.globalAlpha = 1.0;
      break;
    }
    
    // ジュリア集合風パターン
    case 2: {
      // 複雑なジュリア集合の代わりに、螺旋状パターン
      const armCount = 5;
      const pointsPerArm = 50;
      
      for (let arm = 0; arm < armCount; arm++) {
        const baseAngle = (arm / armCount) * Math.PI * 2;
        
        ctx.beginPath();
        
        for (let i = 0; i < pointsPerArm; i++) {
          const ratio = i / pointsPerArm;
          const spiralRadius = ratio * Math.min(width, height) * 0.45;
          const angle = baseAngle + ratio * Math.PI * 4;
          
          const x = centerX + Math.cos(angle) * spiralRadius;
          const y = centerY + Math.sin(angle) * spiralRadius;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        const colorIndex = arm % colors.length;
        ctx.strokeStyle = colors[colorIndex] || '#A78BFA';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      break;
    }
  }
  
  // グローエフェクト
  ctx.globalCompositeOperation = 'screen';
  const glowGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, Math.min(width, height) * 0.2
  );
  glowGradient.addColorStop(0, `rgba(${hexToRgb(colors[2] || '#A78BFA')}, 0.5)`);
  glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  
  ctx.fillStyle = glowGradient;
  ctx.fillRect(0, 0, width, height);
}

// ボロノイスタイルのレンダリング
function renderVoronoiStyle(ctx: any, colors: string[], width: number, height: number, slug: string) {
  // 背景
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);
  
  const hash = simpleHash(slug);
  const pointCount = 20 + (hash % 20);
  const points = [];
  
  // ランダムな点を生成
  for (let i = 0; i < pointCount; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const colorIndex = i % colors.length;
    points.push({ x, y, color: colors[colorIndex] || '#059669' });
  }
  
  // 単純なボロノイダイアグラムを描画（完全正確ではないが、ビジュアル効果としては十分）
  for (let x = 0; x < width; x += 4) {
    for (let y = 0; y < height; y += 4) {
      // 最も近い点を見つける
      let minDist = Infinity;
      let closestPoint = null;
      
      for (const point of points) {
        const dist = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
        if (dist < minDist) {
          minDist = dist;
          closestPoint = point;
        }
      }
      
      if (closestPoint) {
        ctx.fillStyle = closestPoint.color;
        ctx.fillRect(x, y, 4, 4);
      }
    }
  }
  
  // セルの境界線を描画
  ctx.globalCompositeOperation = 'overlay';
  for (const point of points) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
  }
  
  // エッジハイライト
  ctx.globalCompositeOperation = 'screen';
  for (let x = 0; x < width; x += 20) {
    for (let y = 0; y < height; y += 20) {
      if (Math.random() > 0.7) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(x, y, 20, 20);
      }
    }
  }
}

// シンメトリースタイルのレンダリング
function renderSymmetryStyle(ctx: any, colors: string[], width: number, height: number, slug: string) {
  const centerX = width / 2;
  const centerY = height / 2;
  const hash = simpleHash(slug);
  
  // 背景
  ctx.fillStyle = colors[0] || '#6D28D9';
  ctx.fillRect(0, 0, width, height);
  
  // 対称性の数（偶数）
  const symmetryCount = 6 + 2 * (hash % 4);
  
  // 対称パターンを描画
  ctx.save();
  ctx.translate(centerX, centerY);
  
  for (let i = 0; i < symmetryCount; i++) {
    ctx.save();
    ctx.rotate((i / symmetryCount) * Math.PI * 2);
    
    // 各対称軸に沿って図形を描画
    const colorIndex = i % colors.length;
    const color = colors[colorIndex] || '#8B5CF6';
    
    // 三角形のパターン
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width * 0.2, height * 0.1);
    ctx.lineTo(width * 0.1, height * 0.3);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.8;
    ctx.fill();
    
    // 円弧
    ctx.beginPath();
    ctx.arc(width * 0.15, 0, width * 0.1, 0, Math.PI, false);
    ctx.strokeStyle = colors[(i + 1) % colors.length] || '#C4B5FD';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // 長方形
    ctx.fillStyle = colors[(i + 2) % colors.length] || '#C4B5FD';
    ctx.globalAlpha = 0.6;
    ctx.fillRect(width * 0.25, 0, width * 0.1, height * 0.05);
    
    ctx.restore();
  }
  
  ctx.restore();
  
  // 中心にグローエフェクト
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 1.0;
  
  const glowGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, Math.min(width, height) * 0.2
  );
  glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.fillStyle = glowGradient;
  ctx.fillRect(0, 0, width, height);
  
  // 放射状の線
  ctx.globalCompositeOperation = 'overlay';
  for (let i = 0; i < symmetryCount * 2; i++) {
    const angle = (i / (symmetryCount * 2)) * Math.PI * 2;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(angle) * width,
      centerY + Math.sin(angle) * height
    );
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

// グローエフェクトを追加
function addGlowEffect(ctx: any, colors: string[], width: number, height: number) {
  const centerX = width / 2;
  const centerY = height / 2;
  
  // サイズと位置にわずかなランダム性を追加
  const glowX = centerX + (Math.random() * 40 - 20);
  const glowY = centerY + (Math.random() * 40 - 20);
  const glowSize = Math.min(width, height) * (0.3 + Math.random() * 0.2);
  
  // グラデーションを作成
  ctx.globalCompositeOperation = 'screen';
  const glow = ctx.createRadialGradient(
    glowX, glowY, 0,
    glowX, glowY, glowSize
  );
  
  // グローの色を選択
  const glowColor = colors[Math.floor(Math.random() * colors.length)] || '#FFFFFF';
  
  glow.addColorStop(0, `rgba(${hexToRgb(glowColor)}, 0.4)`);
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
  
  // 小さな光の点を追加
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 1 + Math.random() * 2;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fill();
  }
}

// ヘックスカラーをRGB文字列に変換するヘルパー関数
function hexToRgb(hex: string): string {
  // デフォルト値
  if (!hex || !hex.startsWith('#')) {
    return '255, 255, 255';
  }
  
  let r, g, b;
  
  // #RGB または #RRGGBB 形式をチェック
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const formattedHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(formattedHex);
  
  if (result) {
    r = parseInt(result[1], 16);
    g = parseInt(result[2], 16);
    b = parseInt(result[3], 16);
    return `${r}, ${g}, ${b}`;
  }
  
  return '255, 255, 255';
}

// スクリプト実行
async function generateThumbnails() {
  try {
    // サムネイル保存ディレクトリの作成
    await fs.mkdir(THUMBNAIL_DIR, { recursive: true });
    
    // シェーダーのメタデータを読み込む
    const yamlPath = path.join(process.cwd(), 'data', 'shaders.yaml');
    const yamlContent = await fs.readFile(yamlPath, 'utf8');
    const shaders = YAML.parse(yamlContent);
    
    console.log(`📸 シェーダーサムネイルを生成中...`);
    
    // 正常に処理されたカウント
    let successCount = 0;
    
    for (const shader of shaders) {
      try {
        const { slug, shaderCode } = shader;
        console.log(`🔄 処理中: ${slug}`);
        
        // サムネイルを生成
        const thumbnailBuffer = await generateThumbnail(shaderCode, slug);
        
        // サムネイルを保存
        const thumbnailPath = path.join(THUMBNAIL_DIR, `${slug}.png`);
        await fs.writeFile(thumbnailPath, thumbnailBuffer);
        
        console.log(`✅ 生成完了: ${thumbnailPath}`);
        successCount++;
      } catch (error) {
        console.error(`❌ シェーダー「${shader.slug}」の処理中にエラー: ${error}`);
      }
    }
    
    console.log(`🎉 処理完了: ${successCount}/${shaders.length}のサムネイルを生成しました`);
  } catch (error) {
    console.error('サムネイル生成中にエラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプト実行
generateThumbnails(); 