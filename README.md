# 🚀 AI MCP Agent - React Frontend

Modern React + TypeScript + Tailwind CSS frontend for the AI MCP Agent.

## ✨ Features

- 🎨 **Beautiful UI** with Tailwind CSS
- ⚡ **Real-time Streaming** responses using Server-Sent Events
- 🔧 **MCP Server Management** - Add/delete servers from UI
- 💬 **Conversation Memory** - Context maintained across messages
- 🎯 **Mode Switching** - Agent mode vs RAG-only mode
- 📱 **Responsive Design** - Works on all devices

## 🛠️ Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **ESLint** - Code quality

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Backend

In a separate terminal:

```bash
cd ../mcp-server
./start_server.sh
```

Backend will run on: http://localhost:8000

### 3. Start Frontend

```bash
npm run dev
```

Frontend will run on: http://localhost:5173

### 4. Open Browser

Navigate to: **http://localhost:5173**

## 📁 Project Structure

```
src/
├── components/
│   ├── ChatMessage.tsx    # Message bubble component
│   ├── ChatInput.tsx      # Input field with send button
│   └── MCPManager.tsx     # MCP server management modal
├── services/
│   └── api.ts             # API client for backend
├── App.tsx                # Main application component
├── App.css                # Additional styles
├── index.css              # Tailwind CSS imports
└── main.tsx               # Entry point
```

## 🎯 Usage

### Chat with AI

1. Type your message in the input field
2. Press Enter or click "Send"
3. Watch the response stream in real-time
4. Tool usage will be shown as badges

### Manage MCP Servers

1. Click "🔧 MCP Servers" button in header
2. Fill in server name and URL
3. Click "➕ Add Server"
4. Server is available immediately!

### Switch Modes

- **Agent Mode**: Uses all MCP tools + RAG
- **RAG Mode**: Only uses knowledge base (faster)

## 🔌 API Integration

The frontend connects to the FastAPI backend running on port 8000.

### Key Endpoints Used:

- `GET /health` - Health check
- `POST /api/chat/stream` - Streaming chat
- `GET /api/mcp-servers` - List servers
- `POST /api/mcp-servers` - Add server
- `DELETE /api/mcp-servers/{name}` - Delete server

## 🎨 Styling

This project uses Tailwind CSS for styling. Key features:

- Gradient backgrounds
- Smooth animations
- Responsive design
- Custom color palette
- Modern UI components

## 🧪 Development

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint Code

```bash
npm run lint
```

## 🔧 Configuration

### Vite Config

Edit `vite.config.ts` to change:
- Port (default: 5173)
- Proxy settings
- Build options

### Tailwind Config

Edit `tailwind.config.js` to customize:
- Colors
- Fonts
- Spacing
- Animations

### API URL

Edit `src/services/api.ts` to change the backend URL:

```typescript
const API_BASE_URL = 'http://localhost:8000';
```

## 📊 Performance

- Initial load: ~100KB (gzipped)
- Lazy loading for optimal performance
- Efficient re-renders with React
- Streaming for instant feedback

## 🐛 Troubleshooting

### Backend Connection Issues

Make sure the backend is running:

```bash
cd ../mcp-server
./start_server.sh
```

Check backend is accessible: http://localhost:8000/health

### CORS Errors

The backend has CORS enabled for all origins. If you still see errors:

1. Check backend is running
2. Verify the API URL in `src/services/api.ts`
3. Check browser console for details

### Styling Issues

If Tailwind styles aren't working:

```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Restart dev server
npm run dev
```

## 🎉 Features Showcase

### Real-time Streaming

Responses appear word-by-word as they're generated, providing instant feedback.

### Tool Tracking

When the agent uses tools (like math operations or RAG), you'll see badges showing which tools were used.

### Beautiful Animations

- Slide-in animations for messages
- Bounce animation for typing indicator
- Smooth transitions for all interactions

### Responsive Design

Works perfectly on:
- Desktop (1920px+)
- Laptop (1366px+)
- Tablet (768px+)
- Mobile (375px+)

## 📝 Next Steps

- [ ] Add voice input/output
- [ ] Add file upload support
- [ ] Add conversation export
- [ ] Add dark mode
- [ ] Add keyboard shortcuts
- [ ] Add message editing
- [ ] Add conversation search

## 🤝 Contributing

This is a frontend for the AI MCP Agent backend. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

Same as the main AI MCP Agent project.

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**
