'use client';

import { useState } from 'react';
import { Download, Crop, Scissors, Grid } from 'lucide-react';
import { ImageFile } from '@/types';
import { cropImageToSize, formatFileSize, downloadFiles } from '@/lib/imageUtils';

interface BatchCropperProps {
  images: ImageFile[];
  onComplete: (files: File[]) => void;
}

const quickSizes = [
  { name: '小红书正方形', width: 1080, height: 1080, ratio: '1:1', platform: '小红书' },
  { name: '小红书竖版', width: 1080, height: 1440, ratio: '3:4', platform: '小红书' },
  { name: '抖音竖屏', width: 1080, height: 1920, ratio: '9:16', platform: '抖音' },
  { name: 'Instagram正方形', width: 1080, height: 1080, ratio: '1:1', platform: 'Instagram' },
  { name: 'Instagram Story', width: 1080, height: 1920, ratio: '9:16', platform: 'Instagram' },
  { name: 'Twitter横图', width: 1200, height: 675, ratio: '16:9', platform: 'Twitter' },
  { name: 'Facebook封面', width: 1200, height: 675, ratio: '16:9', platform: 'Facebook' },
  { name: 'YouTube缩略图', width: 1280, height: 720, ratio: '16:9', platform: 'YouTube' }
];

export default function BatchCropper({ images, onComplete }: BatchCropperProps) {
  const [selectedSize, setSelectedSize] = useState(quickSizes[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedFiles, setProcessedFiles] = useState<File[]>([]);

  const handleBatchCrop = async () => {
    setIsProcessing(true);
    setProgress(0);
    
    const results: File[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      
      try {
        const croppedFile = await cropImageToSize(
          image.file,
          selectedSize.width,
          selectedSize.height,
          0.9
        );
        
        // 重命名文件
        const newName = `${selectedSize.platform}_${selectedSize.name}_${selectedSize.width}x${selectedSize.height}_${croppedFile.name}`;
        const renamedFile = new File([croppedFile], newName, { type: croppedFile.type });
        
        results.push(renamedFile);
        
        setProgress(((i + 1) / images.length) * 100);
      } catch (error) {
        console.error(`裁剪图片 ${image.info.name} 失败:`, error);
      }
    }
    
    setProcessedFiles(results);
    setIsProcessing(false);
    onComplete(results);
  };

  const handleDownloadAll = () => {
    if (processedFiles.length > 0) {
      downloadFiles(processedFiles);
    }
  };

  const totalSize = processedFiles.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className="space-y-6">
      {/* 批量裁剪标题 */}
      <div className="text-center">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <Grid className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">批量裁剪</h3>
        <p className="text-gray-600">将 {images.length} 张图片批量裁剪为统一尺寸</p>
      </div>

      {/* 尺寸选择 */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-3">选择目标尺寸</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickSizes.map((size) => (
            <button
              key={size.name}
              onClick={() => setSelectedSize(size)}
              className={`p-4 text-left border-2 rounded-lg transition-all ${
                selectedSize.name === size.name
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-900">{size.name}</div>
                  <div className="text-sm text-gray-500">{size.platform}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {size.width} × {size.height}
                  </div>
                  <div className="text-xs text-gray-500">{size.ratio}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 图片预览 */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-3">待处理图片</h4>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {images.map((image) => (
            <div key={image.id} className="relative">
              <img
                src={image.preview}
                alt={image.info.name}
                className="w-full h-20 object-cover rounded-lg border border-gray-200"
              />
              <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
                {image.info.width}×{image.info.height}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 处理按钮 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          目标尺寸: {selectedSize.width} × {selectedSize.height} ({selectedSize.ratio})
        </div>
        <button
          onClick={handleBatchCrop}
          disabled={isProcessing}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 transition-colors flex items-center space-x-2"
        >
          {isProcessing ? (
            <>
              <Crop className="w-4 h-4 animate-pulse" />
              <span>裁剪中... {Math.round(progress)}%</span>
            </>
          ) : (
            <>
              <Scissors className="w-4 h-4" />
              <span>开始批量裁剪</span>
            </>
          )}
        </button>
      </div>

      {/* 进度条 */}
      {isProcessing && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* 处理结果 */}
      {processedFiles.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-green-900">
              ✅ 批量裁剪完成 ({processedFiles.length} 张图片)
            </h4>
            <button
              onClick={handleDownloadAll}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>下载全部</span>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-green-700">总文件大小: </span>
              <span className="font-medium">{formatFileSize(totalSize)}</span>
            </div>
            <div>
              <span className="text-green-700">平均文件大小: </span>
              <span className="font-medium">{formatFileSize(totalSize / processedFiles.length)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 使用提示 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 批量裁剪说明</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 所有图片将裁剪为相同尺寸</li>
          <li>• 自动居中裁剪，保持主要内容</li>
          <li>• 文件名包含平台和尺寸信息</li>
          <li>• 支持一键下载所有结果</li>
        </ul>
      </div>
    </div>
  );
}
