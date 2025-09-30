// 等待DOM加载完成后执行代码
$(document).ready(function() {
    // 页面切换功能
    $('.nav-link').on('click', function() {
        const pageId = $(this).data('page');

        // 更新导航栏激活状态
        $('.nav-link').removeClass('active');
        $(this).addClass('active');

        // 切换页面显示
        $('.page').removeClass('visible').addClass('hidden');
        $(`#${pageId}`).removeClass('hidden').addClass('visible');
    });
});