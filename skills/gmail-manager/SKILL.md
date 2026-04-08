---
name: gmail-manager
description: |
  Gmail邮件管理skill。用于整理和管理Gmail邮箱，包括：邮件摘要、自动标签分类、重要邮件提醒、邮件搜索和归档。
  触发条件：用户要求管理Gmail、整理邮箱、查看邮件摘要、自动分类邮件、或任何Gmail相关操作。
---

# Gmail Manager

使用Gmail API管理和整理邮件。

## 快速开始

### 配置API

首次使用需要配置Gmail API：

1. 在Google Cloud Console启用Gmail API
2. 创建OAuth2凭据（客户端ID和密钥）
3. 将凭据配置到环境变量或配置文件中

### 认证

使用凭据进行OAuth2认证，获取访问令牌。

## 功能

### 1. 邮件摘要

获取未读邮件摘要：
```python
from scripts.gmail_client import GmailClient

client = GmailClient()
unread = client.get_unread_emails(max_results=10)
for email in unread:
    print(f"From: {email['from']}")
    print(f"Subject: {email['subject']}")
    print(f"Snippet: {email['snippet'][:100]}...")
```

### 2. 邮件分类

根据内容自动标签：
```python
# 自动分类邮件
labels = {
    '重要': ['urgent', 'important', 'critical'],
    '工作': ['project', 'meeting', 'report'],
    '个人': ['personal', 'family', 'friend']
}
client.auto_label_emails(labels)
```

### 3. 邮件搜索

按关键词搜索：
```python
results = client.search_emails('from:example@gmail.com subject:报告')
```

### 4. 批量操作

归档/删除/标记已读：
```python
# 批量标记已读
client.mark_as_read(email_ids)

# 批量归档
client.archive_emails(email_ids)
```

## 认证流程

### OAuth2认证步骤

1. 获取授权URL
2. 用户访问并授权
3. 获取授权码
4. 交换获取访问令牌
5. 刷新令牌（过期时）

### 凭据配置

支持以下方式配置凭据：

1. **环境变量**：
   ```
   GMAIL_CLIENT_ID=your-client-id
   GMAIL_CLIENT_SECRET=your-client-secret
   GMAIL_REFRESH_TOKEN=your-refresh-token
   ```

2. **配置文件**：
   在`config/gmail_config.json`中配置

## 常用操作

| 操作 | 方法 |
|------|------|
| 获取未读邮件 | `get_unread_emails()` |
| 发送邮件 | `send_email(to, subject, body)` |
| 标记已读 | `mark_as_read(message_ids)` |
| 添加标签 | `add_label(message_id, label)` |
| 搜索邮件 | `search_emails(query)` |
| 创建标签 | `create_label(name)` |

## 错误处理

常见的错误处理：

- `HttpError 401`: 令牌过期，需要刷新
- `HttpError 403`: 权限不足，检查OAuth范围
- `HttpError 429`: 请求过于频繁，添加延迟重试