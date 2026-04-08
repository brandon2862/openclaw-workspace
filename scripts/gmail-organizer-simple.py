#!/usr/bin/env python3
"""
Gmail Organizer - 使用设备授权流程
只需要 Client ID 即可运行
"""

import os
import json
import socket
import urllib.request
import urllib.parse
import time
import argparse
from pathlib import Path

# 你的 Client ID
CLIENT_ID = "468290100221-3mrd5loh4nuc0e6iiht98f87o7sb1vsj.apps.googleusercontent.com"

SCOPES = [
    "https://www.googleapis.com/auth/gmail.labels",
    "https://www.googleapis.com/auth/gmail.settings.basic"
]

TOKEN_FILE = "data/gmail-token.json"
DATA_DIR = Path("data")

# 推荐标签
LABELS = [
    "工作/AI-Agent项目",
    "工作/客户沟通", 
    "工作/投资者",
    "工作/招聘",
    "个人/财务管理",
    "个人/学习资源",
    "个人/订阅",
    "待处理/等待回复",
    "重要/星标",
    "存档/归档",
]


def get_device_code():
    """获取设备授权码"""
    data = {
        "client_id": CLIENT_ID,
        "scope": " ".join(SCOPES)
    }
    
    req = urllib.request.Request(
        "https://oauth2.googleapis.com/device/code",
        data=json.dumps(data).encode(),
        headers={"Content-Type": "application/json"}
    )
    
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())


def poll_for_token(device_code):
    """轮询获取 token"""
    print(f"\n📱 打开浏览器访问: {device_code['verification_url']}")
    print(f"🔑 输入代码: {device_code['user_code']}")
    print("\n⏳ 等待授权...")
    
    data = {
        "client_id": CLIENT_ID,
        "client_secret": "",  # 可能需要填写
        "device_code": device_code["device_code"],
        "grant_type": "urn:ietf:params:oauth:grant-type:device_code"
    }
    
    while True:
        time.sleep(device_code.get("interval", 5))
        
        req = urllib.request.Request(
            "https://oauth2.googleapis.com/token",
            data=json.dumps(data).encode(),
            headers={"Content-Type": "application/json"}
        )
        
        try:
            with urllib.request.urlopen(req) as resp:
                result = json.loads(resp.read().decode())
                if "access_token" in result:
                    return result
        except urllib.error.HTTPError as e:
            error = json.loads(e.read().decode())
            if error.get("error") == "authorization_pending":
                continue
            elif error.get("error") == "slow_down":
                time.sleep(5)
                continue
            else:
                print(f"❌ 错误: {error}")
                return None


def get_gmail_service():
    """获取 Gmail API 服务"""
    # 加载 token
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE) as f:
            token = json.load(f)
        
        # 刷新 token
        data = {
            "client_id": CLIENT_ID,
            "client_secret": "",
            "refresh_token": token.get("refresh_token"),
            "grant_type": "refresh_token"
        }
        
        req = urllib.request.Request(
            "https://oauth2.googleapis.com/token",
            data=json.dumps(data).encode(),
            headers={"Content-Type": "application/json"}
        )
        
        try:
            with urllib.request.urlopen(req) as resp:
                new_token = json.loads(resp.read().decode())
                token.update(new_token)
                with open(TOKEN_FILE, 'w') as f:
                    json.dump(token, f)
        except:
            pass
    
    if not os.path.exists(TOKEN_FILE):
        # 设备授权
        device_code = get_device_code()
        token = poll_for_token(device_code)
        
        if token:
            DATA_DIR.mkdir(exist_ok=True)
            with open(TOKEN_FILE, 'w') as f:
                json.dump(token, f)
            print("✅ 授权成功！")
    
    if not os.path.exists(TOKEN_FILE):
        return None
    
    # 构建服务（简化版 - 仅标签操作）
    return True


def create_labels():
    """创建标签（简化模拟）"""
    print("\n📁 推荐创建以下标签:\n")
    
    for i, label in enumerate(LABELS, 1):
        print(f"  {i}. {label}")
    
    print("\n📋 手动操作步骤:")
    print("   1. 打开 https://mail.google.com/mail")
    print("   2. 点击左侧 '设置' (齿轮图标)")
    print("   3. 选择 '所有设置'")
    print("   4. 向下滚动找到 '标签纸'")
    print("   5. 点击 '创建新标签'")
    print("   6. 按上面列表逐个创建")
    

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--create-labels", action="store_true")
    parser.add_argument("--auth", action="store_true")
    args = parser.parse_args()
    
    if args.auth or args.create_labels:
        print("🔐 开始设备授权...")
        get_gmail_service()
    
    create_labels()


if __name__ == "__main__":
    main()