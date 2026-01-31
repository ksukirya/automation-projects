# Impact3 Presentation Generator

Scripts to generate the Impact3 AI & Automation Audit presentation deck.

## Available Scripts

Two versions available - choose one based on your preference:

### JavaScript Version (Node.js)

**File:** `create_impact3_deck.js`

**Install dependencies:**
```bash
npm install
```

**Run:**
```bash
node scripts/create_impact3_deck.js
```

### Python Version

**File:** `create_impact3_deck.py`

**Install dependencies:**
```bash
pip install -r requirements.txt
```

**Run:**
```bash
python scripts/create_impact3_deck.py
```

## Output

Both scripts generate the same presentation:
- **Location:** `~/Documents/Impact3_AI_Audit_Presentation.pptx`
- **Format:** PowerPoint (.pptx)
- **Slides:** 28 slides covering discovery findings, pain points, solutions, and ROI

## Troubleshooting

**Node.js errors:**
- Ensure Node.js is installed: `node --version`
- Run `npm install` in the project root

**Python errors:**
- Ensure Python 3.7+ is installed: `python --version`
- **For Windows Store Python (recommended):**
  ```bash
  pip install -r requirements.txt
  ```
- **If you have multiple Python installations**, use:
  ```bash
  # Find your Python installation
  where python

  # Use the Windows Store Python directly
  C:\Users\[YourUsername]\AppData\Local\Microsoft\WindowsApps\python.exe -m pip install python-pptx
  ```
- **Recommended:** Use the JavaScript version if Python environment setup is complex
