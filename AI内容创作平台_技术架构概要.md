# AI内容创作平台 - 技术架构概要

## 技术选型建议（轻资产启动）

### 前端技术栈
- **框架：** Next.js 14 (React) + TypeScript
- **UI库：** shadcn/ui + Tailwind CSS
- **状态管理：** Zustand (轻量级)
- **表单处理：** React Hook Form + Zod
- **视频处理：** FFmpeg.wasm (浏览器端轻量处理)
- **部署：** Vercel (免费层起步)

### 后端技术栈
- **框架：** Next.js API Routes (全栈方案，减少运维)
- **数据库：** PostgreSQL (Supabase免费层)
- **文件存储：** Cloudflare R2 (兼容S3，便宜)
- **AI服务：** 混合方案：
  - 基础：OpenAI API / DeepSeek API
  - 自研：微调专用模型 (后期)
- **缓存：** Redis (Upstash免费层)
- **任务队列：** Inngest (Serverless任务队列)

### 第三方服务集成
- **平台API：** 抖音、小红书、B站开放平台
- **素材库：** Unsplash、Pexels免费API
- **音乐库：** 免费商用音乐平台API
- **数据分析：** Plausible Analytics (轻量隐私友好)

---

## 系统架构图

```
┌─────────────────────────────────────────────────────────┐
│                   用户端 (Web/移动端)                    │
│  Next.js前端 + PWA支持 + 响应式设计                      │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS/WebSocket
┌──────────────────────────▼──────────────────────────────┐
│                 Next.js全栈应用层                        │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐          │
│  │ API Routes │ │ 页面渲染   │ │ 中间件     │          │
│  │ (Edge)     │ │ (SSR/ISG)  │ │ (Auth等)   │          │
│  └────────────┘ └────────────┘ └────────────┘          │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                   业务逻辑层                             │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐          │
│  │ 用户服务   │ │ 内容服务   │ │ AI服务代理 │          │
│  │ (Auth/Profile)│ (项目管理) │ │ (路由/缓存)│          │
│  └────────────┘ └────────────┘ └────────────┘          │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                   数据与AI层                             │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐          │
│  │ PostgreSQL │ │   Redis    │ │   AI API   │          │
│  │ (Supabase) │ │ (Upstash)  │ │ (OpenAI等) │          │
│  └────────────┘ └────────────┘ └────────────┘          │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                   外部服务集成                           │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐          │
│  │ 平台API    │ │ 素材API    │ │ 存储服务   │          │
│  │ (抖音/B站) │ │ (Unsplash) │ │ (R2/S3)    │          │
│  └────────────┘ └────────────┘ └────────────┘          │
└─────────────────────────────────────────────────────────┘
```

---

## 核心模块设计

### 1. 用户系统模块
```typescript
// 用户数据模型
interface User {
  id: string;
  email: string;
  username: string;
  // 创作者画像
  niches: string[]; // 领域标签
  platforms: string[]; // 使用平台
  contentStyle: 'professional' | 'casual' | 'funny' | 'emotional';
  // 使用数据
  usageStats: {
    totalCreations: number;
    avgCreationTime: number;
    favoriteTemplates: string[];
  };
}

// 认证：NextAuth.js + 邮箱/第三方登录
```

### 2. 内容项目管理模块
```typescript
interface ContentProject {
  id: string;
  userId: string;
  title: string;
  type: 'short_video' | 'article' | 'medium_video' | 'live';
  platform: 'douyin' | 'xiaohongshu' | 'bilibili' | 'wechat';
  
  // 创作流程状态
  status: 'topic_selection' | 'script_writing' | 'material_matching' | 
          'editing' | 'preview' | 'published' | 'analyzing';
  
  // AI生成内容
  aiSuggestions: {
    topics: AITopic[];
    script: AIScript;
    materials: AIMaterial[];
    optimizations: AIOptimization[];
  };
  
  // 用户编辑内容
  userEdits: {
    selectedTopic: AITopic;
    finalScript: string;
    selectedMaterials: Material[];
    customizations: Customization[];
  };
  
  // 发布数据
  publishData?: {
    platformId: string;
    publishTime: Date;
    url: string;
    stats: PlatformStats;
  };
}
```

### 3. AI服务模块
```typescript
// AI服务路由层
class AIServiceRouter {
  async generateTopics(userContext: UserContext): Promise<AITopic[]> {
    // 1. 检查缓存
    // 2. 调用合适的AI API
    // 3. 记录使用情况
    // 4. 返回结果
  }
  
  async generateScript(topic: Topic, style: string): Promise<AIScript> {
    // 使用few-shot prompt工程
    // 包含平台特定格式要求
  }
  
  async matchMaterials(script: Script): Promise<AIMaterial[]> {
    // 基于脚本内容语义匹配
    // 考虑版权和适用性
  }
}

// Prompt工程模板
const SCRIPT_PROMPT_TEMPLATES = {
  douyin: `你是一个抖音短视频脚本专家。请为以下主题生成一个15-60秒的短视频脚本：
  主题：{topic}
  风格：{style}
  要求：1. 黄金3秒吸引注意力 2. 节奏快速 3. 有记忆点 4. 结尾引导互动
  格式：时间码 + 画面描述 + 台词 + 字幕提示`,
  
  xiaohongshu: `你是一个小红书图文内容专家。请为以下主题生成小红书风格的图文内容：
  主题：{topic}
  要求：1. 吸引人的标题 2. 分段清晰 3. 表情符号适当 4. 标签推荐`,
};
```

### 4. 素材管理模块
```typescript
interface Material {
  id: string;
  type: 'video' | 'image' | 'audio' | 'template';
  source: 'library' | 'user_upload' | 'ai_generated';
  url: string;
  metadata: {
    duration?: number; // 视频/音频
    dimensions?: { width: number; height: number }; // 图片
    tags: string[]; // 语义标签
    style: string; // 风格标签
    license: 'free' | 'premium' | 'user_owned';
  };
}

// 素材匹配算法
class MaterialMatcher {
  async matchMaterialsToScript(script: Script): Promise<Material[]> {
    // 1. 提取脚本关键场景和情绪
    // 2. 语义搜索素材库
    // 3. 考虑平台格式要求
    // 4. 去重和排序
  }
}
```

---

## 数据库设计（关键表）

### 1. users 用户表
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100),
  avatar_url TEXT,
  
  -- 创作者画像
  niches TEXT[], -- 领域标签数组
  platforms TEXT[], -- 平台数组
  content_style VARCHAR(50),
  
  -- 订阅信息
  subscription_tier VARCHAR(20) DEFAULT 'free',
  subscription_ends_at TIMESTAMP,
  
  -- 使用统计
  total_creations INTEGER DEFAULT 0,
  last_active_at TIMESTAMP DEFAULT NOW(),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. projects 项目表
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- short_video, article, etc
  platform VARCHAR(50) NOT NULL, -- douyin, xiaohongshu, etc
  
  -- 状态管理
  status VARCHAR(50) DEFAULT 'draft',
  current_step VARCHAR(50) DEFAULT 'topic_selection',
  
  -- AI生成内容 (JSON存储)
  ai_data JSONB,
  
  -- 用户编辑内容
  user_data JSONB,
  
  -- 发布信息
  published_at TIMESTAMP,
  platform_url TEXT,
  platform_id TEXT,
  
  -- 性能数据
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引优化
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
```

### 3. ai_requests AI请求日志
```sql
CREATE TABLE ai_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  
  endpoint VARCHAR(100) NOT NULL, -- generate_topics, generate_script, etc
  model VARCHAR(100), -- gpt-4, claude-3, etc
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  
  -- 响应数据
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  response_time_ms INTEGER,
  
  -- 成本追踪
  estimated_cost DECIMAL(10, 6),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 用于成本分析和限流
CREATE INDEX idx_ai_requests_user_date ON ai_requests(user_id, created_at);
CREATE INDEX idx_ai_requests_endpoint ON ai_requests(endpoint);
```

### 4. materials 素材表
```sql
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 基础信息
  type VARCHAR(50) NOT NULL, -- video, image, audio, template
  source VARCHAR(50) NOT NULL, -- library, user_upload, ai_generated
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- 元数据
  title VARCHAR(255),
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  style VARCHAR(100),
  
  -- 技术属性
  duration_seconds INTEGER, -- 视频/音频时长
  width INTEGER, -- 图片/视频宽度
  height INTEGER, -- 图片/视频高度
  file_size_bytes BIGINT,
  format VARCHAR(50),
  
  -- 版权信息
  license_type VARCHAR(50) DEFAULT 'free',
  attribution_required BOOLEAN DEFAULT FALSE,
  attribution_text TEXT,
  
  -- 使用统计
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- 素材搜索优化
CREATE INDEX idx_materials_tags ON materials USING GIN(tags);
CREATE INDEX idx_materials_type_style ON materials(type, style);
```

---

## 部署与运维

### 开发环境
- **本地开发：** Docker Compose (PostgreSQL + Redis)
- **代码质量：** ESLint + Prettier + Husky
- **测试：** Jest + React Testing Library + Playwright (E2E)

### 生产部署
```
1. Vercel (前端 + API)
   - 自动CI/CD
   - 边缘网络优化
   - 监控和日志

2. Supabase (数据库 + 认证)
   - 托管PostgreSQL
   - 实时订阅
   - 行级安全

3. Cloudflare (存储 + CDN)
   - R2对象存储
   - CDN加速
   - DDoS防护

4. 监控告警
   - Sentry (错误追踪)
   - Logtail (日志管理)
   - Cronitor (定时任务监控)
```

### 成本估算（月）
| 服务 | 免费层 | 预计增长后 |
|------|--------|------------|
| Vercel | $0 (Hobby) | $20-100 |
| Supabase | $0 (免费计划) | $25-100 |
| Cloudflare R2 | $0 (首10GB免费) | $5-50 |
| OpenAI API | 按使用量 | $100-1000 |
| Redis (Upstash) | $0 (免费计划) | $10-50 |
| **总计** | **≈$0-50** | **≈$160-1300** |

---

## 开发里程碑

### Phase 1: MVP (4周)
**目标：** 核心流程可运行
1. **Week 1:** 项目初始化 + 基础架构
   - Next.js项目搭建
   - 数据库设计部署
   - 用户认证系统
2. **Week 2:** 核心功能开发
   - 选题策划界面
   - AI集成 (基础Prompt)
   - 简单素材展示
3. **Week 3:** 流程串联
   - 脚本编辑器
   - 素材匹配逻辑
   - 预览功能
4. **Week 4:** 测试优化
   - 内测部署
   - Bug修复
   - 性能优化

### Phase 2: 完善体验 (4周)
**目标：** 提升用户体验和稳定性
1. 多平台适配优化
2. AI模型微调和优化
3. 素材库丰富和搜索
4. 数据看板和基础分析

### Phase 3: 商业化准备 (4周)
**目标：** 准备付费功能和规模化
1. 付费墙和订阅系统
2. 团队协作功能
3. 高级AI功能
4. API开放准备

---

## 技术风险与应对

### 1. AI成本控制
**风险：** AI API调用成本不可控
**应对：**
- 实现请求缓存和去重
- 使用更便宜的模型作为后备
- 用户级别限流和配额
- 逐步自研微调模型降低依赖

### 2. 视频处理性能
**风险：** 浏览器端视频处理性能差
**应对：**
- 使用WebAssembly版本的FFmpeg
- 限制处理视频时长和分辨率
- 提供云端处理选项（付费功能）
- 渐进式加载和预览

### 3. 平台API稳定性
**风险：** 第三方平台API变化或限制
**应对：**
- 抽象平台接口层
- 多平台支持分散风险
- 手动发布作为后备方案
- 监控API变化及时适配

### 4. 数据安全与隐私
**风险：** 用户数据和内容泄露
**应对：**
- 端到端加密敏感数据
- 严格的访问控制和审计
- GDPR/中国数据安全法合规
- 定期安全审计和渗透测试

---

## 团队技能要求

### 核心开发团队（2-3人）
1. **全栈工程师 (Tech Lead)**
   - Next.js/React专家
   - TypeScript高级
   - 数据库设计和优化
   - 系统架构设计

2. **前端工程师**
   - React Hooks高级使用
   - 响应式设计和动画
   - 性能优化经验
   - 用户体验敏感

3. **AI/后端工程师**
   - AI API集成经验
   - Prompt工程能力
   - 后端性能优化
   - 第三方API集成

### 可选兼职角色
- **UI/UX设计师：** 界面设计和用户体验
- **DevOps工程师：** 部署和监控优化
- **数据科学家：** AI模型优化和数据分析

---

**技术架构说明：** 此架构设计以轻资产启动为目标，最大化利用Serverless和托管服务降低运维成本，同时保持技术栈的现代性和可扩展性。

🦐 *此技术概要可作为招聘技术团队和启动开发的参考文档*