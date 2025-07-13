'use client';

import { useState } from 'react';
import { AlertCircle, ExternalLink, Download, Copy } from 'lucide-react';

interface CorsHelperProps {
  failedUrl: string;
  onClose: () => void;
}

export default function CorsHelper({ failedUrl, onClose }: CorsHelperProps) {
  const [copied, setCopied] = useState(false);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(failedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const downloadImage = () => {
    window.open(failedUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start space-x-3 mb-4">
            <AlertCircle className="w-6 h-6 text-orange-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                CORS限制 - 无法直接加载图片
              </h3>
              <p className="text-gray-600 text-sm">
                该图片服务器不允许跨域访问。以下是几种解决方案：
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* 方案1：浏览器扩展 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">1</span>
                使用浏览器扩展（推荐）
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                安装CORS解除扩展，临时解除跨域限制：
              </p>
              <div className="space-y-2">
                <a
                  href="https://chrome.google.com/webstore/search/cors%20unblock"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Chrome扩展商店搜索"CORS Unblock"
                </a>
              </div>
            </div>

            {/* 方案2：下载后上传 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">2</span>
                下载后上传（最可靠）
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                手动下载图片，然后使用文件上传功能：
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={downloadImage}
                  className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  <Download className="w-4 h-4 mr-1" />
                  打开图片链接
                </button>
                <button
                  onClick={copyUrl}
                  className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  {copied ? '已复制' : '复制链接'}
                </button>
              </div>
            </div>

            {/* 方案3：使用代理 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">3</span>
                在线代理服务
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                我们会自动尝试多个代理服务，但成功率不保证。
              </p>
              <div className="text-xs text-gray-500">
                <p>已尝试的代理服务：</p>
                <ul className="mt-1 space-y-1">
                  <li>• allorigins.win</li>
                  <li>• corsproxy.io</li>
                  <li>• cors.bridged.cc</li>
                  <li>• yacdn.org</li>
                </ul>
              </div>
            </div>

            {/* 失败的URL */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">失败的URL：</h4>
              <div className="bg-white border rounded p-2 text-sm text-gray-600 break-all">
                {failedUrl}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              我知道了
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
