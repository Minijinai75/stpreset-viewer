(() => {
  const pages = [
    { id: 'index', label: 'INDEX', href: 'index.html' },
    { id: 'preset', label: '預設', href: 'preset-viewer.html' },
    { id: 'worldinfo', label: '世界書', href: 'worldinfo-viewer.html' },
    { id: 'character', label: '角色卡', href: 'character-card-viewer.html' },
    { id: 'regex', label: '正則', href: 'regex-viewer.html' },
  ];

  const notes = {
    index: ['INDEX', '選擇要處理的 SillyTavern 內容類型。所有檔案都只在瀏覽器本機解析，不會上傳。'],
    preset: ['PRESET', '預設頁會轉換 prompt 與常用文字欄位；正則 findRegex / replaceString 會保留原文，避免破壞美化規則。'],
    worldinfo: ['WORLD', '世界書頁適合逐條檢查 comment、key、content 與啟用狀態，再匯出保留原 JSON 結構的版本。'],
    character: ['CARD', '角色卡頁會拆成角色、世界書、正則、酒館助手腳本；安全轉繁會略過正則與 JavaScript。'],
    regex: ['REGEX', '正則頁用來單獨預覽與手動修正腳本；findRegex 會保持原文，避免破壞規則。'],
  };

  function currentPageId() {
    const file = decodeURIComponent(location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (!file || file === 'index.html') return 'index';
    if (file.includes('preset')) return 'preset';
    if (file.includes('worldinfo')) return 'worldinfo';
    if (file.includes('character-card')) return 'character';
    if (file.includes('regex')) return 'regex';
    return 'index';
  }

  function createNav(activeId) {
    const nav = document.createElement('nav');
    nav.className = 'toolbox-nav';
    nav.innerHTML = `
      <div class="toolbox-nav-inner">
        <a class="toolbox-brand" href="index.html" aria-label="回到工具箱首頁">
          <span class="toolbox-brand-copy">
            <strong>SillyTavern 繁中轉換工具箱</strong>
            <span>空藍雲朵風的本機 JSON 工作台</span>
          </span>
        </a>
        <div class="toolbox-links" aria-label="頁面導覽">
          ${pages.map((page) => `
            <a class="toolbox-link ${page.id === activeId ? 'active' : ''}" href="${page.href}">${page.label}</a>
          `).join('')}
        </div>
      </div>
    `;
    return nav;
  }

  function createNote(activeId) {
    const [chip, text] = notes[activeId] || notes.index;
    const note = document.createElement('div');
    note.className = 'toolbox-page-note';
    note.innerHTML = `
      <span><strong>${chip}</strong> ${text}</span>
      <span class="toolbox-note-chip">本機處理</span>
    `;
    return note;
  }

  function createFooter() {
    const footer = document.createElement('footer');
    footer.className = 'toolbox-footer';
    footer.innerHTML = `
      <p>Made with care by Minijinai75</p>
      <p>© 2026 SillyTavern 繁中轉換工具箱</p>
      <p>本工具非官方工具，僅協助繁體中文玩家預覽、編輯與安全轉換 SillyTavern相關使用文件。</p>
    `;
    return footer;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const activeId = currentPageId();
    document.body.classList.add('toolbox-page');
    if (activeId === 'index') document.body.classList.add('toolbox-home');
    if (activeId !== 'index') document.body.prepend(createNote(activeId));
    document.body.prepend(createNav(activeId));
    if (!document.querySelector('.toolbox-footer')) document.body.append(createFooter());
  });
})();
