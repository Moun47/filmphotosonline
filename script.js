// 存储电影数据的数组
let movies = [];
let isLoading = false;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async () => {
    const openBtn = document.getElementById('openBtn');
    const aboutBtn = document.getElementById('aboutBtn');
    const modal = document.getElementById('aboutModal');
    const closeBtn = document.getElementsByClassName('close')[0];
    
    // 加载电影数据
    await loadMovies();
    
    // 添加随机打开按钮点击事件
    openBtn.addEventListener('click', () => {
        openRandomMovie();
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

// 解析评价人数文本，返回实际数字
function parseReviewCount(reviewText) {
    // 提取数字部分
    const match = reviewText.match(/(\d+(?:,\d+)*)/);
    if (match) {
        return parseInt(match[0].replace(/,/g, ''));
    }
    return 0;
}

// 加载电影数据
async function loadMovies() {
    const status = document.getElementById('status');
    
    if (isLoading) return;
    isLoading = true;
    
    try {
        status.textContent = '正在加载电影数据...';
        status.className = 'status success';
        
        const response = await fetch('movie_info.csv');
        
        if (!response.ok) {
            throw new Error(`HTTP错误! 状态码: ${response.status}`);
        }
        
        const data = await response.text();
        
        // 解析CSV数据
        const lines = data.split('\n');
        movies = [];
        
        // 跳过表头行
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '') continue;
            
            const [movieId, movieLink, photoLink, rating, reviewCount] = line.split(',');
            
            // 解析评分和评价人数
            const parsedRating = parseFloat(rating);
            const parsedReviewCount = parseReviewCount(reviewCount);
            
            if (!isNaN(parsedRating) && parsedReviewCount >= 0) {
                movies.push({
                    movieId,
                    movieLink,
                    photoLink,
                    rating: parsedRating,
                    reviewCount: parsedReviewCount
                });
            }
        }
        
        status.textContent = `成功加载 ${movies.length} 部电影数据`;
        status.className = 'status success';
        
        // 3秒后隐藏成功信息
        setTimeout(() => {
            status.className = 'status';
        }, 3000);
        
    } catch (error) {
        console.error('加载电影数据失败:', error);
        status.textContent = `加载数据失败: ${error.message}`;
        status.className = 'status error';
    } finally {
        isLoading = false;
    }
}

// 根据用户选择获取筛选条件
function getFilterOptions() {
    // 获取链接类型
    const linkType = document.querySelector('input[name="linkType"]:checked').value;
    
    // 获取评分区间
    const minRating = parseFloat(document.getElementById('minRating').value);
    const maxRating = parseFloat(document.getElementById('maxRating').value);
    
    // 获取评价人数筛选
    const reviewLevel = document.querySelector('input[name="reviewLevel"]:checked').value;
    
    return {
        linkType,
        minRating,
        maxRating,
        reviewLevel
    };
}

// 根据筛选条件过滤电影
function filterMovies(options) {
    let filtered = [...movies];
    
    // 按评分筛选
    filtered = filtered.filter(movie => 
        movie.rating >= options.minRating && movie.rating <= options.maxRating
    );
    
    // 按评价人数筛选
    switch (options.reviewLevel) {
        case 'hundred':
            // 百人评价（100-999人）
            filtered = filtered.filter(movie => movie.reviewCount >= 100 && movie.reviewCount < 1000);
            break;
        case 'thousand':
            // 千人评价（1000-9999人）
            filtered = filtered.filter(movie => movie.reviewCount >= 1000 && movie.reviewCount < 10000);
            break;
        case 'tenThousand':
            // 万人评价（10000人以上）
            filtered = filtered.filter(movie => movie.reviewCount >= 10000);
            break;
        case 'all':
        default:
            // 全部
            break;
    }
    
    return filtered;
}

// 随机打开一个电影
function openRandomMovie() {
    const status = document.getElementById('status');
    const openBtn = document.getElementById('openBtn');
    
    // 验证电影数据是否已加载
    if (movies.length === 0) {
        status.textContent = '电影数据未加载，请稍后重试';
        status.className = 'status error';
        return;
    }
    
    // 禁用按钮，防止重复点击
    openBtn.disabled = true;
    
    try {
        // 获取筛选条件
        const filterOptions = getFilterOptions();
        
        // 根据筛选条件过滤电影
        const filteredMovies = filterMovies(filterOptions);
        
        if (filteredMovies.length === 0) {
            status.textContent = '当前筛选条件下无电影数据，请调整筛选条件';
            status.className = 'status error';
            return;
        }
        
        // 随机选择一个电影
        const randomIndex = Math.floor(Math.random() * filteredMovies.length);
        const selectedMovie = filteredMovies[randomIndex];
        
        // 根据选择的链接类型打开对应页面
        const url = filterOptions.linkType === 'photos' ? selectedMovie.photoLink : selectedMovie.movieLink;
        
        // 在新标签页中打开链接
        window.open(url, '_blank');
        
        // 显示成功信息
        const linkTypeText = filterOptions.linkType === 'photos' ? '剧照页面' : '电影初始页面';
        status.textContent = `已成功打开随机${linkTypeText}`;
        status.className = 'status success';
        
    } catch (error) {
        console.error('打开电影失败:', error);
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