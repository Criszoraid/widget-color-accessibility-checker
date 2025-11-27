# Color Accessibility Checker 🎨

A web application to check color accessibility compliance with WCAG guidelines. This tool helps designers and developers ensure their websites meet accessibility standards.

## Features

- ✅ URL-based accessibility analysis
- 🎯 WCAG AA/AAA compliance checking
- 📊 Visual results with scores and error counts
- 🔧 Advanced options for custom analysis
- 🎨 Clean, modern UI inspired by shadcn/ui

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **CSS3** - Styling

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/Criszoraid/color-accessibility-checker.git
cd color-accessibility-checker
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Building for Production

\`\`\`bash
npm run build
\`\`\`

The production-ready files will be in the `dist/` directory.

## Deployment

### Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Static Site"
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. Click "Create Static Site"

Your app will be live at `https://your-app-name.onrender.com`

## Usage

1. Enter a website URL in the input field
2. (Optional) Click "Opciones avanzadas" to configure WCAG AAA checking
3. Click "Analizar accesibilidad"
4. View the results with score and error count

## License

MIT

## Author

Created by [Criszoraid](https://github.com/Criszoraid)
