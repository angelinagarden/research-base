# Research Hub - Plex Clone

## Project info

**URL**: https://lovable.dev/projects/f305f1d1-7c5e-40c1-8f32-2c143a395b62

## 🚀 Latest Updates (July 2025)

### ✨ New Features Added

#### 1. **Research Data Integration**
- **7 new research items** added with comprehensive metadata
- **Diverse domains**: Health+AI, AI+Economy, Health+Policy, Media+AI, Sound Studies, Education+AI
- **Rich content structure**: Each research includes body, metadata, visual, links, citations, and ratings

#### 2. **Modal Popup System**
- **Replaced expandable cards** with professional modal windows
- **Full-screen overlay** with backdrop blur effect
- **Responsive design** (max-w-4xl, max-h-[90vh])
- **Easy navigation** with close button and backdrop click

#### 3. **Enhanced Research Display**
- **Detailed research view** with structured sections:
  - Key Insights & Analysis
  - Key Findings & Applications
  - Limitations & Impact Horizon
  - Methods, Sectors, Geography, Personas
  - Links & Resources
  - APA Citations & Notes
- **Visual rating system** with star indicators (1-5 scale)
- **Color-coded tags** for domains and focus areas

#### 4. **Improved UI/UX**
- **Light theme** with custom color palette (#fcfcfa background, #000000 text)
- **Compact sidebar filters** with checkbox selection
- **Smart "All" filter logic** (mutually exclusive with other options)
- **3-column grid layout** on desktop (responsive: 1→2→3 columns)
- **Hover effects** and smooth transitions

#### 5. **Filter System Enhancement**
- **Multi-select checkboxes** instead of radio buttons
- **Domain filters**: Health, AI, Economy, Policy, Media, Culture, Education
- **Focus filters**: Theoretical, Applied, Experimental, Meta-analysis
- **Level filters**: Basic Research, Advanced Research, Cutting-edge
- **DEX filters**: High Impact, Medium Impact, Emerging

### 🔧 Technical Improvements

#### **Component Architecture**
- **Modal.tsx**: Reusable modal component with backdrop and close functionality
- **ResearchDetail.tsx**: Comprehensive research display component
- **ContentGrid.tsx**: Updated to use modal system instead of expandable content
- **Sidebar.tsx**: Enhanced filter system with checkbox logic

#### **State Management**
- **useState** for modal open/close state
- **Dynamic content loading** based on selected research item
- **Efficient re-rendering** with proper key props

#### **Styling & Responsiveness**
- **Tailwind CSS** with custom HSL color variables
- **Mobile-first design** with responsive breakpoints
- **Consistent spacing** and typography using design system
- **Accessibility improvements** with proper ARIA labels

### 📊 Research Data Structure

Each research item includes:
```typescript
interface ResearchItem {
  id: string;
  title: string;
  institution: string;
  summary: string;
  domain: string[];
  focus: string[];
  timeAgo: string;
  publicationType: string;
  source: { /* publication details */ };
  body: { /* research content */ };
  metadata: { /* methods, sectors, geography */ };
  visual: { /* cover image */ };
  links: Array<{label: string, url: string}>;
  citationAPA: string;
  tags: string[];
  rating: { evidenceStrength: number; actionability: number; };
  notes?: string;
}
```

### 🎯 Current Research Topics

1. **Microsoft AI**: Sequential Diagnosis with Language Models
2. **Stanford HAI**: AI Index 2025 Report
3. **WHO**: World Health Statistics 2025
4. **Reuters Institute**: Digital News Report 2025
5. **Würzburg University**: Sound Studies & Media Interface
6. **EDUCAUSE**: Higher Education Horizon Report 2025
7. **ETS**: Generative AI in Education Special Issue

## 🛠️ Development Setup

### Prerequisites
- Node.js & npm
- Git

### Installation & Running
```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd arena-plex-clone-1

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Available Scripts
- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🎨 Design System

### Color Palette
- **Background**: #fcfcfa (light cream)
- **Foreground**: #000000 (pure black)
- **Primary**: Custom HSL with light theme
- **Accent**: Complementary colors for focus areas
- **Muted**: Subtle backgrounds and borders

### Typography
- **Font Family**: Monospace (font-mono)
- **Hierarchy**: Consistent text sizes and weights
- **Spacing**: Tailwind spacing scale for consistency

### Components
- **Cards**: Bordered with hover effects
- **Buttons**: Primary and secondary variants
- **Modals**: Full-screen overlays with backdrop
- **Filters**: Checkbox-based selection system

## 🔄 Git Workflow

### Branch Strategy
- **main**: Production-ready code
- **develop**: Development and feature branches

### Recent Commits
- Added comprehensive research data
- Implemented modal popup system
- Enhanced filter functionality
- Updated UI theme to light mode
- Improved responsive design

## 🚀 Deployment

### Vercel Integration
- **Automatic deployments** from GitHub
- **Preview deployments** for pull requests
- **Custom domain support** available

### Manual Deployment
```sh
# Build the project
npm run build

# Deploy to your preferred platform
# (Vercel, Netlify, GitHub Pages, etc.)
```

## 📱 Responsive Design

- **Mobile**: Single column layout
- **Tablet**: Two column layout
- **Desktop**: Three column layout with sidebar

## 🔍 Search & Filtering

- **Global search** across all research content
- **Multi-criteria filtering** by domain, focus, level, and DEX
- **Smart "All" selection** logic
- **Real-time filter updates**

## 🎯 Future Enhancements

- [ ] Advanced search with full-text indexing
- [ ] Research comparison functionality
- [ ] Export to PDF/CSV
- [ ] User favorites and collections
- [ ] Research timeline visualization
- [ ] Integration with external research APIs

---

## Original Lovable Instructions

**URL**: https://lovable.dev/projects/f305f1d1-7c5e-40c1-8f32-2c143a395b62

### How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/f305f1d1-7c5e-40c1-8f32-2c143a395b62) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/f305f1d1-7c5e-40c1-8f32-2c143a395b62) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
