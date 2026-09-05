/**
 * Syntax Tree Editor - Presets Module
 * Includes both Pedagogical (S/NP) and Academic (TP/DP/CP/vP) generative grammar presets,
 * fully localized in Japanese and English.
 */

export const PRESETS_PEDAGOGICAL = [
  {
    id: 'basic-svo',
    titleJa: '基本文 (Basic SVO)',
    titleEn: 'Basic Sentence (SVO)',
    descJa: '英語の基本的な主語・動詞・目的語（SVO）の統語構造',
    descEn: 'Basic Subject-Verb-Object structural hierarchy',
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
    titleJa: 'Xバー理論 (X-bar Theory)',
    titleEn: 'X-bar Theory (Binary)',
    descJa: '投射階層（XP - X\' - X）に基づく厳密な2分枝構造',
    descEn: 'Strict binary branching based on XP - X\' - X projection',
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
    titleJa: 'Wh移動と痕跡 (Wh-Movement)',
    titleEn: 'Wh-Movement & Trace',
    descJa: '文頭（S\'）へのWh移動と基底位置の痕跡（t_i）を結ぶ移動矢印',
    descEn: 'Movement arrow connecting landing site (S\') and trace (t_i)',
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
    titleJa: '三角形省略 (Triangle / Roof)',
    titleEn: 'Triangle / Roof Abbreviation',
    descJa: '内部構造を展開せず句として一括表記する記法（[^ ...] または [^XP ...]）',
    descEn: 'Abbreviate internal structure using a triangle roof',
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
    titleJa: '埋め込み節 (Embedded Clause)',
    titleEn: 'Embedded Clause (that-clause)',
    descJa: '思考動詞によるthat補文節（S\'）の埋め込み構造',
    descEn: 'Embedded complement clause headed by that',
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
    titleJa: '日本語 SOV文 (Japanese Structure)',
    titleEn: 'Japanese SOV Sentence',
    descJa: '主語・目的語・動詞の基本語順構造',
    descEn: 'Standard head-final Subject-Object-Verb word order in Japanese',
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
    titleJa: '日本語 かき混ぜ (Scrambling)',
    titleEn: 'Japanese Scrambling',
    descJa: '目的語が文頭へ移動（スクランブリング）した構造',
    descEn: 'Object scrambling to sentence-initial position with trace',
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

export const PRESETS_ACADEMIC = [
  {
    id: 'acad-tp-vp',
    titleJa: 'TP / DP / vP 体系 (Full Functional)',
    titleEn: 'TP / DP / vP Architecture',
    descJa: '現代生成文法における標準的な機能範疇（TP, DP, vP）の階層構造',
    descEn: 'Standard functional architecture in generative syntax (TP, DP, vP)',
    code: `[TP 
  [DP 
    [D The] 
    [NP [N student]]
  ] 
  [T' 
    [T -past] 
    [vP 
      [v' 
        [v read] 
        [VP 
          [V t_v] 
          [DP 
            [D a] 
            [NP [N book]]
          ]
        ]
      ]
    ]
  ]
]`
  },
  {
    id: 'acad-cp-wh',
    titleJa: 'CPへのWh移動 (Spec-CP Movement)',
    titleEn: 'Wh-Movement to Spec-CP',
    descJa: 'Spec-CPへのWh句移動とT-to-C主語助動詞倒置',
    descEn: 'Wh-phrase movement to Spec-CP with T-to-C auxiliary inversion',
    code: `[CP 
  [DP:wh Which book] 
  [C' 
    [C did] 
    [TP 
      [DP [D the] [NP [N student]]] 
      [T' 
        [T t_did] 
        [VP 
          [V buy] 
          [DP:wh t_i]
        ]
      ]
    ]
  ]
]`
  },
  {
    id: 'acad-dp-hypothesis',
    titleJa: 'DP仮説 (DP Hypothesis & AP)',
    titleEn: 'DP Hypothesis with AP Adjunct',
    descJa: '名詞句を限定詞句（DP）とし、形容詞を付加詞とする統語分析',
    descEn: 'Determiner Phrase analysis with adjectival phrase modification',
    code: `[DP 
  [D the] 
  [NP 
    [AP [A hungry]] 
    [N' 
      [N cat]
    ]
  ]
]`
  },
  {
    id: 'acad-raising',
    titleJa: '主語繰り上がり (Subject Raising)',
    titleEn: 'Subject Raising (seem)',
    descJa: '埋め込み節の主語位置から主節Spec-TPへの繰り上がり移動',
    descEn: 'Subject raising from embedded Spec-TP to matrix Spec-TP',
    code: `[TP 
  [DP:1 John] 
  [T' 
    [T seems] 
    [TP 
      [DP:1 t_1] 
      [T' 
        [T to] 
        [VP 
          [V be] 
          [AP [A happy]]
        ]
      ]
    ]
  ]
]`
  },
  {
    id: 'acad-control',
    titleJa: '制御構文とPRO (Subject Control & PRO)',
    titleEn: 'Subject Control with PRO',
    descJa: '非定形節の主語位置に生起する空語彙主語 PRO の統語構造',
    descEn: 'Subject control structure with null pronominal PRO in infinitival clause',
    code: `[TP 
  [DP [N John]] 
  [T' 
    [T tried] 
    [CP 
      [TP 
        [DP PRO] 
        [T' 
          [T to] 
          [VP [V win]]
        ]
      ]
    ]
  ]
]`
  },
  {
    id: 'acad-cp-embedded',
    titleJa: '補文標識that節 (Complementizer CP)',
    titleEn: 'Complementizer CP Clause',
    descJa: '思考動詞の補部としてのCP（that節）の精密な投射',
    descEn: 'CP complement of propositional attitude verb',
    code: `[TP 
  [DP [N Mary]] 
  [T' 
    [T pres] 
    [VP 
      [V thinks] 
      [CP 
        [C that] 
        [TP 
          [DP [N John]] 
          [T' [T past] [VP [V left]]]
        ]
      ]
    ]
  ]
]`
  }
];

export const PRESETS = PRESETS_PEDAGOGICAL;
