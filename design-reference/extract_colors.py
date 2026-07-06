import re
import glob

def extract_colors(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    colors = set(re.findall(r'#(?:[0-9a-fA-F]{3}){1,2}\b', content))
    rgb_colors = set(re.findall(r'rgba?\([^)]+\)', content))
    
    print(f"Colors in {file_path}:")
    for c in sorted(colors):
        print(c)
    for c in sorted(rgb_colors):
        print(c)
    print("\n")

extract_colors('/Users/rajshroff/.gemini/antigravity-ide/scratch/ecommerce/design-reference/unpacked_admin_template.html')
extract_colors('/Users/rajshroff/.gemini/antigravity-ide/scratch/ecommerce/design-reference/unpacked_frontstore_template.html')
