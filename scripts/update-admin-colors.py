#!/usr/bin/env python3
"""
Batch update admin panel theme colors from lagoon (blue) to orange brand colors.
Run this script from the project root directory.
"""

import os
import re
from pathlib import Path

# Color mappings: lagoon -> orange/navy
COLOR_REPLACEMENTS = {
    'lagoon-50': 'orange-50',
    'lagoon-100': 'orange-100',
    'lagoon-200': 'orange-200',
    'lagoon-300': 'orange-300',
    'lagoon-400': 'orange-400',
    'lagoon-500': 'orange-500',
    'lagoon-600': 'orange-600',
    'lagoon-700': 'navy-700',
    'lagoon-800': 'navy-800',
    'lagoon-900': 'navy-900',
}

def update_file(file_path: Path):
    """Update color references in a single file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Apply all replacements
        for old_color, new_color in COLOR_REPLACEMENTS.items():
            content = content.replace(old_color, new_color)
        
        # Only write if changes were made
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✓ Updated: {file_path.relative_to(Path.cwd())}")
            return True
        return False
    except Exception as e:
        print(f"✗ Error updating {file_path}: {e}")
        return False

def main():
    """Update all admin panel files."""
    admin_dir = Path('admin/src')
    
    if not admin_dir.exists():
        print("Error: admin/src directory not found. Run this script from project root.")
        return
    
    # Find all TypeScript/TSX files
    files_to_update = list(admin_dir.rglob('*.tsx')) + list(admin_dir.rglob('*.ts'))
    
    print(f"Found {len(files_to_update)} files to check...")
    print("-" * 60)
    
    updated_count = 0
    for file_path in files_to_update:
        if update_file(file_path):
            updated_count += 1
    
    print("-" * 60)
    print(f"\n✅ Complete! Updated {updated_count} files.")
    print("\nThe admin panel now uses the orange brand theme:")
    print("  • Primary: orange-500 (#fb8500)")
    print("  • Dark backgrounds: navy-800, navy-700")
    print("  • Accents: orange shades")

if __name__ == '__main__':
    main()
