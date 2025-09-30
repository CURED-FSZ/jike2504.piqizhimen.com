document.addEventListener('DOMContentLoaded', () => {
    const tableList = document.getElementById('table-list');
    const columnTitle = document.getElementById('column-title');
    const columnList = document.getElementById('column-list');
    const backBtn = document.getElementById('back-btn');

    // 获取所有表
    fetch('/api/tables')
        .then(response => response.json())
        .then(tables => {
            tables.forEach(table => {
                const li = document.createElement('li');
                li.textContent = table;
                li.addEventListener('click', () => showColumns(table));
                tableList.appendChild(li);
            });
        })
        .catch(error => console.error('获取表失败:', error));

    // 显示列
    function showColumns(table) {
        fetch(`/api/columns/${table}`)
            .then(response => response.json())
            .then(columns => {
                columnTitle.textContent = `${table} 的列`;
                columnList.innerHTML = '';
                columns.forEach(column => {
                    const li = document.createElement('li');
                    li.textContent = column;
                    columnList.appendChild(li);
                });
                tableList.style.display = 'none';
                columnTitle.style.display = 'block';
                columnList.style.display = 'block';
                backBtn.style.display = 'block';
            })
            .catch(error => console.error('获取列失败:', error));
    }

    // 返回按钮
    backBtn.addEventListener('click', () => {
        tableList.style.display = 'block';
        columnTitle.style.display = 'none';
        columnList.style.display = 'none';
        backBtn.style.display = 'none';
    });
});