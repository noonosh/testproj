# Mathematical Expression Evaluator - Design Documentation

## Design Philosophy

This application embodies a **minimalist, clean, and authentic** approach to mathematical expression evaluation. The design prioritizes clarity, functionality, and professional aesthetics over decorative elements.

## Key Design Principles

### 1. **Minimalism**
- Clean lines and subtle borders
- Generous whitespace for breathing room
- Neutral color palette (grays, blacks, whites)
- Removed all gradient backgrounds
- Subtle shadows for depth

### 2. **Typography**
- **Monospace fonts** for all mathematical expressions and results
- Ensures proper alignment and readability of formulas
- Professional mathematical tool aesthetic
- Light font weights for modern feel

### 3. **Color Palette**
```
Light Mode:
- Background: gray-50
- Cards: white with gray-200 borders
- Text Primary: gray-900
- Text Secondary: gray-500
- Accent: gray-900

Dark Mode:
- Background: gray-950
- Cards: dark with gray-800 borders
- Text Primary: gray-100
- Text Secondary: gray-500
- Accent: gray-100
```

### 4. **Layout**
- **Centered, focused design** - user attention on the calculator
- **3-2 column grid** on desktop (3 cols for calculator, 2 for sidebar)
- Mobile-responsive with stacked layout
- Clear visual hierarchy with labels

### 5. **User Experience**
- **Immediate feedback** - results appear inline without navigation
- **History persistence** - localStorage keeps calculation history
- **Quick examples** - clickable example expressions
- **Error handling** - clear, non-intrusive error messages
- **Keyboard-friendly** - autofocus on input, Enter to calculate

## Component Breakdown

### Header
- Minimal branding with mathematical integral symbol (∫)
- Clean border separator
- Theme toggle for dark/light mode
- Monospace font for app name

### Main Calculator Card
- Large, monospace input field (2xl text)
- Uppercase, tracked labels
- Inline result display with 4xl font size
- Single "Evaluate" button (not "Calculate")
- Grid of example expressions (2 columns)
- Subtle hover states

### Sidebar

#### History Card
- Scrollable list (max 10 items)
- Click to reload expression + result
- Clear button when items exist
- Empty state message
- Monospace typography

#### Operations Reference Card
- Categorized function list
- Two-tone text (labels in gray-500, values in primary)
- Compact, scannable layout
- Monospace for authentic feel

### Footer
- Minimal attribution
- Monospace font
- Muted colors

## Technical Implementation

### Califi Integration
- Backend API endpoint: `/trpc/calculate`
- Input validation with Zod
- Error handling with proper messages
- Full support for mathematical functions

### State Management
- React hooks for component state
- TanStack Query for server mutations
- localStorage for history persistence
- No unnecessary re-renders

### Responsive Design
- Mobile: single column stacked layout
- Tablet/Desktop: 5-column grid (3+2 split)
- Fluid typography and spacing
- Touch-friendly tap targets

## Color Accessibility
- High contrast ratios for WCAG compliance
- Clear focus states for keyboard navigation
- Visible borders and separators
- Tested in both light and dark modes

## Future Enhancements
- Keyboard shortcuts (e.g., Ctrl+K to focus input)
- Export history as JSON/CSV
- More advanced functions (derivatives, integrals)
- Variable support (e.g., x = 5, then calculate x^2)
- Graph plotting for expressions with variables
- Scientific notation toggle
- Step-by-step solution display

## Technology Stack
- **Frontend**: React + TanStack Router
- **Backend**: Hono + tRPC
- **Math Engine**: Califi
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS v4
- **Build Tool**: Vite + Turborepo

---

**Design Inspiration**: Scientific calculators, mathematical textbooks, professional engineering tools

