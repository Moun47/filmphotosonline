// 存储电影数据的数组
let movies = [];
let isLoading = false;

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

// 所有海报图片路径
const posterImages = [
    'posters/p1055645725.webp',
    'posters/p1271999126.webp',
    'posters/p1883551035.webp',
    'posters/p1910931622.webp',
    'posters/p1957625869.webp',
    'posters/p2071123198.webp',
    'posters/p2163659004.webp',
    'posters/p2166127561.webp',
    'posters/p2173386253.webp',
    'posters/p2178390974.webp',
    'posters/p2194480884.webp',
    'posters/p2195566148.webp',
    'posters/p2201353791.webp',
    'posters/p2206737207.webp',
    'posters/p2215102596.webp',
    'posters/p2215886505.webp',
    'posters/p2235626712.webp',
    'posters/p2236812017.webp',
    'posters/p2238784204.webp',
    'posters/p2245482010.webp',
    'posters/p2247672271.webp',
    'posters/p2248676081.webp',
    'posters/p2253641357.webp',
    'posters/p2256401986.webp',
    'posters/p2263287670.webp',
    'posters/p2263553175.webp',
    'posters/p2312758560.webp',
    'posters/p2321431402.webp',
    'posters/p2339055762.webp',
    'posters/p2350715785.webp',
    'posters/p2402012821.webp',
    'posters/p2418455758.webp',
    'posters/p2440233036.webp',
    'posters/p2458406632.webp',
    'posters/p2490948849.webp',
    'posters/p2501068908.webp',
    'posters/p2518080782.webp',
    'posters/p2518558081.webp',
    'posters/p2528293957.webp',
    'posters/p2533924212.webp',
    'posters/p2538061000.webp',
    'posters/p2549768986.webp',
    'posters/p2553104888.webp',
    'posters/p2558022335.webp',
    'posters/p2560052923.webp',
    'posters/p2565039399.webp',
    'posters/p2573433510.webp',
    'posters/p2614234255.webp',
    'posters/p2630100110.webp',
    'posters/p2654612159.webp',
    'posters/p2873818227.webp',
    'posters/p2880793132.webp',
    'posters/p2893820209.webp',
    'posters/p2897796275.webp',
    'posters/p2914293980.webp',
    'posters/p2914698334.webp',
    'posters/p2922238175.webp',
    'posters/p2923749086.webp',
    'posters/p456703618.webp',
    'posters/p788737850.webp',
    'posters/p983398708.webp',
    'posters/V-for-Vendetta_poster_goldposter_com_31.webp'
];

// 生成海报背景 - 重叠交错效果
function generatePosterBackground() {
    const posterBackground = document.getElementById('posterBackground');
    if (!posterBackground) return;
    
    // 清空现有内容
    posterBackground.innerHTML = '';
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const totalPosters = 100; // 生成100张海报，确保密集覆盖
    
    // 生成海报元素
    for (let i = 0; i < totalPosters; i++) {
        // 随机选择一张海报
        const randomPoster = posterImages[Math.floor(Math.random() * posterImages.length)];
        
        // 创建海报元素
        const posterItem = document.createElement('div');
        posterItem.className = 'poster-item';
        posterItem.style.backgroundImage = `url(${randomPoster})`;
        
        // 1. 随机位置：允许海报超出屏幕边缘，确保完全覆盖
        const randomX = Math.random() * (windowWidth + 300) - 150; // -150px 到 windowWidth + 150px
        const randomY = Math.random() * (windowHeight + 450) - 225; // -225px 到 windowHeight + 225px
        posterItem.style.left = `${randomX}px`;
        posterItem.style.top = `${randomY}px`;
        
        // 2. 随机旋转角度（-5到5度）
        const randomRotate = (Math.random() - 0.5) * 10;
        
        // 3. 随机缩放（0.8到1.1倍）
        const randomScale = 0.8 + Math.random() * 0.3;
        
        // 4. 组合变换效果
        posterItem.style.transform = `rotate(${randomRotate}deg) scale(${randomScale})`;
        
        // 5. 随机z-index，允许海报重叠
        const randomZIndex = Math.floor(Math.random() * 10);
        posterItem.style.setProperty('--z-index', randomZIndex);
        
        // 添加到背景容器
        posterBackground.appendChild(posterItem);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async () => {
    const openBtn = document.getElementById('openBtn');
    const aboutBtn = document.getElementById('aboutBtn');
    const modal = document.getElementById('aboutModal');
    const closeBtn = document.getElementsByClassName('close')[0];
    
    // 生成海报背景
    generatePosterBackground();
    
    // 监听窗口大小变化，重新生成海报背景
    window.addEventListener('resize', generatePosterBackground);
    
    // 加载电影数据
    await loadMovies();
    
    // 初始化评价人数滑块
    const reviewLevelSlider = document.getElementById('reviewLevelSlider');
    
    // 移除了评价人数显示，所以不需要更新显示文本
    
    // 添加评分输入框滚动事件监听
    const minRatingInput = document.getElementById('minRating');
    const maxRatingInput = document.getElementById('maxRating');
    const rangeInputsContainer = document.querySelector('.range-inputs');
    
    // 为输入框区域添加滚动事件监听
    rangeInputsContainer.addEventListener('wheel', (e) => {
        // 获取当前激活的输入框或最近的输入框
        const targetInput = document.activeElement === minRatingInput || document.activeElement === maxRatingInput 
            ? document.activeElement 
            : e.target.closest('.range-item')?.querySelector('input');
        
        if (targetInput) {
            e.preventDefault(); // 阻止页面滚动
            
            const currentValue = parseFloat(targetInput.value) || 0;
            const step = parseFloat(targetInput.step) || 0.1;
            const min = parseFloat(targetInput.min) || 0;
            const max = parseFloat(targetInput.max) || 10;
            
            // 计算新值，往下滚动（deltaY > 0）增大数值，往上滚动（deltaY < 0）减小数值
            let newValue = currentValue + (e.deltaY > 0 ? step : -step);
            
            // 确保新值在范围内
            newValue = Math.max(min, Math.min(max, newValue));
            
            // 更新输入框值
            targetInput.value = newValue.toFixed(1);
        }
    });
    
    // 添加触摸事件支持（手机端）
    let touchStartY = 0;
    let currentTargetInput = null;
    
    rangeInputsContainer.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
        currentTargetInput = e.target.closest('.range-item')?.querySelector('input');
    });
    
    rangeInputsContainer.addEventListener('touchmove', (e) => {
        if (!currentTargetInput) return;
        
        e.preventDefault(); // 阻止页面滚动
        
        const touchEndY = e.touches[0].clientY;
        const deltaY = touchEndY - touchStartY;
        
        if (Math.abs(deltaY) > 5) { // 阈值，防止误触
            const currentValue = parseFloat(currentTargetInput.value) || 0;
            const step = parseFloat(currentTargetInput.step) || 0.1;
            const min = parseFloat(currentTargetInput.min) || 0;
            const max = parseFloat(currentTargetInput.max) || 10;
            
            // 计算新值，往下滑动（deltaY > 0）增大数值，往上滑动（deltaY < 0）减小数值
            let newValue = currentValue + (deltaY > 0 ? step : -step);
            
            // 确保新值在范围内
            newValue = Math.max(min, Math.min(max, newValue));
            
            // 更新输入框值
            currentTargetInput.value = newValue.toFixed(1);
            
            // 更新起始位置，用于连续滑动
            touchStartY = touchEndY;
        }
    });
    
    rangeInputsContainer.addEventListener('touchend', () => {
        currentTargetInput = null;
    });
    
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

// 根据用户选择获取筛选条件
function getFilterOptions() {
    // 获取链接类型
    const linkType = document.querySelector('input[name="linkType"]:checked').value;
    
    // 获取评分区间（从输入框）
    const rating1 = parseFloat(document.getElementById('minRating').value) || 0;
    const rating2 = parseFloat(document.getElementById('maxRating').value) || 10;
    
    // 比较两个值，确定真正的最小值和最大值
    const minRating = Math.min(rating1, rating2);
    const maxRating = Math.max(rating1, rating2);
    
    // 获取评价人数筛选（从滑块）
    const reviewLevel = parseInt(document.getElementById('reviewLevelSlider').value);
    
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
    
    // 按评价人数筛选（更丰富的量级分类）
    switch (options.reviewLevel) {
        case 1:
            // 百人评价（100-999人）
            filtered = filtered.filter(movie => movie.reviewCount >= 100 && movie.reviewCount < 1000);
            break;
        case 2:
            // 千人评价（1000-9999人）
            filtered = filtered.filter(movie => movie.reviewCount >= 1000 && movie.reviewCount < 10000);
            break;
        case 3:
            // 万人评价（10,000-99,999人）
            filtered = filtered.filter(movie => movie.reviewCount >= 10000 && movie.reviewCount < 100000);
            break;
        case 4:
            // 十万人评价（100,000-999,999人）
            filtered = filtered.filter(movie => movie.reviewCount >= 100000 && movie.reviewCount < 1000000);
            break;
        case 5:
            // 百万人评价（1,000,000人以上）
            filtered = filtered.filter(movie => movie.reviewCount >= 1000000);
            break;
        case 0:
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