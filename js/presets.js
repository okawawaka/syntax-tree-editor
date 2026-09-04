/**
 * Syntax Tree Editor - Presets Module
 * Curated linguistic examples demonstrating standard syntax structures,
 * X-bar theory, movement traces, triangle roofs, and cross-linguistic (Japanese) trees.
 */

export const PRESETS = [
  {
    id: 'basic-svo',
    title: '基本文 (Basic SVO)',
    description: '英語の基本的な主語・動詞・目的語（SVO）の統語構造',
    code: `[S 
  [NP 
    [D The] 
    [N student]
  ] 
  [VP 
    [V read] 
    [NP 
      [D a] 
      [N book]
    ]
  ]
]`
  },
  {
    id: 'x-bar-theory',
    title: 'Xバー理論 (X-bar Theory)',
    description: '投射階層（XP - X\' - X）に基づく厳密な2分枝構造',
    code: `[S 
  [NP 
    [D the] 
    [N' 
      [N student]
    ]
  ] 
  [VP 
    [V' 
      [V read] 
      [NP 
        [D a] 
        [N' 
          [N book]
        ]
      ]
    ]
  ]
]`
  },
  {
    id: 'wh-movement',
    title: 'Wh移動と痕跡 (Wh-Movement & Arrow)',
    description: '文頭（S\'）へのWh移動と基底位置の痕跡（t_i）を結ぶ移動矢印',
    code: `[S' 
  [NP:wh Which book] 
  [S 
    [Aux did] 
    [NP 
      [D the] 
      [N student]
    ] 
    [VP 
      [V buy] 
      [NP:wh t_i]
    ]
  ]
]`
  },
  {
    id: 'triangle-roof',
    title: '三角形省略 (Triangle / Roof)',
    description: '内部構造を展開せず句として一括表記する記法（[^ ...] または [^XP ...]）',
    code: `[S 
  [NP This] 
  [VP 
    [V is] 
    [^NP a wug]
  ]
]`
  },
  {
    id: 'embedded-clause',
    title: '埋め込み節 (Embedded Clause)',
    description: '思考動詞によるthat補文節（S\'）の埋め込み構造',
    code: `[S 
  [NP [N Mary]] 
  [VP 
    [V thinks] 
    [S' 
      [Comp that] 
      [S 
        [NP [N John]] 
        [VP 
          [V left]
        ]
      ]
    ]
  ]
]`
  },
  {
    id: 'japanese-sov',
    title: '日本語 SOV文 (Japanese Structure)',
    description: '主語・目的語・動詞の基本語順構造',
    code: `[S 
  [NP 
    [N 太郎] 
    [P が]
  ] 
  [VP 
    [NP 
      [N 本] 
      [P を]
    ] 
    [V 読んだ]
  ]
]`
  },
  {
    id: 'japanese-scrambling',
    title: '日本語 かき混ぜ (Scrambling)',
    description: '目的語が文頭へ移動（スクランブリング）した構造',
    code: `[S 
  [NP:sc [N 本] [P を]] 
  [S 
    [NP 
      [N 太郎] 
      [P が]
    ] 
    [VP 
      [NP:sc t_i] 
      [V 読んだ]
    ]
  ]
]`
  }
];
