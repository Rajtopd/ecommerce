import json
import base64
import gzip
import re
import sys

def unpack(file_path, output_prefix):
    with open(file_path, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Extract template
    template_match = re.search(r'<script type="__bundler/template">(.*?)</script>', html, re.DOTALL)
    if template_match:
        template = json.loads(template_match.group(1))
        with open(f'{output_prefix}_template.html', 'w', encoding='utf-8') as out:
            out.write(template)
        print(f"Wrote {output_prefix}_template.html")
    
    # Extract manifest
    manifest_match = re.search(r'<script type="__bundler/manifest">(.*?)</script>', html, re.DOTALL)
    if manifest_match:
        manifest = json.loads(manifest_match.group(1))
        for uuid, entry in manifest.items():
            if entry['mime'] == 'text/css':
                data = base64.b64decode(entry['data'])
                if entry.get('compressed'):
                    try:
                        data = gzip.decompress(data)
                    except:
                        pass
                with open(f'{output_prefix}_{uuid}.css', 'wb') as out:
                    out.write(data)
                print(f"Wrote {output_prefix}_{uuid}.css")
            elif entry['mime'] == 'text/javascript':
                data = base64.b64decode(entry['data'])
                if entry.get('compressed'):
                    try:
                        data = gzip.decompress(data)
                    except:
                        pass
                with open(f'{output_prefix}_{uuid}.js', 'wb') as out:
                    out.write(data)
                print(f"Wrote {output_prefix}_{uuid}.js")

unpack('/Users/rajshroff/.gemini/antigravity-ide/scratch/ecommerce/design-reference/Admin panel UI.html', '/Users/rajshroff/.gemini/antigravity-ide/scratch/ecommerce/design-reference/unpacked_admin')
unpack('/Users/rajshroff/.gemini/antigravity-ide/scratch/ecommerce/design-reference/Frontstore UI.html', '/Users/rajshroff/.gemini/antigravity-ide/scratch/ecommerce/design-reference/unpacked_frontstore')
