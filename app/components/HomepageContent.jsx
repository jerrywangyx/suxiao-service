'use client';

import { useEffect, useRef } from 'react';

async function logVisit() {
  try {
    await fetch('/api/visit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('记录访问日志失败', error);
  }
}

export default function HomepageContent({ html }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !html) return;

    // 使用innerHTML插入HTML，包括script标签
    containerRef.current.innerHTML = html;

    // 执行插入的script标签（innerHTML不会自动执行script）
    const scripts = containerRef.current.querySelectorAll('script');
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');

      // 复制所有属性
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });

      // 复制script内容
      newScript.textContent = oldScript.textContent;

      // 替换旧script以触发执行
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }, [html]);

  // 记录访问日志
  useEffect(() => {
    void logVisit();
  }, []);

  return <div ref={containerRef} className="lm-tools-clone" />;
}
