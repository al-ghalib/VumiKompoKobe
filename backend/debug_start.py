import sys
import os

print("Starting debug script...")
try:
    print("Importing uvicorn...")
    import uvicorn
    print("Importing app from main...")
    # Add current dir to path
    sys.path.append(os.getcwd())
    from main import app
    print("Imports successful. Starting server on 8000...")
    uvicorn.run(app, host="127.0.0.1", port=8000)
except Exception as e:
    print(f"CRITICAL ERROR: {e}")
    import traceback
    traceback.print_exc()
