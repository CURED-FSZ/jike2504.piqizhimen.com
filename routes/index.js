const express = require('express');
const router = express.Router();
const MYSQL = require('../db');

// 异步初始化数据库
const db = new MYSQL();
db.init().catch(err => {
    console.error('数据库初始化失败:', err.message);
});

// 留言提交路由
router.post('/api/message', async (req, res) => {
    const { name, comments } = req.body;
    console.log('收到请求:', req.body); // 调试日志

    if (!name || !comments) {
        return res.status(400).json({ error: '标题和内容不能为空' });
    }

    try {
        await db.insertData('comments', { title: name, content: comments });
        res.status(200).json({ message: '留言提交成功' });
    } catch (error) {
        console.error('数据库错误:', error.message, error.stack);
        if (error.message.includes('标题长度不能超过255个字符') || error.message.includes('内容长度不能超过1000个字符')) {
            return res.status(400).json({ error: error.message });
        }
        if (error.code === 'ER_NO_SUCH_TABLE') {
            return res.status(500).json({ error: '数据库表 comments 不存在' });
        }
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            return res.status(500).json({ error: '数据库访问权限错误' });
        }
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: '标题已存在（重复条目）' });
        }
        res.status(500).json({ error: `服务器错误：${error.message}` });
    }
});

// 获取所有表
router.get('/api/tables', async (req, res) => {
    try {
        const [rows] = await db.pool.query('SHOW TABLES');
        const tables = rows.map(row => row[`Tables_in_${process.env.DB_NAME || 'jike2504'}`]);
        res.json(tables);
    } catch (error) {
        console.error('获取表失败:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 获取表的列
router.get('/api/columns/:table', async (req, res) => {
    const { table } = req.params;
    try {
        const [rows] = await db.pool.query('SHOW COLUMNS FROM ??', [table]);
        const columns = rows.map(row => row.Field);
        res.json(columns);
    } catch (error) {
        console.error('获取列失败:', error);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 根路由
router.get('/', (req, res) => {
    res.render('index');
});

router.get('/person', (req, res) => {
    res.render('person');
});

router.get('/class', (req, res) => {
    res.render('class');
});

module.exports = router;