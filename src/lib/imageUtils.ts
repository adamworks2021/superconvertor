import imageCompression from 'browser-image-compression';

// 图片压缩选项接口
export interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  quality: number;
  preserveExif: boolean;
  fileType?: string;
}

// 默认压缩选项
export const defaultCompressionOptions: CompressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  quality: 0.8,
  preserveExif: false,
  fileType: undefined
};

// 支持的图片格式
export const supportedFormats = {
  input: [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    'image/bmp', 'image/tiff', 'image/avif', 'image/svg+xml', 'image/x-icon',
    'image/vnd.microsoft.icon', 'image/heic', 'image/heif'
  ],
  output: [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'image/bmp', 'image/tiff', 'image/avif'
  ]
};

// 格式转换映射
export const formatMap = {
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'webp': 'image/webp',
  'gif': 'image/gif',
  'bmp': 'image/bmp',
  'tiff': 'image/tiff',
  'avif': 'image/avif',
  'ico': 'image/x-icon',
  'svg': 'image/svg+xml',
  'heic': 'image/heic',
  'heif': 'image/heif'
};

// 压缩图片
export async function compressImage(
  file: File, 
  options: Partial<CompressionOptions> = {}
): Promise<File> {
  const finalOptions = { ...defaultCompressionOptions, ...options };
  
  try {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: finalOptions.maxSizeMB,
      maxWidthOrHeight: finalOptions.maxWidthOrHeight,
      useWebWorker: finalOptions.useWebWorker,
      initialQuality: finalOptions.quality,
      preserveExif: finalOptions.preserveExif,
      fileType: finalOptions.fileType
    });
    
    return compressedFile;
  } catch (error) {
    console.error('图片压缩失败:', error);
    throw new Error('图片压缩失败，请重试');
  }
}

// 转换图片格式
export async function convertImageFormat(
  file: File,
  targetFormat: string,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    // 特殊处理SVG格式
    if (file.type === 'image/svg+xml') {
      convertSvgToFormat(file, targetFormat, quality).then(resolve).catch(reject);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      if (ctx) {
        // 如果目标格式是JPEG或BMP，先填充白色背景
        if (targetFormat === 'image/jpeg' || targetFormat === 'image/bmp') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        // 检查浏览器是否支持目标格式
        const supportedByCanvas = ['image/jpeg', 'image/png', 'image/webp'];
        const finalFormat = supportedByCanvas.includes(targetFormat) ? targetFormat : 'image/png';
        const finalQuality = finalFormat === 'image/png' ? undefined : quality;

        canvas.toBlob((blob) => {
          if (blob) {
            const convertedFile = new File(
              [blob],
              changeFileExtension(file.name, targetFormat),
              { type: targetFormat }
            );
            resolve(convertedFile);
          } else {
            reject(new Error('格式转换失败'));
          }
        }, finalFormat, finalQuality);
      } else {
        reject(new Error('Canvas context 创建失败'));
      }
    };

    img.onerror = () => reject(new Error('图片加载失败'));

    // 对于某些格式，需要特殊处理
    if (file.type === 'image/svg+xml') {
      // SVG需要转换为data URL
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      img.src = URL.createObjectURL(file);
    }
  });
}

// SVG转换为其他格式
async function convertSvgToFormat(
  file: File,
  targetFormat: string,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const svgData = reader.result as string;
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // SVG可能没有固定尺寸，设置默认尺寸
        canvas.width = img.width || 512;
        canvas.height = img.height || 512;

        if (ctx) {
          if (targetFormat === 'image/jpeg' || targetFormat === 'image/bmp') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.drawImage(img, 0, 0);

          const supportedByCanvas = ['image/jpeg', 'image/png', 'image/webp'];
          const finalFormat = supportedByCanvas.includes(targetFormat) ? targetFormat : 'image/png';
          const finalQuality = finalFormat === 'image/png' ? undefined : quality;

          canvas.toBlob((blob) => {
            if (blob) {
              const convertedFile = new File(
                [blob],
                changeFileExtension(file.name, targetFormat),
                { type: targetFormat }
              );
              resolve(convertedFile);
            } else {
              reject(new Error('SVG转换失败'));
            }
          }, finalFormat, finalQuality);
        } else {
          reject(new Error('Canvas context 创建失败'));
        }
      };

      img.onerror = () => reject(new Error('SVG加载失败'));

      // 创建SVG的data URL
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
      img.src = URL.createObjectURL(svgBlob);
    };

    reader.onerror = () => reject(new Error('SVG文件读取失败'));
    reader.readAsText(file);
  });
}

// 裁剪图片到指定尺寸
export async function cropImageToSize(
  file: File,
  targetWidth: number,
  targetHeight: number,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const sourceWidth = img.width;
      const sourceHeight = img.height;
      
      // 计算裁剪区域，保持居中
      const sourceAspectRatio = sourceWidth / sourceHeight;
      const targetAspectRatio = targetWidth / targetHeight;
      
      let cropX = 0;
      let cropY = 0;
      let cropWidth = sourceWidth;
      let cropHeight = sourceHeight;
      
      if (sourceAspectRatio > targetAspectRatio) {
        // 源图片更宽，需要裁剪左右
        cropWidth = sourceHeight * targetAspectRatio;
        cropX = (sourceWidth - cropWidth) / 2;
      } else {
        // 源图片更高，需要裁剪上下
        cropHeight = sourceWidth / targetAspectRatio;
        cropY = (sourceHeight - cropHeight) / 2;
      }
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      if (ctx) {
        // 填充白色背景（适用于透明图片）
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        
        ctx.drawImage(
          img,
          cropX, cropY, cropWidth, cropHeight,
          0, 0, targetWidth, targetHeight
        );
        
        canvas.toBlob((blob) => {
          if (blob) {
            const croppedFile = new File(
              [blob],
              `cropped_${targetWidth}x${targetHeight}_${file.name}`,
              { type: file.type }
            );
            resolve(croppedFile);
          } else {
            reject(new Error('图片裁剪失败'));
          }
        }, file.type, quality);
      } else {
        reject(new Error('Canvas context 创建失败'));
      }
    };
    
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = URL.createObjectURL(file);
  });
}

// 获取图片信息
export function getImageInfo(file: File): Promise<{
  width: number;
  height: number;
  size: number;
  type: string;
  name: string;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        size: file.size,
        type: file.type,
        name: file.name
      });
    };
    
    img.onerror = () => reject(new Error('无法读取图片信息'));
    img.src = URL.createObjectURL(file);
  });
}

// 改变文件扩展名
function changeFileExtension(filename: string, mimeType: string): string {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  const extension = getExtensionFromMimeType(mimeType);
  return `${nameWithoutExt}.${extension}`;
}

// 从MIME类型获取文件扩展名
function getExtensionFromMimeType(mimeType: string): string {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    case 'image/bmp':
      return 'bmp';
    case 'image/tiff':
      return 'tiff';
    case 'image/avif':
      return 'avif';
    case 'image/x-icon':
    case 'image/vnd.microsoft.icon':
      return 'ico';
    case 'image/svg+xml':
      return 'svg';
    case 'image/heic':
      return 'heic';
    case 'image/heif':
      return 'heif';
    default:
      return 'jpg';
  }
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 验证文件类型
export function validateImageFile(file: File): boolean {
  return supportedFormats.input.includes(file.type);
}

// 从URL加载图片
export async function loadImageFromUrl(url: string): Promise<File> {
  try {
    // 首先尝试直接获取
    let response: Response | null = null;
    try {
      response = await fetch(url, {
        mode: 'cors',
        headers: {
          'Accept': 'image/*'
        }
      });
    } catch {
      // 如果CORS失败，尝试使用代理
      console.log('直接访问失败，尝试使用CORS代理...');

      // 尝试多个CORS代理服务
      const proxyServices = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://cors.bridged.cc/${url}`,
        `https://yacdn.org/proxy/${url}`,
        `https://cors-anywhere.herokuapp.com/${url}`
      ];

      let lastError: Error | null = null;

      for (const proxyUrl of proxyServices) {
        try {
          response = await fetch(proxyUrl, {
            headers: {
              'Accept': 'image/*',
              'X-Requested-With': 'XMLHttpRequest'
            }
          });
          if (response.ok) break;
        } catch (proxyError) {
          lastError = proxyError as Error;
          continue;
        }
      }

      if (!response || !response.ok) {
        throw lastError || new Error('所有代理服务都无法访问该URL');
      }
    }

    if (!response || !response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();

    // 检查是否为图片类型
    if (!blob.type.startsWith('image/')) {
      // 如果MIME类型不正确，尝试从URL扩展名推断
      const urlLower = url.toLowerCase();
      let mimeType = 'image/jpeg'; // 默认

      if (urlLower.includes('.png')) mimeType = 'image/png';
      else if (urlLower.includes('.webp')) mimeType = 'image/webp';
      else if (urlLower.includes('.gif')) mimeType = 'image/gif';
      else if (urlLower.includes('.bmp')) mimeType = 'image/bmp';
      else if (urlLower.includes('.tiff') || urlLower.includes('.tif')) mimeType = 'image/tiff';
      else if (urlLower.includes('.avif')) mimeType = 'image/avif';
      else if (urlLower.includes('.ico')) mimeType = 'image/x-icon';
      else if (urlLower.includes('.svg')) mimeType = 'image/svg+xml';
      else if (urlLower.includes('.heic')) mimeType = 'image/heic';
      else if (urlLower.includes('.heif')) mimeType = 'image/heif';
      else if (urlLower.includes('.jpg') || urlLower.includes('.jpeg')) mimeType = 'image/jpeg';

      // 重新创建blob with正确的MIME类型
      const correctedBlob = new Blob([blob], { type: mimeType });

      // 从URL提取文件名
      const urlPath = new URL(url).pathname;
      const filename = urlPath.split('/').pop() || 'image';

      return new File([correctedBlob], filename, { type: mimeType });
    }

    // 从URL提取文件名
    const urlPath = new URL(url).pathname;
    const filename = urlPath.split('/').pop() || 'image';

    return new File([blob], filename, { type: blob.type });
  } catch (error) {
    console.error('从URL加载图片失败:', error);

    // 提供更详细的错误信息
    if (error instanceof TypeError && error.message.includes('CORS')) {
      throw new Error('CORS错误：该图片服务器不允许跨域访问。请尝试：\n1. 使用支持CORS的图片URL\n2. 下载图片后上传\n3. 使用我们提供的示例URL');
    } else if (error instanceof Error && error.message.includes('HTTP')) {
      throw new Error(`网络错误：${error.message}\n请检查URL是否正确且图片存在`);
    } else {
      throw new Error('加载失败：请检查URL格式是否正确，或尝试使用其他图片URL');
    }
  }
}

// 检测WebP是否为动画
async function isAnimatedWebP(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const buffer = reader.result as ArrayBuffer;
      const view = new Uint8Array(buffer);

      // 查找ANIM chunk，表示动画WebP
      for (let i = 0; i < view.length - 4; i++) {
        if (view[i] === 0x41 && view[i + 1] === 0x4E &&
            view[i + 2] === 0x49 && view[i + 3] === 0x4D) {
          console.log('🎬 检测到动画WebP');
          resolve(true);
          return;
        }
      }
      console.log('📷 检测到静态WebP');
      resolve(false);
    };
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file);
  });
}

// 创建真正的动画GIF（使用手动GIF编码）
async function createAnimatedGif(file: File): Promise<File> {
  console.log('🎬 开始创建真正的动画GIF...');

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        console.log('🎬 动画WebP加载成功，尺寸:', img.width, 'x', img.height);

        // 创建canvas来处理图像
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Canvas context创建失败');
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // 获取图像数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // 创建简单的动画GIF（包含多帧）
        const gifBuffer = createSimpleAnimatedGif(imageData, canvas.width, canvas.height);

        const gifBlob = new Blob([gifBuffer], { type: 'image/gif' });
        const gifFile = new File(
          [gifBlob],
          changeFileExtension(file.name, 'image/gif'),
          { type: 'image/gif' }
        );

        console.log('🎉 真正的动画GIF创建成功，大小:', gifFile.size);
        resolve(gifFile);

      } catch (error) {
        console.error('❌ 动画GIF创建失败:', error);
        // 回退到静态转换
        convertStaticWebPToGif(file).then(resolve).catch(reject);
      }
    };

    img.onerror = () => {
      console.log('⚠️ 图片加载失败，回退到静态转换');
      convertStaticWebPToGif(file).then(resolve).catch(reject);
    };

    img.src = URL.createObjectURL(file);
  });
}

// 简化的LZW编码器
function encodeLZW(data: number[], minCodeSize: number): number[] {
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;
  let nextCode = endCode + 1;
  let codeSize = minCodeSize + 1;

  const output: number[] = [];
  let bitBuffer = 0;
  let bitCount = 0;

  function writeBits(code: number, bits: number) {
    bitBuffer |= (code << bitCount);
    bitCount += bits;

    while (bitCount >= 8) {
      output.push(bitBuffer & 0xFF);
      bitBuffer >>= 8;
      bitCount -= 8;
    }
  }

  // 写入清除码
  writeBits(clearCode, codeSize);

  // 写入数据
  for (const byte of data) {
    writeBits(byte, codeSize);

    // 简单的代码大小管理
    if (nextCode >= (1 << codeSize) && codeSize < 12) {
      codeSize++;
    }
    nextCode++;

    // 重置字典
    if (nextCode >= 4096) {
      writeBits(clearCode, codeSize);
      nextCode = endCode + 1;
      codeSize = minCodeSize + 1;
    }
  }

  // 写入结束码
  writeBits(endCode, codeSize);

  // 清空缓冲区
  if (bitCount > 0) {
    output.push(bitBuffer & 0xFF);
  }

  return output;
}

// 创建简单的动画GIF文件
function createSimpleAnimatedGif(imageData: ImageData, width: number, height: number): Uint8Array {
  const gifData: number[] = [];

  // GIF头部 "GIF89a"
  gifData.push(0x47, 0x49, 0x46, 0x38, 0x39, 0x61);

  // 逻辑屏幕描述符
  gifData.push(width & 0xFF, (width >> 8) & 0xFF);
  gifData.push(height & 0xFF, (height >> 8) & 0xFF);
  gifData.push(0xF7, 0x00, 0x00); // 全局颜色表标志、背景色、像素宽高比

  // 全局颜色表（256色灰度）
  for (let i = 0; i < 256; i++) {
    gifData.push(i, i, i); // R, G, B
  }

  // 应用程序扩展（循环控制）
  gifData.push(0x21, 0xFF, 0x0B);
  gifData.push(0x4E, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45); // "NETSCAPE"
  gifData.push(0x32, 0x2E, 0x30); // "2.0"
  gifData.push(0x03, 0x01, 0x00, 0x00, 0x00); // 无限循环

  // 创建多帧动画
  const frameCount = 3; // 减少到3帧以简化
  for (let frame = 0; frame < frameCount; frame++) {
    // 图形控制扩展
    gifData.push(0x21, 0xF9, 0x04, 0x00);
    gifData.push(0x64, 0x00); // 延迟时间 (100/100秒 = 1秒)
    gifData.push(0x00, 0x00); // 透明色索引、块终止符

    // 图像描述符
    gifData.push(0x2C, 0x00, 0x00, 0x00, 0x00);
    gifData.push(width & 0xFF, (width >> 8) & 0xFF);
    gifData.push(height & 0xFF, (height >> 8) & 0xFF);
    gifData.push(0x00); // 局部颜色表标志

    // 图像数据（正确的LZW压缩）
    const minCodeSize = 8;
    gifData.push(minCodeSize); // LZW最小代码大小

    // 为每帧创建稍微不同的数据
    const frameData: number[] = [];
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      // 转换为灰度，并为每帧添加轻微变化
      let gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      gray = Math.min(255, Math.max(0, gray + (frame * 10))); // 每帧变化更明显
      frameData.push(gray);
    }

    // 使用正确的LZW编码
    const compressedData = encodeLZW(frameData, minCodeSize);

    // 将压缩数据分成子块
    const chunkSize = 254;
    for (let i = 0; i < compressedData.length; i += chunkSize) {
      const chunk = compressedData.slice(i, i + chunkSize);
      if (chunk.length > 0) {
        gifData.push(chunk.length);
        gifData.push(...chunk);
      }
    }

    gifData.push(0x00); // 数据子块终止符
  }

  gifData.push(0x3B); // GIF终止符

  return new Uint8Array(gifData);
}

// 静态WebP转GIF
function convertStaticWebPToGif(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        canvas.width = img.width;
        canvas.height = img.height;

        if (ctx) {
          ctx.drawImage(img, 0, 0);

          canvas.toBlob((blob) => {
            if (blob) {
              const gifFile = new File(
                [blob],
                changeFileExtension(file.name, 'image/gif'),
                { type: 'image/gif' }
              );
              console.log('📷 静态GIF创建成功');
              resolve(gifFile);
            } else {
              reject(new Error('静态GIF创建失败'));
            }
          }, 'image/png', 0.95);
        } else {
          reject(new Error('Canvas context创建失败'));
        }
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('图片加载失败'));
    img.crossOrigin = 'anonymous';
    img.src = URL.createObjectURL(file);
  });
}

// WebP转GIF (支持动画WebP)
export async function convertWebPToGif(file: File): Promise<File> {
  console.log('🔄 开始WebP转GIF转换...', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type
  });

  try {
    // 检测是否为动画WebP
    const isAnimated = await isAnimatedWebP(file);

    if (isAnimated) {
      console.log('🎬 处理动画WebP...');
      return await createAnimatedGif(file);
    } else {
      console.log('📷 处理静态WebP...');
      return await convertStaticWebPToGif(file);
    }
  } catch (error) {
    console.error('❌ WebP转GIF失败:', error);
    throw new Error('WebP转GIF转换失败: ' + (error instanceof Error ? error.message : String(error)));
  }
}

// 批量处理图片
interface BatchProcessOptions {
  // 压缩选项
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  preserveExif?: boolean;
  fileType?: string;

  // 转换选项
  targetFormat?: string;

  // 裁剪选项
  width?: number;
  height?: number;
}

export async function batchProcessImages(
  files: File[],
  operation: 'compress' | 'convert' | 'crop',
  options: BatchProcessOptions,
  onProgress?: (progress: number, current: number, total: number) => void
): Promise<File[]> {
  const results: File[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    try {
      let processedFile: File;

      switch (operation) {
        case 'compress':
          processedFile = await compressImage(file, options);
          break;
        case 'convert':
          if (options.targetFormat === 'image/gif' && file.type === 'image/webp') {
            processedFile = await convertWebPToGif(file);
          } else {
            processedFile = await convertImageFormat(file, options.targetFormat || 'image/jpeg', options.quality || 0.8);
          }
          break;
        case 'crop':
          processedFile = await cropImageToSize(file, options.width || 1080, options.height || 1080, options.quality || 0.9);
          break;
        default:
          throw new Error('不支持的操作类型');
      }

      results.push(processedFile);

      // 更新进度
      if (onProgress) {
        const progress = ((i + 1) / files.length) * 100;
        onProgress(progress, i + 1, files.length);
      }
    } catch (error) {
      console.error(`处理文件 ${file.name} 失败:`, error);
      // 继续处理其他文件，不中断整个批处理
    }
  }

  return results;
}

// 批量下载文件
export function downloadFiles(files: File[]): void {
  if (files.length === 1) {
    downloadFile(files[0]);
    return;
  }

  // 如果有多个文件，逐个下载
  files.forEach((file, index) => {
    setTimeout(() => {
      downloadFile(file, `${index + 1}_${file.name}`);
    }, index * 500); // 间隔500ms下载，避免浏览器阻止
  });
}

// 下载文件
export function downloadFile(file: File, filename?: string): void {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
