<template>
  <div class="app-container">
    <header class="aim-topbar">
      <div class="aim-header">
        <div class="aim-title">
          <a href="https://aiwork-8eo.pages.dev/" target="_blank" rel="noopener">
            永新影视 VIP 在线解析
          </a>
        </div>
      </div>
    </header>

    <main class="container main-body">
      <section class="panel panel-default parser-panel parser-panel--top">
        <div class="panel-body">
          <form class="parser-form" @submit.prevent="handleParse">
            <div class="parser-inline-group">
              <div class="parser-field parser-field--channel">
                <label for="jk">频道</label>
                <select
                  id="jk"
                  class="form-select"
                  v-model="selectedParser"
                  aria-label="解析线路"
                >
                  <option v-for="option in parserOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
              <div class="parser-field parser-field--stretch">
                <label for="url">视频地址</label>
                <input
                  id="url"
                  class="form-control"
                  type="search"
                  placeholder="输视频地址或名称"
                  v-model="videoAddress"
                  aria-label="待解析的视频地址"
                  @keydown.enter.prevent="handleParse"
                />
              </div>
              <div class="parser-action">
                <button id="bf" type="submit" class="btn btn-success btn-lg">
                  播
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      <section class="panel panel-default mt-4">
        <div class="panel-body player-shell">
          <iframe
            v-if="hasVideo"
            :src="iframeSrc"
            title="解析播放窗口"
            allowfullscreen
            allow="fullscreen"
            scrolling="no"
          ></iframe>
          <div v-else class="player-placeholder">
            <div class="player-placeholder-content">
              <h3>请选择解析线路并输入视频地址</h3>
              <p>输入影片地址或名称后点击“播”，多线路可快速切换</p>
            </div>
          </div>
        </div>
      </section>

      <section class="tips">
        <div class="panel-body">
          <div class="alert alert-success" role="alert">
            <p style="text-align:center;">
              一键破解 VIP 视频解析，腾讯 / 爱奇艺 / 优酷 / 芒果等会员节目轻松看，常用线路在此集合。
            </p>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer-links" style="background:#1d1b1b;">
      <p class="statement">
        郑重声明：请访客尊重影片版权，如使用本站链接造成侵权，责任自负。
      </p>
      <span>© 2025 永新 VIP 在线解析</span>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const parserOptions = [
  { label: '搜影片名称专线', value: '//z1.m1907.top/?jx=' },
  { label: '最新电视剧解析（含广告）', value: '//jx.jsonplayer.com/player/?url=' },
  { label: '最新电影解析（含广告）', value: '//jx.playerjy.com/?ads=0&url=' },
  { label: '万能解析（稳定）', value: '//z1.m1907.top/?jx=' },
  { label: '智能解析（备用）', value: '//z1.m1907.cn/?jx=' },
  { label: '蓝光解析（直解）', value: '//llq.tyhua.top/?url=' },
  { label: '优酷解析（备用）', value: '//www.daga.cc/vip2/?url=' },
  { label: '爱奇艺解析（备用）', value: '//www.daga.cc/vip3/?url=' },
  { label: '好莱坞解析（备用）', value: '//player.mrgaocloud.com/player/?url=' }
];

const partnerLinks = [
  { label: '永新解析', url: 'https://www.daga.cc' },
  { label: 'VIP 视频解析', url: 'https://pakou.cn' },
  { label: '兽音译站', url: 'https://hahaka.com' }
];

const selectedParser = ref(parserOptions[0].value);
const videoAddress = ref('');
const iframeSrc = ref('');

const handleParse = () => {
  const trimmed = videoAddress.value.trim();
  if (!trimmed) {
    window.alert('请先输入要解析的视频地址或影片名称');
    return;
  }
  iframeSrc.value = `${selectedParser.value}${trimmed}`;
};

const hasVideo = computed(() => Boolean(iframeSrc.value));
</script>
