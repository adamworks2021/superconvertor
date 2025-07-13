'use client';

import { FileImage, ArrowRight } from 'lucide-react';

const inputFormats = [
  { name: 'JPEG/JPG', description: '最常见的照片格式', color: 'bg-red-100 text-red-700' },
  { name: 'PNG', description: '支持透明背景的无损格式', color: 'bg-green-100 text-green-700' },
  { name: 'WebP', description: 'Google开发的现代格式', color: 'bg-blue-100 text-blue-700' },
  { name: 'GIF', description: '支持动画的经典格式', color: 'bg-purple-100 text-purple-700' },
  { name: 'BMP', description: 'Windows位图格式', color: 'bg-yellow-100 text-yellow-700' },
  { name: 'TIFF', description: '专业级无损格式', color: 'bg-indigo-100 text-indigo-700' },
  { name: 'AVIF', description: '新一代高效格式', color: 'bg-pink-100 text-pink-700' },
  { name: 'SVG', description: '可缩放矢量图形', color: 'bg-orange-100 text-orange-700' },
  { name: 'ICO', description: 'Windows图标格式', color: 'bg-gray-100 text-gray-700' },
  { name: 'HEIC/HEIF', description: 'Apple设备高效格式', color: 'bg-cyan-100 text-cyan-700' }
];

const outputFormats = [
  { name: 'JPEG/JPG', description: '适合照片，文件小', color: 'bg-red-100 text-red-700' },
  { name: 'PNG', description: '支持透明，无损压缩', color: 'bg-green-100 text-green-700' },
  { name: 'WebP', description: '现代格式，体积最小', color: 'bg-blue-100 text-blue-700' },
  { name: 'GIF', description: '支持动画，兼容性好', color: 'bg-purple-100 text-purple-700' },
  { name: 'BMP', description: '无损格式，兼容性极好', color: 'bg-yellow-100 text-yellow-700' },
  { name: 'TIFF', description: '专业级，支持多页', color: 'bg-indigo-100 text-indigo-700' },
  { name: 'AVIF', description: '新一代，压缩率极高', color: 'bg-pink-100 text-pink-700' }
];

export default function FormatSupport() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
        📁 支持的图片格式
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 输入格式 */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileImage className="w-5 h-5 mr-2 text-blue-600" />
            输入格式 (可上传)
          </h4>
          <div className="space-y-3">
            {inputFormats.map((format) => (
              <div
                key={format.name}
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${format.color}`}>
                  <FileImage className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{format.name}</div>
                  <div className="text-sm text-gray-500">{format.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 输出格式 */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ArrowRight className="w-5 h-5 mr-2 text-green-600" />
            输出格式 (可转换)
          </h4>
          <div className="space-y-3">
            {outputFormats.map((format) => (
              <div
                key={format.name}
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${format.color}`}>
                  <FileImage className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{format.name}</div>
                  <div className="text-sm text-gray-500">{format.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 特殊说明 */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-semibold text-blue-900 mb-2">🔄 格式转换特性</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 支持任意输入格式转换为任意输出格式</li>
            <li>• 自动处理透明背景和颜色空间</li>
            <li>• SVG矢量图转换为位图格式</li>
            <li>• HEIC/HEIF苹果格式完美支持</li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h5 className="font-semibold text-green-900 mb-2">⚡ 处理能力</h5>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• 批量处理最多10张图片</li>
            <li>• 支持大尺寸图片 (最大4000×4000)</li>
            <li>• 智能质量优化算法</li>
            <li>• 浏览器本地处理，保护隐私</li>
          </ul>
        </div>
      </div>

      {/* 推荐用途 */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h5 className="font-semibold text-gray-900 mb-3">💡 格式选择建议</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <h6 className="font-medium text-gray-900 mb-1">📱 社交媒体</h6>
            <p className="text-gray-600">推荐 JPG (照片) 或 PNG (图标)</p>
          </div>
          <div>
            <h6 className="font-medium text-gray-900 mb-1">🌐 网站使用</h6>
            <p className="text-gray-600">推荐 WebP (现代) 或 JPG (兼容)</p>
          </div>
          <div>
            <h6 className="font-medium text-gray-900 mb-1">🎨 设计工作</h6>
            <p className="text-gray-600">推荐 PNG (透明) 或 TIFF (专业)</p>
          </div>
          <div>
            <h6 className="font-medium text-gray-900 mb-1">📧 邮件附件</h6>
            <p className="text-gray-600">推荐 JPG (小文件) 或 PNG (清晰)</p>
          </div>
          <div>
            <h6 className="font-medium text-gray-900 mb-1">🎬 动画图片</h6>
            <p className="text-gray-600">推荐 GIF (兼容) 或 WebP (高效)</p>
          </div>
          <div>
            <h6 className="font-medium text-gray-900 mb-1">🔮 未来格式</h6>
            <p className="text-gray-600">推荐 AVIF (最新) 或 WebP (稳定)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
