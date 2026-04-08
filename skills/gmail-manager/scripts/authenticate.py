"""
Gmail认证脚本
帮助生成refresh token
"""
import json
import os
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SCOPES = ['https://www.googleapis.com/auth/gmail.modify',
          'https://www.googleapis.com/auth/gmail.readonly']

def get_creds_from_config():
    """从config.json加载凭据"""
    config_path = os.path.join(os.path.dirname(__file__), 'config.json')
    if os.path.exists(config_path):
        with open(config_path, 'r') as f:
            return json.load(f)
    return {}

def save_creds(credentials):
    """保存凭据到config.json"""
    config_path = os.path.join(os.path.dirname(__file__), 'config.json')
    with open(config_path, 'w') as f:
        json.dump(credentials, f, indent=2)

def oauth_flow():
    """运行OAuth2认证流程"""
    print("=" * 50)
    print("Gmail OAuth2 认证")
    print("=" * 50)
    
    config = get_creds_from_config()
    
    # 如果已有refresh_token，直接使用
    if config.get('refresh_token'):
        print("✓ 已找到refresh_token")
        print(f"Client ID: {config.get('client_id', 'N/A')}")
        return True
    
    # 需要完整的OAuth流程
    print("\n需要完成OAuth认证！")
    print("请在浏览器中完成授权，然后回来粘贴授权码。")
    
    flow = InstalledAppFlow.from_client_config(
        {
            "installed": {
                "client_id": config.get('client_id', ''),
                "client_secret": config.get('client_secret', ''),
                "redirect_uris": ["http://localhost"]
            }
        },
        SCOPES
    )
    
    auth_url, _ = flow.authorization_url(prompt='consent')
    print(f"\n授权URL: {auth_url}")
    
    code = input("\n粘贴授权码: ")
    
    flow.fetch_token(code=code)
    creds = flow.credentials
    
    # 保存refresh_token
    config['refresh_token'] = creds.refresh_token
    save_creds(config)
    
    print("\n✓ 认证成功！refresh_token已保存")
    return True

if __name__ == '__main__':
    oauth_flow()