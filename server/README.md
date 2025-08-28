# EduPlatform Backend Server

Node.js backend server for the EduPlatform educational application.

## Features

- 🔐 JWT-based authentication
- 📊 Test management and results tracking
- 🤖 AI-powered chat assistant
- 📈 Analytics and progress tracking
- 🗄️ SQLite database with automatic initialization
- 🔒 Security middleware (CORS, Helmet)
- 📝 Request logging

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start the server:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `8000` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key...` |
| `GEMINI_API_KEY` | Google Gemini API key | - |
| `DEEPSEEK_API_KEY` | DeepSeek API key | - |
| `OPENROUTER_API_KEY` | OpenRouter API key | - |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Tests
- `GET /api/tests` - Get all tests
- `GET /api/tests/:id` - Get specific test
- `POST /api/tests` - Create new test (teacher/admin only)
- `POST /api/tests/submit` - Submit test result
- `POST /api/tests/:id/submit` - Submit result for specific test
- `GET /api/tests/results/me` - Get user's test results

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `GET /api/profile/stats` - Get user statistics

### AI Assistant
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/ai/generate-quiz` - Generate AI quiz
- `GET /api/ai/chat/history` - Get chat history

### Analytics
- `GET /api/analytics` - Get user analytics
- `GET /api/analytics/subject/:subject` - Get subject-specific analytics
- `GET /api/analytics/comparison` - Get performance comparison

### System
- `GET /health` - Health check
- `POST /api/init` - Initialize system

## Database

The server uses SQLite for data storage. The database file is automatically created at `./data/eduplatform.db` on first run.

### Default Users

The system creates these default users:

| Email | Password | Role |
|-------|----------|------|
| `demo@example.com` | `password123` | student |
| `admin@example.com` | `admin123` | admin |
| `teacher@example.com` | `teacher123` | teacher |

## AI Integration

The server supports multiple AI services for the chat assistant:

1. **Google Gemini** (recommended for free tier)
2. **DeepSeek** (good quality, paid)
3. **OpenRouter** (aggregator service)

Add API keys to your environment variables. The server will try them in order and fall back to demo responses if none are available.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# The server will run on http://localhost:8000
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure proper CORS origins
4. Consider using a process manager like PM2
5. Set up reverse proxy (nginx/Apache)
6. Enable HTTPS

## Security Notes

- Change the default JWT secret in production
- Use HTTPS in production
- Regularly update dependencies
- Consider rate limiting for API endpoints
- Validate all user inputs
- Use environment variables for sensitive data

## Troubleshooting

### Common Issues

1. **Port already in use:** Change the `PORT` in your `.env` file
2. **Database errors:** Ensure the `./data` directory is writable
3. **AI responses not working:** Check your API keys in `.env`
4. **CORS errors:** Update `CORS_ORIGINS` in your environment

### Logs

The server uses Morgan for request logging. Check the console output for detailed request/response information.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
