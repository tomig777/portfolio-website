"""Lossless WOFF2 conversion for existing local fonts; no glyph subsetting."""
import argparse
import hashlib
import json
import io
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.misc.xmlWriter import XMLWriter

parser = argparse.ArgumentParser()
parser.add_argument('--report', required=True)
args = parser.parse_args()
root = Path(__file__).resolve().parents[2]
fonts = root / 'src' / 'assets' / 'fonts'
output = fonts / 'woff2'
output.mkdir(exist_ok=True)
results = []

for source in sorted(fonts.glob('*')):
    if source.suffix.lower() not in {'.otf', '.ttf'}:
        continue
    target = output / (source.stem + '.woff2')
    original = TTFont(source, recalcTimestamp=False)
    original.flavor = 'woff2'
    original.save(target)
    compressed = TTFont(target, recalcTimestamp=False)
    # Compression can reorganize glyf/loca storage. Compare semantic outlines,
    # character maps, metrics and shaping XML rather than encoded byte offsets.
    from fontTools.pens.recordingPen import RecordingPen
    assert original.getGlyphOrder() == compressed.getGlyphOrder(), source.name
    assert original.getBestCmap() == compressed.getBestCmap(), source.name
    assert original['hmtx'].metrics == compressed['hmtx'].metrics, source.name
    for tag in ['GSUB', 'GPOS', 'GDEF', 'kern', 'hhea', 'OS/2']:
        if tag not in original:
            assert tag not in compressed, (source.name, tag)
            continue
        left_xml, right_xml = io.StringIO(), io.StringIO()
        original[tag].toXML(XMLWriter(left_xml), original)
        compressed[tag].toXML(XMLWriter(right_xml), compressed)
        assert left_xml.getvalue() == right_xml.getvalue(), (source.name, tag)
    source_glyphs, target_glyphs = original.getGlyphSet(), compressed.getGlyphSet()
    for name in original.getGlyphOrder():
        left, right = RecordingPen(), RecordingPen()
        source_glyphs[name].draw(left)
        target_glyphs[name].draw(right)
        assert left.value == right.value, (source.name, name)
    results.append({'source': source.relative_to(root).as_posix(), 'output': target.relative_to(root).as_posix(), 'sourceBytes': source.stat().st_size, 'outputBytes': target.stat().st_size, 'savedBytes': source.stat().st_size - target.stat().st_size, 'glyphs': len(original.getGlyphOrder()), 'glyphOutlinesAndMetricsMatch': True, 'shapingTablesMatch': True, 'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'outputSha256': hashlib.sha256(target.read_bytes()).hexdigest()})
    original.close()
    compressed.close()

report = root / args.report
report.parent.mkdir(parents=True, exist_ok=True)
report.write_text(json.dumps({'mode': 'WOFF2 only; no subsetting', 'fonts': results}, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'fonts': len(results), 'sourceBytes': sum(item['sourceBytes'] for item in results), 'outputBytes': sum(item['outputBytes'] for item in results), 'glyphOutlinesAndMetricsMatch': True}))
