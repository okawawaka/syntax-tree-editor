/**
 * Syntax Tree Editor - Parser Module
 * Handles tokenizing, parsing bracket notation into an AST,
 * error reporting, and serializing AST back to bracket notation.
 */

export class TreeNode {
  constructor(label = '', children = [], isLeaf = false, isTriangle = false) {
    this.id = 'node_' + Math.random().toString(36).substr(2, 9);
    this.label = (label || '').trim();
    this.children = children;
    this.isLeaf = isLeaf;
    this.isTriangle = isTriangle;
    this.movementId = null; // for movement arrows e.g., @1, #wh
    this.subscript = null;  // extracted subscript e.g., t_i -> label="t", subscript="i"
    this.features = [];     // syntactic features e.g. [+wh], [-past]
    this.displayLabel = '';
    this.parseLabelAnnotations();
  }

  /**
   * Parse special syntax in label like:
   * "DP_i" -> label="DP", subscript="i"
   * "NP@1" -> movementId="1"
   * "N[+pl]" -> label="N", features=["+pl"]
   */
  parseLabelAnnotations() {
    let text = this.label;

    // Check for triangle marker prefix: ^Text or [^ Text]
    if (text.startsWith('^')) {
      this.isTriangle = true;
      text = text.substring(1).trim();
    }

    // Check for movement tag e.g. @move1 or #1 or :wh
    const moveMatch = text.match(/[@#:]([a-zA-Z0-9_-]+)/);
    if (moveMatch) {
      this.movementId = moveMatch[1];
      text = text.replace(moveMatch[0], '').trim();
    }

    // Check for features e.g. [+wh, -past]
    const featMatches = text.match(/\[([^[\]]+)\]/g);
    if (featMatches) {
      this.features = featMatches.map(f => f.slice(1, -1));
      text = text.replace(/\[([^[\]]+)\]/g, '').trim();
    }

    // Check for subscript e.g. t_i or DP_1
    const subMatch = text.match(/_([a-zA-Z0-9\u03B1-\u03C9\u2205]+)$/);
    if (subMatch) {
      this.subscript = subMatch[1];
      text = text.replace(/_[a-zA-Z0-9\u03B1-\u03C9\u2205]+$/, '');
    }

    this.displayLabel = text;
  }

  clone() {
    const copy = new TreeNode(this.label, this.children.map(c => c.clone()), this.isLeaf, this.isTriangle);
    copy.id = this.id;
    copy.movementId = this.movementId;
    copy.subscript = this.subscript;
    copy.features = [...this.features];
    copy.displayLabel = this.displayLabel;
    return copy;
  }
}

export class TreeParser {
  /**
   * Parse a bracketed string into a TreeNode AST.
   * Format example: [TP [NP [D The] [N cat]] [VP [V sat]]]
   * Supports triangle notation: [NP [^ the cat]] or [NP ^the cat]
   */
  static parse(input) {
    if (!input || !input.trim()) {
      return { tree: null, error: null, movements: [] };
    }

    const tokens = this.tokenize(input);
    if (tokens.length === 0) {
      return { tree: null, error: null, movements: [] };
    }

    let cursor = 0;

    function peek() {
      return tokens[cursor];
    }

    function consume(type) {
      const tok = tokens[cursor];
      if (!tok) {
        throw new Error(`Unexpected end of input, expected ${type}`);
      }
      if (type && tok.type !== type) {
        throw new Error(`Line ${tok.line}, col ${tok.col}: Expected '${type}', found '${tok.val}'`);
      }
      cursor++;
      return tok;
    }

    function parseNode() {
      const openTok = consume('[');
      
      let isTriangle = false;
      let labelTokens = [];

      while (cursor < tokens.length && peek().type !== '[' && peek().type !== ']') {
        labelTokens.push(consume().val);
      }

      let rawLabel = labelTokens.join(' ').trim();
      if (rawLabel.startsWith('^')) {
        isTriangle = true;
        rawLabel = rawLabel.substring(1).trim();
      }

      // If no label was provided (e.g. "[]")
      if (!rawLabel && peek() && peek().type === ']') {
        consume(']');
        return new TreeNode('', [], false, isTriangle);
      }

      // If this node is [Label Child1 Child2...] or [Label Word]
      if (cursor < tokens.length && peek().type === ']') {
        consume(']');

        // Case 1: Pure triangle roof node without category, e.g. [^ the hungry cat]
        if (isTriangle) {
          // If rawLabel was [^ the cat], the whole thing is the phrase
          return new TreeNode(rawLabel, [], true, true);
        }

        // Case 2: [Category Word] shorthand, e.g. [N cat] or [DP John]
        const firstSpace = rawLabel.indexOf(' ');
        if (firstSpace !== -1) {
          const cat = rawLabel.substring(0, firstSpace).trim();
          const word = rawLabel.substring(firstSpace + 1).trim();
          const leafNode = new TreeNode(word, [], true, false);
          return new TreeNode(cat, [leafNode], false, false);
        } else {
          // Just a single word or label with no children e.g. [cat]
          return new TreeNode(rawLabel, [], true, false);
        }
      }

      // Parse nested children
      let children = [];
      while (cursor < tokens.length && peek().type !== ']') {
        if (peek().type === '[') {
          children.push(parseNode());
        } else {
          const textTok = consume();
          let txt = textTok.val;
          let leafTri = false;
          if (txt.startsWith('^')) {
            leafTri = true;
            txt = txt.substring(1).trim();
          }
          children.push(new TreeNode(txt, [], true, leafTri));
        }
      }

      if (cursor >= tokens.length) {
        throw new Error(`Unclosed bracket: missing ']' for node '${rawLabel || openTok.val}'`);
      }

      consume(']');

      if (isTriangle && children.length === 1) {
        children[0].isTriangle = true;
      }

      return new TreeNode(rawLabel, children, children.length === 0, isTriangle);
    }

    try {
      const tree = parseNode();

      if (cursor < tokens.length) {
        const extra = tokens[cursor];
        throw new Error(`Line ${extra.line}, col ${extra.col}: Unexpected token '${extra.val}' after root node`);
      }

      const movements = this.findMovements(tree);

      return { tree, error: null, movements };
    } catch (err) {
      return { tree: null, error: err.message, movements: [] };
    }
  }

  static tokenize(input) {
    const tokens = [];
    let i = 0;
    let line = 1;
    let col = 1;

    while (i < input.length) {
      const ch = input[i];

      if (ch === '\n') {
        line++;
        col = 1;
        i++;
        continue;
      }

      if (/\s/.test(ch)) {
        col++;
        i++;
        continue;
      }

      if (ch === '[' || ch === ']') {
        tokens.push({ type: ch, val: ch, line, col });
        i++;
        col++;
        continue;
      }

      const startCol = col;
      let val = '';
      while (i < input.length && !/\s/.test(input[i]) && input[i] !== '[' && input[i] !== ']') {
        val += input[i];
        i++;
        col++;
      }

      tokens.push({ type: 'TEXT', val, line, col: startCol });
    }

    return tokens;
  }

  static findMovements(root) {
    const map = new Map();
    
    function traverse(node) {
      if (!node) return;
      if (node.movementId) {
        if (!map.has(node.movementId)) {
          map.set(node.movementId, []);
        }
        map.get(node.movementId).push(node);
      }
      if (node.children) {
        for (const child of node.children) {
          traverse(child);
        }
      }
    }

    traverse(root);

    const movements = [];
    for (const [id, nodes] of map.entries()) {
      if (nodes.length >= 2) {
        // First encountered in DFS is usually target (higher/left), second is origin/source (trace/lower)
        movements.push({
          id,
          source: nodes[1], // trace / source
          target: nodes[0], // antecedent / landing site
          label: id
        });
      }
    }

    return movements;
  }

  static stringify(node, indent = false, level = 0) {
    if (!node) return '';

    const pad = indent ? '  '.repeat(level) : '';

    const buildLabel = (n) => {
      let base = n.displayLabel !== undefined && n.displayLabel !== null ? n.displayLabel : n.label;
      if (n.isTriangle && !base.startsWith('^')) {
        base = '^' + base;
      }
      if (n.movementId) {
        base += '@' + n.movementId;
      }
      if (n.subscript) {
        base += '_' + n.subscript;
      }
      if (n.features && n.features.length > 0) {
        base += `[${n.features.join(', ')}]`;
      }
      return base;
    };

    const labelStr = buildLabel(node);

    if (!node.children || node.children.length === 0) {
      return `[${labelStr}]`;
    }

    if (node.children.length === 1 && node.children[0].isLeaf && (!node.children[0].children || !node.children[0].children.length)) {
      const childStr = buildLabel(node.children[0]);
      return `[${labelStr} ${childStr}]`;
    }

    const childStrings = node.children.map(c => this.stringify(c, indent, level + 1));

    if (indent) {
      return `${pad}[${labelStr}\n${childStrings.join('\n')}\n${pad}]`;
    } else {
      return `[${labelStr} ${childStrings.join(' ')}]`;
    }
  }
}
