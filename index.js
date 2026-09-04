let count = 5;

const timer = setInterval(() => {
  // 每一秒都提醒倒數時間
  console.log(`目前倒數：${count} 秒啦啦啦啦啦`);
  
  count--;

  // 秒數少於 0 就終止
  if (count < 0) {
    clearInterval(timer);
  }

}, 1000);