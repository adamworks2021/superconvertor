'use client';

import { useState } from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import BatchProcessor from '@/components/BatchProcessor';
import ImageUploader from '@/components/ImageUploader';
import ImageProcessor from '@/components/ImageProcessor';
import { ImageFile, ToolType } from '@/types';

export default function Home() {
  const [useBatchMode, setUseBatchMode] = useState(true);
  const [currentTool, setCurrentTool] = useState<ToolType>('upload');
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);

  const handleImagesUploaded = (newImages: ImageFile[]) => {
    setImages(prev => [...prev, ...newImages]);
    if (newImages.length > 0 && !selectedImage) {
      setSelectedImage(newImages[0]);
    }
  };

  const handleImageSelect = (image: ImageFile) => {
    setSelectedImage(image);
  };

  const handleToolChange = (toolId: ToolType) => {
    setCurrentTool(toolId);
  };

  if (useBatchMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* 模式切换 */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setUseBatchMode(false)}
            className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 hover:bg-white transition-colors"
          >
            <span className="text-sm font-medium">批量模式</span>
            <ToggleRight className="w-5 h-5 text-blue-600" />
          </button>
        </div>

        <BatchProcessor onImagesUploaded={handleImagesUploaded} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 模式切换 */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setUseBatchMode(true)}
          className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 hover:bg-white transition-colors"
        >
          <span className="text-sm font-medium">单张模式</span>
          <ToggleLeft className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* 原有的单张处理界面 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SC</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SuperConvertor</h1>
                <p className="text-xs text-gray-500">单张图片处理模式</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                已处理 {images.length} 张图片
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 工具栏 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">工具箱</h2>

              <div className="space-y-3">
                {[
                  { id: 'upload', name: '上传图片', description: '选择图片文件' },
                  { id: 'compress', name: '压缩优化', description: '减小文件大小' },
                  { id: 'convert', name: '格式转换', description: '转换图片格式' },
                  { id: 'crop', name: '智能裁剪', description: '交互式精确裁剪' }
                ].map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolChange(tool.id as ToolType)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                      currentTool === tool.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <h3 className="font-medium">{tool.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{tool.description}</p>
                  </button>
                ))}
              </div>

              {/* 图片列表 */}
              {images.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">已上传图片</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {images.map((image) => (
                      <button
                        key={image.id}
                        onClick={() => handleImageSelect(image)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedImage?.id === image.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={image.preview}
                            alt={image.info.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {image.info.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {image.info.width} × {image.info.height}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 主要内容区域 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px]">
              {currentTool === 'upload' ? (
                <ImageUploader onImagesUploaded={handleImagesUploaded} />
              ) : (
                <ImageProcessor
                  tool={currentTool}
                  selectedImage={selectedImage}
                  onImageSelect={handleImageSelect}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
