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
    code: `[TP 
  [DP 
    [D The] 
    [NP 
      [N student]
    ]
  ] 
  [VP 
    [V read] 
    [DP 
      [D a] 
      [NP 
        [N book]
      ]
    ]
  ]
]`
  },
  {
    id: 'x-bar-theory',
    title: 'Xバー理論 (X-bar Theory)',
    description: '投射階層（XP - X\' - X）に基づく厳密な2分枝構造',
    code: `[TP 
  [DP 
    [D' 
      [D the] 
      [NP 
        [N' 
          [N student]
        ]
      ]
    ]
  ] 
  [T' 
    [T [past]] 
    [VP 
      [V' 
        [V read] 
        [DP 
          [D' 
            [D a] 
            [NP 
              [N' 
                [N book]
              ]
            ]
          ]
        ]
      ]
    ]
  ]
]`
  },
  {
    id: 'wh-movement',
    title: 'Wh移動と痕跡 (Wh-Movement & Arrow)',
    description: 'CP領域へのWh移動と基底位置の痕跡（t_i）を結ぶ移動矢印',
    code: `[CP 
  [DP:wh Which book] 
  [C' 
    [C did] 
    [TP 
      [DP 
        [D the] 
        [NP 
          [N student]
        ]
      ] 
      [VP 
        [V buy] 
        [DP:wh t_i]
      ]
    ]
  ]
]`
  },
  {
    id: 'triangle-roof',
    title: '三角形省略 (Triangle / Roof)',
    description: '内部構造を展開せず句として一括表記する記法（[^ ...]）',
    code: `[TP 
  [DP 
    [^ the hungry cat]
  ] 
  [VP 
    [V caught] 
    [DP 
      [^ a very clever mouse]
    ] 
    [PP 
      [P in] 
      [DP 
        [^ the old wooden barn]
      ]
    ]
  ]
]`
  },
  {
    id: 'embedded-cp',
    title: 'CP埋め込み節 (Complementizer Phrase)',
    description: '思考動詞によるthat補文節の埋め込み構造',
    code: `[TP 
  [DP [N Mary]] 
  [VP 
    [V thinks] 
    [CP 
      [C that] 
      [TP 
        [DP [N John]] 
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
    description: '主語・目的語・動詞の主要部末尾（Head-final）構造',
    code: `[TP 
  [DP 
    [NP [N 太郎]] 
    [K が]
  ] 
  [VP 
    [DP 
      [NP [N 本]] 
      [K を]
    ] 
    [V 読んだ]
  ]
]`
  },
  {
    id: 'japanese-scrambling',
    title: '日本語 かき混ぜ (Scrambling)',
    description: '目的語が文頭へ移動（スクランブリング）した構造',
    code: `[TP 
  [DP:sc [NP [N 本]] [K を]] 
  [TP 
    [DP 
      [NP [N 太郎]] 
      [K が]
    ] 
    [VP 
      [DP:sc t_i] 
      [V 読んだ]
    ]
  ]
]`
  }
];
