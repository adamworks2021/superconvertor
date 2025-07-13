'use client';

import { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon, FileImage } from 'lucide-react';
import { ImageFile } from '@/types';
import { getImageInfo, validateImageFile } from '@/lib/imageUtils';
import ImagePasteArea from './ImagePasteArea';

interface ImageUploaderProps {
  onImagesUploaded: (images: ImageFile[]) => void;
}

export default function ImageUploader({ onImagesUploaded }: ImageUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const processFiles = useCallback(async (files: FileList) => {
    setIsUploading(true);
    setUploadProgress(0);

    const validFiles = Array.from(files).filter(validateImageFile);

    // 限制最多5张图片
    if (validFiles.length > 5) {
      alert('一次最多只能上传5张图片，请重新选择');
      setIsUploading(false);
      return;
    }

    const imageFiles: ImageFile[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      try {
        const info = await getImageInfo(file);
        const preview = URL.createObjectURL(file);

        imageFiles.push({
          file,
          id: `${Date.now()}-${i}`,
          preview,
          info
        });

        setUploadProgress(((i + 1) / validFiles.length) * 100);
      } catch (error) {
        console.error('处理文件失败:', error);
      }
    }

    setIsUploading(false);
    setUploadProgress(0);
    onImagesUploaded(imageFiles);
  }, [onImagesUploaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ImageIcon className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">上传图片</h2>
        <p className="text-gray-600">
          支持 JPG、PNG、WebP、GIF、BMP、TIFF、AVIF、SVG、ICO、HEIC 等格式，单个文件最大 10MB，一次最多5张
        </p>
      </div>

      {/* 上传区域 */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        
        {isUploading ? (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">正在处理图片...</p>
              <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">{Math.round(uploadProgress)}%</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
              isDragOver ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <Upload className={`w-6 h-6 ${
                isDragOver ? 'text-blue-600' : 'text-gray-400'
              }`} />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                {isDragOver ? '释放文件开始上传' : '拖拽图片到这里'}
              </p>
              <p className="text-gray-500 mb-4">或者</p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                选择文件
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 粘贴图片区域 */}
      <div className="mt-8">
        <ImagePasteArea onImagesAdded={onImagesUploaded} />
      </div>

      {/* 支持格式说明 */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[
          { name: 'JPG/JPEG', icon: FileImage, color: 'text-red-500' },
          { name: 'PNG', icon: FileImage, color: 'text-green-500' },
          { name: 'WebP', icon: FileImage, color: 'text-blue-500' },
          { name: 'GIF', icon: FileImage, color: 'text-purple-500' },
          { name: 'BMP', icon: FileImage, color: 'text-yellow-500' },
          { name: 'TIFF', icon: FileImage, color: 'text-indigo-500' },
          { name: 'AVIF', icon: FileImage, color: 'text-pink-500' },
          { name: 'SVG', icon: FileImage, color: 'text-orange-500' },
          { name: 'ICO', icon: FileImage, color: 'text-gray-500' },
          { name: 'HEIC', icon: FileImage, color: 'text-cyan-500' }
        ].map((format) => (
          <div key={format.name} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
            <format.icon className={`w-5 h-5 ${format.color}`} />
            <span className="text-sm font-medium text-gray-700">{format.name}</span>
          </div>
        ))}
      </div>

      {/* 使用提示 */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">💡 使用提示</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 支持批量上传多张图片</li>
          <li>• 建议图片尺寸不超过 4000×4000 像素</li>
          <li>• 所有处理都在浏览器本地完成，保护您的隐私</li>
          <li>• 处理后的图片可以直接下载保存</li>
        </ul>
      </div>
    </div>
  );
}
