/**
 * Syntax Tree Editor - Layout Engine
 * Calculates geometric coordinates (x, y) for every tree node
 * using contour-based bottom-up subtree layout with exact text widths
 * (including full support for CJK/Japanese characters, triangles, and subscripts).
 */

export class TreeLayout {
  constructor(options = {}) {
    this.fontSize = options.fontSize || 16;
    this.fontFamily = options.fontFamily || 'Inter, -apple-system, BlinkMacSystemFont, "Noto Sans JP", "Hiragino Sans", sans-serif';
    this.levelHeight = options.levelHeight || 64;       // Vertical distance between levels
    this.nodeMarginX = options.nodeMarginX || 28;       // Horizontal spacing between sibling subtrees
    this.canvas = null;
    this.ctx = null;
  }

  /**
   * Accurate text measurement with Canvas and CJK character support
   */
  measureText(text, fontSize = this.fontSize, isBold = false) {
    if (!text) return 0;

    if (typeof document !== 'undefined') {
      if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
      }
      this.ctx.font = `${isBold ? '600' : '400'} ${fontSize}px ${this.fontFamily}`;
      const measured = this.ctx.measureText(text).width;
      if (measured > 0) return measured;
    }

    // Fallback: distinguish CJK full-width vs ASCII
    let width = 0;
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      // CJK Unified Ideographs, Hiragana, Katakana, Fullwidth forms
      if ((code >= 0x3000 && code <= 0x9FFF) || (code >= 0xFF00 && code <= 0xFFEF)) {
        width += fontSize * 1.05;
      } else {
        width += fontSize * 0.62;
      }
    }
    return width;
  }

  /**
   * Main entry point: takes a TreeNode and returns layout with absolute x, y coordinates
   */
  compute(root) {
    if (!root) return null;

    // Step 1: Pre-calculate node dimensions (width, height)
    this.measureSubtree(root, 0);

    // Step 2: Bottom-up contour layout (relative x positioning)
    this.layoutSubtree(root);

    // Step 3: Convert relative coordinates to absolute coordinates
    this.assignAbsoluteCoordinates(root, 0);

    // Step 4: Calculate bounding box and apply padding
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
      width: Math.ceil((maxX - minX) + paddingX * 2),
      height: Math.ceil(maxY + paddingY * 2)
    };
  }

  /**
   * Measure each node's visual width and height
   */
  measureSubtree(node, depth) {
    node.depth = depth;
    node.y = depth * this.levelHeight;

    const labelStr = node.displayLabel || node.label || ' ';
    let textWidth = this.measureText(labelStr, this.fontSize, !node.isLeaf);

    if (node.subscript) {
      textWidth += this.measureText(node.subscript, this.fontSize * 0.75, false) + 4;
    }

    if (node.features && node.features.length > 0) {
      const featStr = `[${node.features.join(',')}]`;
      textWidth += this.measureText(featStr, this.fontSize * 0.75, false) + 6;
    }

    node.width = Math.max(textWidth + 16, 32);
    node.height = this.fontSize + 12;

    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        this.measureSubtree(child, depth + 1);
      }
    }
  }

  /**
   * Get contour of a subtree (relative to its own root origin x=0)
   * isLeft = true: leftmost edge at each relative depth
   * isLeft = false: rightmost edge at each relative depth
   */
  getContour(node, isLeft) {
    const contour = [];
    const traverse = (n, depth, currentX) => {
      const edge = isLeft ? (currentX - n.width / 2) : (currentX + n.width / 2);
      if (contour[depth] === undefined) {
        contour[depth] = edge;
      } else {
        contour[depth] = isLeft ? Math.min(contour[depth], edge) : Math.max(contour[depth], edge);
      }
      if (n.children && n.children.length > 0) {
        for (const c of n.children) {
          traverse(c, depth + 1, currentX + c.x);
        }
      }
    };
    traverse(node, 0, 0);
    return contour;
  }

  /**
   * Bottom-up layout using contour-based subtree separation
   */
  layoutSubtree(node) {
    if (!node.children || node.children.length === 0) {
      node.x = 0;
      return;
    }

    // Layout all children first
    for (const child of node.children) {
      this.layoutSubtree(child);
    }

    // Position children relative to each other so their contours do not overlap
    node.children[0].x = 0;

    for (let i = 1; i < node.children.length; i++) {
      const leftChild = node.children[i - 1];
      const rightChild = node.children[i];

      const rightContour = this.getContour(leftChild, false);
      const leftContour = this.getContour(rightChild, true);

      let maxRequiredSeparation = this.nodeMarginX;
      const maxDepth = Math.min(rightContour.length, leftContour.length);

      for (let d = 0; d < maxDepth; d++) {
        const req = rightContour[d] - leftContour[d] + this.nodeMarginX;
        if (req > maxRequiredSeparation) {
          maxRequiredSeparation = req;
        }
      }

      // Position rightChild relative to leftChild
      rightChild.x = leftChild.x + maxRequiredSeparation;
    }

    // Center children around parent (x=0)
    const firstChild = node.children[0];
    const lastChild = node.children[node.children.length - 1];
    const midPoint = (firstChild.x + lastChild.x) / 2;

    for (const child of node.children) {
      child.x -= midPoint;
    }
    node.x = 0;
  }

  /**
   * Convert parent-relative x offsets into global x coordinates
   */
  assignAbsoluteCoordinates(node, parentAbsX) {
    node.x = parentAbsX + node.x;
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        this.assignAbsoluteCoordinates(child, node.x);
      }
    }
  }
}
