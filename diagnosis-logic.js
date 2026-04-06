// AI创业诊断工具 - 完整逻辑
// 包含15个问题处理、报告生成、数据收集

class AIDiagnosisTool {
    constructor() {
        this.questions = this.getQuestions();
        this.currentQuestion = 0;
        this.answers = {};
        this.reportTemplates = this.getReportTemplates();
        this.init();
    }

    // 15个问题定义
    getQuestions() {
        return [
            {
                id: 'q1',
                text: '你的创业项目属于哪个领域？',
                type: 'radio',
                options: [
                    '电商/零售',
                    '内容创作/媒体',
                    '服务业（咨询、教育、健康等）',
                    '科技/软件开发',
                    '制造业/实体产品',
                    '其他'
                ]
            },
            {
                id: 'q2',
                text: '你的创业目前处于哪个阶段？',
                type: 'radio',
                options: [
                    '想法验证期（有想法，还没开始）',
                    '启动期（已开始，0-1年）',
                    '成长期（1-3年，有稳定收入）',
                    '扩张期（3年以上，寻求规模化）'
                ]
            },
            {
                id: 'q3',
                text: '你的团队规模是？',
                type: 'radio',
                options: [
                    '单人创业',
                    '2-5人团队',
                    '6-10人团队',
                    '10人以上'
                ]
            },
            {
                id: 'q4',
                text: '你的主要目标是什么？',
                type: 'checkbox',
                options: [
                    '验证商业模式',
                    '获取第一批客户',
                    '提升运营效率',
                    '增加收入/利润',
                    '扩大团队规模',
                    '准备融资'
                ]
            },
            {
                id: 'q5',
                text: '你对AI工具的了解程度如何？',
                type: 'radio',
                options: [
                    '完全不了解',
                    '听说过但没用过',
                    '偶尔使用（如ChatGPT）',
                    '经常使用多种AI工具',
                    '深度使用，有定制需求'
                ]
            },
            {
                id: 'q6',
                text: '你使用过哪些AI工具？',
                type: 'checkbox',
                options: [
                    'ChatGPT/类似聊天AI',
                    'Midjourney/图像生成AI',
                    '剪映/视频AI工具',
                    '其他写作/设计AI',
                    '没用过任何AI工具'
                ]
            },
            {
                id: 'q7',
                text: '在创业中，你尝试过用AI解决什么问题？',
                type: 'checkbox',
                options: [
                    '内容创作（文案、图片、视频）',
                    '客户沟通（客服、销售）',
                    '市场调研和分析',
                    '产品开发/设计',
                    '运营自动化',
                    '还没尝试过'
                ]
            },
            {
                id: 'q8',
                text: '使用AI时遇到的最大困难是什么？',
                type: 'radio',
                options: [
                    '不知道哪些AI工具适合',
                    '不知道怎么应用到具体业务',
                    '担心AI生成内容质量',
                    '技术门槛太高',
                    '成本考虑',
                    '没有困难'
                ]
            },
            {
                id: 'q9',
                text: '你希望AI主要帮你解决什么问题？',
                type: 'checkbox',
                options: [
                    '节省时间，提升效率',
                    '降低成本',
                    '提高内容/产品质量',
                    '获取更多客户',
                    '数据分析支持决策',
                    '创新产品/服务'
                ]
            },
            {
                id: 'q10',
                text: '如果有一个AI创业诊断服务，提供免费AI应用潜力评估，你感兴趣吗？',
                type: 'radio',
                options: [
                    '非常感兴趣，想立即尝试',
                    '有点兴趣，可以试试',
                    '不确定，需要了解更多',
                    '不感兴趣'
                ]
            },
            {
                id: 'q11',
                text: '对于付费的AI创业服务，你更倾向于哪种形式？',
                type: 'radio',
                options: [
                    '按月订阅（固定费用，持续服务）',
                    '按项目收费（一次性解决特定问题）',
                    '按成果付费（效果达成后付费）',
                    '免费+增值（基础免费，高级功能付费）',
                    '还没考虑付费'
                ]
            },
            {
                id: 'q12',
                text: '你愿意为AI创业服务支付的月费预算是？',
                type: 'radio',
                options: [
                    '0-100令吉',
                    '100-300令吉',
                    '300-600令吉',
                    '600-1000令吉',
                    '1000令吉以上'
                ]
            },
            {
                id: 'q13',
                text: '你希望服务以什么语言提供？',
                type: 'radio',
                options: [
                    '中文',
                    '英文',
                    '马来文',
                    '多语言混合'
                ]
            },
            {
                id: 'q14',
                text: '你通常通过什么渠道了解创业服务？',
                type: 'checkbox',
                options: [
                    '朋友推荐',
                    '社交媒体（Facebook、微信、LinkedIn）',
                    '创业活动和聚会',
                    '线上搜索',
                    '创业孵化器/加速器',
                    '行业媒体/博客'
                ]
            },
            {
                id: 'q15',
                text: '如果获得免费AI创业诊断，你希望后续如何联系？',
                type: 'checkbox',
                options: [
                    '微信',
                    'WhatsApp',
                    '电话',
                    '邮件',
                    '不需要联系'
                ]
            }
        ];
    }

    // 报告模板
    getReportTemplates() {
        return {
            // 基于领域的建议
            fieldAdvice: {
                '电商/零售': [
                    'AI客服助手 - 自动回复常见客户问题',
                    '产品描述生成 - 快速创建优质商品文案',
                    '价格优化分析 - 基于市场数据智能定价',
                    '库存预测 - AI预测销售趋势优化库存'
                ],
                '内容创作/媒体': [
                    '内容创意生成 - AI提供热门话题和角度',
                    '文案优化 - 提升内容质量和SEO效果',
                    '视频脚本生成 - 快速创作视频内容',
                    '社交媒体管理 - 自动发布和互动'
                ],
                '服务业（咨询、教育、健康等）': [
                    '客户咨询自动化 - AI初步解答常见问题',
                    '内容个性化 - 为客户生成定制化材料',
                    '预约管理 - 智能排期和提醒',
                    '知识库建设 - AI整理和更新专业知识'
                ],
                '科技/软件开发': [
                    '代码生成和优化 - AI辅助编程',
                    '文档自动生成 - 技术文档和API文档',
                    '测试用例生成 - 自动化测试方案',
                    '技术趋势分析 - 跟踪最新技术发展'
                ],
                '制造业/实体产品': [
                    '质量控制 - AI视觉检测产品缺陷',
                    '供应链优化 - 预测需求和物流',
                    '产品设计辅助 - 生成和优化设计方案',
                    '客户反馈分析 - 从评价中提取改进点'
                ]
            },

            // 基于AI认知水平的建议
            aiLevelAdvice: {
                '完全不了解': [
                    '从ChatGPT开始，学习基础对话AI',
                    '关注AI创业案例，了解应用场景',
                    '参加线上AI入门课程',
                    '从简单的自动化任务开始尝试'
                ],
                '听说过但没用过': [
                    '尝试用AI写一篇产品介绍',
                    '用AI工具做一次市场调研',
                    '学习一个具体的AI应用案例',
                    '加入AI创业者交流群'
                ],
                '偶尔使用（如ChatGPT）': [
                    '系统学习AI工具的高级功能',
                    '尝试将AI应用到具体业务环节',
                    '探索垂直领域的专业AI工具',
                    '建立AI应用的工作流程'
                ],
                '经常使用多种AI工具': [
                    '优化现有AI应用流程',
                    '探索AI组合应用场景',
                    '考虑定制化AI解决方案',
                    '分享经验，建立专家形象'
                ],
                '深度使用，有定制需求': [
                    '开发专属AI agent工具',
                    '建立AI驱动的业务流程',
                    '探索AI与现有系统集成',
                    '考虑AI产品的商业化'
                ]
            },

            // 基于预算的建议
            budgetAdvice: {
                '0-100令吉': '从免费工具开始，重点学习应用方法',
                '100-300令吉': '选择1-2个核心AI工具深度使用',
                '300-600令吉': '建立完整的AI工具组合',
                '600-1000令吉': '考虑定制化AI解决方案',
                '1000令吉以上': '全面AI转型，建立竞争优势'
            }
        };
    }

    init() {
        this.renderQuestion();
        this.setupEventListeners();
    }

    renderQuestion() {
        const question = this.questions[this.currentQuestion];
        if (!question) return;

        // 这里应该更新DOM显示当前问题
        console.log(`显示问题 ${this.currentQuestion + 1}: ${question.text}`);
        
        // 实际实现中，这里会更新HTML内容
        // document.getElementById('question-text').textContent = question.text;
        // 渲染选项等
    }

    setupEventListeners() {
        // 设置上一题/下一题/提交按钮事件
        // 实际实现中绑定到DOM元素
    }

    saveAnswer(questionId, answer) {
        this.answers[questionId] = answer;
    }

    nextQuestion() {
        if (this.currentQuestion < this.questions.length - 1) {
            this.currentQuestion++;
            this.renderQuestion();
            return true;
        }
        return false;
    }

    prevQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.renderQuestion();
            return true;
        }
        return false;
    }

    // 生成诊断报告
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            reportId: 'MY' + Date.now(),
            summary: this.generateSummary(),
            recommendations: this.generateRecommendations(),
            actionPlan: this.generateActionPlan(),
            specialOffer: this.generateSpecialOffer()
        };

        return report;
    }

    generateSummary() {
        const field = this.answers['q1'] || '未指定';
        const stage = this.answers['q2'] || '未指定';
        const teamSize = this.answers['q3'] || '未指定';
        const aiLevel = this.answers['q5'] || '未指定';

        return {
            field: field,
            stage: stage,
            teamSize: teamSize,
            aiLevel: aiLevel,
            aiPotential: this.calculateAIPotential(),
            timeSavings: this.estimateTimeSavings(),
            costSavings: this.estimateCostSavings()
        };
    }

    calculateAIPotential() {
        // 基于回答计算AI应用潜力
        let score = 50; // 基础分
        
        // 基于AI认知水平
        const aiLevel = this.answers['q5'];
        if (aiLevel === '深度使用，有定制需求') score += 30;
        else if (aiLevel === '经常使用多种AI工具') score += 20;
        else if (aiLevel === '偶尔使用（如ChatGPT）') score += 10;
        else if (aiLevel === '听说过但没用过') score += 5;
        
        // 基于创业阶段
        const stage = this.answers['q2'];
        if (stage === '启动期（已开始，0-1年）') score += 15;
        else if (stage === '成长期（1-3年，有稳定收入）') score += 20;
        else if (stage === '扩张期（3年以上，寻求规模化）') score += 25;
        
        // 基于团队规模
        const teamSize = this.answers['q3'];
        if (teamSize === '单人创业') score += 10;
        else if (teamSize === '2-5人团队') score += 15;
        
        return Math.min(score, 100);
    }

    estimateTimeSavings() {
        // 估算每周可节省的时间（小时）
        const aiLevel = this.answers['q5'];
        const teamSize = this.answers['q3'];
        
        let baseHours = 5;
        
        if (aiLevel === '深度使用，有定制需求') baseHours = 20;
        else if (aiLevel === '经常使用多种AI工具') baseHours = 15;
        else if (aiLevel === '偶尔使用（如ChatGPT）') baseHours = 10;
        else if (aiLevel === '听说过但没用过') baseHours = 8;
        
        if (teamSize === '单人创业') baseHours *= 1.5;
        else if (teamSize === '2-5人团队') baseHours *= 2;
        else if (teamSize === '6-10人团队') baseHours *= 3;
        
        return baseHours;
    }

    estimateCostSavings() {
        // 估算每月可节省的成本（令吉）
        const timeSavings = this.estimateTimeSavings();
        // 假设每小时价值50令吉
        return timeSavings * 4 * 50; // 每周小时 * 4周 * 每小时价值
    }

    generateRecommendations() {
        const field = this.answers['q1'];
        const aiLevel = this.answers['q5'];
        const budget = this.answers['q12'];
        
        const recommendations = {
            immediateActions: [],
            recommendedTools: [],
            learningResources: []
        };

        // 基于领域的建议
        if (field && this.reportTemplates.fieldAdvice[field]) {
            recommendations.immediateActions = this.reportTemplates.fieldAdvice[field].slice(0, 3);
        }

        // 基于AI水平的建议
        if (aiLevel && this.reportTemplates.aiLevelAdvice[aiLevel]) {
            recommendations.learningResources = this.reportTemplates.aiLevelAdvice[aiLevel];
        }

        // 基于预算的工具推荐
        if (budget) {
            recommendations.budgetAdvice = this.reportTemplates.budgetAdvice[budget] || '根据实际需求选择工具';
        }

        // 通用工具推荐
        recommendations.recommendedTools = [
            'ChatGPT - 通用对话和文案',
            'Canva AI - 设计和小红书内容',
            '剪映 - 视频剪辑和AI功能',
            'Notion AI - 文档和项目管理'
        ];

        return recommendations;
    }

    generateActionPlan() {
        return {
            thisWeek: [
                '选择一个AI工具开始尝试',
                '将AI应用到一个小任务中',
                '记录使用效果和节省时间'
            ],
            thisMonth: [
                '建立2-3个AI应用场景',
                '优化AI使用工作流程',
                '评估AI带来的业务价值'
            ],
            next3Months: [
                '实现关键业务流程AI化',
                '建立AI应用指标体系',
                '考虑定制化AI解决方案'
            ]
        };
    }

    generateSpecialOffer() {
        const aiPotential = this.calculateAIPotential();
        
        const offers = [];
        
        if (aiPotential >= 70) {
            offers.push('免费30分钟AI创业专家咨询（价值200令吉）');
            offers.push('首月AI工具套餐7折优惠');
        } else if (aiPotential >= 50) {
            offers.push('免费30分钟AI创业专家咨询（价值200令吉）');
            offers.push('首月AI工具套餐8折优惠');
        } else {
            offers.push('免费AI入门指导课程');
            offers.push('AI工具试用套餐');
        }
        
        return offers;
    }

    // 导出报告为文本
    exportReportAsText() {
        const report = this.generateReport();
        
        let text = `=== AI创业诊断报告 ===\n`;
        text += `报告编号: ${report.reportId}\n`;
        text += `生成时间: ${new Date(report.timestamp).toLocaleString('zh-CN')}\n\n`;
        
        text += `【一、创业画像】\n`;
        text += `领域: ${report.summary.field}\n`;
        text += `阶段: ${report.summary.stage}\n`;
        text += `团队: ${report.summary.teamSize}\n`;
        text += `AI认知: ${report.summary.aiLevel}\n\n`;
        
        text += `【二、AI应用潜力评估】\n`;
        text += `潜力评分: ${report.summary.aiPotential}/100\n`;
        text += `预计每周节省时间: ${report.summary.timeSavings}小时\n`;
        text += `预计每月节省成本: ${Math.round(report.summary.costSavings)}令吉\n\n`;
        
        text += `【三、立即行动建议】\n`;
        report.recommendations.immediateActions.forEach((action, index) => {
            text += `${index + 1}. ${action}\n`;
        });
        text += `\n`;
        
        text += `【四、推荐工具】\n`;
        report.recommendations.recommendedTools.forEach((tool, index) => {
            text += `${index + 1}. ${tool}\n`;
        });
        text += `\n`;
        
        text += `【五、行动计划】\n`;
        text += `本周:\n`;
        report.actionPlan.thisWeek.forEach(item => {
            text += `