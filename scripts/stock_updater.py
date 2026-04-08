#!/usr/bin/env python3
"""
股票数据自动更新脚本
自动从 stockanalysis.com 获取美股数据并保存到 JSON/Excel
"""

import json
import csv
import os
from datetime import datetime
from pathlib import Path

# ============ 配置 ============
DATA_DIR = Path("/home/brandonclaw/.openclaw/workspace")
STOCKS_FILE = DATA_DIR / "stock_data.json"
STOCKS_CSV = DATA_DIR / "stock_data.csv"
LOG_FILE = DATA_DIR / "logs" / "stock-updater.log"

# 追踪的股票列表
WATCHLIST = [
    "JPM", "TSLA", "MSFT", "META", "JNJ", 
    "AMZN", "NVDA", "AAPL", "GOOGL", "V"
]

# ============ 数据获取 (需要手动运行获取最新数据) ============
def update_manually():
    """手动更新数据 - 需要通过 agent 调用 web_fetch 获取"""
    print("📡 请使用以下命令获取最新数据:")
    print("1. web_fetch 访问 stockanalysis.com/stocks/")
    print("2. 解析数据后更新 stock_data.json")
    return {
        "timestamp": datetime.now().isoformat(),
        "message": "需要通过 agent 手动更新数据",
        "watchlist": WATCHLIST
    }

# ============ JSON 读写 ============
def load_stocks():
    """加载现有股票数据"""
    if STOCKS_FILE.exists():
        with open(STOCKS_FILE, 'r') as f:
            return json.load(f)
    return {"stocks": [], "timestamp": None}

def save_stocks(data):
    """保存股票数据到 JSON"""
    with open(STOCKS_FILE, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"✅ 已保存到 {STOCKS_FILE}")

# ============ CSV 导出 ============
def export_csv(data):
    """导出为 CSV 格式"""
    if not data.get("stocks"):
        print("⚠️ 没有股票数据可导出")
        return
    
    fieldnames = ["symbol", "name", "price", "change", "change_percent", "volume"]
    
    with open(STOCKS_CSV, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for stock in data["stocks"]:
            writer.writerow({k: stock.get(k, "") for k in fieldnames})
    
    print(f"✅ 已导出 CSV 到 {STOCKS_CSV}")

# ============ 状态报告 ============
def report_status():
    """报告当前数据状态"""
    data = load_stocks()
    
    print("📊 股票数据状态")
    print("=" * 40)
    print(f"最后更新: {data.get('timestamp', '未知')}")
    print(f"追踪股票: {len(WATCHLIST)} 只")
    print(f"已有数据: {len(data.get('stocks', []))} 只")
    
    if data.get("stocks"):
        print("\n📈 当前数据:")
        for s in data["stocks"][:5]:
            print(f"  {s.get('symbol'):6} ${s.get('price', 0):>7.2f}  {s.get('change', 0):+.2f}%")
    
    return data

# ============ 主入口 ============
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        if cmd == "status":
            report_status()
        elif cmd == "export":
            data = load_stocks()
            export_csv(data)
        elif cmd == "update":
            update_manually()
        else:
            print("用法: python stock_updater.py [status|export|update]")
    else:
        report_status()