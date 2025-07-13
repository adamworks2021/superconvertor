'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Download, RotateCcw, Square, Maximize, Move } from 'lucide-react';
import { ImageFile } from '@/types';
import { formatFileSize, downloadFile } from '@/lib/imageUtils';

interface InteractiveCropperProps {
  selectedImage: ImageFile;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const aspectRatios = [
  { name: '自由裁剪', ratio: null, icon: Move },
  { name: '正方形 (1:1)', ratio: 1, icon: Square },
  { name: '小红书 (3:4)', ratio: 3/4, icon: Square },
  { name: '抖音 (9:16)', ratio: 9/16, icon: Square },
  { name: 'Instagram (1:1)', ratio: 1, icon: Square },
  { name: 'Twitter (16:9)', ratio: 16/9, icon: Maximize },
  { name: 'Facebook (16:9)', ratio: 16/9, icon: Maximize }
];

export default function InteractiveCropper({ selectedImage }: InteractiveCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 50, y: 50, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedRatio, setSelectedRatio] = useState<number | null>(null);
  const [imageScale, setImageScale] = useState(1);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });
  const [croppedFile, setCroppedFile] = useState<File | null>(null);

  // 加载图片
  useEffect(() => {
    const img = imageRef.current;
    if (img && selectedImage) {
      img.onload = () => {
        setIsLoaded(true);
        drawCanvas();
        
        // 初始化裁剪区域为图片中心的1/3
        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const size = Math.min(rect.width, rect.height) / 3;
          
          setCropArea({
            x: centerX - size / 2,
            y: centerY - size / 2,
            width: size,
            height: size
          });
        }
      };
      img.src = selectedImage.preview;
    }
  }, [selectedImage]);

  // 绘制Canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !isLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 计算图片显示尺寸
    const canvasAspect = canvas.width / canvas.height;
    const imageAspect = img.width / img.height;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (imageAspect > canvasAspect) {
      drawWidth = canvas.width * imageScale;
      drawHeight = drawWidth / imageAspect;
    } else {
      drawHeight = canvas.height * imageScale;
      drawWidth = drawHeight * imageAspect;
    }
    
    drawX = (canvas.width - drawWidth) / 2 + imageOffset.x;
    drawY = (canvas.height - drawHeight) / 2 + imageOffset.y;

    // 绘制图片
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

    // 绘制遮罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 清除裁剪区域的遮罩
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    ctx.globalCompositeOperation = 'source-over';

    // 绘制裁剪框边框
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

    // 绘制调整手柄
    const handleSize = 8;
    ctx.fillStyle = '#3B82F6';
    
    // 四个角的手柄
    ctx.fillRect(cropArea.x - handleSize/2, cropArea.y - handleSize/2, handleSize, handleSize);
    ctx.fillRect(cropArea.x + cropArea.width - handleSize/2, cropArea.y - handleSize/2, handleSize, handleSize);
    ctx.fillRect(cropArea.x - handleSize/2, cropArea.y + cropArea.height - handleSize/2, handleSize, handleSize);
    ctx.fillRect(cropArea.x + cropArea.width - handleSize/2, cropArea.y + cropArea.height - handleSize/2, handleSize, handleSize);
  }, [isLoaded, cropArea, imageScale, imageOffset]);

  // 重绘Canvas
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // 鼠标事件处理
  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 检查是否点击在裁剪区域内
    if (x >= cropArea.x && x <= cropArea.x + cropArea.width &&
        y >= cropArea.y && y <= cropArea.y + cropArea.height) {
      setIsDragging(true);
      setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newX = Math.max(0, Math.min(x - dragStart.x, canvas.width - cropArea.width));
    const newY = Math.max(0, Math.min(y - dragStart.y, canvas.height - cropArea.height));

    setCropArea(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  // 设置宽高比
  const setAspectRatio = (ratio: number | null) => {
    setSelectedRatio(ratio);
    
    if (ratio) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const maxSize = Math.min(canvas.width, canvas.height) * 0.8;
      let newWidth, newHeight;

      if (ratio > 1) {
        newWidth = maxSize;
        newHeight = maxSize / ratio;
      } else {
        newHeight = maxSize;
        newWidth = maxSize * ratio;
      }

      setCropArea(prev => ({
        x: Math.max(0, Math.min(prev.x, canvas.width - newWidth)),
        y: Math.max(0, Math.min(prev.y, canvas.height - newHeight)),
        width: newWidth,
        height: newHeight
      }));
    }
  };

  // 执行裁剪
  const performCrop = async () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    // 创建新的canvas用于裁剪
    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d');
    if (!cropCtx) return;

    // 计算实际图片坐标
    const canvasAspect = canvas.width / canvas.height;
    const imageAspect = img.width / img.height;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (imageAspect > canvasAspect) {
      drawWidth = canvas.width * imageScale;
      drawHeight = drawWidth / imageAspect;
    } else {
      drawHeight = canvas.height * imageScale;
      drawWidth = drawHeight * imageAspect;
    }
    
    drawX = (canvas.width - drawWidth) / 2 + imageOffset.x;
    drawY = (canvas.height - drawHeight) / 2 + imageOffset.y;

    // 计算裁剪区域在原图中的位置
    const scaleX = img.width / drawWidth;
    const scaleY = img.height / drawHeight;
    
    const sourceX = Math.max(0, (cropArea.x - drawX) * scaleX);
    const sourceY = Math.max(0, (cropArea.y - drawY) * scaleY);
    const sourceWidth = Math.min(img.width - sourceX, cropArea.width * scaleX);
    const sourceHeight = Math.min(img.height - sourceY, cropArea.height * scaleY);

    // 设置输出尺寸
    cropCanvas.width = cropArea.width;
    cropCanvas.height = cropArea.height;

    // 绘制裁剪后的图片
    cropCtx.drawImage(
      img,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, cropArea.width, cropArea.height
    );

    // 转换为文件
    cropCanvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File(
          [blob],
          `cropped_${Math.round(cropArea.width)}x${Math.round(cropArea.height)}_${selectedImage.file.name}`,
          { type: selectedImage.file.type }
        );
        setCroppedFile(croppedFile);
      }
    }, selectedImage.file.type, 0.9);
  };

  const handleDownload = () => {
    if (croppedFile) {
      downloadFile(croppedFile);
    }
  };

  const resetCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const size = Math.min(canvas.width, canvas.height) / 3;
    
    setCropArea({
      x: centerX - size / 2,
      y: centerY - size / 2,
      width: size,
      height: size
    });
    setSelectedRatio(null);
    setCroppedFile(null);
  };

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Square className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">智能图片裁剪</h2>
        <p className="text-gray-600">
          拖拽选择裁剪区域，支持多种宽高比和自由裁剪
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 裁剪工具 */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              className="w-full border border-gray-300 rounded cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
            <img
              ref={imageRef}
              className="hidden"
              alt="Source"
            />
          </div>

          {/* 宽高比选择 */}
          <div className="mb-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">选择宽高比</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {aspectRatios.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => setAspectRatio(item.ratio)}
                    className={`p-3 text-left border rounded-lg transition-all ${
                      selectedRatio === item.ratio
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex space-x-3">
            <button
              onClick={performCrop}
              className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              执行裁剪
            </button>
            <button
              onClick={resetCrop}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 信息面板 */}
        <div className="space-y-6">
          {/* 原图信息 */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">原图信息</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">尺寸:</span>
                <span className="font-medium">{selectedImage.info.width} × {selectedImage.info.height}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">大小:</span>
                <span className="font-medium">{formatFileSize(selectedImage.info.size)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">格式:</span>
                <span className="font-medium">{selectedImage.info.type.split('/')[1].toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* 裁剪信息 */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">裁剪区域</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">位置:</span>
                <span className="font-medium">{Math.round(cropArea.x)}, {Math.round(cropArea.y)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">尺寸:</span>
                <span className="font-medium">{Math.round(cropArea.width)} × {Math.round(cropArea.height)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">宽高比:</span>
                <span className="font-medium">
                  {selectedRatio ? `${selectedRatio > 1 ? selectedRatio.toFixed(2) : (1/selectedRatio).toFixed(2)}:1` : '自由'}
                </span>
              </div>
            </div>
          </div>

          {/* 裁剪结果 */}
          {croppedFile && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">裁剪结果</h4>
              <div className="space-y-3">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">文件大小:</span>
                    <span className="font-medium">{formatFileSize(croppedFile.size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">压缩比:</span>
                    <span className="font-medium text-green-600">
                      {Math.round((1 - croppedFile.size / selectedImage.file.size) * 100)}%
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={handleDownload}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  下载裁剪图片
                </button>
              </div>
            </div>
          )}

          {/* 使用提示 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">💡 使用提示</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 拖拽蓝色区域移动裁剪框</li>
              <li>• 选择预设宽高比或自由裁剪</li>
              <li>• 实时预览裁剪效果</li>
              <li>• 支持高精度裁剪</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
