(function () {
  // 限制页面仅在当前域名下使用，防止被任意 iframe 盗链
  var allowedHosts = [window.location.hostname, 'www.' + window.location.hostname];
  var currentHost = document.location.hostname;
  if (currentHost && allowedHosts.indexOf(currentHost) === -1) {
    window.location.href = window.location.protocol + '//' + allowedHosts[0];
    return;
  }

  function showToast(message) {
    alert(message);
  }

  window.dihejk = function dihejk() {
    var urlInput = document.getElementById('url');
    var channelSelect = document.getElementById('jk');
    var player = document.getElementById('player');
    if (!urlInput || !channelSelect || !player) {
      return;
    }

    var videoAddress = (urlInput.value || '').trim();
    if (!videoAddress) {
      showToast('请先输入要解析的视频地址或影片名称');
      urlInput.focus();
      return;
    }

    var parserEndpoint = channelSelect.value;
    player.src = parserEndpoint + videoAddress;
  };

  document.addEventListener('DOMContentLoaded', function () {
    var urlInput = document.getElementById('url');
    if (urlInput) {
      urlInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          window.dihejk();
        }
      });
    }
  });
})();
