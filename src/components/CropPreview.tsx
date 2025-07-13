'use client';

import { useEffect, useRef } from 'react';
import { ImageFile } from '@/types';

interface CropPreviewProps {
  image: ImageFile;
  targetWidth: number;
  targetHeight: number;
  className?: string;
}

export default function CropPreview({ image, targetWidth, targetHeight, className = '' }: CropPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // 设置canvas尺寸
      canvas.width = 200;
      canvas.height = 200 * (targetHeight / targetWidth);

      // 计算裁剪区域（居中裁剪）
      const sourceAspectRatio = img.width / img.height;
      const targetAspectRatio = targetWidth / targetHeight;

      let cropX = 0;
      let cropY = 0;
      let cropWidth = img.width;
      let cropHeight = img.height;

      if (sourceAspectRatio > targetAspectRatio) {
        // 源图片更宽，需要裁剪左右
        cropWidth = img.height * targetAspectRatio;
        cropX = (img.width - cropWidth) / 2;
      } else {
        // 源图片更高，需要裁剪上下
        cropHeight = img.width / targetAspectRatio;
        cropY = (img.height - cropHeight) / 2;
      }

      // 绘制裁剪预览
      ctx.drawImage(
        img,
        cropX, cropY, cropWidth, cropHeight,
        0, 0, canvas.width, canvas.height
      );

      // 绘制边框
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
    };

    img.src = image.preview;
  }, [image, targetWidth, targetHeight]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-auto rounded-lg border border-gray-200"
      />
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
        {targetWidth}×{targetHeight}
      </div>
    </div>
  );
}
