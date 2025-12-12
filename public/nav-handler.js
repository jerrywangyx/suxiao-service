(function () {
  'use strict';

  const CATEGORY_CARD_SELECTOR = '.site-main .card.card-xl[id^="c-"]';
  const ACTIVE_MENU_CLASS = 'lm-aside-active';

  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  }

  function smoothScrollTo(element) {
    if (!element || typeof element.scrollIntoView !== 'function') return;
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showCardById(id) {
    if (!id) return false;
    const target = document.getElementById(`c-${id}`);
    if (!target) return false;
    smoothScrollTo(target);
    return true;
  }

  function showCardByMid(mid) {
    if (!mid) return false;
    const tab = document.querySelector(`.card-tab .nav-link[data-mid="${mid}"]`);
    if (!tab) return false;
    const card = tab.closest(CATEGORY_CARD_SELECTOR);
    if (card) {
      smoothScrollTo(card);
    }
    if (!tab.classList.contains('active')) {
      tab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
    return true;
  }

  function isMobileAside() {
    const toggle = document.getElementById('menuCollasped');
    if (!toggle) return false;
    return window.getComputedStyle(toggle).display !== 'none';
  }

  function toggleSubMenu(menuItem) {
    const subMenu = menuItem.querySelector('.sub-menu');
    if (!subMenu) return;
    const shouldShow = subMenu.style.display === 'none' || !subMenu.style.display;
    subMenu.style.display = shouldShow ? 'block' : 'none';
  }

  function closeSidebarOnMobile() {
    const toggle = document.getElementById('menuCollasped');
    if (!toggle) return;
    if (window.getComputedStyle(toggle).display === 'none') return;
    toggle.click();
  }

  function setActiveMenu(link) {
    const sidebar = document.querySelector('.aside-menu');
    if (!sidebar) return;
    sidebar.querySelectorAll(`a[data-target].${ACTIVE_MENU_CLASS}`).forEach((node) => {
      node.classList.remove(ACTIVE_MENU_CLASS);
    });
    link.classList.add(ACTIVE_MENU_CLASS);
  }

  function resolveTarget(target) {
    return showCardById(target) || showCardByMid(target);
  }

  function handleSidebarClick(event) {
    const link = event.target.closest('a[data-target]');
    if (!link) return;

    const menuItem = link.closest('.menu-item');
    if (menuItem && menuItem.classList.contains('menu-item-has-children') && isMobileAside()) {
      toggleSubMenu(menuItem);
    }

    event.preventDefault();
    const target = link.dataset.target;
    if (!target) return;

    if (!resolveTarget(target)) {
      console.warn('[SidebarNav] Unable to locate target:', target);
      return;
    }

    setActiveMenu(link);
    closeSidebarOnMobile();
  }

  function initSidebarNavigation() {
    const sidebar = document.querySelector('.aside-menu');
    if (!sidebar) {
      console.error('[SidebarNav] Sidebar container missing');
      return;
    }

    sidebar.addEventListener('click', handleSidebarClick);
  }

  onReady(initSidebarNavigation);
})();
