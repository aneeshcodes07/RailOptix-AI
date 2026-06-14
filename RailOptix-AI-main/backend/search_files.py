import os

workspace = r"c:\Users\RAGHUNANDANA SL\Projects\railoptix-ai"
search_words = ["hackathon", "sih", "hack"]

print("Starting custom file search...")
for root, dirs, files in os.walk(workspace):
    if "node_modules" in root or "venv" in root or ".git" in root or "dist" in root:
        continue
    for file in files:
        if file.endswith((".py", ".jsx", ".js", ".json", ".html", ".css", ".txt")):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    for word in search_words:
                        if word in content.lower():
                            print(f"Found '{word}' in file: {filepath}")
                            # Print matching lines
                            lines = content.splitlines()
                            for i, line in enumerate(lines):
                                if word in line.lower():
                                    print(f"  Line {i+1}: {line}")
            except Exception as e:
                print(f"Error reading {filepath}: {e}")
print("Custom search completed.")
