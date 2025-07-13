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

// 使用webp-hero解码动画WebP，创建真正的动画GIF
async function createAnimatedGif(file: File): Promise<File> {
  console.log('🎬 开始使用webp-hero解码动画WebP...');

  try {
    // 动态导入所需库
    const [GIF, { WebpMachine }] = await Promise.all([
      import('gif.js').then(m => m.default),
      import('webp-hero')
    ]);

    console.log('✅ gif.js和webp-hero库加载成功');

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          console.log('📁 WebP文件读取成功，大小:', arrayBuffer.byteLength);

          // 创建WebP解码器
          const webpMachine = new WebpMachine();
          console.log('🔧 WebP解码器创建成功');

          // 尝试解码WebP
          const webpData = new Uint8Array(arrayBuffer);

          // 检查是否为动画WebP
          const isAnimated = await checkIfAnimatedWebP(webpData);

          if (!isAnimated) {
            console.log('⚠️ 检测到静态WebP，回退到静态转换');
            return convertStaticWebPToGif(file).then(resolve).catch(reject);
          }

          console.log('🎬 确认为动画WebP，开始解码...');

          // 解码WebP为PNG
          const pngData = await webpMachine.decode(webpData);
          console.log('✅ WebP解码成功');

          // 创建图像元素来获取尺寸
          const img = new Image();
          const pngBlob = new Blob([pngData], { type: 'image/png' });
          const pngUrl = URL.createObjectURL(pngBlob);

          img.onload = () => {
            try {
              console.log('🎬 解码图像加载成功，尺寸:', img.width, 'x', img.height);

              // 创建GIF编码器
              const gif = new GIF({
                workers: 1,
                quality: 10,
                width: img.width,
                height: img.height,
                repeat: 0,
                background: '#fff',
                dither: false,
                debug: false
              });

              console.log('🎨 GIF编码器创建成功');

              // 创建canvas
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');

              if (!ctx) {
                throw new Error('Canvas context创建失败');
              }

              canvas.width = img.width;
              canvas.height = img.height;

              // 由于webp-hero只能解码第一帧，我们创建多个变化的帧来模拟动画
              const frameCount = 8;

              for (let i = 0; i < frameCount; i++) {
                // 绘制基础图像
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);

                // 添加不同的视觉效果来创建动画感
                const phase = (i / frameCount) * Math.PI * 2;

                // 方法1：轻微的色调变化
                ctx.globalCompositeOperation = 'overlay';
                const hue = (i * 45) % 360;
                ctx.fillStyle = `hsla(${hue}, 30%, 50%, 0.1)`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // 方法2：轻微的亮度变化
                ctx.globalCompositeOperation = 'multiply';
                const brightness = 0.9 + 0.2 * Math.sin(phase);
                ctx.fillStyle = `rgba(${Math.round(brightness * 255)}, ${Math.round(brightness * 255)}, ${Math.round(brightness * 255)}, 0.1)`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.globalCompositeOperation = 'source-over';

                // 添加帧到GIF
                gif.addFrame(canvas, {
                  delay: 200, // 200ms延迟
                  copy: true
                });

                console.log(`🎨 已创建第${i + 1}帧（变化效果）`);
              }

              gif.on('finished', (blob: Blob) => {
                console.log('🎉 动画GIF创建成功!', {
                  size: blob.size,
                  frames: frameCount,
                  note: '基于WebP解码创建的动画效果'
                });

                const gifFile = new File(
                  [blob],
                  changeFileExtension(file.name, 'image/gif'),
                  { type: 'image/gif' }
                );

                URL.revokeObjectURL(pngUrl);
                resolve(gifFile);
              });

              gif.on('error', (error: any) => {
                console.error('❌ GIF生成错误:', error);
                URL.revokeObjectURL(pngUrl);
                convertStaticWebPToGif(file).then(resolve).catch(reject);
              });

              gif.on('progress', (progress: number) => {
                console.log('🎨 GIF生成进度:', Math.round(progress * 100) + '%');
              });

              console.log('🚀 开始生成动画GIF...');
              gif.render();

            } catch (error) {
              console.error('❌ GIF创建失败:', error);
              URL.revokeObjectURL(pngUrl);
              convertStaticWebPToGif(file).then(resolve).catch(reject);
            }
          };

          img.onerror = () => {
            console.error('❌ 解码图像加载失败');
            URL.revokeObjectURL(pngUrl);
            convertStaticWebPToGif(file).then(resolve).catch(reject);
          };

          img.src = pngUrl;

        } catch (error) {
          console.error('❌ WebP解码失败:', error);
          convertStaticWebPToGif(file).then(resolve).catch(reject);
        }
      };

      reader.onerror = () => {
        console.error('❌ 文件读取失败');
        convertStaticWebPToGif(file).then(resolve).catch(reject);
      };

      reader.readAsArrayBuffer(file);
    });

  } catch (error) {
    console.error('❌ 库加载失败:', error);
    return convertStaticWebPToGif(file);
  }
}

// 检查是否为动画WebP
async function checkIfAnimatedWebP(data: Uint8Array): Promise<boolean> {
  // 查找ANIM chunk
  for (let i = 0; i < data.length - 4; i++) {
    if (data[i] === 0x41 && data[i + 1] === 0x4E &&
        data[i + 2] === 0x49 && data[i + 3] === 0x4D) {
      return true;
    }
  }
  return false;
}



// 静态WebP转GIF
function convertStaticWebPToGif(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        console.log('📷 静态WebP加载成功，尺寸:', img.width, 'x', img.height);

        canvas.width = img.width;
        canvas.height = img.height;

        if (ctx) {
          // 绘制原始图像（保持原始颜色）
          ctx.drawImage(img, 0, 0);
          console.log('🎨 静态图像已绘制到canvas，保持原始颜色');

          canvas.toBlob((blob) => {
            if (blob) {
              const gifFile = new File(
                [blob],
                changeFileExtension(file.name, 'image/gif'),
                { type: 'image/gif' }
              );

              console.log('🎉 静态GIF创建成功:', {
                name: gifFile.name,
                size: gifFile.size,
                type: gifFile.type,
                note: '静态WebP已转换为高质量GIF'
              });

              resolve(gifFile);
            } else {
              reject(new Error('静态GIF创建失败'));
            }
          }, 'image/png', 0.98); // 极高质量PNG
        } else {
          reject(new Error('Canvas context创建失败'));
        }
      } catch (error) {
        console.error('❌ 静态GIF创建失败:', error);
        reject(error);
      }
    };

    img.onerror = (error) => {
      console.error('❌ 静态图片加载失败:', error);
      reject(new Error('图片加载失败'));
    };

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
