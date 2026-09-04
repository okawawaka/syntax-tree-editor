/**
 * Syntax Tree Editor - UI Controller
 * Manages interactions: pan/zoom canvas, node selection, inline editing,
 * arrow creation mode, notifications, modals, and export triggers.
 */

export class UIController {
  constructor(app) {
    this.app = app;
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.isPanning = false;
    this.startPanX = 0;
    this.startPanY = 0;

    this.selectedNode = null;
    this.isLinkingMode = false;
    this.linkSourceNode = null;

    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.viewport = document.getElementById('tree-viewport');
    this.canvasContainer = document.getElementById('tree-canvas');
    this.editorTextarea = document.getElementById('bracket-editor');
    this.errorBanner = document.getElementById('error-banner');
    this.nodeActionToolbar = document.getElementById('node-action-toolbar');
    this.selectedNodeName = document.getElementById('selected-node-name');
    this.latexModal = document.getElementById('latex-modal');
    this.latexCodeArea = document.getElementById('latex-code-area');
    this.toast = document.getElementById('toast');
  }

  bindEvents() {
    // Pan & Zoom on SVG Viewport
    this.viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      this.setZoom(this.zoom * zoomFactor, e.clientX, e.clientY);
    }, { passive: false });

    this.viewport.addEventListener('mousedown', (e) => {
      // If clicking directly on SVG background or container (not on a node)
      if (e.target.closest('.tree-node')) return;
      this.isPanning = true;
      this.startPanX = e.clientX - this.panX;
      this.startPanY = e.clientY - this.panY;
      this.viewport.style.cursor = 'grabbing';
      this.deselectNode();
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isPanning) return;
      this.panX = e.clientX - this.startPanX;
      this.panY = e.clientY - this.startPanY;
      this.updateTransform();
    });

    window.addEventListener('mouseup', () => {
      if (this.isPanning) {
        this.isPanning = false;
        this.viewport.style.cursor = 'grab';
      }
    });

    // Zoom buttons
    document.getElementById('btn-zoom-in')?.addEventListener('click', () => this.setZoom(this.zoom * 1.2));
    document.getElementById('btn-zoom-out')?.addEventListener('click', () => this.setZoom(this.zoom * 0.8));
    document.getElementById('btn-zoom-reset')?.addEventListener('click', () => this.resetView());

    // Canvas click delegation for nodes
    this.canvasContainer.addEventListener('click', (e) => {
      const nodeEl = e.target.closest('.tree-node');
      if (!nodeEl) return;

      const nodeId = nodeEl.dataset.nodeId;
      this.handleNodeClick(nodeId);
    });

    // Quick symbol insertion bar
    document.querySelectorAll('.quick-sym-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const insertText = btn.dataset.insert;
        this.insertTextAtCursor(insertText);
      });
    });

    // Node actions
    document.getElementById('btn-node-edit')?.addEventListener('click', () => this.promptEditSelectedNode());
    document.getElementById('btn-node-add-child')?.addEventListener('click', () => this.addChildToSelectedNode());
    document.getElementById('btn-node-add-sibling')?.addEventListener('click', () => this.addSiblingToSelectedNode());
    document.getElementById('btn-node-toggle-triangle')?.addEventListener('click', () => this.toggleSelectedNodeTriangle());
    document.getElementById('btn-node-link-arrow')?.addEventListener('click', () => this.startLinkArrowMode());
    document.getElementById('btn-node-delete')?.addEventListener('click', () => this.deleteSelectedNode());

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (this.selectedNode) {
          e.preventDefault();
          this.deleteSelectedNode();
        }
      } else if (e.key === 'Escape') {
        this.deselectNode();
        this.cancelLinkArrowMode();
        this.closeModals();
      }
    });
  }

  setZoom(newZoom, originX, originY) {
    const minZoom = 0.3;
    const maxZoom = 3.5;
    this.zoom = Math.min(Math.max(newZoom, minZoom), maxZoom);
    this.updateTransform();
    const zoomDisplay = document.getElementById('zoom-level-text');
    if (zoomDisplay) {
      zoomDisplay.textContent = `${Math.round(this.zoom * 100)}%`;
    }
  }

  resetView() {
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.updateTransform();
    const zoomDisplay = document.getElementById('zoom-level-text');
    if (zoomDisplay) zoomDisplay.textContent = '100%';
  }

  updateTransform() {
    this.canvasContainer.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
  }

  handleNodeClick(nodeId) {
    const node = this.findNodeById(this.app.currentTree, nodeId);
    if (!node) return;

    if (this.isLinkingMode) {
      // Finish link
      if (this.linkSourceNode && this.linkSourceNode.id !== node.id) {
        this.finishLinkArrow(this.linkSourceNode, node);
      } else {
        this.showToast('異なるノードを選択してください');
      }
      return;
    }

    this.selectedNode = node;
    this.app.renderer.selectedNodeId = node.id;
    this.app.render();

    // Show action bar
    if (this.nodeActionToolbar) {
      this.nodeActionToolbar.classList.add('visible');
      if (this.selectedNodeName) {
        this.selectedNodeName.textContent = node.displayLabel || node.label || '(空)';
      }
    }
  }

  deselectNode() {
    this.selectedNode = null;
    this.app.renderer.selectedNodeId = null;
    if (this.nodeActionToolbar) {
      this.nodeActionToolbar.classList.remove('visible');
    }
    this.app.render();
  }

  startLinkArrowMode() {
    if (!this.selectedNode) return;
    this.isLinkingMode = true;
    this.linkSourceNode = this.selectedNode;
    this.app.renderer.linkingSourceId = this.selectedNode.id;
    this.showToast('移動先（着地点）のノードをクリックしてください');
    this.app.render();
  }

  cancelLinkArrowMode() {
    this.isLinkingMode = false;
    this.linkSourceNode = null;
    this.app.renderer.linkingSourceId = null;
    this.app.render();
  }

  finishLinkArrow(sourceNode, targetNode) {
    const moveId = 'mov' + Math.floor(Math.random() * 100);
    sourceNode.movementId = moveId;
    targetNode.movementId = moveId;

    this.cancelLinkArrowMode();
    this.app.syncTreeToText();
    this.showToast('移動矢印を接続しました');
  }

  promptEditSelectedNode() {
    if (!this.selectedNode) return;
    const currentLabel = this.selectedNode.label;
    const newLabel = prompt('ノードラベルを編集:', currentLabel);
    if (newLabel !== null && newLabel.trim() !== '') {
      this.selectedNode.label = newLabel.trim();
      this.selectedNode.parseLabelAnnotations();
      this.app.syncTreeToText();
    }
  }

  addChildToSelectedNode() {
    if (!this.selectedNode) return;
    const childLabel = prompt('追加する子ノードのラベル (例: DP, book, etc.):', 'XP');
    if (childLabel !== null && childLabel.trim() !== '') {
      const newNode = new (this.app.TreeNode)(childLabel.trim(), [], true);
      this.selectedNode.children.push(newNode);
      this.selectedNode.isLeaf = false;
      this.app.syncTreeToText();
    }
  }

  addSiblingToSelectedNode() {
    if (!this.selectedNode) return;
    const parent = this.findParentNode(this.app.currentTree, this.selectedNode.id);
    if (!parent) {
      this.showToast('ルートノードには兄弟を追加できません');
      return;
    }
    const sibLabel = prompt('追加する兄弟ノードのラベル:', 'YP');
    if (sibLabel !== null && sibLabel.trim() !== '') {
      const newNode = new (this.app.TreeNode)(sibLabel.trim(), [], true);
      const idx = parent.children.indexOf(this.selectedNode);
      parent.children.splice(idx + 1, 0, newNode);
      this.app.syncTreeToText();
    }
  }

  toggleSelectedNodeTriangle() {
    if (!this.selectedNode) return;
    this.selectedNode.isTriangle = !this.selectedNode.isTriangle;
    this.app.syncTreeToText();
    this.showToast(this.selectedNode.isTriangle ? '三角形（屋根）を適用' : '通常の枝に戻しました');
  }

  deleteSelectedNode() {
    if (!this.selectedNode) return;
    if (this.selectedNode.id === this.app.currentTree.id) {
      this.showToast('ルートノードは削除できません');
      return;
    }

    const parent = this.findParentNode(this.app.currentTree, this.selectedNode.id);
    if (parent) {
      parent.children = parent.children.filter(c => c.id !== this.selectedNode.id);
      if (parent.children.length === 0) {
        parent.isLeaf = true;
      }
      this.deselectNode();
      this.app.syncTreeToText();
      this.showToast('ノードを削除しました');
    }
  }

  findNodeById(node, id) {
    if (!node) return null;
    if (node.id === id) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = this.findNodeById(child, id);
        if (found) return found;
      }
    }
    return null;
  }

  findParentNode(current, childId) {
    if (!current || !current.children) return null;
    for (const child of current.children) {
      if (child.id === childId) return current;
      const found = this.findParentNode(child, childId);
      if (found) return found;
    }
    return null;
  }

  insertTextAtCursor(text) {
    const ta = this.editorTextarea;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const val = ta.value;

    ta.value = val.substring(0, start) + text + val.substring(end);
    ta.selectionStart = ta.selectionEnd = start + text.length;
    ta.focus();

    // Trigger update
    ta.dispatchEvent(new Event('input'));
  }

  showError(msg) {
    if (this.errorBanner) {
      this.errorBanner.textContent = msg;
      this.errorBanner.classList.add('visible');
    }
  }

  clearError() {
    if (this.errorBanner) {
      this.errorBanner.classList.remove('visible');
      this.errorBanner.textContent = '';
    }
  }

  showToast(message) {
    if (!this.toast) return;
    this.toast.textContent = message;
    this.toast.classList.add('show');
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      this.toast.classList.remove('show');
    }, 2800);
  }

  closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('visible'));
  }
}
