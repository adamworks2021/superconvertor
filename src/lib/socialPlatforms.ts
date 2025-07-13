// 社交平台尺寸配置
export interface SocialPlatformSize {
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  description: string;
}

export interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  category: 'domestic' | 'international';
  sizes: SocialPlatformSize[];
}

// 社交平台配置数据
export const socialPlatforms: SocialPlatform[] = [
  // 国内平台
  {
    id: 'xiaohongshu',
    name: '小红书',
    icon: '📱',
    category: 'domestic',
    sizes: [
      {
        name: '正方形',
        width: 1080,
        height: 1080,
        aspectRatio: '1:1',
        description: '标准正方形图片，适用于大部分内容'
      },
      {
        name: '竖版',
        width: 1080,
        height: 1440,
        aspectRatio: '3:4',
        description: '竖版图片，适合展示完整内容'
      },
      {
        name: '横版',
        width: 1440,
        height: 1080,
        aspectRatio: '4:3',
        description: '横版图片，适合风景或宽幅内容'
      }
    ]
  },
  {
    id: 'douyin',
    name: '抖音',
    icon: '🎵',
    category: 'domestic',
    sizes: [
      {
        name: '竖屏视频',
        width: 1080,
        height: 1920,
        aspectRatio: '9:16',
        description: '标准竖屏视频尺寸'
      },
      {
        name: '横屏视频',
        width: 1920,
        height: 1080,
        aspectRatio: '16:9',
        description: '横屏视频尺寸'
      },
      {
        name: '正方形',
        width: 1080,
        height: 1080,
        aspectRatio: '1:1',
        description: '正方形图片'
      }
    ]
  },
  {
    id: 'wechat',
    name: '微信',
    icon: '💬',
    category: 'domestic',
    sizes: [
      {
        name: '朋友圈封面',
        width: 1280,
        height: 720,
        aspectRatio: '16:9',
        description: '朋友圈分享链接封面图'
      },
      {
        name: '公众号封面',
        width: 900,
        height: 383,
        aspectRatio: '2.35:1',
        description: '公众号文章封面图'
      },
      {
        name: '公众号次条',
        width: 200,
        height: 200,
        aspectRatio: '1:1',
        description: '公众号次条文章封面'
      }
    ]
  },
  
  // 国际平台
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📷',
    category: 'international',
    sizes: [
      {
        name: '正方形帖子',
        width: 1080,
        height: 1080,
        aspectRatio: '1:1',
        description: '标准Instagram帖子'
      },
      {
        name: 'Story',
        width: 1080,
        height: 1920,
        aspectRatio: '9:16',
        description: 'Instagram故事'
      },
      {
        name: 'Reel',
        width: 1080,
        height: 1920,
        aspectRatio: '9:16',
        description: 'Instagram短视频'
      },
      {
        name: '横版帖子',
        width: 1080,
        height: 566,
        aspectRatio: '1.91:1',
        description: '横版Instagram帖子'
      }
    ]
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: '🐦',
    category: 'international',
    sizes: [
      {
        name: '推文图片',
        width: 1200,
        height: 675,
        aspectRatio: '16:9',
        description: '推文中的图片'
      },
      {
        name: '头像',
        width: 400,
        height: 400,
        aspectRatio: '1:1',
        description: '用户头像'
      },
      {
        name: '横幅',
        width: 1500,
        height: 500,
        aspectRatio: '3:1',
        description: '个人资料横幅'
      }
    ]
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '👥',
    category: 'international',
    sizes: [
      {
        name: '封面照片',
        width: 1200,
        height: 675,
        aspectRatio: '16:9',
        description: 'Facebook封面照片'
      },
      {
        name: '帖子图片',
        width: 1200,
        height: 630,
        aspectRatio: '1.91:1',
        description: '帖子中的图片'
      },
      {
        name: 'Story',
        width: 1080,
        height: 1920,
        aspectRatio: '9:16',
        description: 'Facebook故事'
      }
    ]
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '📺',
    category: 'international',
    sizes: [
      {
        name: '缩略图',
        width: 1280,
        height: 720,
        aspectRatio: '16:9',
        description: '视频缩略图'
      },
      {
        name: '频道横幅',
        width: 2560,
        height: 1440,
        aspectRatio: '16:9',
        description: '频道页面横幅'
      },
      {
        name: 'Shorts',
        width: 1080,
        height: 1920,
        aspectRatio: '9:16',
        description: 'YouTube Shorts'
      }
    ]
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    category: 'international',
    sizes: [
      {
        name: '帖子图片',
        width: 1200,
        height: 627,
        aspectRatio: '1.91:1',
        description: 'LinkedIn帖子图片'
      },
      {
        name: '个人横幅',
        width: 1584,
        height: 396,
        aspectRatio: '4:1',
        description: '个人资料横幅'
      },
      {
        name: '公司页面',
        width: 1192,
        height: 220,
        aspectRatio: '5.4:1',
        description: '公司页面横幅'
      }
    ]
  }
];

// 根据分类获取平台
export const getDomesticPlatforms = () => 
  socialPlatforms.filter(platform => platform.category === 'domestic');

export const getInternationalPlatforms = () => 
  socialPlatforms.filter(platform => platform.category === 'international');

// 根据ID获取平台
export const getPlatformById = (id: string) => 
  socialPlatforms.find(platform => platform.id === id);

// 获取所有尺寸选项
export const getAllSizes = () => 
  socialPlatforms.flatMap(platform => 
    platform.sizes.map(size => ({
      ...size,
      platformName: platform.name,
      platformId: platform.id
    }))
  );
