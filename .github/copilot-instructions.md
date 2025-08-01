<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Forge API Backend - Custom Instructions

This is a Node.js/Express/TypeScript backend for Autodesk Forge integration, based on the MERN-Stack-Revit-Forge-Viewer repository pattern.

## Project Context

- **Purpose**: Backend API for URN generation and model management
- **Technology Stack**: Node.js, Express, TypeScript, MongoDB, Autodesk Forge
- **Architecture**: RESTful API following the original repository structure

## Key Components

- **Forge Authentication**: Token management for Autodesk Platform Services
- **Model Management**: Door elements with properties (finish, mark, family type)
- **Database**: MongoDB with Mongoose ODM
- **API Endpoints**: CRUD operations and Forge token generation

## Code Style Guidelines

- Use TypeScript with strict typing
- Follow async/await pattern for database operations
- Maintain consistency with original repository structure
- Include comprehensive error handling
- Add detailed comments for Forge-specific operations

## Autodesk Forge Integration

- Always handle token expiration and refresh
- Use proper scopes for different operations (viewables:read, data:read, etc.)
- Follow Autodesk API best practices
- Implement proper error handling for Forge API calls

## Database Patterns

- Use Mongoose models with TypeScript interfaces
- Follow the original schema structure for doors
- Implement bulk operations for performance
- Handle MongoDB connection errors gracefully
