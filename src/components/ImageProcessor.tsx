'use client';

import { useState } from 'react';
import { ImageFile, ToolType } from '@/types';
import ImageCompressor from './ImageCompressor';
import ImageConverter from './ImageConverter';
import SocialCropper from './SocialCropper';
import { AlertCircle } from 'lucide-react';

interface ImageProcessorProps {
  tool: ToolType;
  selectedImage: ImageFile | null;
  onImageSelect: (image: ImageFile) => void;
}

export default function ImageProcessor({ tool, selectedImage, onImageSelect }: ImageProcessorProps) {
  if (!selectedImage) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">请先上传图片</h3>
          <p className="text-gray-500">
            请先在"上传图片"工具中选择要处理的图片文件
          </p>
        </div>
      </div>
    );
  }

  const renderTool = () => {
    switch (tool) {
      case 'compress':
        return <ImageCompressor selectedImage={selectedImage} />;
      case 'convert':
        return <ImageConverter selectedImage={selectedImage} />;
      case 'crop':
        return <SocialCropper selectedImage={selectedImage} />;
      default:
        return (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">选择工具</h3>
              <p className="text-gray-500">
                请从左侧工具栏选择要使用的功能
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full">
      {renderTool()}
    </div>
  );
}
