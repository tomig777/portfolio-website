"""Move archive MP4 metadata before media; preserve every encoded stream."""
import hashlib
import json
import subprocess
from pathlib import Path
import imageio_ffmpeg

root = Path(__file__).resolve().parents[2]
source = root / 'src/assets/background.mp4'
target = root / 'src/assets/web-optimized/background-faststart.mp4'
ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
target.parent.mkdir(parents=True, exist_ok=True)
subprocess.run([ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-i', str(source), '-map', '0', '-c', 'copy', '-movflags', '+faststart', str(target)], check=True)

def stream_hashes(file):
    result = subprocess.run([ffmpeg, '-hide_banner', '-loglevel', 'error', '-i', str(file), '-map', '0', '-c', 'copy', '-f', 'streamhash', '-hash', 'sha256', '-'], check=True, capture_output=True, text=True)
    return result.stdout.strip()

def atoms(file):
    data, offset, result = file.read_bytes(), 0, []
    while offset + 8 <= len(data):
        size = int.from_bytes(data[offset:offset + 4], 'big')
        kind = data[offset + 4:offset + 8].decode('ascii')
        if size == 1:
            size = int.from_bytes(data[offset + 8:offset + 16], 'big')
        if size == 0:
            size = len(data) - offset
        if size < 8:
            raise ValueError('Invalid MP4 atom')
        result.append(kind)
        offset += size
    return result

original_hashes, optimized_hashes = stream_hashes(source), stream_hashes(target)
assert original_hashes == optimized_hashes, 'Encoded streams must stay identical'
source_atoms, output_atoms = atoms(source), atoms(target)
assert output_atoms.index('moov') < output_atoms.index('mdat')
report = {'source': source.relative_to(root).as_posix(), 'output': target.relative_to(root).as_posix(), 'sourceBytes': source.stat().st_size, 'outputBytes': target.stat().st_size, 'sourceAtoms': source_atoms, 'outputAtoms': output_atoms, 'encodedStreamsUnchanged': True, 'streamHashes': original_hashes, 'outputSha256': hashlib.sha256(target.read_bytes()).hexdigest(), 'ffmpeg': imageio_ffmpeg.get_ffmpeg_version(), 'note': 'Remux only, no re-encoding; this improves progressive startup, not video byte size.'}
path = root / 'docs/verification/phase-6-assets/video.json'
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report))
