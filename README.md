# 随机豆瓣剧照（静态网页版）

一个基于Chrome扩展改编的静态网页应用，可以随机打开豆瓣电影剧照页面，并支持自定义打开数量。

## 功能特性

- 🎲 随机打开豆瓣电影剧照页面
- 📊 支持自定义打开数量（1-10个）
- 🎨 美观的渐变设计
- 📱 响应式布局，支持移动端
- ⚡ 快速加载和响应

## 使用方法

### 本地使用

1. 克隆或下载本项目
2. 在项目根目录启动HTTP服务器：
   ```bash
   python3 -m http.server 8000
   ```
3. 在浏览器中访问：`http://localhost:8000`
4. 在输入框中设置要打开的数量（1-10）
5. 点击"随机打开剧照"按钮，系统会在新标签页中打开指定数量的随机豆瓣剧照页面

### 部署到GitHub Pages

1. 在GitHub上创建一个新的仓库
2. 将本地仓库推送到GitHub：
   ```bash
   # 关联远程仓库
   git remote add origin https://github.com/你的用户名/仓库名.git
   
   # 推送代码
   git push -u origin main
   ```
3. 在GitHub仓库设置中启用GitHub Pages：
   - 进入仓库的"Settings"页面
   - 滚动到"Pages"部分
   - 在"Source"下拉菜单中选择"main"分支
   - 点击"Save"按钮
4. 等待几分钟，GitHub Pages会部署你的网站
5. 访问你的GitHub Pages网站：`https://你的用户名.github.io/仓库名/`

## 项目结构

```
├── douban_photo_urls.txt   # 豆瓣剧照链接列表
├── index.html              # 静态网页主文件
├── style.css               # 样式文件
├── script.js               # JavaScript逻辑
├── .gitignore              # Git忽略文件
└── README.md               # 项目说明
```

## 技术实现

- **HTML5**：页面结构
- **CSS3**：样式设计，包括渐变和响应式布局
- **JavaScript (ES6+)**：交互逻辑，包括异步加载和DOM操作
- **Git**：版本控制

## 注意事项

- 确保`douban_photo_urls.txt`文件位于`Extension`目录下
- 网站需要在HTTP服务器环境下运行，直接打开HTML文件可能会遇到跨域问题
- GitHub Pages部署后，访问链接可能需要几分钟时间生效

## 许可证

MIT License