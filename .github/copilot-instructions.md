# Copilot Instructions for SENTINEL SOC

This document provides Copilot with workspace-specific context for the SENTINEL SOC project.

## Project Overview

SENTINEL SOC is a production-grade Real-Time Cybersecurity Monitoring Dashboard built with Vue 3, TypeScript, Pinia, and Tailwind CSS.

**Phase 1 Status**: ✅ Complete - Architecture and foundation ready for Phase 2

## Project Structure

- `src/components/` - Reusable Vue components organized by function
- `src/stores/` - Pinia state management (centralized dashboard state)
- `src/services/` - Business logic services (mock stream simulator)
- `src/types/` - TypeScript type definitions for type-safe development
- `src/views/` - Page components (DashboardView)
- `src/router/` - Vue Router configuration
- `src/composables/` - Reusable composition functions

## Key Technologies

- Vue 3 with Composition API
- TypeScript for type safety
- Pinia for state management
- Vite for fast builds
- Tailwind CSS for styling
- Apache ECharts (prepared for Phase 2)

## Important Conventions

### Component Development

- Use `<script setup lang="ts">` pattern
- Define typed props and emits
- Keep components reusable and modular
- Use semantic component names

### State Management

- Use `useDashboardStore()` for global dashboard state
- Implement actions for state mutations
- Use computed properties for derived state

### Styling

- Use Tailwind CSS utility classes
- Use custom color variables: `cyber-cyan`, `cyber-blue`, `cyber-purple`
- Follow dark theme: `dark-bg`, `dark-surface`, `dark-border`
- Add glow effects with `shadow-cyber-glow` for interactive elements

### Type Safety

- Always define TypeScript interfaces for data structures
- Use `type` definitions from `@/types/dashboard`
- Avoid `any` types; use proper generics

## Development Workflow

1. **Start dev server**: `npm run dev`
2. **Build for production**: `npm run build`
3. **Preview build**: `npm run preview`

## Key Files to Reference

- `src/stores/dashboard.ts` - Central state management
- `src/services/streamSimulator.ts` - Real-time data simulation
- `src/types/dashboard.ts` - Type definitions
- `src/views/DashboardView.vue` - Main dashboard layout
- `README.md` - Complete project documentation

## Phase 2 Preparation

For Phase 2 development:
- Integrate Apache ECharts for threat maps and analytics
- Connect to real WebSocket/SSE backend
- Implement advanced filtering and search
- Add user authentication
- Integrate real threat intelligence data

## Code Quality Guidelines

- Write clean, modular code
- Maintain proper TypeScript types
- Use semantic naming conventions
- Avoid code duplication (create composables)
- Keep components focused on single responsibility

## Performance Considerations

- Limit stored threat events to 100 items
- Limit activity feed to 50 items
- Use efficient Vue 3 reactivity patterns
- Cleanup intervals and listeners in unmounted hooks

## Architecture Goals

- Scalable: Ready for enterprise features
- Maintainable: Clear separation of concerns
- Type-safe: Full TypeScript coverage
- Performant: Efficient rendering and state management
- Production-grade: Following industry best practices
