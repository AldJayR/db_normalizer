#!/usr/bin/env bash
set -e

echo "🔨 Building Database Normalizer Server..."

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --no-frozen-lockfile

# Build TypeScript
echo "⚙️  Compiling TypeScript..."
pnpm run build

echo "✅ Build complete! Run 'pnpm start' to launch the server."
