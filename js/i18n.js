// ==========================================================
// 構文木エディタ (SYNTAX TREE EDITOR) 多言語翻訳辞書 (i18n)
// ==========================================================
window.SYNTAX_I18N = {
  ja: {
    // ページメタ
    pageTitle: "構文木エディタ SYNTAX TREE EDITOR",
    appTitle: "構文木エディタ",
    appSubtitle: "SYNTAX TREE EDITOR",

    // ヘッダー操作
    presetLabel: "プリセット",
    btnShareUrl: "共有",
    btnShareUrlTitle: "URLに状態を含めてコピー",
    btnCopyImage: "画像コピー",
    btnCopyImageTitle: "PNG画像をクリップボードにコピー",
    btnExportPng: "PNG",
    btnExportPngTitle: "高解像度PNG画像をダウンロード",
    btnExportSvg: "SVG",
    btnExportSvgTitle: "ベクターSVG画像をダウンロード",
    btnExportLatex: "エクスポート",
    btnExportLatexTitle: "LaTeX / Mermaid / JSON / テキスト出力",
    grammarModeLabel: "体系:",
    grammarPedagogical: "簡易 (S/NP)",
    grammarPedagogicalTitle: "入門・初級向け S / NP 体系",
    grammarAcademic: "学術 (TP/DP)",
    grammarAcademicTitle: "生成文法・研究向け TP / DP / vP 体系",

    // 左パネル: ヘッダー
    helpBtn: "操作説明 [ ? ]",
    helpBtnTitle: "操作説明を表示 [ ? ]",
    btnFormat: "整形",
    btnFormatTitle: "インデント整形",
    btnClear: "クリア",
    btnClearTitle: "入力をクリア",
    modeTabsLabel: "表示",
    tabSplit: "両方",
    tabSplitTitle: "インデント形式と通常(1行)形式を両方表示",
    tabIndent: "インデント",
    tabIndentTitle: "インデント形式のみ表示",
    tabFlat: "通常 (1行)",
    tabFlatTitle: "通常(1行)形式のみ表示",

    // 左パネル: サブペインラベル
    labelIndented: "インデント形式 (階層表示)",
    labelFlat: "通常形式 (1行ブラケット)",
    sentenceLabel: "文:",

    // クイック記号バー
    symbolBarLabel: "クイック記号入力",

    // キャンバスフローティング
    zoomInTitle: "拡大",
    zoomOutTitle: "縮小",
    zoomResetTitle: "等倍に戻す (100%)",

    // キャンバス設定バー
    labelBranches: "枝の形状:",
    branchStraight: "直線",
    branchCurved: "曲線",
    labelAlignLeaves: "単語底辺揃え",
    labelItalicWords: "単語斜体",
    labelFontSize: "文字サイズ:",
    labelLevelHeight: "階層高:",
    labelSiblingGap: "間隔:",

    // ノード編集ツールバー
    btnEditLabel: "ラベル編集",
    btnAddChild: "+ 子ノード",
    btnAddSibling: "+ 兄弟ノード",
    btnToggleRoof: "△ 屋根",
    btnLinkArrow: "↳ 矢印",
    btnDeleteNode: "削除",

    // トースト通知
    toastCopyImage: "画像をクリップボードにコピーしました",
    toastCopyCode: "コードをクリップボードにコピーしました",
    toastCopyUrl: "共有用URLをクリップボードにコピーしました",
    toastErrorEmpty: "構文木が空です",

    // 操作説明モーダル
    helpModalTitle: "操作説明 (User Guide)",
    helpSecShortcuts: "ショートカットキー",
    helpShortcut1: "操作説明画面の開閉",
    helpShortcut2: "モーダル画面を閉じる / ノード選択の解除",
    helpShortcut3: "キャンバス上で選択中のノードを削除",
    helpSecCanvas: "キャンバス操作",
    helpCanvas1: "キャンバスドラッグ: 表示領域のパン（移動）",
    helpCanvas2: "マウスホイール / 拡大・縮小ボタン: ズーム表示",
    helpCanvas3: "ノードクリック: ノードの選択と直接編集（ラベル編集・ノード追加・削除）",
    helpSecNotation: "基本記法",
    helpThFeature: "機能",
    helpThInput: "入力例",
    helpThOutput: "出力・説明",
    helpRowBase: "基本構造",
    helpRowBaseDesc: "角括弧による階層的ネスト構造",
    helpRowWord: "単語直書き",
    helpRowWordDesc: "範疇ノード直下に語彙項目を配置",
    helpRowRoof1: "三角形省略（句）",
    helpRowRoof1Desc: "範疇名の下に底辺を持つ二等辺三角形を描画",
    helpRowRoof2: "三角形省略（語彙）",
    helpRowRoof2Desc: "語彙の直前に ^ を付与して三角形を描画",
    helpRowPrime: "Xバー（プライム）",
    helpRowPrimeDesc: "アポストロフィによる中間投射表記",
    helpRowMacron: "Xバー（マクロン）",
    helpRowMacronDesc: "マクロン文字による中間投射表記",
    helpRowSub: "下付き添字",
    helpRowSubDesc: "アンダースコア以降を下付き文字として表示",
    helpRowMove: "移動矢印",
    helpRowMoveDesc: "同一タグ（@1等）またはラベルを持つノード間を曲線矢印で接続",
    helpSecExport: "エクスポート",
    helpExport1: "画像コピー: PNG画像をクリップボードに直接コピー",
    helpExport2: "PNG / SVG: 画像ファイルとしてローカルへ保存",
    helpExport3: "エクスポート: LaTeX（forest / tikz-qtree）、Mermaid、JSON、Unicodeテキストを出力",
    helpExport4: "共有: 編集中のデータを埋め込んだURLをクリップボードにコピー",
    helpSecGithub: "リポジトリ案内",
    helpGithubDesc: "バグ報告、機能要望、ソースコードの確認は GitHub リポジトリをご参照ください。",
    helpGithubLink: "GitHub: okawawaka/syntax-tree-editor",
    btnClose: "閉じる",

    // コードエクスポートモーダル
    exportModalTitle: "構文木コードエクスポート",
    tabForest: "LaTeX (forest)",
    tabTikz: "LaTeX (tikz-qtree)",
    tabMermaid: "Mermaid",
    tabJson: "JSON",
    tabUnicode: "テキストツリー",
    btnCopyCode: "コードをコピー"
  },

  en: {
    // Page Meta
    pageTitle: "Syntax Tree Editor - Linguistic Tree Generator",
    appTitle: "Syntax Tree Editor",
    appSubtitle: "LINGUISTICS TREE GENERATOR",

    // Header Controls
    presetLabel: "PRESETS",
    btnShareUrl: "SHARE",
    btnShareUrlTitle: "Copy shareable URL to clipboard",
    btnCopyImage: "COPY IMAGE",
    btnCopyImageTitle: "Copy PNG image to clipboard",
    btnExportPng: "PNG",
    btnExportPngTitle: "Download high-resolution PNG image",
    btnExportSvg: "SVG",
    btnExportSvgTitle: "Download vector SVG image",
    btnExportLatex: "EXPORT",
    btnExportLatexTitle: "Export LaTeX, Mermaid, JSON, and Text",
    grammarModeLabel: "THEORY:",
    grammarPedagogical: "Basic (S/NP)",
    grammarPedagogicalTitle: "Pedagogical S / NP framework",
    grammarAcademic: "Academic (TP/DP)",
    grammarAcademicTitle: "Generative TP / DP / vP framework",

    // Left Panel: Header
    helpBtn: "HELP [ ? ]",
    helpBtnTitle: "Show user guide [ ? ]",
    btnFormat: "FORMAT",
    btnFormatTitle: "Format with indentation",
    btnClear: "CLEAR",
    btnClearTitle: "Clear input",
    modeTabsLabel: "VIEW",
    tabSplit: "Both",
    tabSplitTitle: "Show both indented and flat format",
    tabIndent: "Indented",
    tabIndentTitle: "Show indented format only",
    tabFlat: "Flat (1-line)",
    tabFlatTitle: "Show flat 1-line format only",

    // Left Panel: Subpanes
    labelIndented: "Indented View",
    labelFlat: "Flat 1-Line View",
    sentenceLabel: "SENTENCE:",

    // Quick Symbol Bar
    symbolBarLabel: "QUICK SYMBOLS",

    // Canvas Floating
    zoomInTitle: "Zoom In",
    zoomOutTitle: "Zoom Out",
    zoomResetTitle: "Reset Zoom (100%)",

    // Canvas Settings Bar
    labelBranches: "Branches:",
    branchStraight: "Straight",
    branchCurved: "Curved",
    labelAlignLeaves: "Align Leaves",
    labelItalicWords: "Italic Words",
    labelFontSize: "Font Size:",
    labelLevelHeight: "Level Height:",
    labelSiblingGap: "Gap:",

    // Node Edit Toolbar
    btnEditLabel: "Edit Label",
    btnAddChild: "+ Child",
    btnAddSibling: "+ Sibling",
    btnToggleRoof: "△ Roof",
    btnLinkArrow: "↳ Arrow",
    btnDeleteNode: "Delete",

    // Toast Notifications
    toastCopyImage: "Image copied to clipboard",
    toastCopyCode: "Code copied to clipboard",
    toastCopyUrl: "Share URL copied to clipboard",
    toastErrorEmpty: "Syntax tree is empty",

    // Help Modal
    helpModalTitle: "User Guide",
    helpSecShortcuts: "Keyboard Shortcuts",
    helpShortcut1: "Open / Close Help modal",
    helpShortcut2: "Close modal / Deselect node",
    helpShortcut3: "Delete selected node on canvas",
    helpSecCanvas: "Canvas Interaction",
    helpCanvas1: "Drag canvas: Pan view",
    helpCanvas2: "Mouse wheel / Zoom buttons: Zoom in & out",
    helpCanvas3: "Click node: Select node and edit directly (label, add child/sibling, delete)",
    helpSecNotation: "Notation Syntax",
    helpThFeature: "Feature",
    helpThInput: "Syntax Example",
    helpThOutput: "Output & Description",
    helpRowBase: "Basic Structure",
    helpRowBaseDesc: "Hierarchical nested bracket notation",
    helpRowWord: "Inline Word",
    helpRowWordDesc: "Place lexical item directly under category",
    helpRowRoof1: "Triangle (Phrase)",
    helpRowRoof1Desc: "Render roof triangle under category",
    helpRowRoof2: "Triangle (Word)",
    helpRowRoof2Desc: "Prepend ^ before word to render roof",
    helpRowPrime: "X-bar (Prime)",
    helpRowPrimeDesc: "Apostrophe for intermediate projection",
    helpRowMacron: "X-bar (Macron)",
    helpRowMacronDesc: "Macron character for intermediate projection",
    helpRowSub: "Subscript",
    helpRowSubDesc: "Underscore renders subsequent text as subscript",
    helpRowMove: "Movement Arrow",
    helpRowMoveDesc: "Connect nodes with identical tags (@1) or labels via curved arrow",
    helpSecExport: "Export",
    helpExport1: "Copy Image: Copy PNG image directly to clipboard",
    helpExport2: "PNG / SVG: Download image files to local storage",
    helpExport3: "Export: Output LaTeX (forest / tikz), Mermaid, JSON, and Unicode text",
    helpExport4: "Share: Copy shareable URL with embedded tree data to clipboard",
    helpSecGithub: "Repository",
    helpGithubDesc: "For bug reports, feature requests, and source code, visit our GitHub repository.",
    helpGithubLink: "GitHub: okawawaka/syntax-tree-editor",
    btnClose: "Close",

    // Code Export Modal
    exportModalTitle: "Export Syntax Tree Code",
    tabForest: "LaTeX (forest)",
    tabTikz: "LaTeX (tikz-qtree)",
    tabMermaid: "Mermaid",
    tabJson: "JSON",
    tabUnicode: "Text Tree",
    btnCopyCode: "Copy Code"
  }
};

// ==========================================================
// i18n Controller
// ==========================================================
class I18nManager {
  constructor() {
    this.currentLang = this.getInitialLanguage();
  }

  getInitialLanguage() {
    const saved = localStorage.getItem('syntax_tree_editor_lang');
    if (saved && (saved === 'ja' || saved === 'en')) {
      return saved;
    }
    const navLang = (navigator.language || (navigator.languages && navigator.languages[0]) || '').toLowerCase();
    return navLang.startsWith('ja') ? 'ja' : 'en';
  }

  t(key) {
    const dict = window.SYNTAX_I18N[this.currentLang] || window.SYNTAX_I18N.ja;
    return dict[key] !== undefined ? dict[key] : key;
  }

  setLanguage(lang) {
    if (!window.SYNTAX_I18N[lang]) return;
    this.currentLang = lang;
    document.documentElement.lang = lang;
    localStorage.setItem('syntax_tree_editor_lang', lang);

    const dict = window.SYNTAX_I18N[lang];

    if (dict.pageTitle) {
      document.title = dict.pageTitle;
    }

    // Text replacement via data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        if (dict[key].includes('<') && dict[key].includes('>')) {
          el.innerHTML = dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    });

    // Title attribute replacement via data-i18n-title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (dict[key] !== undefined) {
        el.setAttribute('title', dict[key]);
      }
    });

    // Update active switch buttons
    const btnJa = document.getElementById('lang-ja');
    const btnEn = document.getElementById('lang-en');
    if (btnJa && btnEn) {
      if (lang === 'ja') {
        btnJa.classList.add('active');
        btnEn.classList.remove('active');
      } else {
        btnEn.classList.add('active');
        btnJa.classList.remove('active');
      }
    }

    // Dispatch language change event for other modules
    window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
  }

  init() {
    this.setLanguage(this.currentLang);

    const btnJa = document.getElementById('lang-ja');
    const btnEn = document.getElementById('lang-en');
    if (btnJa) btnJa.addEventListener('click', () => this.setLanguage('ja'));
    if (btnEn) btnEn.addEventListener('click', () => this.setLanguage('en'));
  }
}

window.i18n = new I18nManager();
