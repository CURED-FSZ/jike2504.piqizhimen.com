// 等待DOM加载完成后执行代码
$(document).ready(function () {

    /**
     * 页面切换函数
     * @param {string} page - 要切换到的页面ID
     */
    function switchPage(page) {
        console.log('切换到页面:', page); // 调试信息
        // 隐藏所有页面
        $('.page').removeClass('visible');
        // 显示目标页面
        $('#' + page).addClass('visible');
        // 移除所有导航链接的活动状态
        $('.nav-link').removeClass('active');
        // 为当前页面的导航链接添加活动状态
        $('.nav-link[data-page="' + page + '"]').addClass('active');
        // 滚动到页面顶部
        $('html, body').animate({ scrollTop: 0 }, 300);
    }

    /**
     * 绑定导航点击事件
     * 处理顶部导航和页脚导航的点击事件
     */
    $('.nav-link, .nav-footer-link').on('click', function (e) {
        e.preventDefault(); // 阻止默认跳转行为
        const page = $(this).data('page'); // 获取目标页面ID
        if (page) {
            switchPage(page); // 切换到目标页面
        } else {
            console.error('data-page 属性缺失:', $(this)); // 调试信息
        }
    });

    /**
     * 评论输入框输入事件
     * 更新字符计数并在接近限制时改变颜色
     */
    $('#comments').on('input', function () {
        var current = $(this).val().length; // 当前输入字符数
        $('.char-count').text('(' + current + '/1000)').css('color', current > 900 ? '#e74c3c' : '#999');
    });

    /**
     * 名称输入框输入事件
     * 验证名称是否有效
     */
    $('#name').on('input', function () {
        if ($(this).val().length < 1) {
            $(this).nextAll('.error').show(); // 显示错误提示
        } else {
            $(this).nextAll('.error').hide(); // 隐藏错误提示
        }
    });

    /**
     * 留言表单提交事件
     * 处理表单数据并提交到服务器
     */
    $('.message-form').submit(function (e) {
        e.preventDefault(); // 阻止默认提交行为
        const $form = $(this);
        // 获取表单数据
        const name = $('#name').val().trim();
        const contact = $('#contact').val().trim();
        const comments = $('#comments').val().trim();

        // 禁用提交按钮并显示加载状态
        $('.submit-btn').prop('disabled', true).text('提交中...');
        $('.loading').show();

        // 发送AJAX请求提交表单
        $.ajax({
            url: '/api/message', // 请求URL
            method: 'POST',      // 请求方法
            data: { name, contact, comments }, // 表单数据
            dataType: 'json',    // 预期返回数据类型
            success: function (response) {
                // 请求成功处理
                if (response.success) {
                    switchPage('success'); // 切换到成功页面
                } else {
                    alert('提交失败: ' + response.message); // 显示错误信息
                }
            },
            error: function (xhr, status, error) {
                // 请求失败处理
                alert('提交失败，请稍后重试');
            },
            complete: function () {
                // 请求完成，恢复按钮状态
                $('.loading').hide();
                $('.submit-btn').prop('disabled', false).text('提交留言');
            }
        });
    });

    /**
     * 重置按钮点击事件
     * 重置表单数据和状态
     */
    $('.reset-btn').click(function () {
        $('.message-form')[0].reset(); // 重置表单
        $('.char-count').text('(0/1000)').css('color', '#999'); // 重置字符计数
        $('.error').hide(); // 隐藏所有错误提示
    });

    /**
     * 返回主页按钮点击事件
     */
    $('.back-to-home').click(function (e) {
        e.preventDefault(); // 阻止默认跳转行为
        switchPage('home'); // 切换到主页
    });

    // 初始加载时切换到主页
    switchPage('home');
});