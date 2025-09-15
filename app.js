const express = require('express');
const path = require('path');
const httpErrors = require('http-errors');
const indexRouter = require('./routes/index');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/download', express.static(path.join(__dirname, 'public', 'download'))); // 明确映射
app.use(express.static(path.join(__dirname, 'public'))); // 保留其他静态文件

app.use('/', (req, res, next) => {
    console.log('命中路由：', req.method, req.url);
    next();
});

app.use('/', indexRouter);

app.use((req, res, next) => {
  res.status(404).render('404');
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).render('error', {
    message: err.message
  });
});

app.use((err, req, res, next) => {
  console.error('全局错误:', err.stack); // 记录详细错误
  res.status(err.status || 500).render('error', { message: err.message });
});

module.exports = app;