/**
 * MySQL 数据库操作封装类
 * 提供异步初始化的数据库连接管理，支持查询、插入、更新等常用操作
 * 支持环境变量配置和动态参数传入，灵活适应不同部署环境
 */
const mysql = require('mysql2/promise');
require('dotenv').config(); // 加载环境变量

class MYSQL {
    /**
     * 构造函数 - 初始化空连接池和配置
     * 注意：需要调用 init() 方法完成真正的初始化
     */
    constructor() {
        this.pool = null; // 数据库连接池实例
        this.config = null; // 数据库连接配置
    }

    /**
     * 异步初始化数据库连接池
     * 配置优先级：传入参数 > 环境变量 > 默认值
     * @param {Object} config - 可选的数据库配置对象
     * @param {string} config.host - 数据库主机地址
     * @param {number} config.port - 数据库端口
     * @param {string} config.user - 数据库用户名
     * @param {string} config.password - 数据库密码
     * @param {string} config.database - 数据库名称
     * @param {number} config.connectionLimit - 连接池最大连接数
     * @param {boolean} config.waitForConnections - 无可用连接时是否等待
     * @param {number} config.queueLimit - 等待队列最大长度
     * @param {number} config.acquireTimeout - 获取连接超时时间(毫秒)
     * @param {number} config.timeout - 查询超时时间(毫秒)
     * @param {Object} config.ssl - SSL配置，生产环境默认启用
     * @returns {Promise<void>}
     *
     * @example
     * // 使用环境变量配置初始化
     * const db = new MYSQL();
     * await db.init();
     *
     * @example
     * // 使用自定义配置初始化
     * await db.init({
     *   host: '127.0.0.1',
     *   user: 'my_user',
     *   password: 'mypassword',
     *   database: 'mydb'
     * });
     *
     * @note 重要提示：必须先调用init()方法才能使用其他数据库操作
     */
    async init(config = {}) {
        // 合并配置：自定义参数 > 环境变量 > 默认值
        this.config = {
            host: config.host || process.env.DB_HOST || 'localhost',
            port: config.port || process.env.DB_PORT || 3306,
            user: config.user || process.env.DB_USER || 'root',
            password: config.password || process.env.DB_PASSWORD || '',
            database: config.database || process.env.DB_NAME || 'test',
            connectionLimit: config.connectionLimit || process.env.DB_CONNECTION_LIMIT || 10,
            waitForConnections: config.waitForConnections || true,
            queueLimit: config.queueLimit || process.env.DB_QUEUE_LIMIT || 50,
            acquireTimeout: config.acquireTimeout || 60000, // 60秒获取连接超时
            timeout: config.timeout || 60000, // 60秒查询超时
            // 生产环境默认启用SSL，开发环境可禁用
            ssl: config.ssl || (process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined),
        };

        // 创建数据库连接池
        this.pool = await mysql.createPool(this.config);
        console.log('✅ 数据库连接池初始化完成');
    }

    /**
     * 检查连接池是否已初始化
     * @private
     * @throws {Error} 当连接池未初始化时抛出错误
     */
    _checkPool() {
        if (!this.pool) {
            throw new Error('连接池未初始化，请先调用init()方法完成初始化');
        }
    }

    /**
     * 查询指定表的所有数据
     * @param {string} tableName - 要查询的表名称
     * @returns {Promise<Array>} 包含表中所有记录的数组
     * @throws {Error} 当表不存在或查询失败时抛出错误
     *
     * @example
     * const users = await db.queryTable('users');
     * console.log(users); // 输出所有用户数据
     */
    async queryTable(tableName) {
        this._checkPool();
        try {
            // 使用参数化查询防止SQL注入，?? 会被转义为表名
            const [rows] = await this.pool.query('SELECT * FROM ??', [tableName]);
            console.log(`✅ 成功查询表 ${tableName}，获取 ${rows.length} 条记录`);
            return rows;
        } catch (err) {
            throw new Error(`查询表 ${tableName} 失败: ${err.message}`);
        }
    }

    /**
     * 为指定表添加新列
     * @param {string} tableName - 目标表名称
     * @param {string} columnName - 要添加的列名称
     * @param {string} columnType - 列的数据类型（如：INT, VARCHAR(255)等）
     * @returns {Promise<void>}
     * @throws {Error} 当表不存在或列已存在时抛出错误
     *
     * @example
     * // 添加整数类型的age列
     * await db.addColumn('users', 'age', 'INT');
     *
     * @example
     * // 添加可变字符串类型的email列
     * await db.addColumn('users', 'email', 'VARCHAR(255)');
     */
    async addColumn(tableName, columnName, columnType) {
        this._checkPool();
        try {
            // 使用mysql.format构建安全的SQL语句，自动转义参数
            await this.pool.query(mysql.format('ALTER TABLE ?? ADD COLUMN ?? ?', [tableName, columnName, columnType]));
            console.log(`✅ 成功为表 ${tableName} 添加列 ${columnName} (${columnType})`);
        } catch (err) {
            throw new Error(`添加列 ${columnName} 失败: ${err.message}`);
        }
    }

    /**
     * 更新指定表中的数据
     * @param {string} tableName - 要更新的表名称
     * @param {Object} setClause - SET子句对象，指定要更新的字段和值 {字段: 新值}
     * @param {Object} whereClause - WHERE子句对象，指定更新条件 {字段: 值}
     * @returns {Promise<void>}
     * @throws {Error} 当参数类型错误或更新失败时抛出错误
     *
     * @example
     * // 将id为1的用户名更新为'新名字'
     * await db.updateData('users', { name: '新名字' }, { id: 1 });
     *
     * @example
     * // 同时更新多个字段
     * await db.updateData('users',
     *   { name: '张三', age: 25 },
     *   { id: 1 }
     * );
     *
     * @warning 注意：whereClause为空对象会更新整张表，请谨慎使用！
     */
    async updateData(tableName, setClause, whereClause) {
        this._checkPool();
        // 参数类型验证
        if (typeof setClause !== 'object' || typeof whereClause !== 'object') {
            throw new Error('setClause 和 whereClause 必须为对象');
        }
        try {
            // 使用mysql2的参数化查询，自动处理对象转义
            await this.pool.query(`UPDATE ?? SET ? WHERE ?`, [tableName, setClause, whereClause]);
            console.log(`✅ 成功更新表 ${tableName} 的数据`);
        } catch (err) {
            throw new Error(`更新表 ${tableName} 失败: ${err.message}`);
        }
    }

    /**
     * 向指定表插入新数据
     * @param {string} tableName - 要插入数据的表名称
     * @param {Object} data - 要插入的数据对象，键为列名，值为数据
     * @returns {Promise<void>}
     * @throws {Error} 当表不存在或插入失败时抛出错误
     *
     * @example
     * // 插入用户数据
     * await db.insertData('users', {
     *   name: '李四',
     *   age: 30,
     *   email: 'lisi@example.com'
     * });
     *
     * @security 使用参数化查询，自动防止SQL注入攻击
     */
    async insertData(tableName, data) {
        this._checkPool();
        try {
            const columns = Object.keys(data).join(', ');
            const placeholders = Object.keys(data).map(() => '?').join(', ');
            const values = Object.values(data);
            // 使用参数化查询，tableName和values都会被正确转义
            await this.pool.query(`INSERT INTO ?? (${columns}) VALUES (${placeholders})`, [tableName, ...values]);
            console.log(`✅ 成功向表 ${tableName} 插入数据`);
        } catch (err) {
            throw new Error(`插入数据到 ${tableName} 失败: ${err.message}`);
        }
    }

    /**
     * 获取当前数据库的所有表列表
     * @returns {Promise<Array>} 包含所有表名称的数组
     * @throws {Error} 当查询失败时抛出错误
     *
     * @example
     * const tables = await db.tableList();
     * console.log(tables); // ['users', 'products', 'orders']
     */
    async tableList() {
        this._checkPool();
        try {
            const [rows] = await this.pool.query('SHOW TABLES');
            const dbName = this.config.database;
            // 提取表名，格式为 Tables_in_数据库名
            const tables = rows.map(row => row[`Tables_in_${dbName}`]);
            console.log(`✅ 获取数据库 ${dbName} 的表列表，共 ${tables.length} 个表`);
            return tables;
        } catch (err) {
            throw new Error(`查询表列表失败: ${err.message}`);
        }
    }

    /**
     * 获取指定表的所有列名
     * @param {string} tableName - 表名称
     * @returns {Promise<Array>} 包含所有列名的数组
     * @throws {Error} 当表不存在或查询失败时抛出错误
     *
     * @example
     * const columns = await db.columnList('users');
     * console.log(columns); // ['id', 'name', 'email', 'created_at']
     */
    async columnList(tableName) {
        this._checkPool();
        try {
            const [rows] = await this.pool.query('SHOW COLUMNS FROM ??', [tableName]);
            // 提取Field字段获取列名
            const columns = rows.map(row => row['Field']);
            console.log(`✅ 获取表 ${tableName} 的列列表，共 ${columns.length} 个列`);
            return columns;
        } catch (err) {
            throw new Error(`查询表 ${tableName} 的列失败: ${err.message}`);
        }
    }

    /**
     * 关闭数据库连接池
     * 在应用退出时调用，释放所有数据库连接
     * @returns {Promise<void>}
     *
     * @example
     * // 在应用关闭时调用
     * await db.close();
     */
    async close() {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
            console.log('✅ 数据库连接池已关闭');
        }
    }
}

module.exports = MYSQL;