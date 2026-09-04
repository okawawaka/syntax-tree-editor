/**
 * Syntax Tree Editor - SVG Renderer
 * Renders the layout tree into an SVG element with crisp Swiss typographic styling,
 * interactive node hitboxes, triangles, and movement arrows.
 */

export class TreeRenderer {
  constructor(options = {}) {
    this.branchType = options.branchType || 'straight'; // 'straight' or 'curved'
    this.fontFamily = options.fontFamily || 'Inter, -apple-system, BlinkMacSystemFont, "Noto Sans JP", "Hiragino Sans", sans-serif';
    this.fontSize = options.fontSize || 16;
    this.strokeColor = options.strokeColor || '#111111';
    this.arrowColor = options.arrowColor || '#E30613'; // Swiss Red
    this.leafItalic = options.leafItalic !== undefined ? options.leafItalic : true;
    this.showTriangles = true;
    this.selectedNodeId = null;
    this.hoverNodeId = null;
    this.linkingSourceId = null; // for arrow creation mode
  }

  /**
   * Render layout tree into an SVG DOM element or string
   */
  renderToSVG(layoutData, movements = []) {
    if (!layoutData || !layoutData.root) {
      return this.renderEmptySVG();
    }

    const { root, width, height } = layoutData;
    const nodeMap = new Map();

    const collectNodes = (node) => {
      nodeMap.set(node.id, node);
      if (node.children) {
        for (const c of node.children) collectNodes(c);
      }
    };
    collectNodes(root);

    // Build SVG elements
    let svgContent = '';

    // Defs: markers for movement arrows
    svgContent += `
      <defs>
        <marker id="arrow-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="${this.arrowColor}" />
        </marker>
        <marker id="arrow-head-gray" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#8E8E93" />
        </marker>
        <filter id="pill-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.08"/>
        </filter>
      </defs>
    `;

    // Group for branches (lines & triangles)
    svgContent += '<g class="branches" stroke-linecap="round" stroke-linejoin="round">';
    svgContent += this.renderBranches(root);
    svgContent += '</g>';

    // Group for movement arrows
    if (movements && movements.length > 0) {
      svgContent += '<g class="movement-arrows">';
      svgContent += this.renderMovements(movements, nodeMap);
      svgContent += '</g>';
    }

    // Group for nodes
    svgContent += '<g class="nodes">';
    svgContent += this.renderNodes(root);
    svgContent += '</g>';

    return `
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 ${width} ${height}" 
        width="${width}" 
        height="${height}"
        class="syntax-tree-svg"
        style="font-family: ${this.fontFamily}; font-size: ${this.fontSize}px;"
      >
        ${svgContent}
      </svg>
    `;
  }

  /**
   * Render empty placeholder state
   */
  renderEmptySVG() {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="100%" height="200" class="syntax-tree-svg">
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#8E8E93" font-family="${this.fontFamily}" font-size="14">
          入力されたブラケット構文から樹形図を生成します
        </text>
      </svg>
    `;
  }

  /**
   * Recursively render branch lines and triangle roofs
   */
  renderBranches(node) {
    if (!node.children || node.children.length === 0) return '';

    let out = '';
    const parentBottomX = node.x;
    const parentBottomY = node.y + (node.height / 2);

    for (const child of node.children) {
      const childTopX = child.x;
      const childTopY = child.y - (child.height / 2) + 2;

      // Triangle Roof handling
      if (child.isTriangle) {
        const halfW = Math.max(child.width / 2 + 4, 16);
        const leftX = childTopX - halfW;
        const rightX = childTopX + halfW;
        const triBottomY = childTopY + 2;

        // Draw triangle polygon: apex (parentBottom), bottom-left, bottom-right
        out += `
          <polygon 
            points="${parentBottomX},${parentBottomY} ${leftX},${triBottomY} ${rightX},${triBottomY}" 
            fill="none" 
            stroke="${this.strokeColor}" 
            stroke-width="1.6" 
            class="tree-triangle"
          />
        `;
      } else {
        // Standard branch line
        if (this.branchType === 'curved') {
          // Smooth vertical Bezier curve
          const midY = (parentBottomY + childTopY) / 2;
          out += `
            <path 
              d="M ${parentBottomX} ${parentBottomY} C ${parentBottomX} ${midY}, ${childTopX} ${midY}, ${childTopX} ${childTopY}" 
              fill="none" 
              stroke="${this.strokeColor}" 
              stroke-width="1.6" 
              class="tree-branch"
            />
          `;
        } else {
          // Sharp straight line
          out += `
            <line 
              x1="${parentBottomX}" 
              y1="${parentBottomY}" 
              x2="${childTopX}" 
              y2="${childTopY}" 
              stroke="${this.strokeColor}" 
              stroke-width="1.6" 
              class="tree-branch"
            />
          `;
        }
      }

      // Recurse children
      out += this.renderBranches(child);
    }

    return out;
  }

  /**
   * Recursively render node labels and interactive hitboxes
   */
  renderNodes(node) {
    let out = '';
    const isSelected = this.selectedNodeId === node.id;
    const isHover = this.hoverNodeId === node.id;
    const isLinkingSource = this.linkingSourceId === node.id;

    const pillW = node.width;
    const pillH = node.height;
    const pillX = node.x - pillW / 2;
    const pillY = node.y - pillH / 2;

    // Interactive node container
    out += `<g class="tree-node ${isSelected ? 'selected' : ''} ${isLinkingSource ? 'linking-source' : ''}" data-node-id="${node.id}" transform="translate(${node.x}, ${node.y})">`;

    // Selection / hover pill rect
    let rectFill = 'transparent';
    let rectStroke = 'transparent';
    let strokeWidth = '1.5';

    if (isSelected) {
      rectFill = 'rgba(227, 6, 19, 0.08)';
      rectStroke = '#E30613'; // Swiss Red
      strokeWidth = '2';
    } else if (isLinkingSource) {
      rectFill = 'rgba(0, 113, 227, 0.12)';
      rectStroke = '#0071E3';
      strokeWidth = '2';
    } else if (isHover) {
      rectFill = 'rgba(0, 0, 0, 0.04)';
      rectStroke = '#D1D1D6';
    }

    out += `
      <rect 
        x="${-pillW / 2}" 
        y="${-pillH / 2}" 
        width="${pillW}" 
        height="${pillH}" 
        rx="4" 
        fill="${rectFill}" 
        stroke="${rectStroke}" 
        stroke-width="${strokeWidth}" 
        class="node-hitbox"
      />
    `;

    // Node text
    const fontWeight = node.isLeaf ? '400' : '600';
    const fontStyle = (node.isLeaf && this.leafItalic && !node.isTriangle) ? 'italic' : 'normal';
    const textColor = isSelected ? '#E30613' : this.strokeColor;

    // Build label display with subscript and features
    out += `
      <text 
        x="0" 
        y="1" 
        text-anchor="middle" 
        dominant-baseline="central" 
        fill="${textColor}" 
        font-weight="${fontWeight}" 
        font-style="${fontStyle}" 
        class="node-label"
      >
        ${this.escapeXml(node.displayLabel || node.label)}
    `;

    if (node.subscript) {
      out += `<tspan dy="4" font-size="0.75em" font-weight="400" font-style="normal">_${this.escapeXml(node.subscript)}</tspan><tspan dy="-4"></tspan>`;
    }

    if (node.features && node.features.length > 0) {
      out += `<tspan dx="2" dy="-2" font-size="0.7em" font-weight="500" fill="#666">[${this.escapeXml(node.features.join(','))}]</tspan><tspan dy="2"></tspan>`;
    }

    out += '</text>';
    out += '</g>';

    // Recursively render children
    if (node.children) {
      for (const child of node.children) {
        out += this.renderNodes(child);
      }
    }

    return out;
  }

  /**
   * Render curved movement arrows with Swiss arrowheads and indices
   * Uses cubic bezier curves traversing strictly UNDER all intervening nodes
   */
  renderMovements(movements, nodeMap) {
    let out = '';
    const allNodes = Array.from(nodeMap.values());

    for (const mov of movements) {
      const sourceNode = typeof mov.source === 'string' ? nodeMap.get(mov.source) : mov.source;
      const targetNode = typeof mov.target === 'string' ? nodeMap.get(mov.target) : mov.target;

      if (!sourceNode || !targetNode) continue;

      const sx = sourceNode.x;
      const sy = sourceNode.y + sourceNode.height / 2 + 3;
      const tx = targetNode.x;
      const ty = targetNode.y + targetNode.height / 2 + 3;

      const minX = Math.min(sx, tx) - 10;
      const maxX = Math.max(sx, tx) + 10;

      // Find the maximum bottom Y of any node situated horizontally between source and target
      let maxInterveningY = Math.max(sy, ty);
      for (const node of allNodes) {
        if (node.x >= minX && node.x <= maxX) {
          const nodeBottom = node.y + node.height / 2;
          if (nodeBottom > maxInterveningY) {
            maxInterveningY = nodeBottom;
          }
        }
      }

      // Dip comfortably below the lowest intervening node
      const dipY = maxInterveningY + 34;

      // Cubic Bezier curve: drops down from source, sweeps under bottom, rises to target
      const pathD = `M ${sx} ${sy} C ${sx} ${dipY}, ${tx} ${dipY}, ${tx} ${ty}`;

      out += `
        <path 
          d="${pathD}" 
          fill="none" 
          stroke="${this.arrowColor}" 
          stroke-width="1.8" 
          stroke-dasharray="4,3" 
          marker-end="url(#arrow-head)" 
          class="movement-path"
        />
      `;

      // Movement tag text positioned along bottom trough
      if (mov.label) {
        const midX = (sx + tx) / 2;
        const midY = dipY + 12;
        out += `
          <text 
            x="${midX}" 
            y="${midY}" 
            text-anchor="middle" 
            font-size="11" 
            font-weight="600" 
            fill="${this.arrowColor}"
            class="movement-tag"
          >
            ${this.escapeXml(mov.label)}
          </text>
        `;
      }
    }

    return out;
  }

  escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
