#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
豆瓣电影剧照链接爬虫 - 基于API接口
使用豆瓣提供的JSON API接口爬取电影信息，支持多类型和多评分区间
"""

import requests
import json
import time
import random
import os
import re
from urllib.parse import quote

# 配置区域
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
]

# 电影类型配置 - 共28种类型
MOVIE_TYPES = [
    {"name": "剧情", "type": 11},
    {"name": "喜剧", "type": 24},
    {"name": "动作", "type": 5},
    {"name": "爱情", "type": 13},
    {"name": "科幻", "type": 17},
    {"name": "动画", "type": 25},
    {"name": "悬疑", "type": 10},
    {"name": "惊悚", "type": 19},
    {"name": "恐怖", "type": 20},
    {"name": "纪录片", "type": 1},
    {"name": "短片", "type": 23},
    {"name": "情色", "type": 6},
    {"name": "音乐", "type": 14},
    {"name": "歌舞", "type": 7},
    {"name": "家庭", "type": 28},
    {"name": "儿童", "type": 8},
    {"name": "传记", "type": 2},
    {"name": "历史", "type": 4},
    {"name": "战争", "type": 22},
    {"name": "犯罪", "type": 3},
    {"name": "西部", "type": 27},
    {"name": "奇幻", "type": 16},
    {"name": "冒险", "type": 15},
    {"name": "灾难", "type": 12},
    {"name": "武侠", "type": 29},
    {"name": "古装", "type": 30},
    {"name": "运动", "type": 18},
    {"name": "黑色电影", "type": 31}
]

# 评分区间设置 (从100:90到10:0)
INTERVALS = [
    "100:90", "90:80", "80:70", "70:60", 
    "60:50", "50:40", "40:30", "30:20", 
    "20:10", "10:0"
]

# 请求参数
REQUEST_DELAY = (1.5, 3.5)  # 请求延迟范围 (秒)
TIMEOUT = 15  # 请求超时时间 (秒)
MAX_RETRY = 5  # 单次请求最大重试次数
LIMIT_PER_PAGE = 20  # 每页获取的电影数量

# 输出文件路径
OUTPUT_FILE = "all_douban_photo_urls.txt"
MOVIE_INFO_FILE = "movie_info.csv"

class DoubanMovieAPICrawler:
    def __init__(self):
        self.session = requests.Session()
        self.collected_movies = {}  # key: movie_id, value: {rating, comment_count}
        self.request_count = 0
        self.start_time = time.time()
        
        # 加载已有数据 (断点续爬)
        self.load_existing_data()
    
    def load_existing_data(self):
        """加载已有数据，支持断点续爬"""
        if os.path.exists(OUTPUT_FILE):
            try:
                with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
                    lines = f.readlines()
                    
                # 从剧照链接中提取电影ID
                for line in lines:
                    line = line.strip()
                    if line:
                        match = re.match(r"^https://movie\.douban\.com/subject/(\d+)/all_photos/?$", line)
                        if match:
                            movie_id = match.group(1)
                            self.collected_movies[movie_id] = {"rating": "", "comment_count": ""}
                
                print(f"已加载 {len(self.collected_movies)} 个已有电影ID")
            except Exception as e:
                print(f"加载已有数据失败: {e}")
    
    def get_random_headers(self):
        """生成随机请求头"""
        return {
            "User-Agent": random.choice(USER_AGENTS),
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7",
            "Referer": "https://movie.douban.com/typerank",
            "X-Requested-With": "XMLHttpRequest",
            "Connection": "keep-alive"
        }
    
    def make_request(self, type_id, interval, start, retry=0):
        """执行带防护的API请求"""
        if retry >= MAX_RETRY:
            print(f"请求失败超过最大重试次数: type={type_id}, interval={interval}, start={start}")
            return None
        
        # 随机延迟
        delay = random.uniform(*REQUEST_DELAY)
        time.sleep(delay)
        
        # 构造请求URL
        params = {
            "type": type_id,
            "interval_id": interval,
            "action": "",
            "start": start,
            "limit": LIMIT_PER_PAGE
        }
        
        url = "https://movie.douban.com/j/chart/top_list?" + "&".join(
            [f"{k}={quote(str(v))}" for k, v in params.items()]
        )
        
        headers = self.get_random_headers()
        
        try:
            response = self.session.get(
                url,
                headers=headers,
                timeout=TIMEOUT
            )
            
            self.request_count += 1
            elapsed = time.time() - self.start_time
            req_per_min = self.request_count / (elapsed / 60) if elapsed > 0 else 0
            
            print(f"请求成功: type={type_id}, interval={interval}, 第{start//LIMIT_PER_PAGE+1}页 | "
                  f"总电影数: {len(self.collected_movies)} | 请求数: {self.request_count} | "
                  f"速率: {req_per_min:.1f}次/分钟")
            
            # 检查是否触发反爬
            if response.status_code == 403 or "检测到有异常请求" in response.text:
                print("触发反爬机制，等待30秒后重试")
                time.sleep(30)  # 长时等待
                return self.make_request(type_id, interval, start, retry+1)
                
            return response
        
        except requests.exceptions.RequestException as e:
            print(f"请求异常: {type(e).__name__}, 5秒后重试...")
            time.sleep(5)
            return self.make_request(type_id, interval, start, retry+1)
    
    def crawl_movies(self, type_config, interval):
        """爬取单个类型单个评分区间的电影"""
        print(f"\n开始爬取: {type_config['name']} ({interval})")
        start = 0
        new_movies = 0
        
        while True:
            response = self.make_request(type_config['type'], interval, start)
            
            if not response:
                break  # 请求失败
                
            try:
                movies = response.json()
                
                if not movies:
                    print(f"区间 {interval} 爬取完成，共新增 {new_movies} 部电影")
                    break
                
                # 提取电影信息
                for movie in movies:
                    movie_id = str(movie.get("id", ""))
                    if movie_id and movie_id not in self.collected_movies:
                        # 提取评分和评价人数
                        rating = movie.get("score", "暂无评分")
                        comment_count = movie.get("vote_count", 0)
                        
                        # 存储电影信息
                        self.collected_movies[movie_id] = {
                            "rating": rating,
                            "comment_count": f"{comment_count}人评价"
                        }
                        new_movies += 1
                
                # 检查是否还有下一页
                if len(movies) < LIMIT_PER_PAGE:
                    print(f"区间 {interval} 最后一页，共新增 {new_movies} 部电影")
                    break
                
                start += LIMIT_PER_PAGE
                
            except json.JSONDecodeError:
                print("JSON解析错误，可能是反爬措施")
                break
            except Exception as e:
                print(f"处理数据时出错: {str(e)}")
                break
        
        return new_movies
    
    def convert_to_photo_url(self, movie_id):
        """将电影ID转换为剧照链接"""
        return f"https://movie.douban.com/subject/{movie_id}/all_photos"
    
    def save_results(self):
        """保存结果到文件"""
        # 保存剧照链接
        photo_urls = [self.convert_to_photo_url(movie_id) for movie_id in sorted(self.collected_movies.keys())]
        
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            f.write("\n".join(photo_urls))
        
        print(f"\n剧照链接已保存到: {OUTPUT_FILE}")
        print(f"共导出 {len(photo_urls)} 个剧照链接")
        
        # 保存电影详细信息
        with open(MOVIE_INFO_FILE, "w", encoding="utf-8") as f:
            f.write("电影ID,电影链接,剧照链接,评分,评价人数\n")
            for movie_id, info in sorted(self.collected_movies.items()):
                movie_url = f"https://movie.douban.com/subject/{movie_id}"
                photo_url = self.convert_to_photo_url(movie_id)
                f.write(f"{movie_id},{movie_url},{photo_url},{info['rating']},{info['comment_count']}\n")
        
        print(f"电影信息已保存到: {MOVIE_INFO_FILE}")
    
    def test_crawl(self, limit=20):
        """
        测试爬取功能
        
        Args:
            limit: 每个类型每个区间爬取的电影数量限制
        """
        print("======================================")
        print("        豆瓣电影剧照链接爬虫测试        ")
        print("======================================")
        
        # 只测试前3种类型，每种类型前3个区间，每个区间爬取limit个电影
        test_types = MOVIE_TYPES[:3]
        test_intervals = INTERVALS[:3]
        
        print(f"测试配置: {len(test_types)}种类型, {len(test_intervals)}个区间, 每个区间{limit}部电影")
        
        # 保存原始电影数量
        original_count = len(self.collected_movies)
        
        # 遍历测试类型和区间
        for type_config in test_types:
            for interval in test_intervals:
                # 爬取指定数量的电影
                start_count = len(self.collected_movies)
                self.crawl_movies(type_config, interval)
                
                # 检查是否达到限制
                current_count = len(self.collected_movies)
                if current_count - start_count >= limit:
                    break
            
            # 类型之间增加延迟
            time.sleep(random.uniform(3, 6))
        
        # 保存测试结果
        test_file_path = "test_douban_photo_urls.txt"
        photo_urls = [self.convert_to_photo_url(movie_id) for movie_id in sorted(self.collected_movies.keys())]
        
        with open(test_file_path, "w", encoding="utf-8") as f:
            f.write("\n".join(photo_urls))
        
        print(f"\n测试完成！")
        print(f"共新增 {len(self.collected_movies) - original_count} 部电影")
        print(f"共生成 {len(photo_urls)} 个剧照链接")
        print(f"测试结果已保存到: {test_file_path}")
        
        return photo_urls
    
    def run(self):
        """主运行方法 - 爬取所有类型和评分区间"""
        print("======================================")
        print("        豆瓣电影剧照链接爬虫            ")
        print("======================================")
        print(f"爬取配置: {len(MOVIE_TYPES)}种类型, {len(INTERVALS)}个评分区间")
        print("=" * 60)
        
        total_new_movies = 0
        
        # 遍历所有电影类型
        for type_config in MOVIE_TYPES:
            print(f"\n开始爬取类型: {type_config['name']} (type={type_config['type']})")
            
            type_new_movies = 0
            
            # 遍历所有评分区间
            for interval in INTERVALS:
                try:
                    new_movies = self.crawl_movies(type_config, interval)
                    type_new_movies += new_movies
                    total_new_movies += new_movies
                    
                    # 每爬取一个区间保存一次结果
                    self.save_results()
                    
                    # 区间之间增加延迟
                    time.sleep(random.uniform(3, 6))
                    
                except Exception as e:
                    print(f"处理区间 {interval} 时出错: {str(e)}")
            
            print(f"类型 {type_config['name']} 爬取完成，共新增 {type_new_movies} 部电影")
            
            # 类型之间增加更长延迟
            time.sleep(random.uniform(5, 10))
        
        # 最终保存结果
        self.save_results()
        
        # 打印统计信息
        total_time = time.time() - self.start_time
        print("\n" + "=" * 60)
        print(f"爬取完成! 总耗时: {total_time/60:.1f} 分钟")
        print(f"总电影数: {len(self.collected_movies)}")
        print(f"总新增电影数: {total_new_movies}")
        print(f"总请求次数: {self.request_count}")
        print(f"平均速率: {self.request_count/(total_time/60):.1f} 次/分钟")
        print("=" * 60)


if __name__ == "__main__":
    crawler = DoubanMovieAPICrawler()
    
    # 运行完整爬取 - 获取所有类型所有评分区间的电影
    crawler.run()
