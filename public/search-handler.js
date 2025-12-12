(function () {
  function setupSearchTabSwitching() {
    const searchBlock = document.getElementById('search');
    if (!searchBlock) {
      console.log('Search block not found');
      return;
    }

    const searchButtons = searchBlock.querySelectorAll('.search-group a[data-index]');
    const childContainer = searchBlock.querySelector('.search-child');

    if (!childContainer) {
      console.log('Search child container not found');
      return;
    }

    // 从window.searchData获取配置
    const searchData = window.searchData || [];

    console.log('Search data:', searchData);

    // 点击标签切换子选项
    searchButtons.forEach((button) => {
      button.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        const tabData = searchData[index];

        if (!tabData || !tabData.child) {
          console.log('No child data for index:', index);
          return;
        }

        // 更新按钮active状态
        searchButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');

        // 更新子选项
        childContainer.innerHTML = '';
        tabData.child.forEach((item, idx) => {
          const link = document.createElement('a');
          link.href = 'javascript:;';
          link.className = 'btn btn-link btn-sm btn-rounded' + (idx === 0 ? ' active' : '');
          link.setAttribute('data-url', item.url);
          link.textContent = ' ' + item.name + ' ';
          childContainer.appendChild(link);
        });

        console.log('Switched to tab:', tabData.name, 'with', tabData.child.length, 'options');
      });
    });

    // 触发默认active按钮的点击以初始化显示
    const activeButton = searchBlock.querySelector('.search-group a.active');
    if (activeButton) {
      activeButton.click();
    }
  }

  // 等待DOM和searchData都准备好
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(setupSearchTabSwitching, 100);
    });
  } else {
    setTimeout(setupSearchTabSwitching, 100);
  }
})();
