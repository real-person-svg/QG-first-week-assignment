// 获取相关button
const todoForm = document.querySelector('.todo-form');
const todoInput = document.querySelector('.todo-input');
const todoList = document.querySelector('.todo-list');
const recycleBin = document.querySelector('.recycle-bin');
const completeAll = document.querySelector('.complete-all');
const clearCompleted = document.querySelector('.clear-completed');

// 保存数据到localStorage
function saveData() {
  const todoItems = [];

  // 收集todo-list数据
  const todoElements = todoList.querySelectorAll('.todo-item');
  todoElements.forEach(item => {
    // 获取todo-item的文本内容、完成状态、创建时间等信息
    const checkbox = item.querySelector('.checkbox');
    const todoTextElement = item.querySelector('span:not(.create-todo-time)');
    const createTime = item.querySelector('.create-todo-time').textContent;
    // 把获取到的添加到todoItems数组中
    todoItems.push({
      text: todoTextElement.textContent,
      completed: checkbox.checked,
      urgent: item.classList.contains('urgent'),
      createTime,
      isInRecycleBin: false
    });
  });

  // 收集recycle-bin数据
  const recycleElements = recycleBin.querySelectorAll('.recycle-item');
  recycleElements.forEach(item => {
    // 获取recycle-item的文本内容、创建时间等信息
    const todoTextElement = item.querySelector('span:not(.create-todo-time)');
    const createTime = item.querySelector('.create-todo-time').textContent;
    // 把获取到的添加到todoItems数组中
    todoItems.push({
      text: todoTextElement.textContent,
      completed: false,
      urgent: false,
      createTime,
      isInRecycleBin: true
    });
  });

  // 把todoItems数组保存到localStorage中,进行本地存储
  localStorage.setItem('todoItems', JSON.stringify(todoItems));
}

// 从localStorage加载数据
function loadData() {
  const storedTodoItems = localStorage.getItem('todoItems');
  // 如果有数据就加载数据
  if (storedTodoItems) {
    // 把存储的数据解析为JavaScript对象，使之能在JavaScript中使用
    const todoItems = JSON.parse(storedTodoItems);
    todoItems.forEach(item => {
      // 把每一个todoItem添加到todo-list中
      const todoItem = createTodoItem(item.text, item.completed, item.urgent, item.createTime);
      // 检测todoItem是否在回收站中
      if (item.isInRecycleBin) {
        moveToRecycleBin(todoItem);
      } else {
        todoList.appendChild(todoItem);
      }
    });
  }
}

// 创建待办事项,默认completed为false，urgent为false，创建时间为当前时间
function createTodoItem(text, completed = false, urgent = false, createTime) {

  // 创建todo-item，添加类名todo-item和new
  const todoItem = document.createElement('div');
  todoItem.classList.add('todo-item', 'new');

  // 如果是紧急事项，添加类名urgent
  if (urgent) {
    todoItem.classList.add('urgent');
  }

  // 创建checkbox，添加类名checkbox以做渲染，设置type为checkbox，设置checked为completed
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.classList.add('checkbox');
  checkbox.checked = completed;

  // 创建创建时间，添加类名create-todo-time，设置文本内容为createTime或者当前时间，如果createTime不存在则设置为当前时间
  const createTodoTime = document.createElement('span');
  createTodoTime.classList.add('create-todo-time');
  // 修改时间的格式
  const options = {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }
  createTodoTime.textContent = createTime || new Date().toLocaleString('zh-CN', options);

  //创建todo-item的文本
  const todoTextElement = document.createElement('span');
  todoTextElement.innerHTML = text;

  // 如果completed为true，添加类名completed
  if (completed) {
    todoTextElement.classList.add('completed');
  }

  // 添加事件监听器，当checkbox改变时，添加或移除类名completed，保存数据
  checkbox.addEventListener('change', function () {
    if (checkbox.checked) {
      todoTextElement.classList.add('completed');
    } else {
      todoTextElement.classList.remove('completed');
    }
    saveData();
  });

  // 添加事件监听器，当点击completeAll按钮时，设置checkbox为true，如果todo-item在todo-list里，添加类名completed，保存数据
  completeAll.addEventListener('click', function () {
    checkbox.checked = true;
    if (todoItem.classList.contains('todo-item')) {
      todoTextElement.classList.add('completed');
    }
    saveData();
  });

  //添加urgent按钮，并设置里面的文本
  const urgentButton = document.createElement('button');
  urgentButton.classList.add('softchange');
  urgentButton.textContent = urgent ? '取消加急' : '加急';

  //添加事件监听器，按加急时把这个todo-item移动到todo-list的最前面，取消加急时把这个todo-item移动到todo-list的最后面，保存数据
  urgentButton.addEventListener('click', function () {
    if (todoItem.classList.contains('urgent')) {
      todoItem.classList.remove('urgent');
      urgentButton.textContent = '加急';
      todoList.insertAdjacentElement('beforeend', todoItem);
    } else {
      todoItem.classList.add('urgent');
      urgentButton.textContent = '取消加急';
      todoList.insertAdjacentElement('afterbegin', todoItem);
    }
    saveData();
  });

  //添加delete按钮，并设置里面的文本
  const deleteButton = document.createElement('button');
  deleteButton.classList.add('softchange');
  deleteButton.textContent = '进入回收站';

  //添加edit按钮，并设置里面的文本
  const editButton = document.createElement('button');
  editButton.classList.add('softchange');
  editButton.textContent = '编辑';

  //添加事件监听器，按clearCompleted按钮时，删除所有todo-item，保存数据
  clearCompleted.addEventListener('click', function () {
    todoItem.remove();
    saveData();
  });

  //添加事件监听器，按deleteButton按钮时，把这个todo-item移动到recycle-bin中，保存数据
  deleteButton.addEventListener('click', function () {
    moveToRecycleBin(todoItem);
    saveData();
  });

  //按下editButton按钮时，把这个todo-item变成可编辑状态
  editButton.addEventListener('click', function () {
    const input = document.createElement('input');
    input.type = 'text';
    input.classList.add('edit-input');
    input.value = todoTextElement.textContent;

    const saveButton = document.createElement('button');
    saveButton.classList.add('softchange');
    saveButton.textContent = '保存';

    //按下saveButton按钮时，把这个todo-item变成不可编辑状态并保存数据
    saveButton.addEventListener('click', function () {
      const newText = input.value.trim();
      if (newText) {
        todoTextElement.textContent = newText;
        todoItem.replaceChild(todoTextElement, input);
        todoItem.removeChild(saveButton);
        todoItem.appendChild(editButton);
      }
      saveData();
    });

    todoItem.replaceChild(input, todoTextElement);
    todoItem.removeChild(editButton);
    todoItem.appendChild(saveButton);
  });

  //把之前创建的元素添加到todo-item中
  todoItem.appendChild(checkbox);
  todoItem.appendChild(todoTextElement);
  todoItem.appendChild(createTodoTime);
  todoItem.appendChild(urgentButton);
  todoItem.appendChild(deleteButton);
  todoItem.appendChild(editButton);

  //返回todo-item，方便本地存储
  return todoItem;
}

// 移动到回收站
function moveToRecycleBin(todoItem) {
  // 把todo-list中的todo-item删除
  todoItem.remove();

  // 把todo-item添加到recycle-bin中
  todoItem.classList.remove('todo-item');
  todoItem.classList.add('recycle-item');
  recycleBin.appendChild(todoItem);

  const checkbox = todoItem.querySelector('.checkbox');
  const urgentButton = todoItem.querySelector('.softchange:nth-of-type(1)');
  const deleteButton = todoItem.querySelector('.softchange:nth-of-type(2)');
  const editButton = todoItem.querySelector('.softchange:nth-of-type(3)');

  // 把todo-item中的checkbox、urgent按钮、delete按钮、edit按钮删除
  todoItem.removeChild(checkbox);
  todoItem.removeChild(urgentButton);
  todoItem.removeChild(deleteButton);
  todoItem.removeChild(editButton);

  // 添加restore和deleteforever按钮
  const restoreButton = document.createElement('button');
  restoreButton.classList.add('softchange');
  restoreButton.textContent = '恢复';
  const deleteForeverButton = document.createElement('button');
  deleteForeverButton.classList.add('softchange');
  deleteForeverButton.textContent = '永久删除';

  // 把restore和deleteforever按钮添加到todo-item中
  todoItem.appendChild(restoreButton);
  todoItem.appendChild(deleteForeverButton);

  // 按restore按钮时，把这个todo-item移动到todo-list中，保存数据
  restoreButton.addEventListener('click', function () {
    todoList.appendChild(todoItem);
    todoItem.classList.remove('recycle-item');

    // 把todo-item中的restore和deleteforever按钮删除
    todoItem.removeChild(restoreButton);
    todoItem.removeChild(deleteForeverButton);

    // 把todo-item中的checkbox、urgent按钮、delete按钮、edit按钮添加回来，保存数据
    todoItem.classList.add('todo-item');

    const newCheckbox = document.createElement('input');
    newCheckbox.type = 'checkbox';
    newCheckbox.classList.add('checkbox');
    todoItem.prepend(newCheckbox);

    const newUrgentButton = document.createElement('button');
    newUrgentButton.classList.add('softchange');
    newUrgentButton.textContent = '加急';
    todoItem.appendChild(newUrgentButton);

    const newDeleteButton = document.createElement('button');
    newDeleteButton.classList.add('softchange');
    newDeleteButton.textContent = '进入回收站';
    todoItem.appendChild(newDeleteButton);

    const newEditButton = document.createElement('button');
    newEditButton.classList.add('softchange');
    newEditButton.textContent = '编辑';
    todoItem.appendChild(newEditButton);

    saveData();
  });

  // 按deleteforever按钮时，把这个todo-item删除，保存数据
  deleteForeverButton.addEventListener('click', function () {
    // deleting类名是用来添加动画效果的
    todoItem.classList.add('deleting');
    todoItem.remove();
    saveData();
  });
}

// 按submit按钮时，把输入框中的文本添加到todo-list中，保存数据
todoForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const todoText = todoInput.value.trim();
  if (todoText) {
    // 这里调用前面定义的createTodoItem函数，把输入框中的文本添加到todo-list中
    const todoItem = createTodoItem(todoText);
    // 把todo-item添加到todo-list的最前面
    todoList.prepend(todoItem);
    // 清空输入框
    todoInput.value = '';
  }
  saveData();
});

// 刷新页面时加载localStorage的数据
window.addEventListener('load', loadData);


// 获取导出按钮
const exportButton = document.querySelector('.export');

// 导出数据到 TXT 文件
function exportDataToTxt() {
  // todoItems是一个数组，这个数组里的每一个元素都是一个对象
  const todoItems = [];

  // 收集待办事项列表数据
  const todoElements = todoList.querySelectorAll('.todo-item');
  todoElements.forEach(item => {
    const checkbox = item.querySelector('.checkbox');
    const todoTextElement = item.querySelector('span:not(.create-todo-time)');
    const createTime = item.querySelector('.create-todo-time').textContent;
    todoItems.push({
      text: todoTextElement.textContent,
      completed: checkbox.checked,
      urgent: item.classList.contains('urgent'),
      createTime,
      isInRecycleBin: false
    });
  });

  // 收集回收站数据
  const recycleElements = recycleBin.querySelectorAll('.recycle-item');
  recycleElements.forEach(item => {
    const todoTextElement = item.querySelector('span:not(.create-todo-time)');
    const createTime = item.querySelector('.create-todo-time').textContent;
    todoItems.push({
      text: todoTextElement.textContent,
      completed: false,
      urgent: false,
      createTime,
      isInRecycleBin: true
    });
  });

  if (todoItems.length === 0) {
    alert('没有待办事项可导出！');
    return;
  }

  // 将数据转换为 TXT 格式
  let txtContent = '';
  todoItems.forEach(item => {
    const status = item.completed ? '已完成' : '未完成';
    const binStatus = item.isInRecycleBin ? '回收站' : '待办事项表';
    const urgentStatus = item.urgent ? '是' : '否';
    txtContent += `事项: ${item.text}\n状态: ${status}\n是否加急: ${urgentStatus}\n创建时间: ${item.createTime}\n位置: ${binStatus}\n\n`;
  });

  // 创建一个 Blob 对象
  const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });

  // 创建一个下载链接
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'todo_list_export.txt';
  a.click();

  // 释放 URL 对象
  URL.revokeObjectURL(url);
  alert('导出成功！');
}

// 为导出按钮添加点击事件监听器
exportButton.addEventListener('click', exportDataToTxt);