# Garden Calculator Application

## Overview

This is a full-stack garden planning application that helps users calculate optimal crop layouts for their garden space. The application allows users to input their garden size, family size, and select crops to get real-time calculations on space utilization, yield estimates, and visual garden layouts. Users can work with pre-defined crops or create custom crop varieties with their own specifications.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: React hooks for local state, TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

The frontend follows a component-based architecture with reusable UI components in the `/components/ui` directory. The main application logic is contained in specialized components like `InputPanel`, `OutputPanel`, and `GardenLayout` that handle different aspects of the garden planning interface.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Data Storage**: In-memory storage with interface-based design for future database integration
- **API Design**: RESTful endpoints for CRUD operations on crops and garden calculations
- **Development Server**: Vite integration for hot module replacement in development
- **Error Handling**: Centralized error middleware with proper HTTP status codes

The backend uses a modular approach with separate files for routes, storage abstraction, and server configuration. The storage layer implements an interface pattern that allows for easy migration from in-memory storage to a persistent database.

### Data Storage Solutions
- **Current**: In-memory storage using Map data structures with pre-seeded default crops
- **Future Ready**: Drizzle ORM configuration prepared for PostgreSQL integration
- **Schema**: Strongly typed schemas using Drizzle and Zod for data validation
- **Migration Ready**: Database migration setup configured for when persistent storage is needed

### Development Environment
- **Replit Integration**: Custom Vite plugins for Replit development environment
- **Hot Reload**: Full-stack hot reloading with Vite middleware integration
- **TypeScript**: Strict TypeScript configuration across client and server
- **Path Aliases**: Configured import aliases for clean code organization

### API Architecture
The application exposes several REST endpoints:
- `GET /api/crops` - Retrieve all crops
- `GET /api/crops/default` - Get default crops only
- `GET /api/crops/custom` - Get user-created crops only
- `POST /api/crops` - Create new custom crops
- `PUT /api/crops/:id` - Update existing crops
- `DELETE /api/crops/:id` - Remove custom crops

All endpoints include proper error handling, input validation using Zod schemas, and consistent JSON responses.

### Calculation Engine
The application features a real-time calculation engine that processes garden parameters and provides:
- Space utilization analysis
- Yield projections per person
- Garden efficiency metrics
- Visual garden layout generation
- Sufficiency status indicators (sufficient/borderline/insufficient)

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18 with TypeScript, React DOM, React Hook Form
- **Build Tools**: Vite for frontend bundling, ESBuild for backend bundling
- **Development**: TSX for TypeScript execution, various Vite plugins for Replit integration

### UI and Styling
- **Shadcn/ui**: Complete component library built on Radix UI primitives
- **Radix UI**: Unstyled, accessible UI components (dialogs, forms, navigation, etc.)
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Class Variance Authority**: For component variant management
- **Lucide React**: Icon library for consistent iconography

### Data Management
- **TanStack Query**: Server state management and caching
- **Drizzle ORM**: Type-safe ORM configured for PostgreSQL
- **Zod**: Runtime type validation and schema parsing
- **Date-fns**: Date manipulation utilities

### Database (Configured)
- **PostgreSQL**: Primary database (configured via Drizzle but using in-memory storage currently)
- **Neon Database**: Serverless PostgreSQL provider integration ready

### Development Tools
- **TypeScript**: Strict type checking across the entire application
- **ESLint**: Code linting and formatting
- **PostCSS**: CSS processing with Tailwind CSS integration

The application is architected to be easily deployable and scalable, with clear separation of concerns between frontend and backend, and preparation for database integration when needed.