/**
 * Syntax Tree Editor - LaTeX Exporter
 * Generates ready-to-compile LaTeX code for both modern `forest`
 * and classic `tikz-qtree` packages, including roofs (triangles) and subscripts.
 */

export class LatexExporter {
  /**
   * Export to `forest` package format (Modern linguistic standard)
   */
  static toForest(root, movements = []) {
    if (!root) return '';

    const formatNode = (node, indent = 0) => {
      const pad = '  '.repeat(indent);
      let label = this.formatLatexText(node.label || '');

      let opts = [];
      if (node.isTriangle) {
        opts.push('roof');
      }
      if (node.movementId) {
        opts.push(`name=${node.movementId}`);
      }

      const optStr = opts.length > 0 ? `, ${opts.join(', ')}` : '';

      if (!node.children || node.children.length === 0) {
        return `${pad}[${label}${optStr}]`;
      }

      // Special case: terminal word
      if (node.children.length === 1 && node.children[0].isLeaf && (!node.children[0].children || !node.children[0].children.length)) {
        const child = node.children[0];
        let childLabel = this.formatLatexText(child.label || '');
        let childOpts = child.isTriangle ? ', roof' : '';
        if (child.movementId) childOpts += `, name=${child.movementId}`;
        return `${pad}[${label}${optStr}\n${pad}  [${childLabel}${childOpts}]\n${pad}]`;
      }

      const childLines = node.children.map(c => formatNode(c, indent + 1)).join('\n');
      return `${pad}[${label}${optStr}\n${childLines}\n${pad}]`;
    };

    let latex = `% Requires: \\usepackage[linguistics]{forest}\n`;
    latex += `\\begin{forest}\n`;
    latex += formatNode(root, 0) + `\n`;

    // Movement arrows in forest
    if (movements && movements.length > 0) {
      for (const mov of movements) {
        const src = typeof mov.source === 'string' ? mov.source : mov.source.movementId || 'src';
        const tgt = typeof mov.target === 'string' ? mov.target : mov.target.movementId || 'tgt';
        latex += `  \\draw[->, dashed, red] (${src}) to[out=south, in=south] node[below, font=\\scriptsize]{${mov.label || ''}} (${tgt});\n`;
      }
    }

    latex += `\\end{forest}`;
    return latex;
  }

  /**
   * Export to `tikz-qtree` format
   */
  static toTikzQtree(root) {
    if (!root) return '';

    const formatNode = (node) => {
      let label = this.formatLatexText(node.label || '');

      if (!node.children || node.children.length === 0) {
        return node.isLeaf ? label : `[.${label} ]`;
      }

      // Check if child is triangle roof
      if (node.children.length === 1 && node.children[0].isTriangle) {
        const phrase = this.formatLatexText(node.children[0].label || '');
        return `\\qroof{${phrase}}.${label} `;
      }

      const childStrings = node.children.map(c => formatNode(c)).join(' ');
      return `[.${label} ${childStrings} ]`;
    };

    let latex = `% Requires: \\usepackage{tikz-qtree}\n`;
    latex += `\\Tree ${formatNode(root)}`;
    return latex;
  }

  /**
   * Convert linguistic notations to LaTeX equivalents:
   * X' -> $X'$
   * t_i -> $t_i$
   * [+wh] -> $[+wh]$
   */
  static formatLatexText(text) {
    if (!text) return '';
    let out = text;

    // Handle subscript e.g. t_i -> \textit{t}$_i$
    out = out.replace(/_([a-zA-Z0-9]+)/g, '_{$1}');

    // Handle prime e.g. N' -> N$'$
    out = out.replace(/'/g, '$^{\\prime}$');

    // Handle features [+wh]
    out = out.replace(/\[\+([^\]]+)\]/g, '$[+$\\text{$1$}$]$');
    out = out.replace(/\[-([^\]]+)\]/g, '$[-$\\text{$1$}$]$');

    return out;
  }
}
