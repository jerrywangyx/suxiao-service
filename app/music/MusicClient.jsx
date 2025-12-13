'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import './music.css';

// SVG 图标组件
const Icons = {
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  Music: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18V5l12-2v13"/>
      <circle cx="6" cy="18" r="3"/>
      <circle cx="18" cy="16" r="3"/>
    </svg>
  ),
  Play: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  Pause: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16"/>
      <rect x="14" y="4" width="4" height="16"/>
    </svg>
  ),
  SkipBack: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <polygon points="19 20 9 12 19 4 19 20"/>
      <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  SkipForward: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 4 15 12 5 20 5 4"/>
      <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  Repeat: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="17 1 21 5 17 9"/>
      <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
      <polyline points="7 23 3 19 7 15"/>
      <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    </svg>
  ),
  RepeatOne: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="17 1 21 5 17 9"/>
      <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
      <polyline points="7 23 3 19 7 15"/>
      <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
      <text x="12" y="14" fontSize="8" fill="currentColor" textAnchor="middle">1</text>
    </svg>
  ),
  Shuffle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 3 21 3 21 8"/>
      <line x1="4" y1="20" x2="21" y2="3"/>
      <polyline points="21 16 21 21 16 21"/>
      <line x1="15" y1="15" x2="21" y2="21"/>
      <line x1="4" y1="4" x2="9" y2="9"/>
    </svg>
  ),
  Volume2: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
  ),
  VolumeX: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <line x1="23" y1="9" x2="17" y2="15"/>
      <line x1="17" y1="9" x2="23" y2="15"/>
    </svg>
  ),
  List: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6"/>
      <line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/>
      <line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  ),
  Info: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  Heart: ({ filled }) => (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  Delete: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  Lyrics: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18V5l12-2v13"/>
      <path d="M6 15H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2z"/>
      <path d="M18 13h-2a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2z"/>
    </svg>
  )
};

// 格式化时间
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// 数据源配置
const MUSIC_SOURCES = [
  { id: 'buguyy', name: '精简音乐', direct: true }, // 前端直接调用（默认）
  { id: 'netease', name: '全网音乐' },
];


export default function MusicClient({ initialName }) {
  const [searchName, setSearchName] = useState(initialName || '');
  const [searchSource, setSearchSource] = useState('buguyy'); // 数据源（默认精简音乐）
  const [musicList, setMusicList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPlaying, setCurrentPlaying] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const pageSize = 20;
  
  // 播放器状态
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [playMode, setPlayMode] = useState('sequential'); // sequential, repeat, repeatOne, shuffle
  const [playlist, setPlaylist] = useState([]); // 当前播放列表
  const [favoriteList, setFavoriteList] = useState([]); // 收藏列表
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [showFavorites, setShowFavorites] = useState(true); // 是否显示收藏侧边栏
  
  // 歌词相关状态
  const [lyrics, setLyrics] = useState([]); // 解析后的歌词数组
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1); // 当前歌词索引
  const [showLyrics, setShowLyrics] = useState(false); // 是否显示歌词面板
  
  
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  const lyricContainerRef = useRef(null); // 歌词容器引用
  const isPlayingRef = useRef(false); // 用于防止重复播放
  const currentPlayingRef = useRef(null); // 当前播放歌曲的 ref
  const playlistRef = useRef([]); // 播放列表的 ref
  const wakeLockRef = useRef(null); // Wake Lock 引用
  const currentSourceIndexRef = useRef(0); // 当前播放源索引
  const retryCountRef = useRef(0); // 重试计数
  const playErrorTimeoutRef = useRef(null); // 播放错误后跳转下一首的定时器
  const isHandlingErrorRef = useRef(false); // 是否正在处理错误（防止重复触发）
  const currentPlayIdRef = useRef(0); // 当前播放任务ID（用于取消过期的异步操作）

  // 请求 Wake Lock 防止设备休眠（保持后台播放）
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        console.log('Wake Lock 已激活，设备将保持唤醒');
        
        // 监听 Wake Lock 释放事件
        wakeLockRef.current.addEventListener('release', () => {
          console.log('Wake Lock 已释放');
        });
      } catch (err) {
        console.warn('Wake Lock 请求失败:', err);
      }
    }
  };

  // 释放 Wake Lock
  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      } catch (err) {
        console.warn('Wake Lock 释放失败:', err);
      }
    }
  };

  // 页面可见性变化时重新获取 Wake Lock
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isPlaying) {
        // 页面重新可见且正在播放，重新请求 Wake Lock
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [isPlaying]);

  // 加载收藏列表
  useEffect(() => {
    const savedFavorites = localStorage.getItem('music_favorites');
    if (savedFavorites) {
      try {
        setFavoriteList(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Failed to parse favorites', e);
      }
    }
  }, []);

  // 收藏/取消收藏
  const toggleFavorite = (music) => {
    let newFavorites;
    if (favoriteList.some(item => item.id === music.id)) {
      newFavorites = favoriteList.filter(item => item.id !== music.id);
    } else {
      newFavorites = [...favoriteList, music];
    }
    setFavoriteList(newFavorites);
    localStorage.setItem('music_favorites', JSON.stringify(newFavorites));
  };

  // 解析 LRC 歌词
  const parseLyric = (lrcString) => {
    if (!lrcString) return [];
    
    // 先把 <br /> 或 <br> 替换为换行符（兼容不同API返回格式）
    const normalizedLrc = lrcString
      .replace(/<br\s*\/?>/gi, '\n')  // 替换 <br> 或 <br /> 或 <br/>
      .replace(/\\n/g, '\n');          // 替换转义的 \n
    
    const lines = normalizedLrc.split('\n');
    const result = [];
    
    // 匹配时间标签 [mm:ss.xx] 或 [mm:ss]
    const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;
    
    for (const line of lines) {
      const times = [];
      let match;
      
      // 提取所有时间标签
      while ((match = timeRegex.exec(line)) !== null) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const milliseconds = match[3] ? parseInt(match[3].padEnd(3, '0'), 10) : 0;
        times.push(minutes * 60 + seconds + milliseconds / 1000);
      }
      
      // 提取歌词文本（去掉时间标签）
      const text = line.replace(/\[\d{2}:\d{2}(?:\.\d{2,3})?\]/g, '').trim();
      
      // 跳过空行和元数据行
      if (text && !text.startsWith('[')) {
        for (const time of times) {
          result.push({ time, text });
        }
      }
    }
    
    // 按时间排序
    result.sort((a, b) => a.time - b.time);
    return result;
  };

  // 获取歌词
  const fetchLyric = async (music) => {
    if (!music) {
      setLyrics([]);
      return;
    }
    
    try {
      let lyricText = '';
      
      // 根据不同数据源获取歌词
      if (music.type === 'buguyy') {
        // 全网音乐源：通过 geturl2 API 获取歌词
        console.log('[歌词] 尝试获取全网音乐歌词, id:', music.id);
        const response = await fetch(`https://a.buguyy.top/newapi/geturl2.php?id=${music.id}`);
        const data = await response.json();
        console.log('[歌词] API 返回:', data);
        
        if (data && data.code === 200 && data.data && data.data.lrc) {
          lyricText = data.data.lrc;
          console.log('[歌词] 获取到歌词长度:', lyricText.length);
        }
      } else {
        // 网易云音乐：通过后端 API 获取歌词
        const response = await fetch(`/api/music/search?action=lyric&id=${music.id}&type=${music.type || 'netease'}`);
        const data = await response.json();
        
        if (data.success && data.lyric) {
          lyricText = data.lyric;
        }
      }
      
      // 解析歌词
      if (lyricText) {
        const parsedLyrics = parseLyric(lyricText);
        console.log('[歌词] 解析完成，共', parsedLyrics.length, '行');
        setLyrics(parsedLyrics);
        setCurrentLyricIndex(-1);
      } else {
        console.log('[歌词] 未获取到歌词');
        setLyrics([]);
      }
    } catch (error) {
      console.error('获取歌词失败:', error);
      setLyrics([]);
    }
  };

  // 更新当前歌词索引
  useEffect(() => {
    if (lyrics.length === 0) return;
    
    // 找到当前时间对应的歌词
    let index = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (lyrics[i].time <= currentTime) {
        index = i;
      } else {
        break;
      }
    }
    
    if (index !== currentLyricIndex) {
      setCurrentLyricIndex(index);
      
      // 自动滚动到当前歌词
      if (lyricContainerRef.current && index >= 0) {
        const container = lyricContainerRef.current;
        const lyricElements = container.querySelectorAll('.lyric-line');
        if (lyricElements[index]) {
          lyricElements[index].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }
    }
  }, [currentTime, lyrics, currentLyricIndex]);

  /**
   * 记录访问日志
   * @param {string} visitType - 访问类型
   * @param {string} searchContent - 搜索内容
   */
  const logVisit = useCallback((visitType, searchContent = null) => {
    try {
      fetch('/api/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitType, searchContent }),
      }).catch(() => {});
    } catch (e) {
      // 忽略错误
    }
  }, []);

  /**
   * 搜索音乐 - 根据数据源选择后端代理或前端直接调用
   * @param {string} name - 搜索关键词
   * @param {string} source - 数据源ID
   * @param {number} page - 页码
   */
  const searchMusic = async (name = searchName, source = searchSource, page = 1) => {
    if (!name.trim()) {
      alert('请输入歌曲或歌手名称');
      return;
    }

    setLoading(true);
    try {
      let data;
      
      // 检查是否为前端直接调用的源
      const sourceConfig = MUSIC_SOURCES.find(s => s.id === source);
      
      if (sourceConfig?.direct && source === 'buguyy') {
        // 前端直接调用全网音乐 API
        data = await searchMusicDirect(name, page);
      } else {
        // 通过后端代理
        const response = await fetch(`/api/music/search?action=search&name=${encodeURIComponent(name)}&source=${source}&page=${page}&pageSize=${pageSize}`);
        data = await response.json();
      }

      if (data.success) {
        setMusicList(data.data || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 0);
        setCurrentPage(page);
        
        // 记录访问日志（仅首次搜索，即第1页时记录）
        if (page === 1) {
          logVisit('音乐搜索', name.trim());
        }
      } else {
        alert('搜索失败: ' + (data.message || '未知错误'));
        setMusicList([]);
        setTotal(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('搜索音乐失败', error);
      alert('搜索失败，请稍后重试');
      setMusicList([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 前端直接调用全网音乐搜索 API
   * @param {string} keyword - 搜索关键词
   * @param {number} page - 页码
   * @returns {Object} 搜索结果
   */
  const searchMusicDirect = async (keyword, page = 1) => {
    try {
      const response = await fetch(`https://a.buguyy.top/newapi/search.php?keyword=${encodeURIComponent(keyword)}&page=${page}`);
      const result = await response.json();
      
      console.log('[全网音乐] API 返回:', result);
      console.log('[全网音乐] 返回类型:', typeof result);
      console.log('[全网音乐] 返回键名:', result ? Object.keys(result) : 'null');
      
      // 尝试多种格式解析数据
      let songsData = null;
      
      // 格式1: { data: [...] }
      if (result && result.data && Array.isArray(result.data)) {
        console.log('[全网音乐] 匹配格式: data数组');
        songsData = result.data;
      }
      // 格式2: { list: [...] }
      else if (result && result.list && Array.isArray(result.list)) {
        console.log('[全网音乐] 匹配格式: list数组');
        songsData = result.list;
      }
      // 格式3: { songs: [...] }
      else if (result && result.songs && Array.isArray(result.songs)) {
        console.log('[全网音乐] 匹配格式: songs数组');
        songsData = result.songs;
      }
      // 格式4: 直接返回数组 [...]
      else if (Array.isArray(result)) {
        console.log('[全网音乐] 匹配格式: 直接数组');
        songsData = result;
      }
      // 格式5: { code: 200, data: {...} } 或 { code: 0, data: {...} }
      else if (result && (result.code === 200 || result.code === 0 || result.code === '200')) {
        console.log('[全网音乐] 匹配格式: code+data');
        // data 可能是数组或对象
        const dataContent = result.data;
        if (Array.isArray(dataContent)) {
          songsData = dataContent;
        } else if (dataContent && typeof dataContent === 'object') {
          // data 是对象，尝试从中提取数组
          console.log('[全网音乐] data 是对象，键名:', Object.keys(dataContent));
          songsData = dataContent.list || dataContent.songs || dataContent.data || dataContent.items || dataContent.result;
          // 如果还不是数组，遍历找数组字段
          if (!Array.isArray(songsData)) {
            for (const key of Object.keys(dataContent)) {
              if (Array.isArray(dataContent[key])) {
                console.log(`[全网音乐] 在 data 中找到数组字段: ${key}`);
                songsData = dataContent[key];
                break;
              }
            }
          }
        }
      }
      // 格式6: 检查其他可能的数组字段
      else if (result && typeof result === 'object') {
        console.log('[全网音乐] 尝试查找数组字段...');
        for (const key of Object.keys(result)) {
          if (Array.isArray(result[key]) && result[key].length > 0) {
            console.log(`[全网音乐] 找到数组字段: ${key}`);
            songsData = result[key];
            break;
          }
        }
      }
      
      console.log('[全网音乐] 解析到的歌曲数据:', songsData);
      
      if (songsData && songsData.length > 0) {
        // 打印第一首歌的字段，帮助调试
        console.log('[精简音乐] 第一首歌原始数据:', songsData[0]);
        console.log('[精简音乐] 第一首歌键名:', Object.keys(songsData[0]));
        
        const songs = songsData.map(song => ({
          id: song.id || song.rid || song.songid || song.song_id || song.musicid || song.hash,
          name: song.title || song.name || song.song || song.songname || song.song_name || song.filename,
          artist: song.singer || song.artist || song.singername || song.singer_name || song.author || '未知歌手',
          album: song.album || song.albumname || song.album_name || '',
          duration: song.duration || song.timelength || '',
          cover: song.picurl || song.pic || song.cover || '',
          // 注意：downurl 格式是 "FLAC#网盘链接###MP3#网盘链接"，不是直接播放链接
          // 精简音乐需要通过 geturl2.php API 获取真正的播放链接
          playUrl: '', // 不使用搜索返回的链接，统一通过API获取
          type: 'buguyy', // 标记数据源类型
          originalData: song, // 保留原始数据
        }));
        
        console.log('[全网音乐] 解析后歌曲:', songs);
        
        return {
          success: true,
          data: songs,
          total: songs.length,
          totalPages: 1, // 该源不支持分页
        };
      }
      
      console.warn('[全网音乐] 无法解析数据格式，songsData:', songsData);
      return { success: false, message: '未找到相关歌曲' };
    } catch (error) {
      console.error('[全网音乐] 直接搜索失败:', error);
      return { success: false, message: '搜索失败: ' + error.message };
    }
  };

  /**
   * 获取播放源列表
   * @param {Object} music - 歌曲对象
   * @returns {Array} 播放源URL列表
   */
  const getPlaySources = (music) => {
    const sources = [];
    const id = music.id;
    
    // 根据歌曲来源选择播放源
    if (music.type === 'buguyy') {
      // 精简音乐源 - 只使用一个源，避免切换导致从头播放
      if (music.playUrl) {
        // 优先使用搜索结果中的直链
        console.log('[精简音乐] 使用搜索返回的播放链接:', music.playUrl);
        sources.push({
          name: '精简音乐直链',
          url: music.playUrl,
        });
      } else {
        // 没有直链时，通过 API 获取播放链接
        sources.push({
          name: '精简音乐API',
          getUrl: async () => {
            try {
              const response = await fetch(`https://a.buguyy.top/newapi/geturl2.php?id=${id}`);
              const data = await response.json();
              console.log('[精简音乐] geturl2 API 返回:', data);
              // 根据API返回格式解析播放URL
              if (data && data.code === 200 && data.data && data.data.url) {
                return data.data.url;
              }
              if (data && data.url) {
                return data.url;
              }
              if (data && data.data && data.data.url) {
                return data.data.url;
              }
              return null;
            } catch (error) {
              console.error('获取播放URL失败:', error);
              return null;
            }
          },
        });
      }
    } else {
      // 网易云官方外链（默认）
      if (id) {
        sources.push({
          name: '网易云外链',
          url: `https://music.163.com/song/media/outer/url?id=${id}.mp3`,
        });
      }
    }
    
    return sources;
  };

  /**
   * 尝试使用指定源播放
   * @param {Object} music - 歌曲对象
   * @param {number} sourceIndex - 源索引
   * @param {number} playId - 当前播放任务ID
   */
  const tryPlayWithSource = async (music, sourceIndex, playId) => {
    // 检查播放任务是否已过期（用户可能已经点击了其他歌曲）
    if (playId !== currentPlayIdRef.current) {
      console.log(`[播放] 任务已过期，取消: ${music.name}`);
      return;
    }
    
    const sources = getPlaySources(music);
    
    // 所有源都尝试过了
    if (sourceIndex >= sources.length) {
      console.log(`[播放] 所有源都失败: ${music.name}`);
      isPlayingRef.current = false;
      isHandlingErrorRef.current = false;
      retryCountRef.current = 0;
      handlePlayError(music, playId);
      return;
    }
    
    const source = sources[sourceIndex];
    currentSourceIndexRef.current = sourceIndex;
    isHandlingErrorRef.current = false; // 重置错误处理标志
    
    try {
      // 获取播放URL
      let playUrl = source.url;
      if (!playUrl && source.getUrl) {
        console.log(`[播放] 尝试源 ${sourceIndex + 1}/${sources.length}: ${source.name}`);
        playUrl = await source.getUrl();
      } else {
        console.log(`[播放] 尝试源 ${sourceIndex + 1}/${sources.length}: ${source.name} - ${playUrl}`);
      }
      
      // 再次检查任务是否过期
      if (playId !== currentPlayIdRef.current) {
        console.log(`[播放] 任务已过期，取消: ${music.name}`);
        return;
      }
      
      if (!playUrl) {
        // 当前源获取URL失败，尝试下一个
        console.log(`[播放] ${source.name} 获取URL失败，尝试下一个源`);
        tryPlayWithSource(music, sourceIndex + 1, playId);
        return;
      }
        
      if (audioRef.current) {
        audioRef.current.src = playUrl;
        audioRef.current.volume = isMuted ? 0 : volume;
        audioRef.current.load();
        
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            // 播放成功后再次检查任务是否过期
            if (playId !== currentPlayIdRef.current) {
              console.log(`[播放] 成功但任务已过期，停止: ${music.name}`);
              audioRef.current?.pause();
              return;
            }
            console.log(`[播放成功] ${source.name}: ${music.name}`);
            setIsPlaying(true);
            isHandlingErrorRef.current = false;
            retryCountRef.current = 0;
            failedSongsRef.current.clear();
            updateMediaSession(music);
            requestWakeLock();
          }).catch((error) => {
            // 检查任务是否过期
            if (playId !== currentPlayIdRef.current) return;
            
            if (error.name === 'NotAllowedError') {
              console.warn('需要用户交互才能播放');
              setIsPlaying(false);
              isPlayingRef.current = false;
            } else if (error.name === 'AbortError') {
              console.log('播放被中断');
            } else {
              // 标记正在处理错误，防止 onError 重复触发
              if (!isHandlingErrorRef.current) {
                isHandlingErrorRef.current = true;
                console.warn(`[播放] ${source.name} 播放失败，尝试下一个源`);
                tryPlayWithSource(music, sourceIndex + 1, playId);
              }
            }
          });
        }
      }
    } catch (error) {
      // 检查任务是否过期
      if (playId !== currentPlayIdRef.current) return;
      
      if (!isHandlingErrorRef.current) {
        isHandlingErrorRef.current = true;
        console.warn(`[播放] ${source.name} 出错，尝试下一个源:`, error.message);
        tryPlayWithSource(music, sourceIndex + 1, playId);
      }
    }
  };

  // 播放音乐
  const playMusic = async (music, fromList = 'search') => {
    // 如果点击的是当前正在播放的歌曲，切换播放/暂停
    if (currentPlayingRef.current?.id === music.id && audioRef.current?.src) {
      togglePlay();
      return;
    }

    // ★ 清除之前的播放错误跳转定时器
    if (playErrorTimeoutRef.current) {
      clearTimeout(playErrorTimeoutRef.current);
      playErrorTimeoutRef.current = null;
    }

    // ★ 生成新的播放任务ID，使之前的异步操作失效
    const playId = Date.now();
    currentPlayIdRef.current = playId;

    // 停止当前播放
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    
    // 重置播放状态
    setIsPlaying(false);
    isPlayingRef.current = true;
    isHandlingErrorRef.current = false; // 重置错误处理标志
    currentSourceIndexRef.current = 0; // 重置源索引
    retryCountRef.current = 0; // 重置重试计数

    // 更新当前播放列表（只在非 current 模式下更新）
    if (fromList === 'favorites') {
      setPlaylist(favoriteList);
      playlistRef.current = favoriteList;
    } else if (fromList === 'search') {
      if (!musicList.some(m => m.id === music.id)) {
        setPlaylist([music]);
        playlistRef.current = [music];
      } else {
        setPlaylist(musicList);
        playlistRef.current = musicList;
      }
    }

    // 设置当前播放歌曲
    setCurrentPlaying(music);
    currentPlayingRef.current = music;
    fetchLyric(music); // 获取歌词
    
    // 从第一个源开始尝试播放（传入播放任务ID）
    tryPlayWithSource(music, 0, playId);
  };

  // 设置 Media Session（支持后台播放和锁屏控制）
  const updateMediaSession = (music) => {
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: music.name || '未知歌曲',
          artist: music.artist || '未知歌手',
          album: music.album || '未知专辑',
        });

        // 设置媒体控制按钮
        navigator.mediaSession.setActionHandler('play', () => {
          audioRef.current?.play();
          setIsPlaying(true);
        });
        
        navigator.mediaSession.setActionHandler('pause', () => {
          audioRef.current?.pause();
          setIsPlaying(false);
        });
        
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          playPrevious();
        });
        
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          playNext();
        });

        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (audioRef.current && details.seekTime !== undefined) {
            audioRef.current.currentTime = details.seekTime;
          }
        });

        // 更新播放状态
        navigator.mediaSession.playbackState = 'playing';
      } catch (error) {
        console.warn('Media Session API 不完全支持:', error);
      }
    }
  };

  // 更新 Media Session 播放状态
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  // 保持音频会话活跃（防止后台被系统中断）
  useEffect(() => {
    let keepAliveInterval = null;

    if (isPlaying && audioRef.current) {
      // 每隔一段时间检查并恢复播放（针对某些浏览器的后台限制）
      keepAliveInterval = setInterval(() => {
        if (audioRef.current && !audioRef.current.paused && audioRef.current.readyState >= 2) {
          // 更新 Media Session 位置信息，保持会话活跃
          if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
            try {
              navigator.mediaSession.setPositionState({
                duration: audioRef.current.duration || 0,
                playbackRate: audioRef.current.playbackRate || 1,
                position: audioRef.current.currentTime || 0,
              });
            } catch (e) {
              // 忽略错误
            }
          }
        }
      }, 1000);
    }

    return () => {
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
      }
    };
  }, [isPlaying]);

  // 失败歌曲ID集合
  const failedSongsRef = useRef(new Set());
  
  /**
   * 处理播放错误，2 秒后自动切换下一首
   * @param {Object} failedMusic - 播放失败的歌曲对象
   * @param {number} playId - 当前播放任务ID
   */
  const handlePlayError = (failedMusic, playId) => {
    // ★ 检查任务是否已过期
    if (playId !== currentPlayIdRef.current) {
      console.log('[错误处理] 任务已过期，忽略:', failedMusic?.name);
      return;
    }
    
    // 记录失败的歌曲
    if (failedMusic?.id) {
      failedSongsRef.current.add(failedMusic.id);
      console.log('歌曲播放失败，已记录:', failedMusic.name);
    }
    
    setIsPlaying(false);
    isPlayingRef.current = false;
    
    // 检查当前列表是否全部失败
    const list = playlistRef.current;
    const allFailed = list.length > 0 && list.every(item => failedSongsRef.current.has(item.id));
    
    if (allFailed) {
      console.log('当前列表所有歌曲都播放失败');
      return;
    }
    
    // ★ 清除之前的定时器
    if (playErrorTimeoutRef.current) {
      clearTimeout(playErrorTimeoutRef.current);
    }
    
    // 2秒后自动切换下一首（保存定时器引用）
    playErrorTimeoutRef.current = setTimeout(() => {
      // 再次检查任务是否过期
      if (playId === currentPlayIdRef.current) {
        playNext();
      }
      playErrorTimeoutRef.current = null;
    }, 2000);
  };

  // 播放/暂停切换
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      releaseWakeLock(); // 暂停时释放 Wake Lock
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        requestWakeLock(); // 播放时请求 Wake Lock
      }).catch(console.error);
    }
  };

  // 上一首
  const playPrevious = () => {
    const current = currentPlayingRef.current;
    const list = playlistRef.current;
    
    if (!current || list.length === 0) return;
    
    const currentIndex = list.findIndex(item => item.id === current.id);
    let prevIndex;
    
    if (playMode === 'shuffle') {
      prevIndex = Math.floor(Math.random() * list.length);
    } else {
      prevIndex = currentIndex > 0 ? currentIndex - 1 : list.length - 1;
    }
    
    isPlayingRef.current = false; // 允许播放新歌
    playMusic(list[prevIndex], 'current');
  };

  // 下一首
  const playNext = () => {
    const current = currentPlayingRef.current;
    const list = playlistRef.current;
    
    if (!current || list.length === 0) return;
    
    const currentIndex = list.findIndex(item => item.id === current.id);
    let nextIndex;
    
    if (playMode === 'shuffle') {
      nextIndex = Math.floor(Math.random() * list.length);
    } else if (playMode === 'repeatOne') {
      nextIndex = currentIndex;
    } else {
      nextIndex = currentIndex < list.length - 1 ? currentIndex + 1 : 0;
    }
    
    isPlayingRef.current = false; // 允许播放新歌
    playMusic(list[nextIndex], 'current');
  };

  // 切换播放模式
  const togglePlayMode = () => {
    const modes = ['sequential', 'repeat', 'repeatOne', 'shuffle'];
    const currentIndex = modes.indexOf(playMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setPlayMode(modes[nextIndex]);
  };

  // 获取播放模式图标
  const getPlayModeIcon = () => {
    switch (playMode) {
      case 'repeatOne':
        return <Icons.RepeatOne />;
      case 'shuffle':
        return <Icons.Shuffle />;
      default:
        return <Icons.Repeat />;
    }
  };

  // 进度条点击
  const handleProgressClick = (e) => {
    if (!audioRef.current || !duration) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // 音量控制
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // 静音切换
  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  // 音频事件处理
  const onTimeUpdate = () => {
    if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
        setDuration(audioRef.current.duration);
    }
  };

  const onEnded = () => {
      console.log('播放结束，自动播放下一首');

      isPlayingRef.current = false; // 标记当前播放结束
      if (playMode === 'repeatOne') {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
            isPlayingRef.current = true;
        }
      } else {
        playNext();
      }
  };

  const onError = (e) => {
      // 检查是否是真正的播放错误
      const audio = audioRef.current;
      if (!audio || !audio.src || audio.src === window.location.href) {
        // 没有设置src或src为空，忽略
        return;
      }
      
      // ★ 检查是否已经在处理错误（防止和 .catch() 重复触发）
      if (isHandlingErrorRef.current) {
        console.log('[onError] 已在处理中，忽略重复触发');
        return;
      }
      
      const error = audio.error;
      const currentMusic = currentPlayingRef.current;
      const playId = currentPlayIdRef.current;
      console.error('播放出错:', currentMusic?.name, 'code:', error?.code, 'message:', error?.message);
      
      // 只有在确实无法播放时才处理错误
      // error.code: 1=MEDIA_ERR_ABORTED, 2=MEDIA_ERR_NETWORK, 3=MEDIA_ERR_DECODE, 4=MEDIA_ERR_SRC_NOT_SUPPORTED
      if (error && error.code && currentMusic) {
        // ★ 标记正在处理错误
        isHandlingErrorRef.current = true;
        // 尝试下一个播放源
        const nextSourceIndex = currentSourceIndexRef.current + 1;
        console.log(`[音频错误] 当前源失败，尝试源 ${nextSourceIndex + 1}`);
        tryPlayWithSource(currentMusic, nextSourceIndex, playId);
      }
  };

  // 初始搜索
  useEffect(() => {
    if (initialName) {
      searchMusic(initialName, searchSource, 1);
    }
  }, []);

  // 切换数据源
  const handleSourceChange = (source) => {
    setSearchSource(source);
    if (searchName.trim()) {
      searchMusic(searchName, source, 1);
    }
  };

  // 切换页码
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    searchMusic(searchName, searchSource, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // 移动端当前视图：'search' 或 'favorites'
  const [mobileView, setMobileView] = useState('search');

  return (
    <div className="music-page has-sidebar">
        {/* 移动端顶部导航 */}
        <div className="mobile-tabs">
          {/* 移动端数据源选择 */}
          <select
            className="mobile-source-select"
            value={searchSource}
            onChange={(e) => handleSourceChange(e.target.value)}
          >
            {MUSIC_SOURCES.map((source) => (
              <option key={source.id} value={source.id}>
                {source.name}
              </option>
            ))}
          </select>
          <div className="mobile-search-bar">
            <input
              type="text"
              className="mobile-search-input"
              placeholder="搜索歌曲或歌手"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  searchMusic(searchName, searchSource, 1);
                  setMobileView('search');
                }
              }}
            />
            <button
              className="mobile-search-btn"
              onClick={() => {
                searchMusic(searchName, searchSource, 1);
                setMobileView('search');
              }}
              disabled={loading}
            >
              <Icons.Search />
            </button>
          </div>
          <button 
            className={`mobile-fav-btn ${mobileView === 'favorites' ? 'active' : ''}`}
            onClick={() => setMobileView(mobileView === 'favorites' ? 'search' : 'favorites')}
          >
            <Icons.Heart filled={mobileView === 'favorites'} />
            <span className="fav-count">{favoriteList.length}</span>
          </button>
        </div>

        {/* 左侧收藏侧边栏 (桌面端) / 全屏收藏页 (移动端) */}
        <div className={`favorites-sidebar ${showFavorites ? 'open' : ''} ${mobileView === 'favorites' ? 'mobile-show' : ''}`}>
            <div className="sidebar-header">
                <h3>我的收藏</h3>
                <span className="count">{favoriteList.length} 首</span>
            </div>
            <div className="sidebar-content">
                {favoriteList.length > 0 ? (
                    <div className="favorites-list">
                        {favoriteList.map((music, index) => (
                            <div 
                                key={music.id} 
                                className={`favorite-item ${currentPlaying?.id === music.id ? 'active' : ''}`}
                                onClick={() => playMusic(music, 'favorites')}
                            >
                                <div className="fav-index">{index + 1}</div>
                                <div className="fav-info">
                                    <div className="fav-name">{music.name}</div>
                                    <div className="fav-artist">{music.artist}</div>
                                </div>
                                <button 
                                    className="fav-remove"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(music);
                                    }}
                                    title="取消收藏"
                                >
                                    <Icons.Delete />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-favorites">
                        <Icons.Heart filled={false} />
                        <p>暂无收藏歌曲</p>
                        <p className="hint">在搜索结果中点击心形图标收藏</p>
                    </div>
                )}
            </div>
        </div>

      {/* 搜索内容区 (移动端根据 tab 显示/隐藏) */}
      <div className={`search-content-wrapper ${mobileView === 'search' ? 'mobile-show' : 'mobile-hide'}`}>
      {/* 头部搜索 */}
      <div className="music-header">
        <div className="container">
          <div className="header-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <div className="search-box" style={{ flex: 1 }}>
              <div className="search-input-group">
                <select
                  className="source-select"
                  value={searchSource}
                  onChange={(e) => handleSourceChange(e.target.value)}
                >
                  {MUSIC_SOURCES.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  className="search-input"
                  placeholder="输入歌曲名称或歌手名"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      searchMusic(searchName, searchSource, 1);
                    }
                  }}
                />
                <button
                  className="search-button"
                  onClick={() => searchMusic(searchName, searchSource, 1)}
                  disabled={loading}
                >
                  <Icons.Search />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 音乐列表 */}
      <div className="music-content">
        <div className="container">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>搜索中...</p>
            </div>
          ) : musicList.length > 0 ? (
            <>
              <div className="music-list">
                <div className="list-header">
                  <div className="col-index">#</div>
                  <div className="col-title">歌曲</div>
                  <div className="col-info">信息</div>
                  <div className="col-action">操作</div>
                </div>
                {musicList.map((music, index) => (
                  <div
                    key={music.id}
                    className={`music-item ${currentPlaying?.id === music.id ? 'playing' : ''}`}
                    onClick={() => playMusic(music, 'search')}
                  >
                    <div className="col-index">
                      {currentPlaying?.id === music.id && isPlaying ? (
                        <span style={{ color: 'var(--music-accent)' }}>♪</span>
                      ) : (
                        (currentPage - 1) * pageSize + index + 1
                      )}
                    </div>
                    <div className="col-title">{music.name}</div>
                    <div className="col-info">
                      <div className="info-artist">{music.artist}</div>
                      <div className="info-extra">
                        {music.album && <span>{music.album}</span>}
                        {music.duration && <span>{music.duration}</span>}
                      </div>
                    </div>
                    <div className="col-action">
                        <button 
                            className={`action-btn ${favoriteList.some(item => item.id === music.id) ? 'active' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(music);
                            }}
                            title="收藏"
                        >
                            <Icons.Heart filled={favoriteList.some(item => item.id === music.id)} />
                        </button>
                      <button
                        className={`play-button ${currentPlaying?.id === music.id ? 'playing' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (currentPlaying?.id === music.id) {
                            togglePlay();
                          } else {
                            playMusic(music, 'search');
                          }
                        }}
                      >
                        {currentPlaying?.id === music.id && isPlaying ? '暂停' : '播放'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 精简音乐：显示"加载更多"按钮 */}
              {searchSource === 'buguyy' && musicList.length > 0 && (
                <div className="load-more-container">
                  <button
                    className="load-more-btn"
                    onClick={() => {
                      // 切换到全网音乐源并重新搜索
                      setSearchSource('netease');
                      searchMusic(searchName, 'netease', 1);
                    }}
                  >
                    <span>🔍 加载更多结果</span>
                    <span className="load-more-hint">切换至全网音乐搜索更多歌曲</span>
                  </button>
                </div>
              )}

              {/* 分页器（仅全网音乐源显示） */}
              {searchSource !== 'buguyy' && totalPages > 1 && (
                <div className="pagination">
                  <div className="pagination-info">
                    共 {total} 首歌曲，第 {currentPage} / {totalPages} 页
                  </div>
                  <div className="pagination-controls">
                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    >
                      首页
                    </button>
                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      上一页
                    </button>
                    <div className="pagination-pages">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      下一页
                    </button>
                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      末页
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Icons.Music />
              </div>
              <h3>开始搜索音乐</h3>
              <p>输入歌曲名称或歌手名开始探索</p>
            </div>
          )}
        </div>
      </div>
      </div>{/* 搜索内容区结束 */}

      {/* 底部播放器 */}
      {currentPlaying && (
        <div className="music-player">
          {/* 进度条 */}
          <div 
            className="player-progress-bar" 
            ref={progressRef}
            onClick={handleProgressClick}
          >
            <div className="progress-fill" style={{ width: `${progressPercent}%` }}>
              <div className="progress-handle"></div>
            </div>
          </div>

          <div className="player-main">
            {/* 歌曲信息 */}
            <div className="player-info">
              <div 
                className={`player-cover ${isPlaying ? 'spinning' : ''}`}
                onClick={() => setShowLyrics(!showLyrics)}
                title="点击查看歌词"
                style={{ cursor: 'pointer' }}
              >
                <Icons.Music />
              </div>
              <div className="player-text">
                <div className="player-title">{currentPlaying.name}</div>
                <div className="player-artist">{currentPlaying.artist}</div>
              </div>
               <button 
                    className={`action-btn small ${favoriteList.some(item => item.id === currentPlaying.id) ? 'active' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(currentPlaying);
                    }}
                >
                    <Icons.Heart filled={favoriteList.some(item => item.id === currentPlaying.id)} />
                </button>
            </div>

            {/* 播放控制 */}
            <div className="player-controls">
              <button 
                className={`control-btn ${playMode !== 'sequential' ? 'active' : ''}`} 
                onClick={togglePlayMode}
                title={
                  playMode === 'sequential' ? '顺序播放' :
                  playMode === 'repeat' ? '列表循环' :
                  playMode === 'repeatOne' ? '单曲循环' : '随机播放'
                }
              >
                {getPlayModeIcon()}
              </button>
              
              <button className="control-btn" onClick={playPrevious} title="上一首">
                <Icons.SkipBack />
              </button>
              
              <button className="control-btn main-play" onClick={togglePlay}>
                {isPlaying ? <Icons.Pause /> : <Icons.Play />}
              </button>
              
              <button className="control-btn" onClick={playNext} title="下一首">
                <Icons.SkipForward />
              </button>

              <div className="player-time">
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* 右侧控制 */}
            <div className="player-extra">
              <div className="volume-control">
                <button className="control-btn" onClick={toggleMute}>
                  {isMuted || volume === 0 ? <Icons.VolumeX /> : <Icons.Volume2 />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="volume-slider-input"
                  style={{
                    width: '80px',
                    accentColor: 'var(--music-accent)'
                  }}
                />
              </div>
              
              <button 
                className={`control-btn ${showFavorites ? 'active' : ''}`} 
                onClick={() => setShowFavorites(!showFavorites)}
                title="收藏列表"
              >
                <Icons.List />
              </button>
            </div>
          </div>

          {/* 歌词面板 */}
          {showLyrics && (
            <div className="lyrics-panel">
              <div className="lyrics-container" ref={lyricContainerRef}>
                {lyrics.length > 0 ? (
                  lyrics.map((lyric, index) => (
                    <div 
                      key={index}
                      className={`lyric-line ${index === currentLyricIndex ? 'active' : ''}`}
                    >
                      {lyric.text}
                    </div>
                  ))
                ) : (
                  <div className="no-lyrics">暂无歌词</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 隐藏的 audio 元素 - 支持后台播放 */}
      <audio 
        ref={audioRef} 
        className="audio-player"
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
        onError={onError}
        playsInline
        preload="auto"
      />
      
    </div>
  );
}
