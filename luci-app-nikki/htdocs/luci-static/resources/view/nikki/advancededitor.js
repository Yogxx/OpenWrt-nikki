'use strict';
'require view';
'require fs';

return view.extend({
  tinyFmPaths: [
    {
      path: '/www/tinyfilemanager',
      urls: [
        '/tinyfilemanager/tinyfilemanager.php?p=etc%2Fnikki',
        '/tinyfilemanager/index.php?p=etc%2Fnikki'
      ]
    },
    {
      path: '/www/tinyfm',
      urls: [
        '/tinyfm/tinyfm.php?p=etc%2Fnikki',
        '/tinyfm/index.php?p=etc%2Fnikki'
      ]
    }
  ],

  findValidPath: async function() {
    for (const { path, urls } of this.tinyFmPaths) {
      try {
        const stat = await fs.stat(path);
        if (stat.type === 'directory') {
          const url = await this.testUrls(urls);
          if (url) return url;
        }
      } catch (_) {}
    }
    return null;
  },

  testUrls: async function(urls) {
    for (const url of urls) {
      try {
        const res = await fetch(`${url}?_=${Date.now()}`, {
          method: 'HEAD',
          cache: 'no-store',
          credentials: 'same-origin'
        });
        if (res.ok) return url;
      } catch (_) {}
    }
    return null;
  },

  load: function() {
    return this.findValidPath();
  },

  render: function(iframePath) {
    if (iframePath) {
      return this.renderIframe(`http://${window.location.hostname}${iframePath}`);
    }
    return E('div', { class: 'cbi-section' }, [
      E('div', {
        style: 'color: red; padding: 20px; border: 1px solid #ccc; border-radius: 8px;'
      }, _('TinyFileManager not found. Please install it to use the Advanced Editor.'))
    ]);
  },

  renderIframe: function(url) {
    return E('div', { class: 'cbi-section' }, [
      E('iframe', {
        src: url,
        style: 'width: 100%; height: 80vh; border: none;',
        onerror: (e) => {
          const iframe = e.target;
          iframe.style.display = 'none';
          const div = document.createElement('div');
          div.style.color = 'red';
          div.style.padding = '20px';
          div.innerHTML = 'Failed to load TinyFileManager.';
          iframe.parentNode.appendChild(div);
        },
        onload: (e) => {
          const iframe = e.target;
          try {
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            if (!doc || doc.body.innerHTML.trim() === '') throw new Error();
          } catch (_) {
            iframe.style.display = 'none';
            const div = document.createElement('div');
            div.style.color = 'red';
            div.style.padding = '20px';
            div.innerHTML = 'Unable to load TinyFileManager content. Check CORS or permissions.';
            iframe.parentNode.appendChild(div);
          }
        }
      }, _('Your browser does not support iframes.'))
    ]);
  }
});
