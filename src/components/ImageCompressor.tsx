'use client';

import { useState } from 'react';
import { Download, Zap, Image as ImageIcon, Sliders } from 'lucide-react';
import { ImageFile } from '@/types';
import { compressImage, formatFileSize, downloadFile } from '@/lib/imageUtils';

interface ImageCompressorProps {
  selectedImage: ImageFile;
}

const presets = [
  {
    id: 'web',
    name: 'Web优化',
    description: '适合网站使用',
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
    quality: 0.8
  },
  {
    id: 'social',
    name: '社交媒体',
    description: '适合分享',
    maxSizeMB: 1,
    maxWidthOrHeight: 1080,
    quality: 0.85
  },
  {
    id: 'email',
    name: '邮件附件',
    description: '快速传输',
    maxSizeMB: 0.2,
    maxWidthOrHeight: 800,
    quality: 0.7
  },
  {
    id: 'custom',
    name: '自定义',
    description: '手动调节参数',
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    quality: 0.8
  }
];

export default function ImageCompressor({ selectedImage }: ImageCompressorProps) {
  const [selectedPreset, setSelectedPreset] = useState('web');
  const [maxSizeMB, setMaxSizeMB] = useState(0.5);
  const [maxWidthOrHeight, setMaxWidthOrHeight] = useState(1920);
  const [quality, setQuality] = useState(0.8);
  const [preserveExif, setPreserveExif] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = presets.find(p => p.id === presetId);
    if (preset && presetId !== 'custom') {
      setMaxSizeMB(preset.maxSizeMB);
      setMaxWidthOrHeight(preset.maxWidthOrHeight);
      setQuality(preset.quality);
    }
  };

  const handleCompress = async () => {
    setIsCompressing(true);
    try {
      const compressed = await compressImage(selectedImage.file, {
        maxSizeMB,
        maxWidthOrHeight,
        quality,
        preserveExif,
        useWebWorker: true
      });
      
      setCompressedFile(compressed);
      
      // 创建预览URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const newPreviewUrl = URL.createObjectURL(compressed);
      setPreviewUrl(newPreviewUrl);
    } catch (error) {
      console.error('压缩失败:', error);
      alert('图片压缩失败，请重试');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (compressedFile) {
      downloadFile(compressedFile, `compressed_${compressedFile.name}`);
      
      // 下载后清理资源
      setTimeout(() => {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        setCompressedFile(null);
      }, 1000);
    }
  };

  const compressionRatio = compressedFile 
    ? Math.round((1 - compressedFile.size / selectedImage.file.size) * 100)
    : 0;

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">图片压缩</h2>
        <p className="text-gray-600">
          智能压缩图片，减小文件大小，保持视觉质量
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 压缩设置 */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">原始图片</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <img
                src={selectedImage.preview}
                alt={selectedImage.info.name}
                className="w-full h-48 object-contain rounded-lg mb-4"
              />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">文件名:</span>
                  <span className="font-medium">{selectedImage.info.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">尺寸:</span>
                  <span className="font-medium">{selectedImage.info.width} × {selectedImage.info.height}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">大小:</span>
                  <span className="font-medium">{formatFileSize(selectedImage.info.size)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 预设选择 */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3">压缩预设</h4>
            <div className="grid grid-cols-2 gap-3">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetChange(preset.id)}
                  className={`p-3 text-left border-2 rounded-lg transition-all ${
                    selectedPreset === preset.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{preset.name}</div>
                  <div className="text-sm text-gray-500">{preset.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 自定义参数 */}
          {selectedPreset === 'custom' && (
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900 flex items-center">
                <Sliders className="w-4 h-4 mr-2" />
                自定义参数
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最大文件大小: {maxSizeMB} MB
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={maxSizeMB}
                  onChange={(e) => setMaxSizeMB(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最大宽高: {maxWidthOrHeight} px
                </label>
                <input
                  type="range"
                  min="400"
                  max="4000"
                  step="100"
                  value={maxWidthOrHeight}
                  onChange={(e) => setMaxWidthOrHeight(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  图片质量: {Math.round(quality * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="preserveExif"
                  checked={preserveExif}
                  onChange={(e) => setPreserveExif(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="preserveExif" className="text-sm text-gray-700">
                  保留EXIF信息（拍摄参数等）
                </label>
              </div>
            </div>
          )}

          {/* 压缩按钮 */}
          <button
            onClick={handleCompress}
            disabled={isCompressing}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isCompressing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            {isCompressing ? (
              <span className="flex items-center justify-center">
                <Zap className="w-4 h-4 mr-2 animate-pulse" />
                压缩中...
              </span>
            ) : (
              '开始压缩'
            )}
          </button>
        </div>

        {/* 压缩结果 */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">压缩结果</h3>
            {compressedFile && previewUrl ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <img
                  src={previewUrl}
                  alt="压缩后的图片"
                  className="w-full h-48 object-contain rounded-lg mb-4"
                />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">压缩后大小:</span>
                    <span className="font-medium">{formatFileSize(compressedFile.size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">压缩比:</span>
                    <span className="font-medium text-green-600">{compressionRatio}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">节省空间:</span>
                    <span className="font-medium">
                      {formatFileSize(selectedImage.file.size - compressedFile.size)}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  下载压缩后的图片
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">压缩后的图片将在这里显示</p>
              </div>
            )}
          </div>

          {/* 压缩提示 */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-orange-900 mb-2">💡 压缩建议</h4>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• Web使用建议压缩到500KB以下</li>
              <li>• 社交媒体分享建议1MB以下</li>
              <li>• 邮件附件建议200KB以下</li>
              <li>• 质量80%通常是最佳平衡点</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
