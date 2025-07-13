'use client';

import { useState } from 'react';
import { Download, RefreshCw, Image as ImageIcon, FileImage } from 'lucide-react';
import { ImageFile } from '@/types';
import { convertImageFormat, convertWebPToGif, formatFileSize, downloadFile } from '@/lib/imageUtils';

interface ImageConverterProps {
  selectedImage: ImageFile;
}

const formatOptions = [
  { value: 'image/jpeg', label: 'JPG', description: '适合照片，文件较小', color: 'bg-red-100 text-red-700' },
  { value: 'image/png', label: 'PNG', description: '支持透明背景，无损压缩', color: 'bg-green-100 text-green-700' },
  { value: 'image/webp', label: 'WebP', description: '现代格式，体积最小', color: 'bg-blue-100 text-blue-700' },
  { value: 'image/gif', label: 'GIF', description: '支持动画，兼容性好', color: 'bg-purple-100 text-purple-700' },
  { value: 'image/bmp', label: 'BMP', description: '无损格式，文件较大', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'image/tiff', label: 'TIFF', description: '专业级无损格式', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'image/avif', label: 'AVIF', description: '新一代高效格式', color: 'bg-pink-100 text-pink-700' }
];

export default function ImageConverter({ selectedImage }: ImageConverterProps) {
  const [targetFormat, setTargetFormat] = useState('image/jpeg');
  const [quality, setQuality] = useState(0.9);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFile, setConvertedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionStatus, setConversionStatus] = useState('');

  const handleConvert = async () => {
    setIsConverting(true);
    setConversionProgress(0);
    setConversionStatus('准备转换...');

    try {
      let converted: File;

      // 特殊处理WebP转GIF
      if (selectedImage.file.type === 'image/webp' && targetFormat === 'image/gif') {
        setConversionStatus('正在转换WebP为GIF...');
        setConversionProgress(25);

        // 添加延迟以显示进度
        await new Promise(resolve => setTimeout(resolve, 200));
        setConversionProgress(50);

        converted = await convertWebPToGif(selectedImage.file);

        setConversionProgress(75);
        setConversionStatus('转换完成，生成预览...');
      } else {
        setConversionStatus('正在转换格式...');
        setConversionProgress(25);

        // 添加延迟以显示进度
        await new Promise(resolve => setTimeout(resolve, 200));
        setConversionProgress(50);

        converted = await convertImageFormat(selectedImage.file, targetFormat, quality);

        setConversionProgress(75);
        setConversionStatus('转换完成，生成预览...');
      }

      setConvertedFile(converted);

      // 创建预览URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const newPreviewUrl = URL.createObjectURL(converted);
      setPreviewUrl(newPreviewUrl);

      setConversionProgress(100);
      setConversionStatus('转换成功！');

      // 清除状态
      setTimeout(() => {
        setConversionProgress(0);
        setConversionStatus('');
      }, 2000);

    } catch (error) {
      console.error('格式转换失败:', error);
      setConversionStatus('转换失败');

      const errorMessage = error instanceof Error ? error.message : '未知错误';
      alert(`格式转换失败: ${errorMessage}\n\n请尝试以下解决方案：\n1. 刷新页面重试\n2. 检查图片文件是否损坏\n3. 尝试其他格式转换`);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (convertedFile) {
      downloadFile(convertedFile);
      
      // 下载后清理资源
      setTimeout(() => {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        setConvertedFile(null);
      }, 1000);
    }
  };

  const currentFormat = selectedImage.file.type;
  const isCurrentFormat = currentFormat === targetFormat;

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <RefreshCw className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">格式转换</h2>
        <p className="text-gray-600">
          将图片转换为不同格式，优化文件大小和兼容性
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 原图信息 */}
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
                  <span className="text-gray-600">格式:</span>
                  <span className="font-medium">{selectedImage.info.type.split('/')[1].toUpperCase()}</span>
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

          {/* 格式选择 */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3">目标格式</h4>
            <div className="space-y-3">
              {formatOptions.map((format) => (
                <label
                  key={format.value}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    targetFormat === format.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={format.value}
                    checked={targetFormat === format.value}
                    onChange={(e) => setTargetFormat(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${format.color}`}>
                      <FileImage className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{format.label}</div>
                      <div className="text-sm text-gray-500">{format.description}</div>
                    </div>
                  </div>
                  {currentFormat === format.value && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">当前格式</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* 质量设置 */}
          {(targetFormat === 'image/jpeg' || targetFormat === 'image/webp') && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">图片质量</h4>
              <div className="space-y-3">
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>较小文件</span>
                  <span className="font-medium">{Math.round(quality * 100)}%</span>
                  <span>高质量</span>
                </div>
              </div>
            </div>
          )}

          {/* WebP转GIF特殊说明 */}
          {selectedImage.file.type === 'image/webp' && targetFormat === 'image/gif' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-purple-900 mb-2">🎬 WebP转GIF</h4>
              <p className="text-sm text-purple-800">
                将WebP图片转换为GIF格式，适合在不支持WebP的平台使用。
              </p>
            </div>
          )}

          {/* 进度显示 */}
          {isConverting && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">{conversionStatus}</span>
                <span className="text-sm font-medium text-blue-600">{conversionProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${conversionProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* 转换按钮 */}
          <button
            onClick={handleConvert}
            disabled={isConverting || isCurrentFormat}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isConverting || isCurrentFormat
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isConverting ? (
              <span className="flex items-center justify-center">
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                {conversionStatus} {conversionProgress}%
              </span>
            ) : isCurrentFormat ? (
              '已是目标格式'
            ) : (
              '开始转换'
            )}
          </button>
        </div>

        {/* 转换结果 */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">转换结果</h3>
            {convertedFile && previewUrl ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <img
                  src={previewUrl}
                  alt="转换后的图片"
                  className="w-full h-48 object-contain rounded-lg mb-4"
                />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">新格式:</span>
                    <span className="font-medium">{targetFormat.split('/')[1].toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">文件大小:</span>
                    <span className="font-medium">{formatFileSize(convertedFile.size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">压缩比:</span>
                    <span className="font-medium">
                      {Math.round((1 - convertedFile.size / selectedImage.file.size) * 100)}%
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={handleDownload}
                  className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  下载转换后的图片
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">转换后的图片将在这里显示</p>
              </div>
            )}
          </div>

          {/* 格式说明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">💡 格式选择建议</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>JPG</strong>: 适合照片，文件小，不支持透明</li>
              <li>• <strong>PNG</strong>: 支持透明背景，适合图标和图形</li>
              <li>• <strong>WebP</strong>: 现代格式，体积最小，兼容性较新</li>
              <li>• <strong>GIF</strong>: 支持动画，兼容性好，适合简单图形</li>
              <li>• <strong>BMP</strong>: 无损格式，文件大，兼容性极好</li>
              <li>• <strong>TIFF</strong>: 专业级无损格式，支持多页</li>
              <li>• <strong>AVIF</strong>: 新一代格式，压缩率极高</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
