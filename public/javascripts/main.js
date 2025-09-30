$(document).ready(function () {
    // 留言表单处理
    const $form = $('.message-form');
    const $textarea = $('#comments');
    const $charCount = $('.char-count');
    const $error = $('.error');
    const titleInput = $('#title');
    const popup = $("#popup");
    const popupT = $('#popup-title');
    const popupC = $('#popup-message');
    const popupI = $('#popup-icon');
    const popupB = $('#popup-button');

    /**
     * 页面切换函数
     * @param {string} page - 要切换到的页面ID
     */
    function switchPage(page) {
        console.log('切换到页面:', page);
        $('.page').removeClass('visible');
        $('#' + page).addClass('visible');
        $('.nav-link').removeClass('active');
        $('.nav-link[data-page="' + page + '"]').addClass('active');
        $('html, body').animate({ scrollTop: 0 }, 300);
    }

    /**
     * 显示弹窗
     * @param {number} code - 弹窗类型代码
     * @param {string} message - 弹窗内容
     * @description 代码类型：
     * 1: 成功
     * 2: 错误
     * 3: 警告
     * 4: 信息
     * default: 提示
     */
    function showPopup(code,message) {
        if (popup.css('display') !== 'none') {
            popup.css('display', 'none');
        }
        console.log('show popup?code='+code+'&message='+message);
        // 设置标题和图标
        switch (code) {
            case 1:
                popupT.text('成功');
                popupI.text('✅');
                break;
            case 2:
                popupT.text('错误');
                popupI.text('❌');
                break;
            case 3:
                popupT.text('警告');
                popupI.text('⚠️');
                break;
            case 4:
                popupT.text('信息');
                popupI.text('ℹ️');
                break;
            default:
                popupT.text('提示');
                popupI.text('');
        }
        popupC.text(message).fadeIn();
        popup.css('display', 'flex');
        console.log(`浮窗显示: 类型=${code}, 消息=${message}`);
    }

    popupB.click(function () {
        popup.css('display', 'none');
        popupC.text('').fadeOut();
        popupT.text('');
        popupI.text('');
    });

    $('.nav-link, .nav-footer-link').on('click', function (e) {
        e.preventDefault();
        const page = $(this).data('page');
        if (page) {
            switchPage(page);
        } else {
            console.error('data-page 属性缺失:', $(this));
        }
    });

    // 合并重复的 input 事件
    $textarea.on('input', function () {
        const count = $(this).val().length;
        $charCount.text(`(${count}/1000)`).css('color', count > 900 ? '#e74c3c' : '#999');
        if (count > 0) $error.hide();
    });

    titleInput.on('input', function () {
        const val = $(this).val().trim();
        if (val.length < 1) {
            $(this).nextAll('.error').show();
        } else {
            $(this).nextAll('.error').hide();
        }
    });

    $('.reset-btn').click(function () {
        $form[0].reset();
        $charCount.text('(0/1000)').css('color', '#999');
        $error.hide();
    });

    $('.back-to-home').click(function (e) {
        e.preventDefault();
        switchPage('home');
    });

    // 表单提交
    $form.on('submit', async function (e) {
        e.preventDefault();

        const name = titleInput.val().trim();
        const comments = $textarea.val().trim();

        console.log(name+'\n'+ comments);

        // 前端验证
        if (!name || !comments) {
            $error.text('标题和内容不能为空');
            $error.show();
            return;
        }
        if (name.length > 255) {
            $error.text('标题长度不能超过255个字符');
            $error.show();
            return;
        }
        if (comments.length > 1000) {
            $error.text('留言内容长度不能超过1000个字符');
            $error.show();
            return;
        }

        try {
            const response = await fetch('/api/message', {
                method: 'POST',
                headers: {'Content-Type': 'application/json',},
                body: JSON.stringify({ name, comments })
            });
            const result = await response.json();
            console.log('服务器返回结果:', result);
            if (response.ok) {
                showPopup(1, '留言提交成功');
                $form[0].reset();
                $charCount.text('(0/1000)').css('color', '#999');
                $error.hide();
            } else {
                $error.text(`提交失败：${result.error}`).show();
            }
        } catch (error) {
            $error.text('提交失败：网络错误').show();
            console.error('错误:', error);
        }
    });

    // 重置表单
    $form.on('reset', function () {
        $charCount.text('(0/1000)').css('color', '#999');
        $error.hide();
        $error.text('留言内容不能为空');
    });

    //初始化完成后切换到主页面
    switchPage('home');
});

const list = document.querySelector('.carousel');
let idx = 0;
const cardW = 280;
setInterval(() => {
    idx = (idx + 1) % list.children.length;
    list.scrollTo({ left: idx * cardW, behavior: 'smooth' });
}, 2500);

const weekDay = new Date().getDay();
const classTableDay = [
    document.getElementsByClassName('week1'),
    document.getElementsByClassName('week2'),
    document.getElementsByClassName('week3'),
    document.getElementsByClassName('week4'),
    document.getElementsByClassName('week5')
];

if (weekDay >= 1 && weekDay <= 5) {
    const elements = Array.prototype.slice.call(classTableDay[weekDay - 1]);
    elements.forEach(function (item) {
        if (item && item.style) {
            item.style.background = '#ddd';
        }
    });
}