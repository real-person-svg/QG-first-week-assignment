const addLevel = document.querySelector('.add-level');
const workbench = document.querySelector('.workbench');

let levelCount = 1;
let selectedModels = [];

// 检查workbench中是否有空的层级框
function hasEmptyLevelBox() {
  const levelBoxes = workbench.querySelectorAll('.level-box');
  for (let i = 0; i < levelBoxes.length; i++) {
    const modelItems = levelBoxes[i].querySelectorAll('.inModelItemContainer');
    if (modelItems.length === 0) {
      return true;
    }
  }
  return false;
}

//点击添加层级出现层级的框
addLevel.addEventListener('click', () => {
  if (hasEmptyLevelBox()) {
    // 如果存在空的层级框，不添加新的层级框
    alert("存在空的层级框，不能添加新的层级框");
    return;
  }
  const levelBox = document.createElement('div');
  levelBox.classList.add('level-box');
  const levelHtml = `
        <div class="level-header">
            <span class="level-label">层级:${levelCount}</span>
        </div>
        <div class="model-item-container"></div>`;
  levelBox.innerHTML = levelHtml;
  const newContainer = levelBox.querySelector('.model-item-container');
  workbench.appendChild(levelBox);
  levelCount++;
  setupDropEvents(newContainer);
  recycle(newContainer);
});

//模型库中的模型被拖动时记录拖动的数据，保存为text/html格式
const contentItems = document.querySelectorAll('.content-item');
const modelItemContainers = document.querySelectorAll('.model-item-container');
const modelLibrary = document.querySelector('.model-library');
contentItems.forEach((contentItem) => {
  contentItem.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/html', `<div class="content-item" draggable="true">${contentItem.textContent}</div>`);
    // 如果contentItem被移动到层级框就添加inModelItemContainer类
    if (contentItem.parentNode.classList.contains('model-item-container')) {
      contentItem.classList.add('inModelItemContainer');
    }
  });
});

// 实现拖出删除功能
function recycle(parent) {
  let isDragging = false;
  let startX, startY;
  let offsetX, offsetY;
  let currentDraggingChild;
  let currentParent;

  parent.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('inModelItemContainer')) {
      isDragging = true;
      startX = e.pageX;
      startY = e.pageY;
      offsetX = e.offsetX;
      offsetY = e.offsetY;
      currentDraggingChild = e.target;
      currentParent = currentDraggingChild.parentNode;
      currentDraggingChild.style.position = 'absolute';
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging && currentDraggingChild) {
      //通过用 e.pageX 减去 offsetX，能够得到被拖动元素左上角相对于文档左边缘的新的水平坐标。
      const x = e.pageX - offsetX;
      const y = e.pageY - offsetY;
      currentDraggingChild.style.left = x + 'px';
      currentDraggingChild.style.top = y + 'px';
    }
  });

  document.addEventListener('mouseup', (e) => {
    if (isDragging && currentDraggingChild) {
      isDragging = false;
      const rect = currentParent.getBoundingClientRect();
      const childRect = currentDraggingChild.getBoundingClientRect();

      // 检测模型是否已经移到层级框的外面
      if (childRect.right < rect.left || childRect.left > rect.right ||
        childRect.bottom < rect.top || childRect.top > rect.bottom) {
        if (currentParent.contains(currentDraggingChild)) {
          currentParent.removeChild(currentDraggingChild);
          // 在要传输的数据中删除移出的模型
          const index = selectedModels.indexOf(currentDraggingChild.textContent);
          if (index > -1) {
            selectedModels.splice(index, 1);
          }
        }
      } else {
        currentDraggingChild.style.position = 'static';
        currentDraggingChild.style.left = 'auto';
        currentDraggingChild.style.top = 'auto';
      }
      currentDraggingChild = null;
      currentParent = null;
    }
  });
}

function setupDropEvents(container) {
  container.addEventListener('dragover', (e) => {
    // 允许层级框把模型放下
    e.preventDefault();
  });

  container.addEventListener('drop', (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/html');
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = data;
    const draggedElement = tempDiv.firstChild;
    draggedElement.classList.add('inModelItemContainer');
    draggedElement.removeAttribute('draggable');
    container.appendChild(draggedElement);
    // recycle(container);
    selectedModels.push(draggedElement.textContent);
  });
}

modelItemContainers.forEach(setupDropEvents);
// modelItemContainers.forEach(recycle);
const deleteIcon = document.querySelector('.delete-icon');

// 点击垃圾桶可以全部删除
deleteIcon.addEventListener('click', () => {
  workbench.innerHTML = '';
  levelCount = 1;
  selectedModels = [];
});

//控制遮罩层和上传界面是否出现
const upload = document.querySelector('.upload');
const modalSection = document.querySelector('.modal-section');
const closeBtn = document.querySelector('.close');
const cancelBtn = document.querySelector('.cancel-btn');
const mask = document.querySelector('.mask');
const runBtn = document.querySelector('.run-btn');

upload.addEventListener('click', () => {
  modalSection.style.right = '0';
  mask.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
  modalSection.style.right = '-100%';
  mask.style.display = 'none';
});

cancelBtn.addEventListener('click', () => {
  modalSection.style.right = '-100%';
  mask.style.display = 'none';
});

document.querySelectorAll('.choice-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.choice-btn').forEach((choicebtn) => {
      choicebtn.classList.remove('active');
    });
    btn.classList.add('active');
  });
});

document.querySelector('.upload-box').addEventListener('click', (e) => {
  e.stopPropagation();
  document.getElementById('upload-image').click();
});

document.querySelector('.upload-icon').addEventListener('click', (e) => {
  e.stopPropagation();
});

document.querySelector('.upload-text').addEventListener('click', (e) => {
  e.stopPropagation();
});

const uploadImageInput = document.getElementById('upload-image');
const uploadBox = document.querySelector('.upload-box');

let imgBase64 = '';
uploadImageInput.addEventListener('change', async () => {
  // 这是type="file"的input标签，所以用files属性获得上传的图片
  const file = uploadImageInput.files[0];
  if (file) {
    // 修改 upload-box 的样式
    uploadBox.style.borderColor = 'green';
    uploadBox.innerHTML = '<img src="" alt="Uploaded Image" id="uploaded-image" style="max-width: 100%; max-height: 100%;">';
    const uploadedImage = document.getElementById('uploaded-image');
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener('load', (e) => {
      uploadedImage.src = e.target.result;
    })

    try {
      imgBase64 = await compressImage(file);
    } catch (error) {
      console.error(error);
    }
  }
});

// 压缩图片的函数
function compressImage(file) {
  //使用promise构造函数来接受成功或失败的结果，然后返回
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxWidth = 80;
        const maxHeight = 60;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = height * (maxWidth / width);
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = width * (maxHeight / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.7;
        let compressedDataUrl = canvas.toDataURL(file.type, quality);
        let base64 = compressedDataUrl.split(',')[1];
        let byteCharacters = atob(base64);
        let byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        let byteArray = new Uint8Array(byteNumbers);
        let size = byteArray.length;

        // 不断调整质量参数
        while (size > 4 * 1024 && quality > 0.1) {
          quality -= 0.1;
          compressedDataUrl = canvas.toDataURL(file.type, quality);
          base64 = compressedDataUrl.split(',')[1];
          byteCharacters = atob(base64);
          byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          byteArray = new Uint8Array(byteNumbers);
          size = byteArray.length;
        }
        resolve(base64);
      };
      img.onerror = () => {
        reject(new Error('图片加载失败'));
      };
    };
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
  });
}

runBtn.addEventListener('click', () => {
  modalSection.style.right = '-100%';
  mask.style.display = 'none';
  const content = document.getElementById('project-name').value;
  const inputText = document.getElementById('input-text').value;
  const serverChoice = document.querySelector('.choice-btn.active').textContent;

  const modelList = [];
  const levelBoxes = workbench.querySelectorAll('.level-box');
  levelBoxes.forEach((levelBox, index) => {
    const layer = index + 1;
    let parallel = 0;
    const models = [];
    const modelItems = levelBox.querySelectorAll('.inModelItemContainer');
    modelItems.forEach((modelItem) => {
      let modelName = modelItem.textContent.replace(/\n/g, '');
      modelName = modelName.trim();
      let modelUrl = '';
      if (modelName === 'openai') {
        modelUrl = 'https://chat.openai.com/';
      } else if (modelName === 'deepseek') {
        modelUrl = 'https://chat.deepseek.com/';
      } else if (modelName === '腾讯元宝') {
        modelUrl = 'https://yuanbao.tencent.com/';
      }
      models.push({ modelName, modelUrl });
    });
    if (models.length > 1) {
      parallel = 1;
    }
    if (models.length > 0) {
      modelList.push({ layer, parallel, models });
    }
  });
  const data = {
    image: JSON.stringify(imgBase64),
    content,
    inputText,
    serverChoice,
    modelList
  };

  fetch('http://localhost:3000/api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(result => {
      console.log('Success:', result);
    })
    .catch(error => {
      console.error('Error:', error);
    });
});