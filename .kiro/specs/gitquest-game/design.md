# GitQuest: The Chrono-Coder's Journey - Design Document

## Overview

GitQuest is a full-stack web application that gamifies Git and GitHub education through an interactive narrative experience. The system consists of a React-based frontend, Node.js/Express backend, PostgreSQL database, and a custom JavaScript-based Git simulation engine. Players interact with a browser-based terminal to execute real Git commands against simulated repositories while progressing through a story-driven quest system.

### Architecture Philosophy

- **Simulation over Sandboxing**: Use a JavaScript Git simulation engine rather than Docker containers for security, scalability, and cost-effectiveness
- **Progressive Enhancement**: Core learning experience works without advanced features; visual enhancements layer on top
- **Mobile-First Responsive**: Design for mobile terminal interaction first, scale up to desktop
- **Stateless API**: Backend APIs are stateless; all session state stored in database or JWT tokens
- **Real-Time Feedback**: Immediate visual and textual feedback for every player action

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React Frontend Application                            │ │
│  │  ├─ Terminal Component (xterm.js)                      │ │
│  │  ├─ Code Editor (Monaco Editor)                        │ │
│  │  ├─ Git Graph Visualizer (gitgraph-js)                │ │
│  │  ├─ Progress Map (React + SVG)                         │ │
│  │  └─ Quest UI Components                                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                    HTTPS / WebSocket
                            │
