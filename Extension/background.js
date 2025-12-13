// 存储豆瓣剧照链接的数组
let doubanUrls = [];

// 在安装或更新扩展时加载链接
function loadUrls() {
  return new Promise((resolve, reject) => {
    // 获取文本文件的URL
    const fileUrl = chrome.runtime.getURL('douban_photo_urls.txt');
    
    fetch(fileUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP错误! 状态码: ${response.status}`);
        }
        return response.text();
      })
      .then(data => {
        // 按行分割，并过滤掉空行
        doubanUrls = data.split('\n').filter(url => url.trim() !== '');
        console.log(`成功加载 ${doubanUrls.length} 个豆瓣剧照链接`);
        resolve();
      })
      .catch(error => {
        console.error('加载豆瓣剧照链接失败:', error);
        reject(error);
      });
  });
}

// 当扩展安装时加载链接
chrome.runtime.onInstalled.addListener(() => {
  loadUrls().catch(error => console.error('初始化加载链接失败:', error));
});

// 当点击扩展图标时触发
chrome.action.onClicked.addListener(() => {
  openRandomUrl();
});

// 监听快捷键命令
chrome.commands.onCommand.addListener((command) => {
  if (command === "open-random-photo") {
    openRandomUrl();
  }
});

// 随机打开一个链接
function openRandomUrl() {
  // 如果链接尚未加载，尝试加载
  if (doubanUrls.length === 0) {
    console.log('链接未加载，正在尝试重新加载...');
    loadUrls()
      .then(() => {
        openRandomUrl();
      })
      .catch(error => {
        console.error('加载链接失败，无法打开页面', error);
        showNotification('加载链接失败', '请确保douban_photo_urls.txt文件存在');
      });
    return;
  }
  
  const randomIndex = Math.floor(Math.random() * doubanUrls.length);
  const url = doubanUrls[randomIndex];
  
  console.log(`随机打开链接: ${url}`);
  chrome.tabs.create({ url: url });
  
  // 显示操作通知
  showNotification('已打开随机剧照', `已打开链接: ${url}`);
}

// 显示通知函数
function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon48.png',
    title: title,
    message: message
  });
}