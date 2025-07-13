'use client';

import { useState } from 'react';
import { Download, Crop, Image as ImageIcon, Smartphone, Monitor, Scissors } from 'lucide-react';
import { ImageFile } from '@/types';
import { cropImageToSize, formatFileSize, downloadFile } from '@/lib/imageUtils';
import { socialPlatforms, getDomesticPlatforms, getInternationalPlatforms } from '@/lib/socialPlatforms';
import InteractiveCropper from './InteractiveCropper';

interface SocialCropperProps {
  selectedImage: ImageFile;
}

export default function SocialCropper({ selectedImage }: SocialCropperProps) {
  const [cropMode, setCropMode] = useState('social');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [isCropping, setIsCropping] = useState(false);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'domestic' | 'international'>('domestic');

  const domesticPlatforms = getDomesticPlatforms();
  const internationalPlatforms = getInternationalPlatforms();
  const currentPlatforms = activeTab === 'domestic' ? domesticPlatforms : internationalPlatforms;

  const selectedPlatformData = socialPlatforms.find(p => p.id === selectedPlatform);
  const selectedSizeData = selectedPlatformData?.sizes.find(s => s.name === selectedSize);

  const handleCrop = async () => {
    if (!selectedSizeData) return;

    setIsCropping(true);
    try {
      const cropped = await cropImageToSize(
        selectedImage.file,
        selectedSizeData.width,
        selectedSizeData.height,
        0.9
      );
      
      setCroppedFile(cropped);
      
      // 创建预览URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const newPreviewUrl = URL.createObjectURL(cropped);
      setPreviewUrl(newPreviewUrl);
    } catch (error) {
      console.error('裁剪失败:', error);
      alert('图片裁剪失败，请重试');
    } finally {
      setIsCropping(false);
    }
  };

  const handleDownload = () => {
    if (croppedFile && selectedPlatformData && selectedSizeData) {
      const filename = `${selectedPlatformData.name}_${selectedSizeData.name}_${selectedSizeData.width}x${selectedSizeData.height}_${croppedFile.name}`;
      downloadFile(croppedFile, filename);
      
      // 下载后清理资源
      setTimeout(() => {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        setCroppedFile(null);
      }, 1000);
    }
  };

  // 如果选择交互式裁剪，显示交互式裁剪器
  if (cropMode === 'interactive') {
    return <InteractiveCropper selectedImage={selectedImage} />;
  }

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Crop className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">图片裁剪</h2>
        <p className="text-gray-600">
          选择社交平台标准尺寸或使用智能交互式裁剪
        </p>
      </div>

      {/* 裁剪模式选择 */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            onClick={() => setCropMode('social')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
              cropMode === 'social'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>社交平台尺寸</span>
          </button>
          <button
            onClick={() => setCropMode('interactive')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
              cropMode === 'interactive'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>智能裁剪</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 平台选择 */}
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
                  <span className="text-gray-600">尺寸:</span>
                  <span className="font-medium">{selectedImage.info.width} × {selectedImage.info.height}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">宽高比:</span>
                  <span className="font-medium">
                    {(selectedImage.info.width / selectedImage.info.height).toFixed(2)}:1
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 平台分类标签 */}
          <div>
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4">
              <button
                onClick={() => setActiveTab('domestic')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'domestic'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Smartphone className="w-4 h-4 inline mr-2" />
                国内平台
              </button>
              <button
                onClick={() => setActiveTab('international')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'international'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Monitor className="w-4 h-4 inline mr-2" />
                国际平台
              </button>
            </div>

            <h4 className="text-md font-semibold text-gray-900 mb-3">选择平台</h4>
            <div className="space-y-3">
              {currentPlatforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => {
                    setSelectedPlatform(platform.id);
                    setSelectedSize('');
                  }}
                  className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                    selectedPlatform === platform.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{platform.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{platform.name}</div>
                      <div className="text-sm text-gray-500">{platform.sizes.length} 种尺寸</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 尺寸选择 */}
          {selectedPlatformData && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">选择尺寸</h4>
              <div className="space-y-3">
                {selectedPlatformData.sizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => setSelectedSize(size.name)}
                    className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                      selectedSize === size.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{size.name}</div>
                        <div className="text-sm text-gray-500">{size.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {size.width} × {size.height}
                        </div>
                        <div className="text-xs text-gray-500">{size.aspectRatio}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 裁剪按钮 */}
          <button
            onClick={handleCrop}
            disabled={!selectedSizeData || isCropping}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              !selectedSizeData || isCropping
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {isCropping ? (
              <span className="flex items-center justify-center">
                <Crop className="w-4 h-4 mr-2 animate-pulse" />
                裁剪中...
              </span>
            ) : !selectedSizeData ? (
              '请选择平台和尺寸'
            ) : (
              `裁剪为 ${selectedSizeData.width} × ${selectedSizeData.height}`
            )}
          </button>
        </div>

        {/* 裁剪结果 */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">裁剪预览</h3>
            {croppedFile && previewUrl ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <img
                  src={previewUrl}
                  alt="裁剪后的图片"
                  className="w-full h-48 object-contain rounded-lg mb-4"
                />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">平台:</span>
                    <span className="font-medium">{selectedPlatformData?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">尺寸类型:</span>
                    <span className="font-medium">{selectedSizeData?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">输出尺寸:</span>
                    <span className="font-medium">
                      {selectedSizeData?.width} × {selectedSizeData?.height}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">文件大小:</span>
                    <span className="font-medium">{formatFileSize(croppedFile.size)}</span>
                  </div>
                </div>
                
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  下载裁剪后的图片
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">裁剪后的图片将在这里显示</p>
              </div>
            )}
          </div>

          {/* 平台说明 */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-purple-900 mb-2">📱 平台建议</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• <strong>小红书</strong>: 正方形图片效果最佳</li>
              <li>• <strong>抖音</strong>: 竖屏9:16比例最适合</li>
              <li>• <strong>Instagram</strong>: 支持多种比例，正方形最经典</li>
              <li>• <strong>Twitter</strong>: 16:9横图显示效果好</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
