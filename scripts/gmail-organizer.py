#!/usr/bin/env python3
"""
Gmail Organizer - 创建标签和过滤规则
用法: python gmail-organizer.py [--create-labels] [--create-filters]
"""

import os
import json
import argparse
from pathlib import Path

# Gmail API 依赖
try:
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
except ImportError:
    print("❌ 需要安装依赖: pip install google-auth google-auth-oauthlib google-api-python-client")
    exit(1)

# 配置
SCOPES = ['https://www.googleapis.com/auth/gmail.labels', 'https://www.googleapis.com/auth/gmail.settings.basic']
TOKEN_FILE = 'data/gmail-token.json'
CREDENTIALS_FILE = 'credentials/gmail-credentials.json'

# 推荐标签结构
LABELS = [
    # 主文件夹
    {"name": "AI-Agent项目", "type": "system", "id": "AI-Agent project"},
    {"name": "工作", "type": "system"}, 
    
    # 自定义标签
    {"name": "工作/AI-Agent项目", "type": "custom"},
    {"name": "工作/客户沟通", "type": "custom"},
    {"name": "工作/投资者", "type": "custom"},
    {"name": "工作/招聘", "type": "custom"},
    {"name": "个人/财务管理", "type": "custom"},
    {"name": "个人/学习资源", "type": "custom"},
    {"name": "个人/订阅", "type": "custom"},
    {"name": "待处理/等待回复", "type": "custom"},
    {"name": "重要/星标", "type": "custom"},
    {"name": "存档/归档", "type": "custom"},
]

# 过滤规则配置
FILTERS = [
    {
        "criteria": {"from": "newsletter@*.com", "hasTheWord": "unsubscribe"},
        "action": {"addLabelIds": [" Label"], "removeLabelIds": ["INBOX"]}
    },
]


def get_gmail_service():
    """获取 Gmail API 服务"""
    creds = None
    
    # 加载 token
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_info(
            json.load(open(TOKEN_FILE)), SCOPES
        )
    
    # 需要认证
    if not creds or not creds.valid:
        if not os.path.exists(CREDENTIALS_FILE):
            print(f"❌ 请先下载 OAuth 凭证:")
            print(f"   1. 访问 https://console.cloud.google.com/")
            print(f"   2. 创建项目 → 启用 Gmail API")
            print(f"   3. 下载凭据 JSON → 保存到 {CREDENTIALS_FILE}")
            return None
        
        flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
        creds = flow.run_local_server(port=8080)
        
        # 保存 token
        Path('data').mkdir(exist_ok=True)
        with open(TOKEN_FILE, 'w') as f:
            json.dump(json.loads(creds.to_json()), f)
        print("✅ 已保存认证凭据")
    
    return build('gmail', 'v1', credentials=creds)


def create_labels(service):
    """创建标签"""
    print("\n📁 创建标签...")
    
    for label in LABELS:
        name = label["name"]
        try:
            # 检查是否已存在
            existing = service.users().labels().list(userId='me').execute()
            label_ids = {l['name']: l['id'] for l in existing.get('labels', [])}
            
            if name in label_ids:
                print(f"  ⏭️  已存在: {name}")
                continue
            
            # 创建标签
            body = {
                'name': name,
                'labelListVisibility': 'labelShow',
                'messageListVisibility': 'show'
            }
            service.users().labels().create(userId='me', body=body).execute()
            print(f"  ✅ 创建: {name}")
            
        except Exception as e:
            print(f"  ❌ 失败: {name} - {e}")
    
    print("✅ 标签创建完成")


def create_filters(service):
    """创建过滤规则"""
    print("\n🔄 创建过滤规则...")
    
    # 注意: Gmail API 需要 Google Workspace 付费版才能创建过滤器
    # 这里只是配置示例
    
    print("⚠️  过滤规则需要 Google Workspace 付费版")
    print("   手动设置: 设置 → 过滤器和已屏蔽的地址 → 创建新过滤器")
    
    for f in FILTERS:
        print(f"   - 从: {f['criteria'].get('from', '任意')}")


def list_labels(service):
    """列出所有标签"""
    print("\n📋 当前标签:")
    
    result = service.users().labels().list(userId='me').execute()
    labels = result.get('labels', [])
    
    for label in sorted(labels, key=lambda x: x['name']):
        if label['type'] == 'system':
            print(f"  📂 {label['name']}")
        else:
            print(f"  📄 {label['name']}")


def main():
    parser = argparse.ArgumentParser(description='Gmail 整理工具')
    parser.add_argument('--create-labels', action='store_true', help='创建标签')
    parser.add_argument('--create-filters', action='store_true', help='创建过滤规则')
    parser.add_argument('--list', action='store_true', help='列出所有标签')
    args = parser.parse_args()
    
    # 获取服务
    service = get_gmail_service()
    if not service:
        print("\n📖 首次设置说明:")
        print("   1. 访问 https://console.cloud.google.com/")
        print("   2. 创建新项目 (例如: Gmail Organizer)")
        print("   3. 搜索并启用 Gmail API")
        print("   4. 左菜单 → APIs & Services → OAuth consent screen")
        print("   5. 选择 External → 创建")
        print("   6. 添加测试用户 (你的 Gmail)")
        print("   7. 左菜单 → Credentials → Create Credentials → OAuth client ID")
        print("   8. 下载 JSON → 保存到 workspace/data/gmail-credentials.json")
        return
    
    # 执行操作
    if args.create_labels:
        create_labels(service)
    elif args.create_filters:
        create_filters(service)
    elif args.list:
        list_labels(service)
    else:
        # 默认列出标签
        list_labels(service)


if __name__ == '__main__':
    main()