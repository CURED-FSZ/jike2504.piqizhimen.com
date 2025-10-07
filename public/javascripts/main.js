/**
 * 主页交互逻辑
 * 包括页面切换、留言表单处理、弹窗显示、轮播图动画和课程表高亮
 * 使用 jQuery 和 Vanilla JS
 */

// 文档加载完成后执行
$(document).ready(function () {
    // ==========================================================================
    // DOM 元素选择
    // ==========================================================================
    const $form = $('.message-form');
    const $textarea = $('#comments');
    const $charCount = $('.char-count');
    const $error = $('.error');
    const $titleInput = $('#title'); // 重命名以避免与变量名冲突
    const $popup = $("#popup");
    const $popupTitle = $('#popup-title');
    const $popupMessage = $('#popup-message');
    const $popupIcon = $('#popup-icon');
    const $popupButton = $('#popup-button');

    // 常量定义
    const MAX_TITLE_LENGTH = 255;
    const MAX_CONTENT_LENGTH = 1000;
    const CAROUSEL_CARD_WIDTH = 280; // 轮播卡片宽度
    const CAROUSEL_INTERVAL = 2500; // 轮播间隔 (ms)

    // ==========================================================================
    // 工具函数
    // ==========================================================================

    /**
     * 页面切换
     * @param {string} pageId - 目标页面 ID
     */
    function switchPage(pageId) {
        console.log('切换到页面:', pageId);
        $('.page').removeClass('visible');
        $(`#${pageId}`).addClass('visible');
        $('.nav-link').removeClass('active');
        $(`.nav-link[data-page="${pageId}"]`).addClass('active');
        $('html, body').animate({ scrollTop: 0 }, 300);
    }

    /**
     * 显示弹窗
     * @param {number} code - 弹窗类型 (1:成功, 2:错误, 3:警告, 4:信息, default:提示)
     * @param {string} message - 消息内容
     */
    function showPopup(code, message) {
        // 先隐藏弹窗
        $popup.css('display', 'none');

        console.log(`show popup? code=${code}&message=${message}`);

        // 设置标题和图标
        const config = {
            1: { title: '成功', icon: '✅' },
            2: { title: '错误', icon: '❌' },
            3: { title: '警告', icon: '⚠️' },
            4: { title: '信息', icon: 'ℹ️' }
        };
        const popupConfig = config[code] || { title: '提示', icon: '' };

        $popupTitle.text(popupConfig.title);
        $popupIcon.text(popupConfig.icon);
        $popupMessage.text(message).fadeIn();
        $popup.css('display', 'flex');

        console.log(`浮窗显示: 类型=${code}, 消息=${message}`);
    }

    /**
     * 关闭弹窗
     */
    function closePopup() {
        $popup.css('display', 'none');
        $popupMessage.text('').fadeOut();
        $popupTitle.text('');
        $popupIcon.text('');
    }

    /**
     * 重置表单状态
     */
    function resetForm() {
        $form[0].reset();
        $charCount.text(`(0/${MAX_CONTENT_LENGTH})`).css('color', '#999');
        $error.hide().text('留言内容不能为空'); // 重置错误消息
    }

    /**
     * 前端表单验证
     * @param {string} name - 标题
     * @param {string} comments - 内容
     * @returns {Object|null} {valid: boolean, error: string} 或 null (有效)
     */
    function validateForm(name, comments) {
        if (!name || !comments) {
            return { valid: false, error: '标题和内容不能为空' };
        }
        if (name.length > MAX_TITLE_LENGTH) {
            return { valid: false, error: `标题长度不能超过${MAX_TITLE_LENGTH}个字符` };
        }
        if (comments.length > MAX_CONTENT_LENGTH) {
            return { valid: false, error: `留言内容长度不能超过${MAX_CONTENT_LENGTH}个字符` };
        }
        return null; // 有效
    }

    /**
     * 提交留言到服务器
     * @param {string} name - 标题
     * @param {string} comments - 内容
     */
    async function submitMessage(name, comments) {
        try {
            const response = await fetch('/api/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, comments })
            });
            const result = await response.json();
            console.log('服务器返回结果:', result);

            if (response.ok) {
                showPopup(1, '留言提交成功');
                resetForm();
            } else {
                $error.text(`提交失败：${result.error}`).show();
            }
        } catch (error) {
            $error.text('提交失败：网络错误').show();
            console.error('错误:', error);
        }
    }

    // ==========================================================================
    // 事件绑定
    // ==========================================================================

    // 弹窗关闭
    $popupButton.on('click', closePopup);

    // 导航链接点击
    $('.nav-link, .nav-footer-link').on('click', function (e) {
        e.preventDefault();
        const pageId = $(this).data('page');
        if (pageId) {
            switchPage(pageId);
        } else {
            console.error('data-page 属性缺失:', $(this));
        }
    });

    // 内容输入计数和验证
    $textarea.on('input', function () {
        const count = $(this).val().length;
        $charCount.text(`(${count}/${MAX_CONTENT_LENGTH})`)
            .css('color', count > 900 ? '#e74c3c' : '#999');
        if (count > 0) $error.hide();
    });

    $titleInput.on('input', function () {
        const val = $(this).val().trim();
        if (val.length < 1) {
            $(this).nextAll('.error').show();
        } else {
            $(this).nextAll('.error').hide();
        }
    });

    // 重置按钮
    $('.reset-btn').on('click', resetForm);

    // 返回首页
    $('.back-to-home').on('click', function (e) {
        e.preventDefault();
        switchPage('home');
    });

    // 表单提交
    $form.on('submit', async function (e) {
        e.preventDefault();

        const name = $titleInput.val().trim();
        const comments = $textarea.val().trim();

        console.log(`${name}\n${comments}`);

        const validation = validateForm(name, comments);
        if (validation) {
            $error.text(validation.error).show();
            return;
        }

        await submitMessage(name, comments);
    });

    // 表单重置事件（浏览器默认）
    $form.on('reset', resetForm);

    // ==========================================================================
    // 初始化
    // ==========================================================================

    // 初始页面切换
    switchPage('home');

    // 轮播图初始化
    initCarousel();

    // 课程表高亮初始化
    highlightCurrentWeekday();
});

/**
 * 初始化轮播图
 */
function initCarousel() {
    const $list = $('.carousel'); // 改为 jQuery 以统一
    if (!$list.length) return;

    let idx = 0;
    const cardW = CAROUSEL_CARD_WIDTH;
    const totalCards = $list.children().length;

    setInterval(() => {
        idx = (idx + 1) % totalCards;
        $list[0].scrollTo({ left: idx * cardW, behavior: 'smooth' });
    }, CAROUSEL_INTERVAL);
}

/**
 * 高亮当前工作日课程
 */
function highlightCurrentWeekday() {
    const weekDay = new Date().getDay();
    if (weekDay < 1 || weekDay > 5) return; // 周六日不处理

    const classTableDay = [
        document.getElementsByClassName('week1'),
        document.getElementsByClassName('week2'),
        document.getElementsByClassName('week3'),
        document.getElementsByClassName('week4'),
        document.getElementsByClassName('week5')
    ];

    const elements = Array.from(classTableDay[weekDay - 1]); // 使用 Array.from 现代替代
    elements.forEach(item => {
        if (item && item.style) {
            item.style.background = '#ddd';
        }
    });
}