FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy server code
COPY server.py .

# Expose port (Render uses 10000 by default or PORT env var, but we can bind to 0.0.0.0)
ENV PORT=8080

# Run with uvicorn
# Assuming 'mcp' in server.py is the ASGI app or compatible
CMD ["sh", "-c", "uvicorn server:mcp --host 0.0.0.0 --port ${PORT}"]
