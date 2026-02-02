from importlib import metadata
import re

req_file = 'requirements.txt'

reqs = []
with open(req_file, 'r', encoding='utf-8') as f:
    for line in f:
        line=line.strip()
        if not line or line.startswith('#'):
            continue
        m = re.match(r"^([^=<>!~\s]+)(?:==([0-9\.]+))?", line)
        if m:
            name = m.group(1)
            ver = m.group(2)
            reqs.append((name, ver))

ok = True
for name, required in reqs:
    try:
        installed = metadata.version(name)
    except metadata.PackageNotFoundError:
        print(f"MISSING: {name} (required: {required})")
        ok = False
        continue
    if required and installed != required:
        print(f"VERSION MISMATCH: {name} (required: {required}, installed: {installed})")
        ok = False
    else:
        print(f"OK: {name}=={installed}")

if not ok:
    raise SystemExit(2)
else:
    print('\nAll required packages are present with matching versions.')
