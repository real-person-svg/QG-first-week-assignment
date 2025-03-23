const backgroundImages = [
  'images/luenbo01.jpg',
  'images/luenbo02.jpg',
  'images/luenbo03.jpg',
  'images/luenbo04.jpg',
  'images/luenbo05.jpg',
  'images/luenbo06.jpg'
];

// 获取相关元素
const productContainer = document.querySelector('.product-container');
const goToLeft = document.querySelector('.go-to-left');
const goToRight = document.querySelector('.go-to-right');
const dotIndicators = document.querySelectorAll('.dot-indicator');

let currentIndex = 0;

// 初始化背景图片
function setBackgroundImage(index) {
  productContainer.style.backgroundImage = `url(${backgroundImages[index]})`;
  //运用排他思想，先将所有的dotIndicators的active类去掉，再给当前的dotIndicators添加active类
  dotIndicators.forEach((dot) => dot.classList.remove('active'));
  dotIndicators[index].classList.add('active');
}

// 切换到上一张图片和下一张图片
function goToPreviousImage() {
  currentIndex = (currentIndex - 1 + backgroundImages.length) % backgroundImages.length;
  setBackgroundImage(currentIndex);
}

function goToNextImage() {
  currentIndex = (currentIndex + 1) % backgroundImages.length;
  setBackgroundImage(currentIndex);
}

// 点击指示器切换图片
dotIndicators.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    currentIndex = index;
    setBackgroundImage(currentIndex);
  });
});

goToLeft.addEventListener('click', goToPreviousImage);
goToRight.addEventListener('click', goToNextImage);

// 自动轮播功能
let intervalId = setInterval(goToNextImage, 5000);

// 当鼠标悬停在展示区域时，暂停自动轮播, 离开时继续轮播
productContainer.addEventListener('mouseenter', () => {
  clearInterval(intervalId);
});

productContainer.addEventListener('mouseleave', () => {
  intervalId = setInterval(goToNextImage, 5000);
});

// 初始化背景图片
setBackgroundImage(currentIndex);