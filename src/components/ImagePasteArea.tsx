'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clipboard, Image as ImageIcon } from 'lucide-react';
import { ImageFile } from '@/types';
import { getImageInfo, validateImageFile } from '@/lib/imageUtils';

interface ImagePasteAreaProps {
  onImagesAdded: (images: ImageFile[]) => void;
}

export default function ImagePasteArea({ onImagesAdded }: ImagePasteAreaProps) {
  const [isPasteActive, setIsPasteActive] = useState(false);

  const processClipboardFiles = useCallback(async (files: File[]) => {
    const validFiles = files.filter(validateImageFile);
    if (validFiles.length === 0) return;

    const newImages: ImageFile[] = [];
    
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      try {
        const info = await getImageInfo(file);
        const preview = URL.createObjectURL(file);
        
        newImages.push({
          file,
          id: `paste-${Date.now()}-${i}`,
          preview,
          info
        });
      } catch (error) {
        console.error('处理粘贴文件失败:', error);
      }
    }
    
    if (newImages.length > 0) {
      onImagesAdded(newImages);
    }
  }, [onImagesAdded]);

  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    // 检查是否在输入框中粘贴
    const target = e.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      // 如果在输入框中，不处理图片粘贴，让默认行为继续
      return;
    }

    const items = Array.from(e.clipboardData?.items || []);
    const files: File[] = [];

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          files.push(file);
        }
      }
    }

    if (files.length > 0) {
      e.preventDefault(); // 只有在处理图片时才阻止默认行为
      setIsPasteActive(true);
      await processClipboardFiles(files);
      setTimeout(() => setIsPasteActive(false), 1000);
    }
  }, [processClipboardFiles]);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  return (
    <div className={`bg-white rounded-xl border-2 border-dashed p-6 transition-all duration-300 ${
      isPasteActive 
        ? 'border-green-500 bg-green-50' 
        : 'border-gray-300 hover:border-blue-400'
    }`}>
      <div className="text-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${
          isPasteActive 
            ? 'bg-green-100' 
            : 'bg-gray-100'
        }`}>
          {isPasteActive ? (
            <ImageIcon className="w-6 h-6 text-green-600" />
          ) : (
            <Clipboard className="w-6 h-6 text-gray-400" />
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isPasteActive ? '正在处理粘贴的图片...' : '粘贴图片'}
        </h3>
        
        <p className="text-gray-500 mb-4">
          {isPasteActive
            ? '图片已成功粘贴！'
            : '复制图片后在页面空白处按 Ctrl+V (或 Cmd+V) 粘贴'
          }
        </p>
        
        {!isPasteActive && (
          <div className="text-xs text-gray-400">
            <p>支持从以下位置复制图片：</p>
            <ul className="mt-1 space-y-1">
              <li>• 网页中的图片 (右键复制图片)</li>
              <li>• 截图工具 (如微信截图、QQ截图)</li>
              <li>• 图片编辑软件</li>
              <li>• 文件管理器中的图片文件</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
