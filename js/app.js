/**
 * Syntax Tree Editor - Main Application
 * Integrates Parser, Layout, Renderer, UI, Presets and Exporters.
 */

import { TreeNode, TreeParser } from './parser.js';
import { TreeLayout } from './tree-layout.js';
import { TreeRenderer } from './renderer.js';
import { LatexExporter } from './latex-exporter.js';
import { PRESETS } from './presets.js';
import { UIController } from './ui-controller.js';

class SyntaxTreeApp {
  constructor() {
    this.TreeNode = TreeNode;
    this.currentTree = null;
    this.currentMovements = [];
    this.layoutData = null;

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

    this.ui = new UIController(this);

    this.init();
  }

  init() {
    this.populatePresets();
    this.setupEditorListeners();
    this.setupExportListeners();
    this.setupSettingListeners();

    // Load initial tree from URL hash or localStorage or default preset
    const savedTree = this.loadInitialContent();
    const editor = document.getElementById('bracket-editor');
    editor.value = savedTree;
    this.parseAndRender(savedTree);
  }

  loadInitialContent() {
    // 1. URL Hash
    if (window.location.hash && window.location.hash.length > 2) {
      try {
        const decoded = decodeURIComponent(window.location.hash.substring(1));
        if (decoded.startsWith('[') && decoded.endsWith(']')) {
          return decoded;
        }
      } catch (e) {
        console.warn('Failed to parse URL hash', e);
      }
    }

    // 2. LocalStorage
    const saved = localStorage.getItem('syntax_tree_editor_content');
    if (saved && saved.trim()) {
      return saved;
    }

    // 3. Default preset (Wh-Movement to showcase rich features)
    return PRESETS[2].code;
  }

  populatePresets() {
    const select = document.getElementById('preset-select');
    if (!select) return;

    PRESETS.forEach((p, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = p.title;
      select.appendChild(opt);
    });

    select.addEventListener('change', (e) => {
      const idx = parseInt(e.target.value, 10);
      if (!isNaN(idx) && PRESETS[idx]) {
        const code = PRESETS[idx].code;
        document.getElementById('bracket-editor').value = code;
        this.parseAndRender(code);
        this.ui.resetView();
        this.ui.showToast(`プリセット「${PRESETS[idx].title}」を読み込みました`);
      }
    });
  }

  setupEditorListeners() {
    const editor = document.getElementById('bracket-editor');
    let debounceTimer = null;

    editor.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.parseAndRender(editor.value);
        this.saveState(editor.value);
      }, 150);
    });

    // Format code button
    document.getElementById('btn-format-bracket')?.addEventListener('click', () => {
      if (this.currentTree) {
        const formatted = TreeParser.stringify(this.currentTree, true);
        editor.value = formatted;
        this.saveState(formatted);
        this.ui.showToast('コードをインデント整形しました');
      }
    });

    // Clear editor button
    document.getElementById('btn-clear-bracket')?.addEventListener('click', () => {
      if (confirm('エディタの内容をクリアしますか？')) {
        editor.value = '[]';
        this.parseAndRender('[]');
        editor.focus();
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

    // Export LaTeX Modal
    document.getElementById('btn-export-latex')?.addEventListener('click', () => {
      this.openLatexModal();
    });

    // LaTeX Tabs (forest vs tikz-qtree)
    let activeLatexTab = 'forest';
    const tabForest = document.getElementById('tab-latex-forest');
    const tabTikz = document.getElementById('tab-latex-tikz');
    const codeArea = document.getElementById('latex-code-area');

    const updateLatexView = () => {
      if (activeLatexTab === 'forest') {
        tabForest.classList.add('active');
        tabTikz.classList.remove('active');
        codeArea.value = LatexExporter.toForest(this.currentTree, this.currentMovements);
      } else {
        tabForest.classList.remove('active');
        tabTikz.classList.add('active');
        codeArea.value = LatexExporter.toTikzQtree(this.currentTree);
      }
    };

    tabForest?.addEventListener('click', () => {
      activeLatexTab = 'forest';
      updateLatexView();
    });

    tabTikz?.addEventListener('click', () => {
      activeLatexTab = 'tikz';
      updateLatexView();
    });

    // Copy LaTeX code
    document.getElementById('btn-copy-latex')?.addEventListener('click', () => {
      navigator.clipboard.writeText(codeArea.value).then(() => {
        this.ui.showToast('LaTeXコードをクリップボードにコピーしました');
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
      const code = document.getElementById('bracket-editor').value;
      url.hash = encodeURIComponent(code);
      navigator.clipboard.writeText(url.toString()).then(() => {
        this.ui.showToast('共有リンクをクリップボードにコピーしました');
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

    this.layoutAndRender();
  }

  layoutAndRender() {
    if (!this.currentTree) {
      document.getElementById('tree-canvas').innerHTML = this.renderer.renderEmptySVG();
      return;
    }

    // Deep clone tree for layout calculations
    const treeCopy = this.currentTree.clone();
    this.layoutData = this.layout.compute(treeCopy);
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
    document.getElementById('bracket-editor').value = formatted;
    this.saveState(formatted);
    this.parseAndRender(formatted);
  }

  saveState(text) {
    try {
      localStorage.setItem('syntax_tree_editor_content', text);
      window.location.hash = encodeURIComponent(text);
    } catch (e) {
      console.warn('Storage save failed', e);
    }
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
    this.renderToCanvas(transparent, (canvas) => {
      canvas.toBlob((blob) => {
        if (!blob) return;
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
    });
  }

  copyPNGToClipboard() {
    if (!this.layoutData) return;
    if (!navigator.clipboard || !navigator.clipboard.write) {
      this.ui.showToast('お使いのブラウザは画像コピーに対応していません');
      return;
    }

    this.renderToCanvas(false, (canvas) => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const item = new ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([item]).then(() => {
          this.ui.showToast('PNG画像をクリップボードにコピーしました！');
        }).catch(err => {
          console.error(err);
          this.ui.showToast('コピーに失敗しました');
        });
      }, 'image/png');
    });
  }

  renderToCanvas(transparent, callback) {
    const scale = 2; // Retina 2x
    const { width, height } = this.layoutData;
    const svgString = this.renderer.renderToSVG(this.layoutData, this.currentMovements);

    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');

    if (!transparent) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, width * scale, height * scale);
      URL.revokeObjectURL(url);
      callback(canvas);
    };

    img.src = url;
  }
}

// Bootstrap on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.syntaxApp = new SyntaxTreeApp();
});
