# 構文木エディタ / Syntax Tree Editor

[English](#english) | [日本語](#japanese)

---

<a name="english"></a>
## English

A browser-based application for creating, editing, and exporting syntactic trees (syntax trees) in generative linguistics and formal syntax.

- **Web App**: https://okawawaka.github.io/syntax-tree-editor/
- **GitHub Repository**: https://github.com/okawawaka/syntax-tree-editor

---

### Features

#### Input and Rendering
- **Real-Time Bracket Parsing**: Parses bracketed notation (Penn Treebank format) and renders syntax trees dynamically. Displays specific syntax error messages if brackets or labels are malformed.
- **Dual Editors with Two-Way Synchronization**: Provides both an Indented Editor (displaying structural hierarchies) and a Flat 1-Line Editor (compact view). Editing either editor immediately synchronizes the other editor and the canvas in real time. The top tabs allow switching the view mode between Split, Indented only, and Flat only.
- **Theoretical Framework Toggle (S / NP vs. TP / DP)**: Switch between a pedagogical framework (`S / NP`, suited for introductory syntax) and an academic generative framework (`TP / DP / CP / vP`, suited for minimalist research). Preset selections and quick-symbol bars update accordingly. Default mode on load is `S / NP`.
- **Sentence Yield Preview**: Extracts terminal leaf words from the tree structure and displays the resulting surface sentence in real time in the yield bar.
- **Canvas Navigation**: Pan by dragging the canvas; zoom using the mouse wheel or on-screen `+` / `−` buttons.
- **Direct Node Editing**: Click any node on the canvas to edit labels, add children, add siblings, toggle roof triangles, create movement arrows, or delete nodes.
- **Undo / Redo Support**: Fully tracks edit history with `Ctrl+Z` / `Cmd+Z` (Undo) and `Ctrl+Y` / `Ctrl+Shift+Z` / `Cmd+Shift+Z` (Redo), covering typing, node modifications, presets, and formatting.

#### Linguistic Notation Support
- **Roof Triangles**: Abbreviate internal structures using `[^word]` or `[^Category word]`.
- **X-bar Notation**: Supports prime notation (`X'`) and macron notation (`X̄`).
- **Movement Arrows**: Automatically draws smooth curved arrows underneath the tree between nodes sharing identical tags (e.g., `@1`) or movement labels (e.g., `:wh`).
- **Syntactic Features & Subscripts**: Supports feature bundles such as `[+wh]` and subscript notation such as `t_i` and `DP_1`.

#### Export Formats
- **Copy PNG**: Copies high-resolution rendered PNG image directly to the system clipboard.
- **Download PNG**: Exports standard raster PNG or transparent background PNG.
- **Download SVG**: Exports scalable vector graphics (SVG).
- **Code Exports**:
  - **LaTeX (forest)**: Modern linguistic syntax tree package for LaTeX documents.
  - **LaTeX (tikz-qtree)**: Standard TikZ-based syntax tree package.
  - **Mermaid.js**: Diagram code compatible with Markdown renderers (GitHub, Obsidian, Notion).
  - **Hierarchical JSON**: Structured JSON representation for natural language processing pipelines (Python, spaCy, Stanza).
  - **Unicode Text Tree**: Monospace box-drawing character tree for plaintext emails, research notes, and terminal outputs.
- **URL Sharing**: Encodes the current syntax tree structure into a shareable URL hash.

#### Display Adjustments
- Branch style toggle (straight lines vs. curved lines).
- Leaf bottom-alignment toggle (aligning all terminal lexical items to the bottom baseline).
- Leaf italic font toggle.
- Numerical adjustments for font size, level vertical spacing, and horizontal node margin.

#### Design and Internationalization
- **Bilingual Interface (JA / EN)**: Switch between Japanese and English in the header, with automatic browser language detection.
- **Swiss Typographic Style (Zero Corner Radii)**: Strict geometric grid layout with sharp borders (`border-radius: 0`) and zero drop shadows, harmonized with the `ipa-keyboard` and `phonological-rule-editor` suite.

---

### Syntax Notation Specifications

| Feature | Input Example | Description |
| :--- | :--- | :--- |
| Basic Structure | `[S [NP [D The] [N cat]] [VP [V sat]]]` | Hierarchical nested structure with square brackets |
| Word Directly Under Category | `[N cat]` | Places terminal lexical item directly under the category node |
| Roof Triangle (Phrase) | `[^NP a wug]` | Renders an isosceles triangle under `NP` covering `a wug` |
| Roof Triangle (Lexical) | `[NP [^ a wug]]` | Prefixing `^` to words renders an abbreviated triangle |
| X-bar (Prime) | `[N' [N student]]` | Intermediate projection with apostrophe (`'`) |
| X-bar (Macron) | `[N̄ [N student]]` | Intermediate projection with macron character |
| Subscript | `[t_i]`, `[DP_1]` | Text following an underscore (`_`) is rendered as subscript |
| Movement Arrow (Tag) | `[NP@1 Which book] ... [t@1]` | Connects nodes with matching `@index` via a curved bottom arrow |
| Movement Arrow (Label) | `[NP:wh Which book] ... [NP:wh t_i]` | Connects nodes with matching `:label` via a curved bottom arrow |
| Syntactic Features | `[C[+wh] who]` | Features inside brackets are displayed to the right of the label |

---

### Operating Instructions

#### Keyboard Shortcuts
- `?` or `Shift` + `/`: Open / close user guide modal.
- `Esc`: Close open modal / deselect active node.
- `Ctrl` + `Z` / `Cmd` + `Z`: Undo previous change.
- `Ctrl` + `Y` / `Ctrl` + `Shift` + `Z`: Redo change.
- `Delete` or `Backspace`: Delete currently selected node on canvas.

#### Presets
Select standard linguistic structures from the preset dropdown menu:
- Basic Sentence (SVO)
- X-bar Theory (Binary Branching)
- Wh-Movement (Curved Arrow)
- Roof Triangle (Abbreviated Structure)
- Embedded Complement Clause (CP)
- Japanese SOV
- Scrambling
- Academic Minimalist Presets (TP / DP / vP / Head Movement)

---

### File Structure

```text
syntax-tree-editor/
├── index.html            # Main HTML application entry
├── css/
│   └── style.css         # Swiss-style stylesheet
├── js/
│   ├── app.js            # Application bootstrap and event coordination
│   ├── parser.js         # Penn Treebank parser, validator, and serializer
│   ├── tree-layout.js    # Multi-level contour layout algorithm
│   ├── renderer.js       # SVG rendering engine
│   ├── presets.js        # Pedagogical and academic preset definitions
│   ├── latex-exporter.js # LaTeX, Mermaid, JSON, and text tree serializers
│   ├── i18n.js           # Bilingual dictionary and language manager
│   └── ui-controller.js  # Pan, zoom, and interactive node editor UI
├── assets/
│   └── favicon.svg       # Application favicon
├── .github/
│   └── workflows/
│       └── deploy.yml    # GitHub Pages deployment workflow
├── README.md
├── LICENSE
└── .gitignore
```

---

### Running Locally

No external build tools or dependencies are required. Open `index.html` directly in any modern browser, or run a local HTTP server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

---

<a name="japanese"></a>
## 日本語

ブラウザ上で統語論・言語学の構文木（Syntax Tree）を作成・編集・エクスポートできるWebアプリケーションです。

- **Webサイト**: https://okawawaka.github.io/syntax-tree-editor/
- **リポジトリ**: https://github.com/okawawaka/syntax-tree-editor

---

### 機能

#### 入力と描画
- **ブラケット記法によるリアルタイム描画**: Penn Treebank形式の括弧入力に対応し、入力内容を即座に構文木として描画します。構文エラーがある場合はエラー箇所を表示します。
- **デュアルエディタ（インデント / 通常1行）と双方向同期**: 階層構造が分かりやすい「インデント形式」と、コンパクトな「通常形式（1行）」のエディタを備え、どちらを編集しても相互およびキャンバスにリアルタイムで同期されます。上部のタブで表示形式（両方 / インデント / 通常）を切り替え可能です。
- **文法体系の切り替え（S / NP 体系 / TP / DP 体系）**: 授業・入門教育向けの「S / NP 体系」と、現代生成文法研究向けの「TP / DP / CP / vP 体系」をワンクリックで切り替え可能。プリセットおよびクイック記号バーが連動します。初期起動時は S / NP 体系が選択されます。
- **文プレビュー**: 構文木の末端ノードから抽出された文（語彙列）をリアルタイムに上部バーへ表示します。
- **キャンバス操作**: マウスドラッグによる移動、ホイールまたはボタンによる拡大・縮小に対応しています。
- **ノード直接編集**: キャンバス上の各ノードをクリックしてラベルや語彙を直接編集できます。
- **アンドゥ・リドゥ（やり直し）機能**: `Ctrl+Z` / `Cmd+Z`（元に戻す）、`Ctrl+Y` / `Ctrl+Shift+Z` / `Cmd+Shift+Z`（やり直す）による履歴管理に対応しています。テキスト編集、ノード直接変更、整形、プリセット変更を網羅します。

#### 国際化とデザイン
- **日英言語切り替え (JA / EN)**: ヘッダー右上のトグルスイッチから日本語と英語を即座に切り替え可能。ブラウザ設定からの自動判定にも対応しています。
- **正統スイス・スタイル (Zero Corner Radii)**: 角丸を一切使わない幾何学的グリッド（`border-radius: 0`）とシャープな境界線を採用し、`ipa-keyboard` や `phonological-rule-editor` と統一されたデザインとなっています。

#### 統語論記法のサポート
- **三角形省略（Roof）**: `[^語彙]` または `[^範疇 語彙]` による内部構造の省略表記に対応しています。
- **Xバー理論記法**: プライム（`X'`）およびマクロン（`X̄`）の表記に対応しています。
- **移動矢印**: 同一のインデックス（`@1` 等）または移動ラベル（`:wh` 等）を持つノード間を下部経由のベジェ曲線で自動接続します。
- **統語素性・下付き添字**: `[+wh]` などの素性束表記や、`_i` などの下付き添字表記に対応しています。

#### 多彩なエクスポート
- **画像コピー**: レンダリングされた構文木をPNG形式でクリップボードにコピーします。
- **PNG保存**: ラスター画像（PNG）形式でのダウンロードに対応しています。
- **SVG保存**: ベクター画像（SVG）形式でのダウンロードに対応しています。
- **コードエクスポート**:
  - **LaTeX (forest)**: 現代言語学の標準パッケージ形式
  - **LaTeX (tikz-qtree)**: 伝統的なtikzパッケージ形式
  - **Mermaid.js**: Markdown文書（GitHub / Obsidian / Notion）に直接埋め込み可能なダイアグラムコード
  - **JSON**: 自然言語処理（Python / spaCy / Stanza）連携用の階層JSONデータ
  - **Unicodeテキストツリー**: 論文メモやメール、Slack等にそのまま貼れる罫線テキストアート
- **URL共有**: 編集中の構文木データを含む共有用URLを生成します。

#### 表示調整
- 枝の形状切り替え（直線 / 曲線）
- 単語底辺揃え（Leaf bottom-alignment）の切り替え
- 語彙項目のイタリック体表示切り替え
- 文字サイズ、階層の高さ、ノード間隔の数値調整

---

### 記法仕様

| 記法 | 入力例 | 出力・説明 |
| :--- | :--- | :--- |
| 基本構造 | `[S [NP [D The] [N cat]] [VP [V sat]]]` | 角括弧による階層的ネスト構造 |
| 単語直書き | `[N cat]` | 範疇ノード直下に語彙項目を配置 |
| 三角形省略（句） | `[^NP a wug]` | 範疇名（NP）の下に「a wug」の底辺を持つ二等辺三角形を描画 |
| 三角形省略（語彙） | `[NP [^ a wug]]` | 語彙の直前に `^` を付与して三角形を描画 |
| Xバー（プライム） | `[N' [N student]]` | アポストロフィ（`'`）による中間投射表記 |
| Xバー（マクロン） | `[N̄ [N student]]` | マクロン文字による表記 |
| 下付き添字 | `[t_i]`, `[DP_1]` | アンダースコア（`_`）以降を下付き文字として表示 |
| 移動矢印（タグ） | `[NP@1 Which book] ... [t@1]` | 同一のタグ（`@1`）を持つノード間を矢印で接続 |
| 移動矢印（ラベル） | `[NP:wh Which book] ... [NP:wh t_i]` | 同一のラベル（`:wh`）を持つノード間を矢印で接続 |
| 統語素性 | `[C[+wh] who]` | 角括弧内の素性をラベル右側に表示 |

---

### 操作方法

#### ショートカットキー
- `?` または `Shift` + `/`: 操作説明画面の開閉
- `Esc`: モーダル画面の閉鎖、ノード選択の解除
- `Ctrl` + `Z` / `Cmd` + `Z`: 直前の操作を取り消す（元に戻す）
- `Ctrl` + `Y` / `Ctrl` + `Shift` + `Z`: 取り消した操作をやり直す
- `Delete` または `Backspace`: キャンバス上で選択中のノードの削除

#### プリセット
上部のドロップダウンメニューから、基本文（SVO）、Xバー理論、Wh移動、三角形省略、埋め込み節、日本語SOV、かき混ぜ（スクランブリング）などの構文を選択して読み込むことができます。

---

### ファイル構成

```text
syntax-tree-editor/
├── index.html            # メイン画面HTML
├── css/
│   └── style.css         # スタイルシート
├── js/
│   ├── app.js            # アプリケーション初期化・イベント統合
│   ├── parser.js         # Penn Treebank記法パーサー・シリアライザー
│   ├── tree-layout.js    # 木構造レイアウト計算
│   ├── renderer.js       # SVGレンダリングエンジン
│   ├── presets.js        # 例文プリセット定義
│   ├── latex-exporter.js # LaTeX (forest / tikz-qtree) 変換
│   ├── i18n.js           # 多言語翻訳辞書・言語マネージャー
│   └── ui-controller.js  # パン/ズーム・操作UIコントローラー
├── assets/
│   └── favicon.svg       # ファビコン
├── .github/
│   └── workflows/
│       └── deploy.yml    # GitHub Pages自動デプロイワークフロー
├── README.md
├── LICENSE
└── .gitignore
```

---

### 実行環境

外部依存パッケージやビルドツールは不要です。ブラウザで直接 `index.html` を開くか、ローカルHTTPサーバーで実行できます。

```bash
# Pythonを使用する場合
python -m http.server 8000

# Node.jsを使用する場合
npx serve
```

---

## ライセンス / License

[MIT License](LICENSE)
