/**
 * Syntax Tree Editor - Layout Engine
 * Calculates geometric coordinates (x, y) for every tree node
 * using an adapted tidy-tree algorithm with linguistic conventions
 * (fixed or dynamic level heights, triangle roof bounds, feature annotations).
 */

export class TreeLayout {
  constructor(options = {}) {
    this.fontSize = options.fontSize || 16;
    this.fontFamily = options.fontFamily || 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    this.levelHeight = options.levelHeight || 64;       // Vertical distance between levels
    this.nodeMarginX = options.nodeMarginX || 28;       // Horizontal spacing between sibling nodes
    this.leafMarginX = options.leafMarginX || 24;       // Spacing between leaf nodes
    this.canvas = null;
    this.ctx = null;
  }

  /**
   * Helper to measure text width via canvas
   */
  measureText(text, fontSize = this.fontSize, isBold = false) {
    if (typeof document !== 'undefined') {
      if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
      }
      this.ctx.font = `${isBold ? '600' : '400'} ${fontSize}px ${this.fontFamily}`;
      return this.ctx.measureText(text).width;
    }
    // Fallback if no DOM (node.js / headless)
    return text.length * fontSize * 0.62;
  }

  /**
   * Main entry point: takes a TreeNode and returns a LayoutNode with x, y coordinates
   */
  compute(root) {
    if (!root) return null;

    // Step 1: Pre-calculate node dimensions (width, height)
    this.measureSubtree(root, 0);

    // Step 2: Post-order bottom-up initial layout
    this.layoutSubtree(root);

    // Step 3: Shift all nodes so min X is padded nicely
    let minX = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    const findExtents = (node) => {
      const left = node.x - node.width / 2;
      const right = node.x + node.width / 2;
      if (left < minX) minX = left;
      if (right > maxX) maxX = right;
      if (node.y + node.height > maxY) maxY = node.y + node.height;

      if (node.children) {
        for (const child of node.children) {
          findExtents(child);
        }
      }
    };

    findExtents(root);

    const paddingX = 40;
    const paddingY = 40;
    const shiftX = paddingX - minX;
    const shiftY = paddingY;

    const applyShift = (node) => {
      node.x += shiftX;
      node.y += shiftY;
      if (node.children) {
        for (const child of node.children) {
          applyShift(child);
        }
      }
    };

    applyShift(root);

    return {
      root,
      width: (maxX - minX) + paddingX * 2,
      height: maxY + paddingY * 2
    };
  }

  /**
   * Measures each node's text and sets width/height and level depth
   */
  measureSubtree(node, depth) {
    node.depth = depth;
    node.y = depth * this.levelHeight;

    // Calculate display width
    let textWidth = this.measureText(node.displayLabel || node.label || ' ', this.fontSize, !node.isLeaf);

    // If there is subscript
    if (node.subscript) {
      textWidth += this.measureText(node.subscript, this.fontSize * 0.75, false) + 2;
    }

    // If there are syntactic features [+wh]
    if (node.features && node.features.length > 0) {
      const featStr = `[${node.features.join(',')}]`;
      textWidth += this.measureText(featStr, this.fontSize * 0.75, false) + 4;
    }

    node.width = Math.max(textWidth + 14, 30);
    node.height = this.fontSize + 12;

    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        this.measureSubtree(child, depth + 1);
      }
    }
  }

  /**
   * Post-order layout: computes relative x positions, avoiding sibling subtree overlap
   */
  layoutSubtree(node) {
    if (!node.children || node.children.length === 0) {
      node.x = 0;
      return;
    }

    // Recursively layout all children first
    for (const child of node.children) {
      this.layoutSubtree(child);
    }

    // Position children relative to each other from left to right
    let currentX = 0;
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      if (i === 0) {
        child.x = 0;
      } else {
        const prevChild = node.children[i - 1];
        // Calculate minimum distance needed between prevChild subtree and current child subtree
        const dist = this.getSubtreeSeparation(prevChild, child);
        currentX += dist;
        this.shiftSubtree(child, currentX - child.x);
      }
    }

    // Parent node sits centered above its children
    const firstChild = node.children[0];
    const lastChild = node.children[node.children.length - 1];
    node.x = (firstChild.x + lastChild.x) / 2;
  }

  /**
   * Shift an entire subtree horizontally by dx
   */
  shiftSubtree(node, dx) {
    node.x += dx;
    if (node.children) {
      for (const child of node.children) {
        this.shiftSubtree(child, dx);
      }
    }
  }

  /**
   * Calculate minimum horizontal distance to prevent subtree collisions
   */
  getSubtreeSeparation(leftSubtree, rightSubtree) {
    const leftContours = [];
    const rightContours = [];

    const getRightContour = (node, depth = 0) => {
      const rightEdge = node.x + node.width / 2;
      if (leftContours[depth] === undefined || rightEdge > leftContours[depth]) {
        leftContours[depth] = rightEdge;
      }
      if (node.children) {
        for (const child of node.children) {
          getRightContour(child, depth + 1);
        }
      }
    };

    const getLeftContour = (node, depth = 0) => {
      const leftEdge = node.x - node.width / 2;
      if (rightContours[depth] === undefined || leftEdge < rightContours[depth]) {
        rightContours[depth] = leftEdge;
      }
      if (node.children) {
        for (const child of node.children) {
          getLeftContour(child, depth + 1);
        }
      }
    };

    getRightContour(leftSubtree);
    getLeftContour(rightSubtree);

    let maxOverlap = 0;
    const minSeparation = this.nodeMarginX;
    const maxDepth = Math.min(leftContours.length, rightContours.length);

    for (let d = 0; d < maxDepth; d++) {
      const overlap = leftContours[d] + minSeparation - rightContours[d];
      if (overlap > maxOverlap) {
        maxOverlap = overlap;
      }
    }

    return Math.max(maxOverlap, minSeparation);
  }
}
