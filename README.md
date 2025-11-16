# Retro Tracker

A modern, collaborative team retrospective management application built with React, TypeScript, and Vite. Retro Tracker helps teams conduct effective retrospectives, track action items, and continuously improve their processes.

## ✨ Features

- **Team Management**: Create and manage multiple teams with role-based access (admin/member)
- **Retrospectives**: Organize retrospectives with three categories:
  - What Went Well
  - Needs Improvement
  - Kudos
- **Action Items**: Track and manage action items from retrospectives with:
  - Status tracking (Open, In Progress, Completed, Cancelled)
  - Priority levels (Low, Medium, High)
  - Assignments to team members
  - Due dates
- **Real-time Collaboration**: Team members can contribute cards, vote, and collaborate in real-time
- **User Profile & Settings**: Manage profile, preferences, and notification settings
- **Beautiful UI**: Modern, responsive design with gradient accents and smooth animations
- **Dark Mode**: Support for light and dark themes

## 🎬 Demo

Watch the demo videos to see Retro Tracker in action:

1. **Demo Video 1**: [Watch on Loom](https://www.loom.com/share/2250694abbf14798a339ab5641cf7332)
2. **Demo Video 2**: [Watch on Loom](https://www.loom.com/share/6f0eef69ab424d5ca2fd3ee8973e092c)

## 🚀 Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Routing**: React Router DOM 7
- **State Management**: 
  - React Context API for auth state
  - TanStack React Query for server state
- **UI Components**: 
  - shadcn/ui (Radix UI primitives)
  - Tailwind CSS 4 for styling
  - Lucide React for icons
- **Form Management**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Notifications**: Sonner (toast notifications)

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running (see API.md for endpoint documentation)

## 🔧 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Buggcy-Front-End/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:3000/api
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in the terminal).

## 📜 Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── actionItems/     # Action item dialogs
│   │   ├── auth/            # Authentication forms
│   │   ├── cards/           # Retrospective card components
│   │   ├── layout/          # Layout components (Header, Layout, ProtectedRoute)
│   │   ├── retros/          # Retrospective components
│   │   ├── teams/           # Team management components
│   │   └── ui/              # shadcn/ui components
│   ├── contexts/            # React contexts (AuthContext)
│   ├── hooks/               # Custom React hooks
│   │   ├── useActionItems.ts
│   │   ├── useAuth.ts
│   │   ├── useCards.ts
│   │   ├── useRetros.ts
│   │   ├── useTeams.ts
│   │   └── use-toast.ts
│   ├── lib/                 # Utility libraries
│   │   ├── api.ts           # Axios instance and interceptors
│   │   ├── queryClient.ts   # React Query configuration
│   │   └── utils.ts         # Utility functions
│   ├── pages/               # Page components
│   │   ├── ActionItems.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Profile.tsx
│   │   ├── Register.tsx
│   │   ├── RetroBoard.tsx
│   │   ├── RetroList.tsx
│   │   ├── Settings.tsx
│   │   └── TeamMembers.tsx
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx              # Main app component with routes
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── API.md                   # API endpoint documentation
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## 🔐 Authentication

The application uses JWT-based authentication:

1. Register a new account or login
2. JWT token is stored in `localStorage`
3. Token is automatically included in API requests via Axios interceptors
4. Protected routes require authentication

## 🌐 API Configuration

The application connects to a backend API. Configure the API URL using the `VITE_API_URL` environment variable:

```env
VITE_API_URL=http://localhost:3000/api
```

For detailed API documentation, see [API.md](./API.md).

## 🎨 Styling

- **Tailwind CSS 4**: Utility-first CSS framework
- **Custom Gradients**: Defined in `tailwind.config.js` for primary, info, success, warning colors
- **Responsive Design**: Mobile-first approach with breakpoints
- **Dark Mode**: Toggle in Settings page, persisted to localStorage

## 🔄 State Management

- **Auth State**: Managed via `AuthContext` with `useAuth` hook
- **Server State**: TanStack React Query for all API calls
- **Form State**: React Hook Form with Zod validation
- **Local State**: React `useState` for component-specific state

## 🛡️ Type Safety

Full TypeScript support with:
- Strict type checking
- Type definitions in `src/types/index.ts`
- Type-safe API responses
- Type-safe form validation with Zod

## 📱 Features Breakdown

### Dashboard
- Quick access to teams, retrospectives, and action items
- Team switcher with persistent selection
- Visual cards for navigation

### Retrospectives
- Create retrospectives for teams
- Three-column board (Went Well, Needs Improvement, Kudos)
- Add, edit, and delete cards
- Vote on cards
- Real-time updates

### Action Items
- Create action items from retrospectives
- Filter by status, retrospective, and search
- Assign to team members
- Set priorities and due dates
- Track completion

### Team Management
- Create teams
- Invite members
- Manage roles (admin/member)
- View team members

## 🤝 Contributing

1. Follow the existing code style
2. Use TypeScript for all new code
3. Ensure type safety
4. Write meaningful component and function names
5. Keep components focused and reusable

## 📄 License

[Your License Here]

## 🔗 Related Documentation

- [API Documentation](./API.md) - Complete backend API reference
- [Vite Documentation](https://vite.dev/)
- [React Documentation](https://react.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
- [shadcn/ui](https://ui.shadcn.com/)

---

Built with ❤️ using React, TypeScript, and Vite
