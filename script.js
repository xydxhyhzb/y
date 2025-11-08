class ConfessionWall {
    constructor() {
        this.confessions = this.loadConfessions();
        this.currentFilter = 'all';
        this.historyMessages = this.loadHistoryMessages();
        this.selectedFiles = []; // 存储选中的文件
        this.init();
    }

    // 初始化应用
    init() {
        this.bindEvents();
        this.renderWall();
    }

    // 绑定事件
    bindEvents() {
        // 表单提交事件
        document.getElementById('confessionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitConfession();
        });

        // 过滤器按钮事件
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
        
        // 文件上传事件
        this.setupFileUpload();
    }

    // 设置文件上传功能 - 修复版
    setupFileUpload() {
        console.log('设置文件上传功能...');
        
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('mediaInput');
        const previewContainer = document.getElementById('previewContainer');

        if (!uploadArea || !fileInput || !previewContainer) {
            console.error('上传元素未找到', {
                uploadArea: !!uploadArea,
                fileInput: !!fileInput,
                previewContainer: !!previewContainer
            });
            return;
        }

        // 点击上传区域触发文件选择
        uploadArea.addEventListener('click', () => {
            console.log('点击上传区域');
            fileInput.click();
        });

        // 文件选择变化事件
        fileInput.addEventListener('change', (e) => {
            console.log('文件选择变化', e.target.files);
            this.handleFiles(e.target.files);
            fileInput.value = ''; // 重置input以便选择相同文件
        });

        // 拖拽事件
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            console.log('拖拽文件', e.dataTransfer.files);
            this.handleFiles(e.dataTransfer.files);
        });

        // 移除预览项事件委托
        previewContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-btn')) {
                const fileName = e.target.dataset.file;
                this.removeFile(fileName);
            }
        });
        
        console.log('文件上传功能设置完成');
    }

    // 处理选择的文件 - 修复版
    handleFiles(files) {
        console.log('处理文件', files);
        const MAX_SIZE = 50 * 1024 * 1024; // 50MB
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 
            'video/mp4', 'video/webm', 'video/ogg', 
            'video/quicktime', 'video/x-msvideo'
        ];

        for (let file of files) {
            console.log('处理文件:', file.name, '类型:', file.type, '大小:', file.size);
            
            // 检查文件大小
            if (file.size > MAX_SIZE) {
                this.showErrorMessage(`文件"${file.name}"大小超过50MB限制`);
                continue;
            }

            // 检查文件类型 - 更宽松的检查
            if (file.type.startsWith('image/')) {
                if (!file.type.match(/^image\/(jpeg|png|gif)$/)) {
                    this.showErrorMessage(`不支持的图片格式: ${file.type}`);
                    continue;
                }
            } else if (file.type.startsWith('video/')) {
                // 接受所有视频类型
                console.log('接受视频文件:', file.name, '类型:', file.type);
            } else {
                this.showErrorMessage(`不支持的文件类型: ${file.type}`);
                continue;
            }

            // 添加到已选文件列表
            if (!this.selectedFiles.find(f => f.name === file.name)) {
                this.selectedFiles.push(file);
                this.addFilePreview(file);
                console.log('文件添加成功:', file.name);
            } else {
                console.log('文件已存在:', file.name);
            }
        }
        
        console.log('当前选中的文件数量:', this.selectedFiles.length);
    }

    // 添加文件预览
    addFilePreview(file) {
        const previewContainer = document.getElementById('previewContainer');
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.dataset.file = file.name;

        // 使用URL.createObjectURL()生成预览，性能更好
        const fileURL = URL.createObjectURL(file);
        
        if (file.type.startsWith('image/')) {
            previewItem.innerHTML = `
                <img src="${fileURL}" alt="${file.name}" class="preview-image">
                <div class="file-info">
                    <span>${file.name}</span>
                    <span>${this.formatFileSize(file.size)}</span>
                </div>
                <button class="remove-btn" data-file="${file.name}">×</button>
            `;
        } else if (file.type.startsWith('video/')) {
            // 为视频添加更好的样式和错误处理
            previewItem.innerHTML = `
                <div class="video-wrapper">
                    <video class="preview-video" preload="metadata">
                        <source src="${fileURL}" type="${file.type}">
                        您的浏览器不支持视频播放。
                    </video>
                    <div class="video-overlay">
                        <div class="video-loading">加载中...</div>
                    </div>
                </div>
                <div class="file-info">
                    <span>${file.name}</span>
                    <span>${this.formatFileSize(file.size)}</span>
                </div>
                <button class="remove-btn" data-file="${file.name}">×</button>
            `;
            
            // 添加视频加载事件处理
            const videoElement = previewItem.querySelector('video');
            const loadingOverlay = previewItem.querySelector('.video-loading');
            
            videoElement.addEventListener('loadedmetadata', () => {
                if (loadingOverlay) {
                    loadingOverlay.textContent = '✅';
                    setTimeout(() => {
                        const overlay = previewItem.querySelector('.video-overlay');
                        if (overlay) overlay.style.display = 'none';
                    }, 1000);
                }
            });
            
            videoElement.addEventListener('error', (e) => {
                console.error('视频加载错误:', e);
                if (loadingOverlay) {
                    loadingOverlay.textContent = '❌ 加载失败';
                }
                this.showErrorMessage(`视频"${file.name}"加载失败`);
            });
        }

        previewContainer.appendChild(previewItem);
    }

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 移除文件
    removeFile(fileName) {
        this.selectedFiles = this.selectedFiles.filter(f => f.name !== fileName);
        const previewItem = document.querySelector(`[data-file="${fileName}"]`);
        if (previewItem) {
            previewItem.remove();
        }
    }

    // 将文件转换为DataURL
    fileToDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // 处理媒体文件
    async processMediaFiles() {
        const mediaFiles = [];
        
        for (const file of this.selectedFiles) {
            try {
                const dataUrl = await this.fileToDataURL(file);
                mediaFiles.push({
                    name: file.name,
                    type: file.type,
                    data: dataUrl,
                    size: file.size
                });
            } catch (error) {
                console.error('处理文件失败:', error);
                this.showErrorMessage(`处理文件"${file.name}"失败`);
            }
        }
        
        return mediaFiles;
    }

    // 重置表单（包括文件选择）
    resetForm() {
        document.getElementById('confessionForm').reset();
        this.selectedFiles = [];
        const previewContainer = document.getElementById('previewContainer');
        previewContainer.innerHTML = '';
    }

    // 提交表白
    async submitConfession() {
        const to = document.getElementById('to').value.trim();
        const from = document.getElementById('from').value.trim() || '匿名';
        const content = document.getElementById('content').value.trim();
        const type = document.getElementById('type').value;

        if (!to || !content) {
            alert('请填写接收人和表白内容！');
            return;
        }

        // 处理媒体文件
        const mediaFiles = await this.processMediaFiles();
        
        const confession = {
            id: Date.now(),
            to: to,
            from: from,
            content: content,
            type: type,
            timestamp: new Date().toLocaleString('zh-CN'),
            likes: 0,
            media: mediaFiles
        };

        this.confessions.unshift(confession);
        this.saveConfessions();
        this.renderWall();
        this.resetForm();
        
        // 显示成功提示
        this.showSuccessMessage('表白发布成功！');
    }

    // 设置过滤器
    setFilter(filter) {
        this.currentFilter = filter;
        
        // 更新按钮状态
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.renderWall();
    }

    // 渲染表白墙
    renderWall() {
        const wall = document.getElementById('wall');
        const filteredConfessions = this.currentFilter === 'all' 
            ? this.confessions 
            : this.confessions.filter(c => c.type === this.currentFilter);

        if (filteredConfessions.length === 0) {
            wall.innerHTML = `
                <div class="empty-wall">
                    <div style="font-size: 4rem; margin-bottom: 20px;">💭</div>
                    <p>暂无表白内容</p>
                    <p style="font-size: 0.9rem; margin-top: 10px; color: #aaa;">
                        ${this.currentFilter === 'all' ? '快来发布第一条表白吧！' : '该分类下暂无表白内容'}
                    </p>
                </div>
            `;
            return;
        }

        wall.innerHTML = filteredConfessions.map(confession => {
            let mediaContent = '';
            
            // 如果有媒体文件，生成媒体内容
            if (confession.media && confession.media.length > 0) {
                mediaContent = confession.media.map((media, index) => {
                    if (media.type.startsWith('image/')) {
                        return `<div class="card-media media-clickable" onclick="confessionWall.openMediaGallery('${confession.id}', ${index}, 'image')" data-confession-id="${confession.id}" data-media-index="${index}">
                            <img src="${media.data}" alt="${media.name}">
                            <div class="media-overlay">
                                <div class="media-icon">🔍</div>
                            </div>
                        </div>`;
                    } else if (media.type.startsWith('video/')) {
                        return `<div class="card-media media-clickable" onclick="confessionWall.openMediaGallery('${confession.id}', ${index}, 'video')" data-confession-id="${confession.id}" data-media-index="${index}">
                            <video src="${media.data}" muted></video>
                            <div class="media-overlay">
                                <div class="media-icon">▶️</div>
                            </div>
                        </div>`;
                    }
                    return '';
                }).join('');
            }
            
            return `
                <div class="confession-card ${confession.type}">
                    <div class="card-header">
                        <div class="card-to">致：${this.escapeHtml(confession.to)}</div>
                        <div class="card-type">${this.getTypeIcon(confession.type)}</div>
                    </div>
                    <div class="card-content">${this.escapeHtml(confession.content)}</div>
                    ${mediaContent}
                    <div class="card-from">—— ${this.escapeHtml(confession.from)}</div>
                    <div class="card-time">${confession.timestamp}</div>
                    <div class="card-actions">
                        <button class="like-btn" onclick="confessionWall.likeConfession(${confession.id})">
                            ❤️ ${confession.likes}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 点赞功能
    likeConfession(id) {
        const confession = this.confessions.find(c => c.id === id);
        if (confession) {
            confession.likes++;
            this.saveConfessions();
            this.renderWall();
        }
    }

    // 获取类型图标
    getTypeIcon(type) {
        const icons = {
            love: '💘',
            friendship: '🤝',
            admiration: '🌟',
            thanks: '🙏'
        };
        return icons[type] || '💕';
    }

    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 显示成功消息（一直显示）
    showSuccessMessage(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            border-left: 5px solid #388E3C;
        `;
        notification.textContent = message;
        
        // 添加关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 5px;
            right: 8px;
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        closeBtn.onclick = () => {
            notification.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        };
        
        notification.appendChild(closeBtn);
        document.body.appendChild(notification);

        // 添加CSS动画
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // 打开媒体相册
    openMediaGallery(confessionId, mediaIndex, mediaType) {
        const confession = this.confessions.find(c => c.id == confessionId);
        if (!confession || !confession.media || confession.media.length === 0) return;
        
        // 创建相册弹窗
        const gallery = document.createElement('div');
        gallery.id = 'media-gallery';
        gallery.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 3000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        
        // 创建内容容器
        const container = document.createElement('div');
        container.style.cssText = `
            position: relative;
            max-width: 90%;
            max-height: 90%;
            display: flex;
            flex-direction: column;
            align-items: center;
        `;
        
        // 当前媒体
        const currentMedia = confession.media[mediaIndex];
        let mediaElement;
        
        if (mediaType === 'image') {
            mediaElement = document.createElement('img');
            mediaElement.src = currentMedia.data;
            mediaElement.style.cssText = `
                max-width: 100%;
                max-height: 80vh;
                object-fit: contain;
            `;
        } else if (mediaType === 'video') {
            mediaElement = document.createElement('video');
            mediaElement.src = currentMedia.data;
            mediaElement.controls = true;
            mediaElement.autoplay = true;
            mediaElement.style.cssText = `
                max-width: 100%;
                max-height: 80vh;
                background: #000;
            `;
        }
        
        // 文件信息
        const fileInfo = document.createElement('div');
        fileInfo.style.cssText = `
            color: white;
            text-align: center;
            margin-top: 20px;
            font-size: 16px;
        `;
        fileInfo.innerHTML = `
            <div>${currentMedia.name}</div>
            <div style="font-size: 14px; opacity: 0.8; margin-top: 5px;">
                ${this.formatFileSize(currentMedia.size)} · ${mediaIndex + 1} / ${confession.media.length}
            </div>
        `;
        
        // 关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 40px;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 24px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.3s;
        `;
        closeBtn.onmouseover = () => closeBtn.style.background = 'rgba(255, 255, 255, 0.3)';
        closeBtn.onmouseout = () => closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        
        // 前后导航按钮
        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = '❮';
        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = '❯';
        
        const navBtnStyle = `
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.3s;
        `;
        
        prevBtn.style.cssText = navBtnStyle + 'left: 40px;';
        nextBtn.style.cssText = navBtnStyle + 'right: 40px;';
        
        prevBtn.style.display = confession.media.length > 1 && mediaIndex > 0 ? 'flex' : 'none';
        nextBtn.style.display = confession.media.length > 1 && mediaIndex < confession.media.length - 1 ? 'flex' : 'none';
        
        // 导航事件
        prevBtn.onclick = (e) => {
            e.stopPropagation();
            this.openMediaGallery(confessionId, mediaIndex - 1, confession.media[mediaIndex - 1].type.startsWith('image/') ? 'image' : 'video');
        };
        
        nextBtn.onclick = (e) => {
            e.stopPropagation();
            this.openMediaGallery(confessionId, mediaIndex + 1, confession.media[mediaIndex + 1].type.startsWith('image/') ? 'image' : 'video');
        };
        
        // 点击背景关闭
        closeBtn.onclick = () => document.body.removeChild(gallery);
        gallery.onclick = (e) => {
            if (e.target === gallery) document.body.removeChild(gallery);
        };
        
        // 组装元素
        container.appendChild(mediaElement);
        container.appendChild(fileInfo);
        container.appendChild(closeBtn);
        container.appendChild(prevBtn);
        container.appendChild(nextBtn);
        gallery.appendChild(container);
        
        document.body.appendChild(gallery);
        
        // 阻止媒体元素上的点击冒泡
        mediaElement.onclick = (e) => e.stopPropagation();
    }

    // 加载表白数据
    loadConfessions() {
        try {
            const saved = localStorage.getItem('confessions');
            return saved ? JSON.parse(saved) : [
                {
                    id: 1,
                    to: '全体同学',
                    from: '校园小助手',
                    content: '欢迎来到校园表白墙！在这里，你可以勇敢表达自己的心意，让爱传递整个校园。无论是爱情、友情还是感谢，都值得被看见和珍惜！',
                    type: 'thanks',
                    timestamp: new Date().toLocaleString('zh-CN'),
                    likes: 5
                }
            ];
        } catch (error) {
            console.error('加载表白数据失败:', error);
            return [];
        }
    }

    // 保存表白数据
    saveConfessions() {
        try {
            localStorage.setItem('confessions', JSON.stringify(this.confessions));
        } catch (error) {
            console.error('保存表白数据失败:', error);
        }
    }

    // 显示错误消息
    showErrorMessage(message) {
        historyManager.addMessage('error', message);
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            border-left: 5px solid #C62828;
        `;
        notification.textContent = message;
        
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 5px;
            right: 8px;
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        closeBtn.onclick = () => {
            notification.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        };
        
        notification.appendChild(closeBtn);
        document.body.appendChild(notification);
    }
}

// 历史消息管理功能
class HistoryManager {
    constructor() {
        this.messages = [];
        this.loadMessages();
        this.setupHistoryButton();
    }

    // 加载历史消息
    loadMessages() {
        try {
            const saved = localStorage.getItem('historyMessages');
            this.messages = saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('加载历史消息失败:', error);
            this.messages = [];
        }
    }

    // 保存历史消息
    saveMessages() {
        try {
            localStorage.setItem('historyMessages', JSON.stringify(this.messages));
        } catch (error) {
            console.error('保存历史消息失败:', error);
        }
    }

    // 添加新消息
    addMessage(type, content) {
        const message = {
            id: Date.now(),
            type: type,
            content: content,
            timestamp: new Date().toLocaleString('zh-CN'),
            read: false
        };
        
        this.messages.unshift(message);
        // 保留最近100条消息
        if (this.messages.length > 100) {
            this.messages = this.messages.slice(0, 100);
        }
        
        this.saveMessages();
        this.updateBadge();
    }

    // 设置历史按钮
    setupHistoryButton() {
        const historyBtn = document.getElementById('historyBtn');
        if (historyBtn) {
            historyBtn.addEventListener('click', () => {
                this.showHistoryPanel();
            });
        }
        this.updateBadge();
    }

    // 更新未读消息徽章
    updateBadge() {
        const historyBtn = document.getElementById('historyBtn');
        if (historyBtn) {
            const unreadCount = this.messages.filter(msg => !msg.read).length;
            
            // 移除旧的徽章
            const oldBadge = historyBtn.querySelector('.badge');
            if (oldBadge) {
                oldBadge.remove();
            }
            
            // 如果有未读消息，添加徽章
            if (unreadCount > 0) {
                const badge = document.createElement('span');
                badge.className = 'badge';
                badge.textContent = unreadCount;
                badge.style.cssText = `
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: #e74c3c;
                    color: white;
                    border-radius: 10px;
                    padding: 2px 6px;
                    font-size: 10px;
                    min-width: 16px;
                    text-align: center;
                `;
                historyBtn.style.position = 'relative';
                historyBtn.appendChild(badge);
            }
        }
    }

    // 显示历史消息面板
    showHistoryPanel() {
        // 创建或更新历史面板
        let panel = document.getElementById('historyPanel');
        
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'historyPanel';
            panel.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                background: white;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                z-index: 2000;
                display: flex;
                flex-direction: column;
            `;
            
            // 面板头部
            const header = document.createElement('div');
            header.style.cssText = `
                padding: 20px;
                border-bottom: 2px solid #f0f0f0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;
            
            const title = document.createElement('h3');
            title.textContent = '📜 历史消息管理';
            title.style.margin = '0';
            title.style.color = '#333';
            
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '×';
            closeBtn.style.cssText = `
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            closeBtn.onclick = () => {
                document.body.removeChild(panel);
            };
            
            header.appendChild(title);
            header.appendChild(closeBtn);
            
            // 消息容器
            const content = document.createElement('div');
            content.id = 'historyContent';
            content.style.cssText = `
                flex: 1;
                overflow-y: auto;
                padding: 0;
            `;
            
            // 操作栏
            const actions = document.createElement('div');
            actions.style.cssText = `
                padding: 15px 20px;
                border-top: 2px solid #f0f0f0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;
            
            const clearBtn = document.createElement('button');
            clearBtn.textContent = '🗑️ 清空历史';
            clearBtn.style.cssText = `
                background: #e74c3c;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            `;
            clearBtn.onclick = () => {
                if (confirm('确定要清空所有历史消息吗？此操作不可撤销！')) {
                    this.messages = [];
                    this.saveMessages();
                    this.renderHistory();
                    this.updateBadge();
                }
            };
            
            const markAllReadBtn = document.createElement('button');
            markAllReadBtn.textContent = '✅ 全部已读';
            markAllReadBtn.style.cssText = `
                background: #3498db;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            `;
            markAllReadBtn.onclick = () => {
                this.messages.forEach(msg => msg.read = true);
                this.saveMessages();
                this.renderHistory();
                this.updateBadge();
            };
            
            actions.appendChild(clearBtn);
            actions.appendChild(markAllReadBtn);
            
            panel.appendChild(header);
            panel.appendChild(content);
            panel.appendChild(actions);
            
            document.body.appendChild(panel);
        }
        
        this.renderHistory();
        
        // 标记所有消息为已读
        this.messages.forEach(msg => msg.read = true);
        this.saveMessages();
        this.updateBadge();
    }

    // 渲染历史消息
    renderHistory() {
        const content = document.getElementById('historyContent');
        if (!content) return;
        
        if (this.messages.length === 0) {
            content.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: #888;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">📭</div>
                    <p style="font-size: 1.2rem;">暂无历史消息</p>
                    <p style="margin-top: 10px;">所有操作消息都会在这里记录</p>
                </div>
            `;
            return;
        }
        
        content.innerHTML = this.messages.map(message => `
            <div class="history-message ${message.read ? 'read' : 'unread'}" style="
                padding: 15px 20px;
                border-bottom: 1px solid #f0f0f0;
                transition: background 0.3s;
            ">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <span style="font-weight: bold; color: #333;">
                        ${this.getMessageTypeIcon(message.type)} ${this.getMessageTypeText(message.type)}
                    </span>
                    <span style="color: #888; font-size: 12px;">${message.timestamp}</span>
                </div>
                <div style="color: #666; line-height: 1.4;">${this.escapeHtml(message.content)}</div>
            </div>
        `).join('');
        
        // 添加悬停效果
        const messages = content.querySelectorAll('.history-message');
        messages.forEach(msg => {
            msg.addEventListener('mouseenter', () => {
                msg.style.background = '#f8f9fa';
            });
            msg.addEventListener('mouseleave', () => {
                msg.style.background = '';
            });
        });
    }

    // 获取消息类型图标
    getMessageTypeIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️'
        };
        return icons[type] || '💬';
    }

    // 获取消息类型文本
    getMessageTypeText(type) {
        const texts = {
            success: '成功',
            error: '错误',
            info: '信息',
            warning: '警告'
        };
        return texts[type] || '消息';
    }

    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 初始化历史消息管理器
const historyManager = new HistoryManager();

// 初始化应用
const confessionWall = new ConfessionWall();

// 重写显示成功消息方法，使其同时记录到历史
const originalShowSuccessMessage = confessionWall.showSuccessMessage;
confessionWall.showSuccessMessage = function(message) {
    historyManager.addMessage('success', message);
    return originalShowSuccessMessage.call(this, message);
};