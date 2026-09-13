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
    this.inlineEditMode = null;

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
    this.toolbarDefault = document.getElementById('node-toolbar-default');
    this.toolbarInputForm = document.getElementById('node-toolbar-input-form');
    this.inputActionLabel = document.getElementById('node-input-action-label');
    this.inlineInput = document.getElementById('node-inline-input');
    this.btnInputConfirm = document.getElementById('btn-node-input-confirm');
    this.btnInputCancel = document.getElementById('btn-node-input-cancel');
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

    // Double-click on node opens inline label editor directly
    this.canvasContainer.addEventListener('dblclick', (e) => {
      const nodeEl = e.target.closest('.tree-node');
      if (!nodeEl) return;

      const nodeId = nodeEl.dataset.nodeId;
      this.handleNodeClick(nodeId);
      this.startInlineEdit('edit');
    });

    // Quick symbol insertion bar
    document.querySelectorAll('.quick-sym-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const insertText = btn.dataset.insert;
        this.insertTextAtCursor(insertText);
      });
    });

    // Node actions
    document.getElementById('btn-node-edit')?.addEventListener('click', () => this.startInlineEdit('edit'));
    document.getElementById('btn-node-add-child')?.addEventListener('click', () => this.startInlineEdit('child'));
    document.getElementById('btn-node-add-sibling')?.addEventListener('click', () => this.startInlineEdit('sibling'));
    document.getElementById('btn-node-toggle-triangle')?.addEventListener('click', () => this.toggleSelectedNodeTriangle());
    document.getElementById('btn-node-link-arrow')?.addEventListener('click', () => this.startLinkArrowMode());
    document.getElementById('btn-node-delete')?.addEventListener('click', () => this.deleteSelectedNode());

    // Inline edit controls
    this.btnInputConfirm?.addEventListener('click', () => this.commitInlineEdit());
    this.btnInputCancel?.addEventListener('click', () => this.cancelInlineEdit());
    this.toolbarInputForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.commitInlineEdit();
    });
    this.inlineInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.commitInlineEdit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.cancelInlineEdit();
      }
    });

    // Help button trigger
    document.getElementById('btn-show-help')?.addEventListener('click', () => {
      this.toggleHelpModal();
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.inlineEditMode) {
          this.cancelInlineEdit();
          return;
        }
        this.deselectNode();
        this.cancelLinkArrowMode();
        this.closeModals();
        return;
      }

      // '?' command: Open / Toggle Operating Instructions Modal
      if (e.key === '?' || (e.shiftKey && (e.key === '/' || e.key === '?'))) {
        const isInputFocused = e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT';
        if (!isInputFocused || e.altKey || e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.toggleHelpModal();
          return;
        }
      }

      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (this.selectedNode) {
          e.preventDefault();
          this.deleteSelectedNode();
        }
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
    if (this.viewport && this.app.layoutData) {
      const vpW = this.viewport.clientWidth || 600;
      const vpH = this.viewport.clientHeight || 500;
      const treeW = this.app.layoutData.width || 400;
      const treeH = this.app.layoutData.height || 350;

      // Fit zoom if tree is larger than viewport
      const fitZoom = Math.min(1.0, Math.max(0.4, Math.min((vpW - 40) / treeW, (vpH - 40) / treeH)));
      this.zoom = fitZoom;
      this.panX = 0;
      this.panY = 0;
    } else {
      this.zoom = 1.0;
      this.panX = 0;
      this.panY = 0;
    }
    this.updateTransform();
    const zoomDisplay = document.getElementById('zoom-level-text');
    if (zoomDisplay) zoomDisplay.textContent = `${Math.round(this.zoom * 100)}%`;
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
        const isEn = window.i18n && window.i18n.currentLang === 'en';
        this.showToast(isEn ? 'Select a different node' : '異なるノードを選択してください');
      }
      return;
    }

    this.cancelInlineEdit();
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
    this.cancelInlineEdit();
    this.selectedNode = null;
    this.app.renderer.selectedNodeId = null;
    if (this.nodeActionToolbar) {
      this.nodeActionToolbar.classList.remove('visible');
    }
    this.app.render();
  }

  startLinkArrowMode() {
    if (!this.selectedNode) return;
    const isEn = window.i18n && window.i18n.currentLang === 'en';
    this.isLinkingMode = true;
    this.linkSourceNode = this.selectedNode;
    this.app.renderer.linkingSourceId = this.selectedNode.id;
    this.showToast(isEn ? 'Click landing site (target) node' : '移動先（着地点）のノードをクリックしてください');
    this.app.render();
  }

  cancelLinkArrowMode() {
    this.isLinkingMode = false;
    this.linkSourceNode = null;
    this.app.renderer.linkingSourceId = null;
    this.app.render();
  }

  finishLinkArrow(sourceNode, targetNode) {
    const isEn = window.i18n && window.i18n.currentLang === 'en';
    const moveId = 'mov' + Math.floor(Math.random() * 100);
    sourceNode.movementId = moveId;
    targetNode.movementId = moveId;

    this.cancelLinkArrowMode();
    this.app.syncTreeToText();
    this.showToast(isEn ? 'Movement arrow connected' : '移動矢印を接続しました');
  }

  startInlineEdit(mode) {
    if (!this.selectedNode) return;
    const isEn = window.i18n && window.i18n.currentLang === 'en';

    if (mode === 'sibling') {
      const parent = this.findParentNode(this.app.currentTree, this.selectedNode.id);
      if (!parent) {
        const msg = (window.i18n && window.i18n.t('toastRootNoSibling')) || (isEn ? 'Cannot add sibling to root node' : 'ルートノードには兄弟を追加できません');
        this.showToast(msg);
        return;
      }
    }

    this.inlineEditMode = mode;

    let actionLabel = '';
    let initialVal = '';
    let placeholder = '';

    if (mode === 'edit') {
      actionLabel = (window.i18n && window.i18n.t('nodeInlineEditTitle')) || (isEn ? 'Edit Label:' : 'ラベル編集:');
      initialVal = this.selectedNode.label;
      placeholder = (window.i18n && window.i18n.t('nodeInlinePlaceholder')) || (isEn ? 'Label (e.g. DP, book)' : 'ラベル (例: DP, book)');
    } else if (mode === 'child') {
      actionLabel = (window.i18n && window.i18n.t('nodeInlineChildTitle')) || (isEn ? 'Add Child:' : '子ノード追加:');
      initialVal = 'XP';
      placeholder = (window.i18n && window.i18n.t('nodeInlinePlaceholder')) || (isEn ? 'Child label (e.g. DP, book)' : '子ノードラベル (例: DP, book)');
    } else if (mode === 'sibling') {
      actionLabel = (window.i18n && window.i18n.t('nodeInlineSiblingTitle')) || (isEn ? 'Add Sibling:' : '兄弟ノード追加:');
      initialVal = 'YP';
      placeholder = (window.i18n && window.i18n.t('nodeInlinePlaceholder')) || (isEn ? 'Sibling label (e.g. VP, PP)' : '兄弟ノードラベル (例: VP, PP)');
    }

    if (this.inputActionLabel) this.inputActionLabel.textContent = actionLabel;
    if (this.inlineInput) {
      this.inlineInput.placeholder = placeholder;
      this.inlineInput.value = initialVal;
    }

    if (this.toolbarDefault) this.toolbarDefault.style.display = 'none';
    if (this.toolbarInputForm) this.toolbarInputForm.style.display = 'flex';

    setTimeout(() => {
      if (this.inlineInput) {
        this.inlineInput.focus();
        this.inlineInput.select();
      }
    }, 20);
  }

  cancelInlineEdit() {
    this.inlineEditMode = null;
    if (this.toolbarInputForm) this.toolbarInputForm.style.display = 'none';
    if (this.toolbarDefault) this.toolbarDefault.style.display = 'flex';
    if (this.inlineInput) this.inlineInput.value = '';
  }

  commitInlineEdit() {
    if (!this.inlineEditMode || !this.selectedNode || !this.inlineInput) return;
    const isEn = window.i18n && window.i18n.currentLang === 'en';
    const val = this.inlineInput.value.trim();

    if (val === '') {
      this.cancelInlineEdit();
      return;
    }

    const mode = this.inlineEditMode;
    this.cancelInlineEdit();

    if (mode === 'edit') {
      this.selectedNode.label = val;
      this.selectedNode.parseLabelAnnotations();
      this.app.syncTreeToText();
      if (this.selectedNodeName) {
        this.selectedNodeName.textContent = this.selectedNode.displayLabel || this.selectedNode.label;
      }
      const msg = (window.i18n && window.i18n.t('toastLabelUpdated')) || (isEn ? 'Label updated' : 'ラベルを更新しました');
      this.showToast(msg);
    } else if (mode === 'child') {
      const newNode = new (this.app.TreeNode)(val, [], true);
      this.selectedNode.children.push(newNode);
      this.selectedNode.isLeaf = false;
      this.app.syncTreeToText();
      const msg = (window.i18n && window.i18n.t('toastChildAdded')) || (isEn ? 'Child node added' : '子ノードを追加しました');
      this.showToast(msg);
      this.handleNodeClick(newNode.id);
    } else if (mode === 'sibling') {
      const parent = this.findParentNode(this.app.currentTree, this.selectedNode.id);
      if (parent) {
        const newNode = new (this.app.TreeNode)(val, [], true);
        const idx = parent.children.indexOf(this.selectedNode);
        parent.children.splice(idx + 1, 0, newNode);
        this.app.syncTreeToText();
        const msg = (window.i18n && window.i18n.t('toastSiblingAdded')) || (isEn ? 'Sibling node added' : '兄弟ノードを追加しました');
        this.showToast(msg);
        this.handleNodeClick(newNode.id);
      }
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
    const isEn = window.i18n && window.i18n.currentLang === 'en';
    if (this.selectedNode.id === this.app.currentTree.id) {
      const msg = (window.i18n && window.i18n.t('toastRootNoDelete')) || (isEn ? 'Cannot delete root node' : 'ルートノードは削除できません');
      this.showToast(msg);
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
      const msg = (window.i18n && window.i18n.t('toastNodeDeleted')) || (isEn ? 'Node deleted' : 'ノードを削除しました');
      this.showToast(msg);
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
    if (this.inlineEditMode && this.inlineInput && document.activeElement === this.inlineInput) {
      const start = this.inlineInput.selectionStart !== undefined ? this.inlineInput.selectionStart : this.inlineInput.value.length;
      const end = this.inlineInput.selectionEnd !== undefined ? this.inlineInput.selectionEnd : this.inlineInput.value.length;
      const val = this.inlineInput.value;
      this.inlineInput.value = val.substring(0, start) + text + val.substring(end);
      this.inlineInput.selectionStart = this.inlineInput.selectionEnd = start + text.length;
      this.inlineInput.focus();
      return;
    }

    const ta = this.app.activeEditor || document.getElementById('bracket-editor-indented') || document.getElementById('bracket-editor-flat');
    if (!ta) return;
    const start = ta.selectionStart !== undefined ? ta.selectionStart : ta.value.length;
    const end = ta.selectionEnd !== undefined ? ta.selectionEnd : ta.value.length;
    const val = ta.value;

    ta.value = val.substring(0, start) + text + val.substring(end);
    ta.selectionStart = ta.selectionEnd = start + text.length;
    ta.focus();

    // Trigger input event to run parser & sync both editors
    ta.dispatchEvent(new Event('input', { bubbles: true }));
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

  openHelpModal() {
    const modal = document.getElementById('help-modal');
    if (modal) {
      modal.classList.add('visible');
    }
  }

  toggleHelpModal() {
    const modal = document.getElementById('help-modal');
    if (modal) {
      modal.classList.toggle('visible');
    }
  }
}
