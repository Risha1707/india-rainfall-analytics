"""
server.py
Standalone local Python development server.
Run with: python server.py
Serves API endpoints locally on http://localhost:8000
"""

from http.server import HTTPServer
import sys
import os

# Add api directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from api.predict import handler

def run(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, handler)
    print(f"🚀 Varsha-AI Local Python API running at http://localhost:{port}/")
    print(f"📡 Endpoints available: POST /api/predict, GET /api/predict")
    print("Press Ctrl+C to stop.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    run(port)
