const express = require('express');
const path = require('path');
const indexRouter = require('./routes/index');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/download', express.static(path.join(__dirname, 'public', 'download')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', (req, res, next) => {
    console.log('命中路由：', req.method, req.url);
    next();
});

app.use('/', indexRouter);

// 404 处理
app.use((req, res, next) => {
    res.status(404).render('404');
});

// 全局错误处理
app.use((err, req, res, next) => {
    console.error('全局错误:', err.stack);
    res.status(500).render('error', { message: err.message || '服务器错误' });
});

app.listen(4000, () => console.log('API ready on :4000'));

module.exports = app;