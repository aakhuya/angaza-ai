import sys
from pathlib import Path

# Make `app` importable regardless of where pytest is invoked from.
ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
