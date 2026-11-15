"""Recompute the CSP hashes in netlify.toml for the inline <style> and <script> in index.html.

Run after any edit to the CSS or JS in index.html:  python scripts/update-csp.py
Without this, the live site blocks the edited styles/script.
"""
import base64, hashlib, pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
html = (root / "index.html").read_text(encoding="utf-8").replace("\r\n", "\n")
toml_path = root / "netlify.toml"
toml = toml_path.read_text(encoding="utf-8").replace("\r\n", "\n")

def sha(block):
    return "'sha256-" + base64.b64encode(hashlib.sha256(block.encode("utf-8")).digest()).decode() + "'"

styles = re.findall(r"<style>(.*?)</style>", html, re.S)
scripts = re.findall(r"<script>(.*?)</script>", html, re.S)
style_src = " ".join(map(sha, styles)) + " https://fonts.googleapis.com"
script_src = " ".join(map(sha, scripts)) or "'none'"

toml = re.sub(r"script-src [^;]*;", f"script-src {script_src};", toml)
toml = re.sub(r"style-src [^;]*;", f"style-src {style_src};", toml)
toml_path.write_bytes(toml.encode("utf-8"))
print(f"style-src  {style_src}\nscript-src {script_src}")
