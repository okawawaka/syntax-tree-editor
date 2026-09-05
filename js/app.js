/**
 * Syntax Tree Editor - Main Application
 * Integrates Parser, Layout, Renderer, UI, Presets and Exporters.
 */

import { TreeNode, TreeParser } from './parser.js?v=20260905_3';
import { TreeLayout } from './tree-layout.js?v=20260905_3';
import { TreeRenderer } from './renderer.js?v=20260905_3';
import { LatexExporter } from './latex-exporter.js?v=20260905_3';
import { PRESETS_PEDAGOGICAL, PRESETS_ACADEMIC } from './presets.js?v=20260905_3';
import { UIController } from './ui-controller.js?v=20260905_3';

class SyntaxTreeApp {
  constructor() {
    this.TreeNode = TreeNode;
    this.currentTree = null;
    this.currentMovements = [];
    this.layoutData = null;
    this.isSyncing = false;
    this.grammarMode = 'pedagogical';

    this.layout = new TreeLayout({
      fontSize: 16,
      levelHeight: 64,
      nodeMarginX: 28
    });

    this.renderer = new TreeRenderer({
      branchType: 'straight',
      fontSize: 16,
      leafItalic: true
    });

    this.editorIndented = document.getElementById('bracket-editor-indented');
    this.editorFlat = document.getElementById('bracket-editor-flat');
    this.sentenceEl = document.getElementById('sentence-text');
    this.activeEditor = this.editorIndented;

    this.ui = new UIController(this);

    this.init();

    // Automatic layout recalculation when Web Fonts (Inter / Noto Sans JP) finish loading
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        this.layoutAndRender();
      });
      document.fonts.addEventListener('loadingdone', () => {
        this.layoutAndRender();
      });
    }
  }

  init() {
    if (window.i18n) window.i18n.init();
    try {
      this.grammarMode = localStorage.getItem('syntax_tree_editor_grammar_mode') || 'pedagogical';
    } catch (e) {
      this.grammarMode = 'pedagogical';
    }
    this.setupGrammarModeListeners();
    window.addEventListener('languagechange', () => {
      this.populatePresets();
    });
    this.populatePresets();
    this.setupViewModeListeners();
    this.setupEditorListeners();
    this.setupExportListeners();
    this.setupSettingListeners();

    // Initial preset: Default to Basic SVO (Preset 0) unless explicitly shared via ?share=1#...
    const initialCode = this.loadInitialContent();
    const { tree } = TreeParser.parse(initialCode);
    const indented = tree ? TreeParser.stringify(tree, true) : initialCode;
    const flat = tree ? TreeParser.stringify(tree, false) : initialCode;

    if (this.editorIndented) this.editorIndented.value = indented;
    if (this.editorFlat) this.editorFlat.value = flat;

    this.parseAndRender(indented);
    this.syncPresetSelect(initialCode);
    if (tree) this.updateSentence(tree);

    // Clean up residual hash from address bar so page reloads always stay clean
    if (window.location.hash && !window.location.search.includes('share=')) {
      try {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch (e) {}
    }
  }

  loadInitialContent() {
    // Only restore from hash if user arrived via an explicit share link (?share=1#...)
    if (window.location.search.includes('share=') && window.location.hash && window.location.hash.length > 2) {
      try {
        const decoded = decodeURIComponent(window.location.hash.substring(1));
        if (decoded.startsWith('[') && decoded.endsWith(']')) {
          return decoded;
        }
      } catch (e) {
        console.warn('Failed to parse share URL hash', e);
      }
    }

    // Default: Always Basic SVO (Preset 0)
    const presets = this.grammarMode === 'academic' ? PRESETS_ACADEMIC : PRESETS_PEDAGOGICAL;
    return presets[0].code;
  }



  setupViewModeListeners() {
    const container = document.getElementById('editor-panes-container');
    const tabSplit = document.getElementById('tab-mode-split');
    const tabIndent = document.getElementById('tab-mode-indent');
    const tabFlat = document.getElementById('tab-mode-flat');

    const setMode = (mode) => {
      if (!container) return;
      container.classList.remove('mode-split', 'mode-indent', 'mode-flat');
      container.classList.add(`mode-${mode}`);

      [tabSplit, tabIndent, tabFlat].forEach(t => t?.classList.remove('active'));
      if (mode === 'split') tabSplit?.classList.add('active');
      if (mode === 'indent') tabIndent?.classList.add('active');
      if (mode === 'flat') tabFlat?.classList.add('active');

      try {
        localStorage.setItem('syntax_tree_editor_view_mode', mode);
      } catch (e) {}
    };

    tabSplit?.addEventListener('click', () => setMode('split'));
    tabIndent?.addEventListener('click', () => setMode('indent'));
    tabFlat?.addEventListener('click', () => setMode('flat'));

    try {
      const savedMode = localStorage.getItem('syntax_tree_editor_view_mode') || 'split';
      setMode(savedMode);
    } catch (e) {
      setMode('split');
    }
  }

  getCurrentPresets() {
    return this.grammarMode === 'academic' ? PRESETS_ACADEMIC : PRESETS_PEDAGOGICAL;
  }

  setupGrammarModeListeners() {
    const btnPed = document.getElementById('grammar-pedagogical');
    const btnAcad = document.getElementById('grammar-academic');

    const updateButtons = () => {
      if (this.grammarMode === 'academic') {
        btnAcad?.classList.add('active');
        btnPed?.classList.remove('active');
      } else {
        btnPed?.classList.add('active');
        btnAcad?.classList.remove('active');
      }

      // Toggle academic quick symbol buttons in symbol bar
      document.querySelectorAll('.quick-sym-btn.sym-acad').forEach(btn => {
        btn.style.display = this.grammarMode === 'academic' ? 'inline-flex' : 'none';
      });
    };

    updateButtons();

    const switchMode = (mode) => {
      if (this.grammarMode === mode) return;
      this.grammarMode = mode;
      try {
        localStorage.setItem('syntax_tree_editor_grammar_mode', mode);
      } catch (e) {}
      updateButtons();
      this.populatePresets();

      // Load first preset of newly selected framework
      const presets = this.getCurrentPresets();
      if (presets.length > 0) {
        const code = presets[0].code;
        const { tree } = TreeParser.parse(code);
        const indented = tree ? TreeParser.stringify(tree, true) : code;
        const flat = tree ? TreeParser.stringify(tree, false) : code;

        this.isSyncing = true;
        if (this.editorIndented) this.editorIndented.value = indented;
        if (this.editorFlat) this.editorFlat.value = flat;
        this.isSyncing = false;

        this.parseAndRender(indented);
        if (tree) this.updateSentence(tree);
        this.ui.resetView();

        const isEn = window.i18n && window.i18n.currentLang === 'en';
        const title = isEn ? (presets[0].titleEn || presets[0].titleJa) : presets[0].titleJa;
        const msg = isEn ? `Loaded preset "${title}"` : `プリセット「${title}」を読み込みました`;
        this.ui.showToast(msg);
      }
    };

    btnPed?.addEventListener('click', () => switchMode('pedagogical'));
    btnAcad?.addEventListener('click', () => switchMode('academic'));
  }

  populatePresets() {
    const select = document.getElementById('preset-select');
    if (!select) return;

    const presets = this.getCurrentPresets();
    const isEn = window.i18n && window.i18n.currentLang === 'en';

    select.innerHTML = '';
    presets.forEach((p, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = isEn ? (p.titleEn || p.titleJa) : p.titleJa;
      select.appendChild(opt);
    });

    select.value = '0';

    // Remove existing change listener by replacing element clone
    const newSelect = select.cloneNode(true);
    select.parentNode.replaceChild(newSelect, select);

    newSelect.addEventListener('change', (e) => {
      const idx = parseInt(e.target.value, 10);
      const currentList = this.getCurrentPresets();
      if (!isNaN(idx) && currentList[idx]) {
        const code = currentList[idx].code;
        const { tree } = TreeParser.parse(code);
        const indented = tree ? TreeParser.stringify(tree, true) : code;
        const flat = tree ? TreeParser.stringify(tree, false) : code;

        this.isSyncing = true;
        if (this.editorIndented) this.editorIndented.value = indented;
        if (this.editorFlat) this.editorFlat.value = flat;
        this.isSyncing = false;

        this.parseAndRender(indented);
        if (tree) this.updateSentence(tree);
        this.ui.resetView();

        const title = isEn ? (currentList[idx].titleEn || currentList[idx].titleJa) : currentList[idx].titleJa;
        const msg = isEn ? `Loaded preset "${title}"` : `プリセット「${title}」を読み込みました`;
        this.ui.showToast(msg);
      }
    });
  }

  syncPresetSelect(currentCode) {
    const select = document.getElementById('preset-select');
    if (!select) return;

    const trimmed = (currentCode || '').trim().replace(/\s+/g, ' ');
    const matchedIdx = PRESETS.findIndex(p => p.code.trim().replace(/\s+/g, ' ') === trimmed);

    if (matchedIdx !== -1) {
      select.value = String(matchedIdx);
    }
  }

  setupEditorListeners() {
    let debounceTimer = null;

    // Track active editor
    this.editorIndented?.addEventListener('focus', () => {
      this.activeEditor = this.editorIndented;
    });
    this.editorFlat?.addEventListener('focus', () => {
      this.activeEditor = this.editorFlat;
    });

    // Indented text editor input
    this.editorIndented?.addEventListener('input', () => {
      this.activeEditor = this.editorIndented;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (this.isSyncing) return;
        const code = this.editorIndented.value;
        this.parseAndRender(code);
        this.syncPresetSelect(code);
        this.saveState(code);

        // Instantly reflect changes in the flat (normal) editor
        if (this.currentTree && this.editorFlat) {
          this.isSyncing = true;
          this.editorFlat.value = TreeParser.stringify(this.currentTree, false);
          this.updateSentence(this.currentTree);
          this.isSyncing = false;
        }
      }, 100);
    });

    // Normal (Flat 1-line) text editor input
    this.editorFlat?.addEventListener('input', () => {
      this.activeEditor = this.editorFlat;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (this.isSyncing) return;
        const code = this.editorFlat.value;
        this.parseAndRender(code);
        this.syncPresetSelect(code);
        this.saveState(code);

        // Instantly reflect changes in the indented editor
        if (this.currentTree && this.editorIndented) {
          this.isSyncing = true;
          this.editorIndented.value = TreeParser.stringify(this.currentTree, true);
          this.updateSentence(this.currentTree);
          this.isSyncing = false;
        }
      }, 100);
    });

    // Format code button: Formats both indented and flat representations
    document.getElementById('btn-format-bracket')?.addEventListener('click', () => {
      if (this.currentTree) {
        const formatted = TreeParser.stringify(this.currentTree, true);
        const flat = TreeParser.stringify(this.currentTree, false);
        if (this.editorIndented) this.editorIndented.value = formatted;
        if (this.editorFlat) this.editorFlat.value = flat;
        this.updateSentence(this.currentTree);
        this.saveState(formatted);
        this.ui.showToast('コードをインデント整形しました');
      }
    });

    // Clear editor button: Clears both editors
    document.getElementById('btn-clear-bracket')?.addEventListener('click', () => {
      if (confirm('エディタの内容をクリアしますか？')) {
        if (this.editorIndented) this.editorIndented.value = '[]';
        if (this.editorFlat) this.editorFlat.value = '[]';
        this.parseAndRender('[]');
        if (this.sentenceEl) this.sentenceEl.textContent = '';
        (this.activeEditor || this.editorIndented)?.focus();
      }
    });
  }

  setupSettingListeners() {
    // Branch style: straight vs curved
    const branchStyleRadios = document.querySelectorAll('input[name="branch-style"]');
    branchStyleRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.renderer.branchType = e.target.value;
        this.render();
      });
    });

    // Leaf bottom-alignment toggle (Align all terminal words to same horizontal baseline)
    const alignLeavesToggle = document.getElementById('toggle-align-leaves');
    if (alignLeavesToggle) {
      alignLeavesToggle.addEventListener('change', (e) => {
        this.layout.alignLeaves = e.target.checked;
        this.layoutAndRender();
        this.ui.showToast(e.target.checked ? '単語を最下段に整列しました' : '階層に応じた配置に戻しました');
      });
    }

    // Leaf font style italic toggle
    const italicToggle = document.getElementById('toggle-leaf-italic');
    if (italicToggle) {
      italicToggle.addEventListener('change', (e) => {
        this.renderer.leafItalic = e.target.checked;
        this.render();
      });
    }

    // Font size adjustment
    const fontSizeInput = document.getElementById('setting-font-size');
    if (fontSizeInput) {
      fontSizeInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val)) {
          this.layout.fontSize = val;
          this.renderer.fontSize = val;
          document.getElementById('font-size-val').textContent = `${val}px`;
          this.layoutAndRender();
        }
      });
    }

    // Level height slider
    const levelHeightInput = document.getElementById('setting-level-height');
    if (levelHeightInput) {
      levelHeightInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val)) {
          this.layout.levelHeight = val;
          document.getElementById('level-height-val').textContent = `${val}px`;
          this.layoutAndRender();
        }
      });
    }

    // Node margin slider
    const nodeMarginInput = document.getElementById('setting-node-margin');
    if (nodeMarginInput) {
      nodeMarginInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val)) {
          this.layout.nodeMarginX = val;
          document.getElementById('node-margin-val').textContent = `${val}px`;
          this.layoutAndRender();
        }
      });
    }
  }

  setupExportListeners() {
    // Download SVG
    document.getElementById('btn-export-svg')?.addEventListener('click', () => {
      this.exportSVG();
    });

    // Download PNG
    document.getElementById('btn-export-png')?.addEventListener('click', () => {
      this.exportPNG(false);
    });

    // Download Transparent PNG
    document.getElementById('btn-export-png-transparent')?.addEventListener('click', () => {
      this.exportPNG(true);
    });

    // Copy PNG to Clipboard
    document.getElementById('btn-copy-png')?.addEventListener('click', () => {
      this.copyPNGToClipboard();
    });

    // Export Code Modal (LaTeX, Mermaid, JSON, Unicode)
    document.getElementById('btn-export-latex')?.addEventListener('click', () => {
      this.openExportModal();
    });

    let activeExportTab = 'forest';
    const tabForest = document.getElementById('tab-latex-forest');
    const tabTikz = document.getElementById('tab-latex-tikz');
    const tabMermaid = document.getElementById('tab-export-mermaid');
    const tabJson = document.getElementById('tab-export-json');
    const tabUnicode = document.getElementById('tab-export-unicode');
    const codeArea = document.getElementById('latex-code-area');

    const updateExportView = () => {
      const allTabs = [tabForest, tabTikz, tabMermaid, tabJson, tabUnicode];
      allTabs.forEach(t => t?.classList.remove('active'));

      if (activeExportTab === 'forest') {
        tabForest?.classList.add('active');
        codeArea.value = LatexExporter.toForest(this.currentTree, this.currentMovements);
      } else if (activeExportTab === 'tikz') {
        tabTikz?.classList.add('active');
        codeArea.value = LatexExporter.toTikzQtree(this.currentTree);
      } else if (activeExportTab === 'mermaid') {
        tabMermaid?.classList.add('active');
        codeArea.value = TreeParser.toMermaid(this.currentTree);
      } else if (activeExportTab === 'json') {
        tabJson?.classList.add('active');
        codeArea.value = TreeParser.toJSON(this.currentTree);
      } else if (activeExportTab === 'unicode') {
        tabUnicode?.classList.add('active');
        codeArea.value = TreeParser.toUnicodeTree(this.currentTree);
      }
    };

    tabForest?.addEventListener('click', () => { activeExportTab = 'forest'; updateExportView(); });
    tabTikz?.addEventListener('click', () => { activeExportTab = 'tikz'; updateExportView(); });
    tabMermaid?.addEventListener('click', () => { activeExportTab = 'mermaid'; updateExportView(); });
    tabJson?.addEventListener('click', () => { activeExportTab = 'json'; updateExportView(); });
    tabUnicode?.addEventListener('click', () => { activeExportTab = 'unicode'; updateExportView(); });

    // Copy exported code
    document.getElementById('btn-copy-latex')?.addEventListener('click', () => {
      navigator.clipboard.writeText(codeArea.value).then(() => {
        const msg = window.i18n ? window.i18n.t('toastCopyCode') : 'コードをクリップボードにコピーしました';
        this.ui.showToast(msg);
      });
    });

    // Close modal
    document.querySelectorAll('.modal-close, .modal-overlay').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (e.target === btn || e.target.closest('.modal-close')) {
          this.ui.closeModals();
        }
      });
    });

    // Share URL
    document.getElementById('btn-share-url')?.addEventListener('click', () => {
      const url = new URL(window.location.href);
      const code = this.editorFlat?.value || this.editorIndented?.value || '';
      url.hash = encodeURIComponent(code);
      navigator.clipboard.writeText(url.toString()).then(() => {
        const msg = window.i18n ? window.i18n.t('toastCopyUrl') : '共有リンクをクリップボードにコピーしました';
        this.ui.showToast(msg);
      });
    });
  }

  parseAndRender(code) {
    const { tree, error, movements } = TreeParser.parse(code);

    if (error) {
      this.ui.showError(error);
      return;
    }

    this.ui.clearError();
    this.currentTree = tree;
    this.currentMovements = movements;

    if (tree) {
      this.updateSentence(tree);
    }

    this.layoutAndRender();
  }

  updateSentence(tree) {
    if (this.sentenceEl && tree) {
      this.sentenceEl.textContent = TreeParser.getSentence(tree);
    }
  }

  layoutAndRender() {
    if (!this.currentTree) {
      document.getElementById('tree-canvas').innerHTML = this.renderer.renderEmptySVG();
      return;
    }

    // Deep clone tree for layout calculations
    const treeCopy = this.currentTree.clone();
    this.layoutData = this.layout.compute(treeCopy, this.currentMovements);
    this.render();
  }

  render() {
    if (!this.layoutData) return;
    const svgString = this.renderer.renderToSVG(this.layoutData, this.currentMovements);
    document.getElementById('tree-canvas').innerHTML = svgString;
  }

  syncTreeToText() {
    if (!this.currentTree) return;
    const formatted = TreeParser.stringify(this.currentTree, true);
    const flat = TreeParser.stringify(this.currentTree, false);

    this.isSyncing = true;
    if (this.editorIndented) this.editorIndented.value = formatted;
    if (this.editorFlat) this.editorFlat.value = flat;
    this.isSyncing = false;

    this.updateSentence(this.currentTree);
    this.saveState(formatted);
    this.layoutAndRender();
  }

  saveState(text) {
    try {
      localStorage.setItem('syntax_tree_editor_content', text);
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  }

  openExportModal() {
    this.openLatexModal();
  }

  openLatexModal() {
    if (!this.currentTree) {
      this.ui.showToast('構文木がありません');
      return;
    }
    const modal = document.getElementById('latex-modal');
    modal.classList.add('visible');
    const codeArea = document.getElementById('latex-code-area');
    codeArea.value = LatexExporter.toForest(this.currentTree, this.currentMovements);
  }

  exportSVG() {
    if (!this.layoutData) return;
    const svgString = this.renderer.renderToSVG(this.layoutData, this.currentMovements);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'syntax-tree.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.ui.showToast('SVGをダウンロードしました');
  }

  exportPNG(transparent = false) {
    if (!this.layoutData) return;
    this.ui.showToast('PNGを生成中...');
    this.renderToCanvas(transparent, (canvas) => {
      try {
        canvas.toBlob((blob) => {
          if (!blob) {
            this.ui.showToast('PNG生成に失敗しました');
            return;
          }
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = transparent ? 'syntax-tree-transparent.png' : 'syntax-tree.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          this.ui.showToast('PNGをダウンロードしました');
        }, 'image/png');
      } catch (err) {
        console.error('Export PNG failed:', err);
        this.ui.showToast('PNGダウンロードに失敗しました');
      }
    }, (err) => {
      console.error('Canvas render failed:', err);
      this.ui.showToast('画像レンダリングに失敗しました');
    });
  }

  copyPNGToClipboard() {
    if (!this.layoutData) return;
    if (!navigator.clipboard || !navigator.clipboard.write) {
      this.ui.showToast('お使いのブラウザは画像クリップボードコピーに対応していません');
      return;
    }

    // Wrap canvas rendering into a Promise so ClipboardItem is created synchronously
    // within the user activation context
    const blobPromise = new Promise((resolve, reject) => {
      this.renderToCanvas(false, (canvas) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob returned null'));
        }, 'image/png');
      }, (err) => reject(err));
    });

    try {
      const item = new ClipboardItem({ 'image/png': blobPromise });
      navigator.clipboard.write([item]).then(() => {
        this.ui.showToast('PNG画像をクリップボードにコピーしました！');
      }).catch(err => {
        console.warn('Clipboard write failed, downloading PNG as fallback...', err);
        this.exportPNG(false);
        this.ui.showToast('クリップボード制限のため、PNG画像を保存しました');
      });
    } catch (err) {
      console.warn('Direct ClipboardItem promise failed, attempting fallback...', err);
      blobPromise.then(blob => {
        const item = new ClipboardItem({ 'image/png': blob });
        return navigator.clipboard.write([item]);
      }).then(() => {
        this.ui.showToast('PNG画像をクリップボードにコピーしました！');
      }).catch(e => {
        console.warn('Fallback copy failed, downloading PNG...', e);
        this.exportPNG(false);
        this.ui.showToast('PNG画像をダウンロードしました');
      });
    }
  }

  renderToCanvas(transparent, callback, errorCallback) {
    if (!this.layoutData) {
      if (errorCallback) errorCallback(new Error('No layout data'));
      return;
    }

    const scale = 2; // Retina 2x
    const { width, height } = this.layoutData;
    const svgString = this.renderer.renderToSVG(this.layoutData, this.currentMovements);

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(Math.ceil(width * scale), 100);
    canvas.height = Math.max(Math.ceil(height * scale), 100);
    const ctx = canvas.getContext('2d');

    if (!transparent) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const img = new Image();

    img.onload = () => {
      try {
        ctx.drawImage(img, 0, 0, width * scale, height * scale);
        callback(canvas);
      } catch (err) {
        console.error('Canvas drawImage error:', err);
        if (errorCallback) errorCallback(err);
      }
    };

    img.onerror = (e) => {
      console.warn('Base64 SVG load failed, attempting UTF-8 data URI fallback...', e);
      const fallbackImg = new Image();
      fallbackImg.onload = () => {
        try {
          ctx.drawImage(fallbackImg, 0, 0, width * scale, height * scale);
          callback(canvas);
        } catch (err) {
          if (errorCallback) errorCallback(err);
        }
      };
      fallbackImg.onerror = (err) => {
        console.error('All SVG to Image conversions failed:', err);
        if (errorCallback) errorCallback(err);
      };
      fallbackImg.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgString);
    };

    // Use safe base64 Data URI for maximum SVG rasterization compatibility
    try {
      const base64 = btoa(unescape(encodeURIComponent(svgString)));
      img.src = 'data:image/svg+xml;base64,' + base64;
    } catch (e) {
      img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgString);
    }
  }
}

// Bootstrap on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.syntaxApp = new SyntaxTreeApp();
});
