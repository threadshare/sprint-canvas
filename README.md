# Foundation Sprint

A collaborative product strategy tool based on Google Ventures' Foundation Sprint methodology. Helps founding teams achieve core strategic consensus in 10 hours through structured thinking and rapid idea validation.

## 🎥 Demo

https://github.com/threadshare/sprint-canvas/assets/demo/foundation_sprint_demo.mp4

*A 2-minute overview showing the complete Foundation Sprint workflow from team setup to strategic consensus.*

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/foundation-sprint.git
cd foundation-sprint

# Option 1: Docker (Recommended)
make env          # Create environment file
make build        # Build images
make up           # Start all services

# Option 2: Local Development
cd frontend && npm install && npm run dev  # Frontend at http://localhost:3000
cd backend && go run cmd/api/main.go       # Backend at http://localhost:8080
```

## 📚 Documentation

### Getting Started
- [**Quick Start Guide**](./GETTING_STARTED.md) - Set up and run the application
- [**Docker Deployment**](./README-DOCKER.md) - Complete Docker setup and deployment guide

### Methodology & Product
- [**Foundation Sprint Guide**](./docs/Foundation.md) - Complete methodology explanation and framework
- [**Original Article (Chinese)**](./docs/foundation-sprint-guide-cn.md) - Original Foundation Sprint guide from Google Ventures

### Development
- [**Project Configuration**](./CLAUDE.md) - Development principles, conventions, and Claude Code configuration
- [**Backend Documentation**](./backend/README.md) - Go backend architecture and API documentation
- [**Interactive Agents Design**](./backend/docs/interactive-agents.md) - AI agents implementation details

## 🎯 Core Features

### Foundation Sprint Workflow
1. **Foundation Stage** - Define customers, problems, competition, and advantages
2. **Differentiation Stage** - 2x2 analysis to find unique positioning  
3. **Approach Stage** - Magic Lenses for multi-angle solution evaluation

### AI Sub-Agents
- **Think Agent** - Supplement thinking angles, discover blind spots
- **Critique Agent** - Challenge idealism, assess market reality
- **Research Agent** - Deep research and data collection

### Collaboration Features
- Custom room ID for team sessions
- Real-time collaborative editing
- Note and Vote mechanism for decision making
- Timer-based sprint sessions

## 🛠 Tech Stack

**Frontend**
- React 18 + TypeScript
- ShadcnUI + TailwindCSS  
- Vite + WebSocket
- Paper card aesthetic design

**Backend**
- Golang + Gin Framework
- WebSocket for real-time sync
- PostgreSQL + Redis
- OpenAI API integration

**Infrastructure**
- Docker + Docker Compose
- Nginx reverse proxy
- Multi-stage builds for optimization

## 📦 Project Structure

```
foundation-sprint/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── lib/            # Utilities and helpers
│   │   └── App.tsx         # Main application
│   ├── Dockerfile          # Production build
│   └── package.json
│
├── backend/                 # Golang backend API
│   ├── cmd/api/            # Application entry point
│   ├── internal/           # Internal packages
│   │   ├── agents/         # AI agent implementations
│   │   ├── handlers/       # HTTP handlers
│   │   └── models/         # Data models
│   ├── Dockerfile          # Production build
│   └── go.mod
│
├── docker-compose.yml       # Service orchestration
├── Makefile                # Build and management commands
└── docs/                   # Additional documentation
```

## 🚢 Deployment

### Production with Docker

```bash
# Build for linux/amd64 (for Mac M-series chips)
DOCKER_DEFAULT_PLATFORM=linux/amd64 make build

# Deploy to production
docker-compose up -d

# Monitor services
make logs
make ps
```

### Environment Variables

Create `.env` file from `.env.example`:

```env
# Required
OPENAI_API_KEY=sk-xxx           # OpenAI API key
JWT_SECRET=your-secret-key      # Change in production

# Database
POSTGRES_PASSWORD=secure-pass   # PostgreSQL password
REDIS_PASSWORD=secure-pass      # Redis password

# Optional
GIN_MODE=release                # Gin framework mode
CORS_ORIGINS=http://localhost   # Allowed origins
```

## 🧪 Development

### Local Development

```bash
# Frontend with hot reload
cd frontend
npm run dev

# Backend with air (hot reload)
cd backend
air -c .air.toml

# Run tests
make test

# Code linting
make lint
```

### Development Tools

- **Database Admin**: http://localhost:8081 (Adminer, dev profile only)
- **API Documentation**: http://localhost:8080/swagger
- **WebSocket Testing**: Use `wscat` or browser DevTools

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Ventures for the Foundation Sprint methodology
- The open-source community for the amazing tools and libraries

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/foundation-sprint/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/foundation-sprint/discussions)
- **Email**: support@foundation-sprint.com

---

Built with ❤️ to help teams achieve strategic consensus quickly and effectively.