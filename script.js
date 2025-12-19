// 存储豆瓣剧照链接的数组
let doubanUrls = [];
let isLoading = false;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async () => {
    const openBtn = document.getElementById('openBtn');
    const aboutBtn = document.getElementById('aboutBtn');
    const modal = document.getElementById('aboutModal');
    const closeBtn = document.getElementsByClassName('close')[0];
    
    // 加载链接
    await loadUrls();
    
    // 添加随机打开按钮点击事件
    openBtn.addEventListener('click', () => {
        openRandomUrl();
    });
    
    // 添加关于按钮点击事件
    aboutBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });
    
    // 添加关闭按钮点击事件
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // 点击弹窗外部关闭弹窗
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // 按下ESC键关闭弹窗
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });
});

// 加载豆瓣剧照链接
async function loadUrls() {
    const status = document.getElementById('status');
    
    if (isLoading) return;
    isLoading = true;
    
    try {
        status.textContent = '正在加载链接...';
        status.className = 'status success';
        
        const response = await fetch('douban_photo_urls.txt');
        
        if (!response.ok) {
            throw new Error(`HTTP错误! 状态码: ${response.status}`);
        }
        
        const data = await response.text();
        // 按行分割，并过滤掉空行
        doubanUrls = data.split('\n').filter(url => {
            // 匹配纯URL格式
            url = url.trim();
            return url !== '' && /^https?:\/\/.+/.test(url);
        }).map(url => url.trim());
        
        status.textContent = `成功加载 ${doubanUrls.length} 个豆瓣剧照链接`;
        status.className = 'status success';
        
        // 3秒后隐藏成功信息
        setTimeout(() => {
            status.className = 'status';
        }, 3000);
        
    } catch (error) {
        console.error('加载豆瓣剧照链接失败:', error);
        status.textContent = `加载链接失败: ${error.message}`;
        status.className = 'status error';
    } finally {
        isLoading = false;
    }
}

// 随机打开一个链接
function openRandomUrl() {
    const status = document.getElementById('status');
    const openBtn = document.getElementById('openBtn');
    
    // 验证链接是否已加载
    if (doubanUrls.length === 0) {
        status.textContent = '链接未加载，请稍后重试';
        status.className = 'status error';
        return;
    }
    
    // 禁用按钮，防止重复点击
    openBtn.disabled = true;
    
    try {
        // 随机选择一个链接
        const randomIndex = Math.floor(Math.random() * doubanUrls.length);
        const randomUrl = doubanUrls[randomIndex];
        
        // 在新标签页中打开链接
        window.open(randomUrl, '_blank');
        
        // 显示成功信息
        status.textContent = '已成功打开随机剧照页面';
        status.className = 'status success';
        
    } catch (error) {
        console.error('打开链接失败:', error);
        status.textContent = `打开链接失败: ${error.message}`;
        status.className = 'status error';
    } finally {
        // 3秒后恢复按钮状态和隐藏信息
        setTimeout(() => {
            openBtn.disabled = false;
            status.className = 'status';
        }, 3000);
    }
}