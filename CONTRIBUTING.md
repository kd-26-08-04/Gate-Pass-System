# Contributing to Gate Pass Management System

Thank you for your interest in contributing to the Gate Pass Management System! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation)
- Git
- Expo CLI (for mobile development)

### Setting up the Development Environment

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/gate-pass-system.git
   cd gate-pass-system
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   cd Backend
   npm install
   
   # Mobile app dependencies
   cd ../mobile-app
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env` in the Backend directory
   - Update the values according to your local setup

4. **Start the development servers**
   ```bash
   # Use the automated script
   ./start-system.ps1
   ```

## 📋 How to Contribute

### Reporting Bugs
1. Check if the bug has already been reported in [Issues](https://github.com/your-username/gate-pass-system/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Environment details

### Suggesting Features
1. Check existing [Issues](https://github.com/your-username/gate-pass-system/issues) for similar suggestions
2. Create a new issue with:
   - Clear feature description
   - Use case and benefits
   - Possible implementation approach

### Code Contributions

#### Branch Naming Convention
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/critical-fix` - Critical fixes
- `docs/documentation-update` - Documentation updates

#### Pull Request Process
1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding standards
   - Add tests if applicable
   - Update documentation

3. **Test your changes**
   ```bash
   # Test backend
   cd Backend
   npm test
   
   # Test mobile app
   cd mobile-app
   npm test
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Provide a clear title and description
   - Reference any related issues
   - Include screenshots for UI changes

## 🎯 Coding Standards

### JavaScript/React Native
- Use ES6+ features
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for functions
- Keep functions small and focused

### File Structure
```
Backend/
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Custom middleware
└── server.js        # Main server file

mobile-app/
├── src/
│   ├── components/  # Reusable components
│   ├── screens/     # Screen components
│   ├── navigation/  # Navigation setup
│   ├── services/    # API services
│   └── context/     # React context
└── App.js           # Main app component
```

### Commit Message Format
Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat(auth): add password reset functionality
fix(mobile): resolve login screen crash on Android
docs: update installation instructions
```

## 🧪 Testing

### Backend Testing
```bash
cd Backend
npm test
```

### Mobile App Testing
```bash
cd mobile-app
npm test
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Gate pass creation
- [ ] HOD approval/rejection flow
- [ ] Mobile app navigation
- [ ] API endpoints functionality

## 📱 Mobile Development Guidelines

### React Native Best Practices
- Use functional components with hooks
- Implement proper error handling
- Follow React Navigation patterns
- Use AsyncStorage for local data
- Optimize for both iOS and Android

### UI/UX Guidelines
- Follow platform-specific design guidelines
- Ensure accessibility compliance
- Test on different screen sizes
- Implement loading states
- Provide user feedback for actions

## 🔒 Security Considerations

- Never commit sensitive data (API keys, passwords)
- Use environment variables for configuration
- Validate all user inputs
- Implement proper authentication checks
- Follow OWASP security guidelines

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for functions
- Document complex logic
- Update README for new features
- Include API documentation

### User Documentation
- Update user guides for new features
- Include screenshots for UI changes
- Provide troubleshooting information

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback
- Help newcomers
- Follow GitHub community guidelines

### Communication
- Use clear and professional language
- Be patient with questions
- Provide detailed explanations
- Share knowledge and resources

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

## 📞 Getting Help

- Create an issue for bugs or questions
- Join discussions in pull requests
- Check existing documentation
- Contact maintainers for urgent matters

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to the Gate Pass Management System! 🎉