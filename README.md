# 言語学 構文木エディタ (Linguistic Syntax Tree Editor)

[![GitHub Pages Deployment](https://github.com/okawawaka/syntax-tree-editor/actions/workflows/deploy.yml/badge.svg)](https://github.com/okawawaka/syntax-tree-editor/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

現代的で合理的な**スイス・スタイル（International Typographic Style）**による、言語学・統語論（Syntax）・生成文法研究向けの高機能Web構文木エディタです。  
大学の講義、レポート・卒業論文・学術論文の執筆、スライド作成に最適化されています。

外部ソフトウェアのインストールやビルドは一切不要。ブラウザを開くだけで即座に動作します。

🔗 **公開URL (GitHub Pages)**: [https://okawawaka.github.io/syntax-tree-editor/](https://okawawaka.github.io/syntax-tree-editor/)

---

## 🌟 主な機能と特徴

### 1. 直観的な操作と双方向リアルタイム同期
- **ブラケット記法（Penn Treebank形式）のリアルタイム描画**:
  入力中のカッコの対応を即座に解析し、構文木を瞬時にプレビュー。閉じカッコ忘れなどのシンタックスエラーを行番号つきでハイライト。
- **キャンバス上のダイレクトGUI編集**:
  木構造のノードをクリックしてラベルを直接編集したり、子ノード追加・兄弟ノード追加・ノード削除をワンクリックで実行可能。
  GUI上での操作はテキストエリアのブラケット記法へ自動逆同期されます。

### 2. 言語学特有の高度な表記を完全網羅
- **三角形省略表記（Triangle / Roof）**:
  内部構造を展開せず句（phrase）として一括表記する言語学の必須表現（`[^ phrase]`）。
- **Xバー理論（X-bar Theory）記法**:
  `X'`, `X''`（プライム）、`X̄`（マクロン付き文字）の入力支援と美しいタイポグラフィ描画。
- **移動の矢印（Movement Arrows / Transformations）**:
  Wh移動、主語繰り上がり、受動化、日本語のかき混ぜ（スクランブリング）など、基底位置の痕跡（`t_i`）と着地点を結ぶなめらかな曲線矢印（破線・赤色アクセント・移動ラベル付き）を描画。
- **下付き添字 & 統語素性**:
  `DP_1`, `t_i` などの下付き文字や、`[+wh]`, `[-past]` などの素性束の自動フォーマット。

### 3. 多彩で実用的なエクスポート
- **高解像度 PNG ダウンロード**: 論文やスライドにそのまま貼れるクリアなPNG（2x Retina解像度）。
- **ベクター SVG ダウンロード**: 拡大しても粗くならない無限解像度ベクターファイル。WordやIllustratorにも対応。
- **クリップボードへ画像直接コピー**: ワンクリックでクリップボードにPNGをコピーし、WordやGoogle Docsに `Ctrl+V` で即座にペースト。
- **LaTeX コード自動生成**:
  - `forest` パッケージコード（現代言語学のデファクトスタンダード）
  - `tikz-qtree` パッケージコード
- **URL共有 / 状態の自動保存**:
  作成した構文木は自動的にブラウザ（LocalStorage）に保存されるほか、共有ボタンでURLハッシュに木構造を含めたリンクを生成・コピー可能。

### 4. スイス・タイポグラフィ（International Typographic Style）
- 幾何学的で規律あるグリッドシステム。
- スイス・レッド（`#E30613`）を象徴的なアクセントとし、視認性に優れた墨黒と機能的グレーで構成。
- 可読性の高いサンセリフ書体（Inter / Helvetica Neue / Noto Sans JP）と等幅フォント。

---

## 📖 記法リファレンス (Syntax Guide)

| 記法 | 入力例 | 説明 |
| :--- | :--- | :--- |
| **基本ノード** | `[TP [NP [N cat]] [VP [V sat]]]` | 角括弧で階層構造をネスト |
| **単語直書き** | `[N cat]` | 範疇ノード直下に語彙項目を配置 |
| **三角形（屋根）** | `[NP [^ the small black cat]]` | 句の内部構造を三角形で省略 |
| **Xバー プライム** | `[N' [N cat]]` | アポストロフィでプライム記号 |
| **Xバー マクロン** | `[N̄ [N cat]]` | マクロン付き文字 |
| **下付き文字** | `[DP_i John]`, `[t_i]` | アンダースコアの後に英数字 |
| **移動矢印タグ** | `[DP:wh Which book] ... [t:wh]` | 同一の移動ID（`:tag` または `@tag`）で矢印自動接続 |
| **統語素性** | `[C[+wh] who]` | 角括弧内に素性を指定 |

---

## 🛠️ プロジェクト構成

```text
syntax-tree-editor/
├── index.html                  # メインUI（スイス・スタイル設計）
├── css/
│   └── style.css               # グリッド・タイポグラフィCSS
├── js/
│   ├── app.js                  # アプリケーション統合コントローラー
│   ├── parser.js               # ブラケット記法パーサー＆シリアライザー
│   ├── tree-layout.js          # 最適木配置レイアウトエンジン（幾何学計算）
│   ├── renderer.js             # SVGレンダラー（枝・ノード・三角形・矢印）
│   ├── latex-exporter.js       # LaTeX (forest / tikz-qtree) 出力
│   ├── presets.js              # 言語学例文集プリセット
│   └── ui-controller.js        # パン/ズーム・GUI編集・モーダル制御
├── assets/
│   └── favicon.svg             # スイス・スタイルSVGファビコン
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages 自動デプロイ
├── README.md
├── LICENSE
└── .gitignore
```

---

## 🚀 GitHub Pagesでの公開手順

1. 本リポジトリの変更をコミットし、リモートへプッシュします：
   ```bash
   git add .
   git commit -m "feat: Initial release of Syntax Tree Editor"
   git push -u origin main
   ```

2. GitHubのリポジトリページを開きます：  
   `https://github.com/okawawaka/syntax-tree-editor`

3. **Settings** タブ > 左メニューの **Pages** を開きます。
4. **Build and deployment** の **Source** 設定で：
   - **GitHub Actions** を選択（同梱の `.github/workflows/deploy.yml` により自動デプロイされます）  
   *または*
   - **Deploy from a branch** を選択し、Branch: `main` / Folder: `/ (root)` を指定して **Save**。
5. 数十秒でデプロイが完了し、`https://okawawaka.github.io/syntax-tree-editor/` でWebアプリが公開されます。

---

## 💻 ローカルでの実行

ビルドステップ不要の Pure Vanilla HTML/JS のため、以下のいずれかで即座にプレビュー可能です：

- `index.html` をブラウザで直接ダブルクリック
- またはローカルHTTPサーバーを起動：
  ```bash
  # Python
  python -m http.server 8000
  ```
  ブラウザで `http://localhost:8000` を開きます。

---

## 📄 ライセンス

[MIT License](LICENSE) © 2026 okawawaka
