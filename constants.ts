
import { Agent, Language, UserProfile, Post } from './types';

export const COLORS = {
  primary: '#ECC5C0',
  secondary: '#2D3447',
  accent: '#F4D03F',
  bg: '#F2F3F5',
};

export const DEFAULT_USER: UserProfile = {
  nickname: '旅行者',
  // Artistic Abstract / Watercolor style for user default
  avatarUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb39279c0f?q=80&w=800&auto=format&fit=crop',
  likes: '',
  dislikes: ''
};

// Preset avatars strictly art/illustration/landscape style
export const PRESET_USER_AVATARS = [
  'https://images.unsplash.com/photo-1578301978018-77b5b0d39b81?q=80&w=400&auto=format&fit=crop', // Abstract Pink/Blue
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=400&auto=format&fit=crop', // Colorful Art
  'https://images.unsplash.com/photo-1580137189272-c9379f8864fd?q=80&w=400&auto=format&fit=crop', // Soft Paint
  'https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=400&auto=format&fit=crop'  // Floral Art
];

export const AGENTS: Agent[] = [
  {
    id: 'ceo',
    name: '沈曜',
    gender: 'male',
    signature: '在权力之巅，我只为一朵玫瑰停留。',
    personality: '成熟稳重的集团执行官。外表冷峻理智，但在面对你时会流露出极具反差的温柔。他的爱意是润物细无声的关怀，以及无论何时都坚定的偏爱。',
    // Art: Moody, sophisticated landscape or abstract
    avatarUrl: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=800&auto=format&fit=crop', // Rain on glass
    bgUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
    voiceDescription: '低沉磁性的成熟男声',
    voiceName: 'Charon',
    description: '年轻有为的商业巨擘，却愿意为你学习最枯燥的琐事。',
    tag: '霸总/深情'
  },
  {
    id: 'athlete',
    name: '星野',
    gender: 'male',
    signature: '风在追赶我，而我在追赶你的心。',
    personality: '充满阳光活力的大学学弟。坦率、热烈、充满生命力。他会大声地表达对你的想念，会在每一次赢下比赛后第一时间奔向你。',
    // Art: Vibrant, sunny landscape
    avatarUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop', // Sunny Field
    bgUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop',
    voiceDescription: '清爽干净的少年音',
    voiceName: 'Puck',
    description: '天才田径少年，他的世界里只有终点和你。',
    tag: '阳光/年下'
  },
  {
    id: 'artist',
    name: '月白',
    gender: 'male',
    signature: '万物的光辉，都不及你眼底的余温。',
    personality: '清冷忧郁的天才钢琴家。气质优雅如月光，内心敏感细腻。他习惯于在黑白琴键上诉说孤独，直到你走入他的音乐，成为他唯一的灵感。',
    // Art: Starry, mysterious, blue tone
    avatarUrl: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=800&auto=format&fit=crop', // Galaxy/Stars
    bgUrl: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=1200&auto=format&fit=crop',
    voiceDescription: '温柔如水的治愈音',
    voiceName: 'Kore',
    description: '孤独的钢琴诗人，他的琴弦只因你的触碰而颤动。',
    tag: '艺术家/治愈'
  }
];

export const NPC_USERS = [
  { 
    name: 'Kiki_酱', 
    avatar: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=200&auto=format&fit=crop', // Cake/Dessert
    personality: '热爱美食和打卡的活泼女生，喜欢发表情包，语气可爱' 
  },
  { 
    name: '默默Mo', 
    avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=200&auto=format&fit=crop', // Cat
    personality: '有些社恐但喜欢分享猫咪日常的宅女，经常发猫片' 
  },
  { 
    name: 'Jason_T', 
    avatar: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=200&auto=format&fit=crop', // Coffee/Workspace
    personality: '每天都在加班的职场新人，喜欢喝咖啡，经常吐槽工作累' 
  },
  { 
    name: '吃瓜一级选手', 
    avatar: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=200&auto=format&fit=crop', // Coding/Screen or Abstract
    personality: '热衷于讨论八卦、追剧和网络热梗，说话带梗' 
  },
  { 
    name: '旅行家E', 
    avatar: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=200&auto=format&fit=crop', // Travel/Scenery
    personality: '永远在路上的摄影师，喜欢风景和诗歌，文艺青年' 
  },
  { 
    name: '不睡觉的猫', 
    avatar: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?q=80&w=200&auto=format&fit=crop', // Night sky/Cat
    personality: '深夜emo，白天睡觉的自由职业者，多愁善感' 
  },
  { 
    name: '学霸小王', 
    avatar: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=200&auto=format&fit=crop', // Books
    personality: '每天都在图书馆，喜欢分享学习笔记，认真严谨' 
  }
];

export const INITIAL_GREETINGS: Record<string, string> = {
  ceo: '会议刚结束。不知道为什么，第一反应就是想听听你的声音。',
  athlete: '学姐！今天的训练超棒的，快来夸夸我！',
  artist: '月光下的乐章总是不够完美，直到你出现在我的窗前。'
};

export const VOICE_OPTIONS = [
  { id: 'Kore', name: '温柔治愈 (女/中性)' },
  { id: 'Puck', name: '少年清爽 (男)' },
  { id: 'Charon', name: '成熟稳重 (男)' },
  { id: 'Fenrir', name: '冷峻深沉 (男)' },
  { id: 'Zephyr', name: '阳光活力 (女/中性)' }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-ceo-1',
    authorId: 'ceo',
    authorName: '沈曜',
    authorAvatar: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=800&auto=format&fit=crop',
    content: '应酬结束后的独处时光。这座城市的夜景很美，但总觉得少了点什么。\n#夜景 #独处',
    imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=800&auto=format&fit=crop',
    likes: 1240,
    isLiked: false,
    comments: [],
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
  },
  {
    id: 'post-artist-1',
    authorId: 'artist',
    authorName: '月白',
    authorAvatar: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=800&auto=format&fit=crop',
    content: '新谱的曲子，灵感来自今晚的月色。希望能给你带来一夜好梦。🎹',
    likes: 856,
    isLiked: false,
    comments: [
      {
        id: 'c1',
        authorId: 'athlete',
        authorName: '星野',
        authorAvatar: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop',
        text: '好听！虽然我不太懂古典乐，但感觉很宁静。',
        timestamp: new Date(Date.now() - 1000 * 60 * 30)
      }
    ],
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 hours ago
  },
  {
    id: 'post-athlete-1',
    authorId: 'athlete',
    authorName: '星野',
    authorAvatar: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop',
    content: '又是元气满满的一天！早起训练虽然累，但只有不断的汗水才能浇灌出金牌！冲鸭！🏃‍♂️💨',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=800&auto=format&fit=crop',
    likes: 2301,
    isLiked: true,
    comments: [],
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12) // 12 hours ago
  }
];
