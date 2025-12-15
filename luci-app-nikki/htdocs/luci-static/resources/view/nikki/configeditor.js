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

  /* Cari folder TinyFileManager yang valid */
  findValidPath: async function () {
    for (const { path, urls } of this.tinyFmPaths) {
      try {
        const stat = await fs.stat(path);

        /* fs.stat() di LuCI pakai 'dir' */
        if (stat && stat.type === 'dir') {
          const url = await this.testUrls(urls);
          if (url)
            return url;
        }
      } catch (e) {
        /* ignore */
      }
    }
    return null;
  },

  /* Test URL TinyFM apakah bisa diakses */
  testUrls: async function (urls) {
    for (const url of urls) {
      try {
        const sep = url.includes('?') ? '&' : '?';
        const res = await fetch(`${url}${sep}_=${Date.now()}`, {
          method: 'GET',
          cache: 'no-store',
          credentials: 'same-origin'
        });

        if (res && res.ok)
          return url;
      } catch (e) {
        /* ignore */
      }
    }
    return null;
  },

  load: function () {
    return this.findValidPath();
  },

  render: function (iframePath) {
    if (iframePath) {
      return this.renderIframe(
        `${window.location.protocol}//${window.location.host}${iframePath}`
      );
    }

    return E('div', { class: 'cbi-section' }, [
      E('div', {
        style: `
          color: red;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 8px;
        `
      }, _('TinyFileManager not found. Please install it to use this feature.'))
    ]);
  },

  renderIframe: function (url) {
    return E('div', { class: 'cbi-section' }, [
      E('iframe', {
        src: url,
        style: 'width:100%; height:80vh; border:none;',

        onerror: function (e) {
          const iframe = e.target;
          iframe.style.display = 'none';

          const div = document.createElement('div');
          div.style.color = 'red';
          div.style.padding = '20px';
          div.textContent = 'Failed to load TinyFileManager.';
          iframe.parentNode.appendChild(div);
        },

        onload: function (e) {
          const iframe = e.target;
          try {
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            if (!doc || !doc.body)
              throw new Error('Invalid document');
          } catch (err) {
            iframe.style.display = 'none';

            const div = document.createElement('div');
            div.style.color = 'red';
            div.style.padding = '20px';
            div.textContent = 'Unable to load TinyFileManager content. Check permissions or web server config.';
            iframe.parentNode.appendChild(div);
          }
        }
      }, _('Your browser does not support iframes.'))
    ]);
  }
});

