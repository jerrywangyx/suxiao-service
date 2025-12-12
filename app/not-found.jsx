export default function NotFound() {
  return (
    <div className="not-found text-center py-5">
      <h2>页面找不到</h2>
      <p>请检查链接或返回首页继续浏览。</p>
      <a className="btn btn-primary mt-3" href="/">
        返回首页
      </a>
    </div>
  );
}
