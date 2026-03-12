#!/usr/bin/env python3
"""
MoonPay Partner Skill Generator
Usage: python generate.py configs/partner.json
Outputs: partners/partner-moonpay-skill.md
"""

import json
import sys
import os
import re
from pathlib import Path

def load_config(path: str) -> dict:
    with open(path) as f:
        return json.load(f)

def fill_template(template: str, config: dict) -> str:
    result = template
    for key, value in config.items():
        placeholder = "{{" + key + "}}"
        result = result.replace(placeholder, str(value))
    # Warn about any unfilled placeholders
    remaining = re.findall(r'\{\{[A-Z_]+\}\}', result)
    if remaining:
        print(f"  Warning: unfilled placeholders: {', '.join(set(remaining))}")
    return result

def main():
    if len(sys.argv) < 2:
        print("Usage: python generate.py configs/<partner>.json")
        sys.exit(1)

    config_path = sys.argv[1]
    config = load_config(config_path)

    template_path = Path(__file__).parent / "template.md"
    with open(template_path) as f:
        template = f.read()

    output = fill_template(template, config)

    partner_slug = config.get("PARTNER_SLUG", Path(config_path).stem)
    output_path = Path(__file__).parent / "partners" / f"{partner_slug}-moonpay-skill.md"
    output_path.parent.mkdir(exist_ok=True)

    with open(output_path, "w") as f:
        f.write(output)

    print(f"Generated: {output_path}")

if __name__ == "__main__":
    main()
