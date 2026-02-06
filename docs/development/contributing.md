# Contributing to Substrate Platform

First off, thank you for considering contributing to Substrate Platform! It's people like you that make this project such a great tool.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Docker Development](#docker-development)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

### Our Standards

- **Be respectful**: Treat everyone with respect and kindness
- **Be collaborative**: Work together and help each other
- **Be inclusive**: Welcome newcomers and diverse perspectives
- **Be professional**: Keep discussions focused and constructive

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include as many details as possible using the bug report template.

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. Use the feature request template and provide detailed information about the proposed feature.

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `documentation` - Documentation improvements

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (see commit guidelines below)
5. Push to your fork (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 💻 Development Setup

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Docker 24.x or higher (optional, for Docker development)
- Git

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/substrate-platform.git
   cd substrate-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your local settings
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open http://localhost:5173 (or the port shown in terminal)

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix

# Format code (if Prettier is configured)
npm run format
```

## 🔄 Pull Request Process

### Before Submitting

1. **Update your fork**: Sync with the latest changes from main
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-feature-branch
   git rebase main
   ```

2. **Run tests**: Ensure all tests pass
   ```bash
   npm test
   ```

3. **Lint your code**: Fix any linting errors
   ```bash
   npm run lint
   ```

4. **Build the project**: Verify the build succeeds
   ```bash
   npm run build
   ```

5. **Update documentation**: Update relevant docs for your changes

### PR Guidelines

- **Fill out the PR template completely**
- **Link to related issues** using "Fixes #123" or "Closes #123"
- **Keep changes focused**: One feature/fix per PR
- **Write meaningful descriptions**: Explain what and why, not just what
- **Add tests**: Include tests for new features
- **Update documentation**: Keep docs in sync with code changes
- **Be responsive**: Address review comments promptly

### PR Review Process

1. A maintainer will review your PR
2. Address any requested changes
3. Once approved, a maintainer will merge your PR
4. Your contribution will be included in the next release!

## 🎨 Coding Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable and function names
- Write clear comments for complex logic
- Prefer `const` over `let`, avoid `var`
- Use arrow functions where appropriate

### File Organization

```
src/
├── components/       # Reusable UI components
├── pages/           # Page components
├── services/        # API and business logic
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── constants/       # Constants and configuration
└── mock/            # Mock data for development
```

### Component Guidelines

- One component per file
- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Document props with TypeScript interfaces

### CSS/Styling

- Use CSS modules or styled-components
- Follow BEM naming convention for classes
- Keep styles close to components
- Use CSS variables for theming
- Ensure responsive design

## 📝 Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring (no functional changes)
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (dependencies, config, etc.)
- **ci**: CI/CD changes
- **build**: Build system changes

### Examples

```bash
# Feature
feat(docker): add HTTPS support with configurable SSL

# Bug fix
fix(nginx): correct metrics endpoint configuration

# Documentation
docs(readme): update Docker deployment instructions

# Refactoring
refactor(api): simplify data fetching logic

# Chore
chore(deps): update dependencies to latest versions
```

### Best Practices

- Use the imperative mood ("add" not "added")
- Capitalize the first letter
- No period at the end of subject
- Limit subject line to 50 characters
- Wrap body at 72 characters
- Explain what and why, not how

## 🐳 Docker Development

### Building the Docker Image

```bash
# Build the image
docker build -t substrate-platform:dev .

```

### Testing Docker Configuration

```bash
# Test HTTP mode
docker compose --profile http up -d

# Test HTTPS mode
docker compose --profile https up -d

# Test with monitoring
docker compose --profile monitoring up -d
```

### Docker Guidelines

- Test both HTTP and HTTPS modes
- Verify health check endpoints
- Check logs for errors
- Ensure metrics work if enabled
- Test with different environment variables

## 🔍 Code Review Checklist

### For Authors

- [ ] Code follows project style guidelines
- [ ] Self-reviewed the code
- [ ] Added/updated tests
- [ ] All tests pass
- [ ] Updated documentation
- [ ] No new warnings or errors
- [ ] Tested locally
- [ ] Tested in Docker (if applicable)

### For Reviewers

- [ ] Code is clear and maintainable
- [ ] Tests are adequate
- [ ] Documentation is updated
- [ ] No security issues
- [ ] Performance is acceptable
- [ ] Breaking changes are documented

## 🏷️ Issue and PR Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `dependencies` - Dependency updates
- `docker` - Docker-related changes
- `security` - Security improvements
- `performance` - Performance improvements
- `needs-triage` - Needs initial review

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Documentation**: Check DOCKER.md and README.md

## 🎉 Recognition

Contributors who make significant contributions will be:
- Listed in the project's CONTRIBUTORS.md file
- Mentioned in release notes
- Thanked in the community

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project (see LICENSE file).

---

Thank you for contributing to Substrate Platform! 🚀
