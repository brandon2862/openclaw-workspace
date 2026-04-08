"""
Gmail API Client
使用凭据：AIzaSyDdnYWtIx2S_UdHbsaTUrsN96dIHz2qNNY
"""
import os
import base64
import json
from email.mime.text import MIMEText
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# API配置
CLIENT_ID = "AIzaSyDdnYWtIx2S_UdHbsaTUrsN96dIHz2qNNY"
CLIENT_SECRET = ""  # 需要填写
REFRESH_TOKEN = ""  # 需要填写
SCOPES = ['https://www.googleapis.com/auth/gmail.modify',
          'https://www.googleapis.com/auth/gmail.readonly']

class GmailClient:
    def __init__(self, credentials_path=None):
        self.credentials = self._load_credentials(credentials_path)
        self.service = self._build_service()
    
    def _load_credentials(self, path):
        """加载凭据"""
        if path and os.path.exists(path):
            with open(path, 'r') as f:
                return json.load(f)
        return {
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'refresh_token': REFRESH_TOKEN
        }
    
    def _build_service(self):
        """构建Gmail服务"""
        credentials = Credentials(
            token=None,
            refresh_token=self.credentials.get('refresh_token'),
            client_id=self.credentials.get('client_id'),
            client_secret=self.credentials.get('client_secret'),
            scopes=SCOPES
        )
        return build('gmail', 'v1', credentials=credentials)
    
    def get_unread_emails(self, max_results=10):
        """获取未读邮件"""
        try:
            results = self.service.users().messages().list(
                userId='me',
                labelIds=['UNREAD'],
                maxResults=max_results
            ).execute()
            
            messages = results.get('messages', [])
            emails = []
            
            for msg in messages:
                email = self.service.users().messages().get(
                    userId='me',
                    id=msg['id'],
                    format='full'
                ).execute()
                
                headers = email.get('payload', {}).get('headers', [])
                subject = self._get_header(headers, 'Subject')
                sender = self._get_header(headers, 'From')
                date = self._get_header(headers, 'Date')
                
                emails.append({
                    'id': msg['id'],
                    'subject': subject,
                    'from': sender,
                    'date': date,
                    'snippet': email.get('snippet', '')
                })
            
            return emails
        except HttpError as error:
            print(f'Error: {error}')
            return []
    
    def _get_header(self, headers, name):
        """获取邮件头"""
        for header in headers:
            if header['name'] == name:
                return header['value']
        return ''
    
    def send_email(self, to, subject, body):
        """发送邮件"""
        try:
            message = MIMEText(body, 'html')
            message['to'] = to
            message['subject'] = subject
            
            raw_message = base64.urlsafe_b64encode(
                message.as_bytes()
            ).decode('utf-8')
            
            self.service.users().messages().send(
                userId='me',
                body={'raw': raw_message}
            ).execute()
            
            return True
        except HttpError as error:
            print(f'Error: {error}')
            return False
    
    def mark_as_read(self, message_ids):
        """标记已读"""
        try:
            for msg_id in message_ids:
                self.service.users().messages().modify(
                    userId='me',
                    id=msg_id,
                    body={'removeLabelIds': ['UNREAD']}
                ).execute()
            return True
        except HttpError as error:
            print(f'Error: {error}')
            return False
    
    def add_label(self, message_id, label_name):
        """添加标签"""
        try:
            # 先创建标签（如果不存在）
            label_id = self._get_or_create_label(label_name)
            
            self.service.users().messages().modify(
                userId='me',
                id=message_id,
                body={'addLabelIds': [label_id]}
            ).execute()
            return True
        except HttpError as error:
            print(f'Error: {error}')
            return False
    
    def _get_or_create_label(self, label_name):
        """获取或创建标签"""
        # 先查找现有标签
        results = self.service.users().labels().list(userId='me').execute()
        labels = results.get('labels', [])
        
        for label in labels:
            if label['name'] == label_name:
                return label['id']
        
        # 创建新标签
        label = self.service.users().labels().create(
            userId='me',
            body={
                'name': label_name,
                'labelListVisibility': 'labelShow',
                'messageListVisibility': 'show'
            }
        ).execute()
        return label['id']
    
    def archive_emails(self, message_ids):
        """归档邮件（移除非INBOX标签）"""
        try:
            for msg_id in message_ids:
                self.service.users().messages().modify(
                    userId='me',
                    id=msg_id,
                    body={'removeLabelIds': ['INBOX', 'UNREAD']}
                ).execute()
            return True
        except HttpError as error:
            print(f'Error: {error}')
            return False
    
    def search_emails(self, query, max_results=10):
        """搜索邮件"""
        try:
            results = self.service.users().messages().list(
                userId='me',
                q=query,
                maxResults=max_results
            ).execute()
            
            messages = results.get('messages', [])
            emails = []
            
            for msg in messages:
                email = self.service.users().messages().get(
                    userId='me',
                    id=msg['id'],
                    format='full'
                ).execute()
                
                headers = email.get('payload', {}).get('headers', [])
                subject = self._get_header(headers, 'Subject')
                sender = self._get_header(headers, 'From')
                
                emails.append({
                    'id': msg['id'],
                    'subject': subject,
                    'from': sender,
                    'snippet': email.get('snippet', '')
                })
            
            return emails
        except HttpError as error:
            print(f'Error: {error}')
            return []


if __name__ == '__main__':
    # 测试
    client = GmailClient()
    print("=== 未读邮件 ===")
    unread = client.get_unread_emails(5)
    for email in unread:
        print(f"From: {email['from']}")
        print(f"Subject: {email['subject']}")
        print("---")