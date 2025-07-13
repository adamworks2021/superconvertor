'use client';

import { useState } from 'react';
import { Upload, Download, Zap, RefreshCw, Crop, Link, Plus, X, CheckCircle } from 'lucide-react';
import { ImageFile } from '@/types';
import {
  loadImageFromUrl,
  batchProcessImages,
  downloadFiles,
  getImageInfo,
  validateImageFile,
  formatFileSize
} from '@/lib/imageUtils';
import ImagePasteArea from './ImagePasteArea';
import CorsHelper from './CorsHelper';
import FormatSupport from './FormatSupport';
import CropPreview from './CropPreview';

interface BatchProcessorProps {
  onImagesUploaded: (images: ImageFile[]) => void;
}

type ProcessingMode = 'compress' | 'convert' | 'crop';

const formatOptions = [
  { value: 'image/jpeg', label: 'JPG', color: 'bg-red-100 text-red-700' },
  { value: 'image/png', label: 'PNG', color: 'bg-green-100 text-green-700' },
  { value: 'image/webp', label: 'WebP', color: 'bg-blue-100 text-blue-700' },
  { value: 'image/gif', label: 'GIF', color: 'bg-purple-100 text-purple-700' },
  { value: 'image/bmp', label: 'BMP', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'image/tiff', label: 'TIFF', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'image/avif', label: 'AVIF', color: 'bg-pink-100 text-pink-700' }
];

const quickSizes = [
  { name: '小红书正方形', width: 1080, height: 1080, ratio: '1:1' },
  { name: '抖音竖屏', width: 1080, height: 1920, ratio: '9:16' },
  { name: 'Instagram Story', width: 1080, height: 1920, ratio: '9:16' },
  { name: 'Twitter横图', width: 1200, height: 675, ratio: '16:9' },
  { name: 'Facebook封面', width: 1200, height: 675, ratio: '16:9' }
];

export default function BatchProcessor({ onImagesUploaded }: BatchProcessorProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [processingMode, setProcessingMode] = useState<ProcessingMode>('compress');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [showCorsHelper, setShowCorsHelper] = useState(false);
  const [failedUrl, setFailedUrl] = useState('');
  
  // 压缩设置
  const [compressQuality, setCompressQuality] = useState(0.8);
  const [maxSize, setMaxSize] = useState(1);
  
  // 转换设置
  const [targetFormat, setTargetFormat] = useState('image/jpeg');
  const [convertQuality, setConvertQuality] = useState(0.9);
  
  // 裁剪设置
  const [cropWidth, setCropWidth] = useState(1080);
  const [cropHeight, setCropHeight] = useState(1080);

  const handleFileUpload = async (files: FileList) => {
    const validFiles = Array.from(files).filter(validateImageFile);
    
    if (validFiles.length > 10) {
      alert('批量处理最多支持10张图片');
      return;
    }
    
    const newImages: ImageFile[] = [];
    
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      try {
        const info = await getImageInfo(file);
        const preview = URL.createObjectURL(file);
        
        newImages.push({
          file,
          id: `${Date.now()}-${i}`,
          preview,
          info
        });
      } catch (error) {
        console.error('处理文件失败:', error);
      }
    }
    
    setImages(prev => [...prev, ...newImages]);
    onImagesUploaded(newImages);
  };

  const handleUrlLoad = async () => {
    if (!urlInput.trim()) return;

    setIsLoadingUrl(true);
    try {
      const file = await loadImageFromUrl(urlInput);
      const info = await getImageInfo(file);
      const preview = URL.createObjectURL(file);

      const newImage: ImageFile = {
        file,
        id: `url-${Date.now()}`,
        preview,
        info
      };

      setImages(prev => [...prev, newImage]);
      setUrlInput('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '加载图片失败，请检查URL是否正确';

      // 如果是CORS错误，显示帮助对话框
      if (errorMessage.includes('CORS') || errorMessage.includes('加载失败')) {
        setFailedUrl(urlInput);
        setShowCorsHelper(true);
      } else {
        alert(errorMessage);
      }
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleBatchProcess = async () => {
    if (images.length === 0) return;
    
    setIsProcessing(true);
    setProgress(0);
    
    try {
      const files = images.map(img => img.file);
      let options: Record<string, unknown> = {};
      
      switch (processingMode) {
        case 'compress':
          options = {
            maxSizeMB: maxSize,
            maxWidthOrHeight: 1920,
            quality: compressQuality,
            preserveExif: false,
            useWebWorker: true
          };
          break;
        case 'convert':
          options = {
            targetFormat,
            quality: convertQuality
          };
          break;
        case 'crop':
          options = {
            width: cropWidth,
            height: cropHeight,
            quality: 0.9
          };
          break;
      }
      
      const results = await batchProcessImages(
        files,
        processingMode,
        options,
        (progress) => {
          setProgress(progress);
        }
      );
      
      setProcessedFiles(results);
    } catch {
      alert('批量处理失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadAll = () => {
    if (processedFiles.length > 0) {
      downloadFiles(processedFiles);
      
      // 清理资源
      setTimeout(() => {
        setProcessedFiles([]);
        setImages([]);
        setProgress(0);
      }, 2000);
    }
  };

  const setQuickSize = (size: typeof quickSizes[0]) => {
    setCropWidth(size.width);
    setCropHeight(size.height);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 标题 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SuperConvertor</h1>
        <p className="text-gray-600 mb-4">智能批量图片处理工具 - 上传图片或输入URL，一键批量处理</p>

        {/* 快速指南 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 max-w-4xl mx-auto">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">🚀 快速开始</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <span>上传图片或输入URL</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <span>选择处理方式和参数</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <span>一键批量处理并下载</span>
            </div>
          </div>
        </div>
      </div>

      {/* 上传区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 文件上传 */}
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-6 hover:border-blue-400 transition-colors">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer block text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">上传图片文件</h3>
            <p className="text-gray-500">支持10+种格式，最多10张</p>
          </label>
        </div>

        {/* 粘贴图片 */}
        <ImagePasteArea onImagesAdded={(newImages) => {
          setImages(prev => [...prev, ...newImages]);
          onImagesUploaded(newImages);
        }} />

        {/* URL输入 */}
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-6">
          <div className="text-center mb-4">
            <Link className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">从URL加载图片</h3>
          </div>
          <div className="flex space-x-2 mb-3">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="输入图片URL..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleUrlLoad}
              disabled={isLoadingUrl || !urlInput.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
            >
              {isLoadingUrl ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>

          {/* 示例URL */}
          <div className="text-xs text-gray-500">
            <p className="mb-2">可用的示例URL (点击快速填入):</p>
            <div className="space-y-1">
              {[
                'https://picsum.photos/800/600.jpg',
                'https://picsum.photos/1080/1080.jpg',
                'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
                'https://httpbin.org/image/jpeg',
                'https://httpbin.org/image/png',
                'https://httpbin.org/image/webp'
              ].map((url, index) => (
                <button
                  key={index}
                  onClick={() => setUrlInput(url)}
                  className="block text-blue-600 hover:text-blue-800 truncate w-full text-left text-xs"
                >
                  {url}
                </button>
              ))}
            </div>
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <p className="text-yellow-800">
                <strong>注意：</strong>某些网站可能有CORS限制。如果加载失败，请尝试：
              </p>
              <ul className="text-yellow-700 mt-1 space-y-1">
                <li>• 使用上面提供的示例URL</li>
                <li>• 下载图片后直接上传</li>
                <li>• 使用支持CORS的图片服务</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 已上传的图片 */}
      {images.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            已选择图片 ({images.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.preview}
                  alt={image.info.name}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="mt-1 text-xs text-gray-500 truncate">
                  {image.info.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 处理选项 */}
      {images.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">选择处理方式</h3>
          
          {/* 模式选择 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => setProcessingMode('compress')}
              className={`p-4 rounded-lg border-2 transition-all ${
                processingMode === 'compress'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Zap className={`w-6 h-6 mx-auto mb-2 ${
                processingMode === 'compress' ? 'text-orange-600' : 'text-gray-400'
              }`} />
              <div className="font-medium">压缩优化</div>
              <div className="text-sm text-gray-500">减小文件大小</div>
            </button>

            <button
              onClick={() => setProcessingMode('convert')}
              className={`p-4 rounded-lg border-2 transition-all ${
                processingMode === 'convert'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <RefreshCw className={`w-6 h-6 mx-auto mb-2 ${
                processingMode === 'convert' ? 'text-green-600' : 'text-gray-400'
              }`} />
              <div className="font-medium">格式转换</div>
              <div className="text-sm text-gray-500">转换图片格式</div>
            </button>

            <button
              onClick={() => setProcessingMode('crop')}
              className={`p-4 rounded-lg border-2 transition-all ${
                processingMode === 'crop'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Crop className={`w-6 h-6 mx-auto mb-2 ${
                processingMode === 'crop' ? 'text-purple-600' : 'text-gray-400'
              }`} />
              <div className="font-medium">尺寸裁剪</div>
              <div className="text-sm text-gray-500">社交平台尺寸</div>
            </button>
          </div>

          {/* 具体设置 */}
          <div className="border-t pt-6">
            {processingMode === 'compress' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    压缩质量: {Math.round(compressQuality * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={compressQuality}
                    onChange={(e) => setCompressQuality(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    最大文件大小: {maxSize} MB
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={maxSize}
                    onChange={(e) => setMaxSize(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {processingMode === 'convert' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">目标格式</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {formatOptions.map((format) => (
                      <button
                        key={format.value}
                        onClick={() => setTargetFormat(format.value)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          targetFormat === format.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded mx-auto mb-1 ${format.color}`}></div>
                        <div className="text-sm font-medium">{format.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
                {targetFormat === 'image/jpeg' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      转换质量: {Math.round(convertQuality * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={convertQuality}
                      onChange={(e) => setConvertQuality(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            )}

            {processingMode === 'crop' && (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-yellow-900 mb-2">🎯 批量裁剪模式</h4>
                  <p className="text-sm text-yellow-800 mb-3">
                    批量模式使用智能居中裁剪，所有图片将裁剪为相同尺寸。如需精确控制裁剪区域，请使用单张模式的智能裁剪功能。
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">快速选择尺寸</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {quickSizes.map((size) => (
                      <button
                        key={size.name}
                        onClick={() => setQuickSize(size)}
                        className="p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                      >
                        <div className="font-medium text-sm">{size.name}</div>
                        <div className="text-xs text-gray-500">{size.width} × {size.height} ({size.ratio})</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">宽度 (px)</label>
                    <input
                      type="number"
                      value={cropWidth}
                      onChange={(e) => setCropWidth(parseInt(e.target.value) || 1080)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">高度 (px)</label>
                    <input
                      type="number"
                      value={cropHeight}
                      onChange={(e) => setCropHeight(parseInt(e.target.value) || 1080)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* 裁剪预览 */}
                {images.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">裁剪预览</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {images.slice(0, 4).map((image) => (
                        <CropPreview
                          key={image.id}
                          image={image}
                          targetWidth={cropWidth}
                          targetHeight={cropHeight}
                        />
                      ))}
                      {images.length > 4 && (
                        <div className="flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200 aspect-square">
                          <span className="text-gray-500 text-sm">+{images.length - 4} 张</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 处理按钮 */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              将处理 {images.length} 张图片
            </div>
            <button
              onClick={handleBatchProcess}
              disabled={isProcessing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors flex items-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>处理中... {Math.round(progress)}%</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>开始批量处理</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 处理结果 */}
      {processedFiles.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              处理完成 ({processedFiles.length} 张图片)
            </h3>
            <button
              onClick={handleDownloadAll}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>下载全部</span>
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            总文件大小: {formatFileSize(processedFiles.reduce((sum, file) => sum + file.size, 0))}
          </div>
        </div>
      )}

      {/* 功能特性 */}
      {images.length === 0 && (
        <div className="mt-12 bg-white rounded-xl border border-gray-200 p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">✨ 新功能特性</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">批量处理</h4>
              <p className="text-sm text-gray-600">一次处理多张图片，大幅提升工作效率</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Link className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">URL直接转换</h4>
              <p className="text-sm text-gray-600">输入图片URL直接处理，无需下载上传</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <RefreshCw className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">WebP转GIF</h4>
              <p className="text-sm text-gray-600">支持WebP到GIF格式转换</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Download className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">一键下载</h4>
              <p className="text-sm text-gray-600">批量下载处理结果，自动清理资源</p>
            </div>
          </div>

          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-3">🎯 支持的操作</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-gray-900 mb-2">压缩优化</h5>
                <ul className="text-gray-600 space-y-1">
                  <li>• 智能压缩算法</li>
                  <li>• 可调节质量和大小</li>
                  <li>• 保持视觉质量</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 mb-2">格式转换</h5>
                <ul className="text-gray-600 space-y-1">
                  <li>• JPG ↔ PNG ↔ WebP</li>
                  <li>• WebP → GIF (新增)</li>
                  <li>• 高质量转换</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 mb-2">尺寸裁剪</h5>
                <ul className="text-gray-600 space-y-1">
                  <li>• 社交平台标准尺寸</li>
                  <li>• 自定义尺寸</li>
                  <li>• 智能居中裁剪</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 格式支持说明 */}
      {images.length === 0 && (
        <div className="mt-8">
          <FormatSupport />
        </div>
      )}

      {/* CORS帮助对话框 */}
      {showCorsHelper && (
        <CorsHelper
          failedUrl={failedUrl}
          onClose={() => setShowCorsHelper(false)}
        />
      )}
    </div>
  );
}
