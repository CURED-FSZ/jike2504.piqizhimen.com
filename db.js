// 引入mysql2模块的promise版本，支持async/await语法
const mysql = require('mysql2/promise');

/**
 * 创建数据库连接池
 * 连接池参数说明:
 * - host: 数据库主机地址，这里是本地主机
 * - user: 数据库用户名
 * - password: 数据库密码
 * - database: 数据库名称
 * - waitForConnections: 是否等待连接可用
 * - connectionLimit: 连接池最大连接数
 * - queueLimit: 连接请求队列大小，0表示无限制
 */
const pool = mysql.createPool({
  host: 'localhost',
  user: 'f1779',
  password: '35090611',
  database: 'maindatabase',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * 测试数据库连接
 * 功能: 验证数据库连接是否成功
 * @async
 * @function
 */
async function testConnection() {
  try {
    // 获取一个连接
    const connection = await pool.getConnection();
    console.log('数据库连接成功');
    // 释放连接回连接池
    connection.release();
  } catch (error) {
    console.error('数据库连接失败:', error.message);
  }
}

// 执行连接测试
 testConnection();

// 导出连接池供其他模块使用
module.exports = pool;