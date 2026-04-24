import json
import os
from pathlib import Path
root = Path(__file__).parent
manifest_path = root / '.scf-manifest.json'
manifest_files = set()
if manifest_path.exists():
    m = json.loads(manifest_path.read_text(encoding='utf-8'))
    for e in m.get('entries', []):
        manifest_files.add(e['file'].replace('\\','/'))
all_files = []
for dirpath, dirnames, filenames in os.walk(root):
    for fn in filenames:
        p = Path(dirpath) / fn
        rel = p.relative_to(root).as_posix()
        all_files.append(rel)
orphans = [f for f in sorted(all_files) if f not in manifest_files and f not in ('.scf-manifest.json','.scf-registry-cache.json')]
report = {'total_files': len(all_files), 'manifest_tracked': len(manifest_files), 'orphans_count': len(orphans), 'orphans': orphans}
print(json.dumps(report, ensure_ascii=False, indent=2))
