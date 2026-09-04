import { TreeParser } from './js/parser.js';
import { TreeLayout } from './js/tree-layout.js';
import { LatexExporter } from './js/latex-exporter.js';
import { PRESETS } from './js/presets.js';

console.log('--- Testing Syntax Tree Modules ---');

// Test 1: Test all PRESETS
console.log(`\n[Test 1] Parsing all ${PRESETS.length} presets...`);
const layout = new TreeLayout();

PRESETS.forEach((preset, i) => {
  const { tree, error, movements } = TreeParser.parse(preset.code);
  if (error) {
    console.error(`FAIL: Preset ${preset.id} failed to parse:`, error);
    process.exit(1);
  }
  console.log(`  ✓ Preset ${i + 1} (${preset.id}): parsed ok. Movements: ${movements.length}`);

  // Test layout
  const layoutRes = layout.compute(tree);
  if (!layoutRes || layoutRes.width <= 0 || layoutRes.height <= 0) {
    console.error(`FAIL: Layout computation invalid for preset ${preset.id}`);
    process.exit(1);
  }
  console.log(`    Layout dimensions: ${Math.round(layoutRes.width)}x${Math.round(layoutRes.height)}px`);

  // Test LaTeX
  const forest = LatexExporter.toForest(tree, movements);
  const tikz = LatexExporter.toTikzQtree(tree);
  if (!forest.includes('\\begin{forest}') || !tikz.includes('\\Tree')) {
    console.error(`FAIL: LaTeX generation failed for preset ${preset.id}`);
    process.exit(1);
  }
});

// Test 2: Triangle notation and subscripts
console.log('\n[Test 2] Testing triangle roof & subscript notations...');
const testCode = '[TP [DP_i [^ the hungry cat]] [VP [V sat] [DP_i t_i]]]';
const res = TreeParser.parse(testCode);
if (res.error) {
  console.error('FAIL: Test 2 failed:', res.error);
  process.exit(1);
}
console.log('  ✓ Triangle and subscript parsed successfully');
const stringified = TreeParser.stringify(res.tree, true);
console.log('  Serialized round-trip:\n' + stringified);

// Test 3: Error handling for unclosed brackets
console.log('\n[Test 3] Testing syntax error detection...');
const badCode = '[TP [NP [D The] [N cat]';
const badRes = TreeParser.parse(badCode);
if (badRes.error) {
  console.log('  ✓ Expected error caught:', badRes.error);
} else {
  console.error('FAIL: Expected syntax error was not caught!');
  process.exit(1);
}

console.log('\nAll core logic tests PASSED successfully!');
