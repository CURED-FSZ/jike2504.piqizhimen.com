// 引入所需模块
const express = require('express');
const path = require('path');

// 创建路由实例
const router = express.Router();
// 引入数据库连接池
const pool = require('../db');

/**
 * 根路由
 * 请求方法: GET
 * 功能: 渲染网站主页
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
router.get('/', (req, res) => {
  // 渲染index视图，并传递标题和CSRF令牌
  res.render('index');
});

router.get('/person', (req, res) => {
    res.render('person',{ title: '汪超' });
})

/**
 * 提交留言API
 * 请求方法: POST
 * 功能: 处理用户提交的留言并存储到数据库
 * @param {Object} req - 请求对象，包含留言数据
 * @param {Object} res - 响应对象
 * @returns {JSON} 操作结果
 */
router.post('/api/message', async (req, res) => {
  // 从请求体中获取留言数据
  const { name, contact, content } = req.body;

  // 输入验证
  if (!name || name.trim().length < 1) {
    return res.status(400).json({ success: false, message: '请输入有效的称呼' });
  }
  if (!content || content.trim().length < 1 || content.trim().length > 1000) {
    return res.status(400).json({ success: false, message: '留言内容不能为空且长度不得超过1000字符' });
  }

  try {
    // 插入留言数据到数据库
    const [result] = await pool.query(
      'INSERT INTO comments (name, contact, content, created_at) VALUES (?, ?, ?, NOW())',
      [name.trim(), contact.trim(), content.trim()]
    );
    if (result.affectedRows === 0) {
      throw new Error('插入未影响任何行');
    }
    console.log('插入成功，ID:', result.insertId); // 调试信息
    // 返回成功响应
    res.json({ success: true, message: '留言提交成功', id: result.insertId });
  } catch (error) {
    // 捕获并记录错误
    console.error('存储留言失败:', error.message, error.stack); // 记录详细错误
    // 返回错误响应
    res.status(500).json({ success: false, message: '服务器错误，留言提交失败' });
  }
});

// 导出路由模块
module.exports = router;