# 音乐搜索API说明

## 功能概述

本项目已实现音乐搜索和播放功能，包括：

1. **多平台支持**：网易云音乐、QQ音乐、酷狗音乐
2. **音乐搜索**：根据歌曲名或歌手名搜索音乐
3. **在线播放**：支持在线播放音乐
4. **漂亮的界面**：响应式设计，支持移动端

## 当前实现

目前使用的是模拟数据，方便测试和演示。

## 如何集成真实的音乐API

要使用真实的音乐数据，你需要：

### 1. 选择音乐API服务

推荐的免费音乐API服务：

- **网易云音乐API**: https://github.com/Binaryify/NeteaseCloudMusicApi
- **QQ音乐API**: https://github.com/jsososo/QQMusicApi
- **酷狗音乐API**: 自行搭建或使用第三方服务

### 2. 修改搜索API (`app/api/music/search/route.js`)

```javascript
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name') || '';
    const type = searchParams.get('type') || 'netease';

    // 根据不同平台调用不同的API
    let apiUrl = '';
    switch (type) {
      case 'netease':
        apiUrl = `http://your-netease-api.com/search?keywords=${encodeURIComponent(name)}`;
        break;
      case 'qq':
        apiUrl = `http://your-qq-api.com/search?key=${encodeURIComponent(name)}`;
        break;
      case 'kugou':
        apiUrl = `http://your-kugou-api.com/search?keyword=${encodeURIComponent(name)}`;
        break;
    }

    const response = await fetch(apiUrl);
    const data = await response.json();

    // 根据API返回的数据结构进行转换
    const musicList = data.result.songs.map(song => ({
      id: song.id,
      name: song.name,
      artist: song.artists[0].name,
      album: song.album.name,
      duration: formatDuration(song.duration),
    }));

    return NextResponse.json({
      success: true,
      data: musicList,
      total: musicList.length,
    });
  } catch (error) {
    console.error('音乐搜索失败:', error);
    return NextResponse.json({
      success: false,
      message: '搜索失败，请稍后重试',
    });
  }
}
```

### 3. 修改播放链接API (`app/api/music/url/route.js`)

```javascript
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || '';
    const type = searchParams.get('type') || 'netease';

    let apiUrl = '';
    switch (type) {
      case 'netease':
        apiUrl = `http://your-netease-api.com/song/url?id=${id}`;
        break;
      case 'qq':
        apiUrl = `http://your-qq-api.com/song/url?id=${id}`;
        break;
      case 'kugou':
        apiUrl = `http://your-kugou-api.com/song/url?hash=${id}`;
        break;
    }

    const response = await fetch(apiUrl);
    const data = await response.json();

    return NextResponse.json({
      success: true,
      url: data.data[0].url,
      id: id,
    });
  } catch (error) {
    console.error('获取音乐链接失败:', error);
    return NextResponse.json({
      success: false,
      message: '获取播放链接失败，请稍后重试',
    });
  }
}
```

## 使用方法

1. 在首页搜索框中选择"音乐"标签
2. 输入歌曲名或歌手名
3. 点击搜索或按回车
4. 页面会跳转到 `/music?name=关键词`
5. 在音乐页面选择音乐平台（网易云、QQ音乐、酷狗）
6. 点击播放按钮即可播放音乐

## 注意事项

1. 音乐API可能需要跨域配置
2. 某些音乐平台有版权限制
3. 建议使用自己搭建的API服务
4. 注意API的请求频率限制
