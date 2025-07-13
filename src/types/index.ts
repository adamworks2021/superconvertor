// 图片处理相关类型定义

export interface ImageFile {
  file: File;
  id: string;
  preview: string;
  info: ImageInfo;
}

export interface ImageInfo {
  width: number;
  height: number;
  size: number;
  type: string;
  name: string;
}

export interface ProcessingResult {
  originalFile: File;
  processedFile: File;
  processingType: 'compress' | 'convert' | 'crop';
  settings: ProcessingSettings;
}

export interface ProcessingSettings {
  // 压缩设置
  compression?: {
    maxSizeMB: number;
    maxWidthOrHeight: number;
    quality: number;
    preserveExif: boolean;
  };
  
  // 格式转换设置
  conversion?: {
    targetFormat: string;
    quality: number;
  };
  
  // 裁剪设置
  cropping?: {
    width: number;
    height: number;
    aspectRatio: string;
    platformName?: string;
  };
}

export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  error: string | null;
  currentStep: string;
}

// 社交平台相关类型（从 socialPlatforms.ts 导入）
export interface SocialPlatformSize {
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  description: string;
}

export interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  category: 'domestic' | 'international';
  sizes: SocialPlatformSize[];
}

// 工具栏选项
export type ToolType = 'upload' | 'compress' | 'convert' | 'crop' | 'batch';

export interface ToolOption {
  id: ToolType;
  name: string;
  description: string;
  icon: string;
  active: boolean;
}

// 批处理相关
export interface BatchOperation {
  id: string;
  type: 'compress' | 'convert' | 'crop';
  settings: ProcessingSettings;
  files: ImageFile[];
  results: ProcessingResult[];
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
}

// 预设配置
export interface PresetConfig {
  id: string;
  name: string;
  description: string;
  settings: ProcessingSettings;
  category: 'compression' | 'social' | 'web' | 'print';
}

// 常用预设
export const commonPresets: PresetConfig[] = [
  {
    id: 'web-optimized',
    name: 'Web优化',
    description: '适合网站使用的压缩设置',
    category: 'web',
    settings: {
      compression: {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1920,
        quality: 0.8,
        preserveExif: false
      }
    }
  },
  {
    id: 'social-media',
    name: '社交媒体',
    description: '适合社交媒体分享的设置',
    category: 'social',
    settings: {
      compression: {
        maxSizeMB: 1,
        maxWidthOrHeight: 1080,
        quality: 0.85,
        preserveExif: false
      }
    }
  },
  {
    id: 'high-quality',
    name: '高质量',
    description: '保持高质量的轻度压缩',
    category: 'compression',
    settings: {
      compression: {
        maxSizeMB: 2,
        maxWidthOrHeight: 2560,
        quality: 0.95,
        preserveExif: true
      }
    }
  }
];

// 错误类型
export interface AppError {
  code: string;
  message: string;
  details?: string;
}

// 应用状态
export interface AppState {
  currentTool: ToolType;
  images: ImageFile[];
  selectedImage: ImageFile | null;
  processing: ProcessingState;
  results: ProcessingResult[];
  error: AppError | null;
}
