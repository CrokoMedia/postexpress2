# 📐 Frontend Specification — PostExpress Editor Visual & Portal

**Data:** 2026-02-16
**Designer:** Uma (UX Design Expert)
**Destinatário:** @dev (Dex) + equipe frontend
**Versão:** 1.0.0

---

## 🎯 Visão Geral

Este documento especifica completamente a implementação frontend do **Editor Visual de Carrosséis** e **Portal do Cliente** do PostExpress.

### Deliverables
1. **Editor Visual** (React + Fabric.js + Zustand)
2. **Portal do Cliente** (Next.js + shadcn/ui)
3. **Design System** (Componentes reutilizáveis)

---

## 📦 Stack Técnica

### Core
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 4.x
- **State:** Zustand (Editor), React Query (Data fetching)
- **UI Library:** shadcn/ui
- **Icons:** Lucide React

### Editor Specific
- **Canvas Engine:** Fabric.js 5.x
- **File Upload:** react-dropzone
- **Drag & Drop:** react-beautiful-dnd (slides reordering)
- **Color Picker:** react-colorful
- **Fonts:** Google Fonts API

### Build & Deploy
- **Build Tool:** Turbopack (Next.js built-in)
- **Package Manager:** pnpm
- **Deploy:** Vercel

---

## 🗂️ Estrutura de Diretórios

```
postexpress-frontend/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth routes (login, register)
│   │   ├── login/
│   │   └── register/
│   ├── (portal)/               # Portal routes (protected)
│   │   ├── dashboard/
│   │   ├── contents/
│   │   ├── metrics/
│   │   └── settings/
│   ├── (editor)/               # Editor route
│   │   └── editor/[id]/
│   └── layout.tsx              # Root layout
│
├── components/                 # React components (Atomic Design)
│   ├── atoms/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Avatar/
│   │   ├── Badge/
│   │   └── Icon/
│   │
│   ├── molecules/
│   │   ├── FormField/
│   │   ├── AvatarWithName/
│   │   ├── StatusBadge/
│   │   ├── SearchBar/
│   │   └── ColorPicker/
│   │
│   ├── organisms/
│   │   ├── Header/
│   │   ├── Card/
│   │   ├── editor/
│   │   │   ├── Canvas/
│   │   │   ├── SlidesPanel/
│   │   │   ├── PropertiesPanel/
│   │   │   └── Toolbar/
│   │   └── portal/
│   │       ├── Dashboard/
│   │       └── CarrosselViewer/
│   │
│   └── templates/
│       ├── DefaultLayout/
│       ├── EditorLayout/
│       └── DashboardLayout/
│
├── lib/                        # Utility libraries
│   ├── fabric-helpers.ts       # Fabric.js wrappers
│   ├── cloudinary.ts           # Cloudinary integration
│   ├── supabase.ts             # Supabase client
│   └── utils.ts                # General utilities
│
├── hooks/                      # Custom React hooks
│   ├── useCanvas.ts
│   ├── useAutoSave.ts
│   ├── useKeyboardShortcuts.ts
│   └── useUndo.ts
│
├── stores/                     # Zustand stores
│   ├── editorStore.ts          # Editor state
│   ├── userStore.ts            # User session
│   └── carrosselStore.ts       # Carrossel data
│
├── types/                      # TypeScript types
│   ├── editor.ts
│   ├── carrossel.ts
│   └── user.ts
│
├── design-tokens/              # Design tokens
│   ├── tokens.ts               # Generated from tokens.yaml
│   └── theme.css               # CSS variables
│
└── public/
    ├── fonts/                  # Self-hosted fonts
    └── templates/              # Template JSONs
```

---

## 🎨 Design Tokens Implementation

### 1. Generate tokens.ts from tokens.yaml

```typescript
// design-tokens/tokens.ts
export const tokens = {
  colors: {
    brand: {
      twitterBlue: '#1d9bf0',
      twitterBlueDark: '#1a8cd8',
      twitterBlueLight: '#e8f5fd',
    },
    neutral: {
      white: '#ffffff',
      gray50: '#f7f9fa',
      gray100: '#e1e8ed',
      // ... todos os grays
      gray900: '#0f1419',
      black: '#000000',
    },
    semantic: {
      success: '#00ba7c',
      successLight: '#d7f4e8',
      warning: '#ffad1f',
      warningLight: '#fff3d9',
      error: '#f4212e',
      errorLight: '#fde8ea',
    },
    status: {
      draft: '#ffd93d',
      editing: '#6bcf7f',
      pending: '#a8dadc',
      rendering: '#457b9d',
      approved: '#00ba7c',
      published: '#2a9d8f',
      needsReview: '#e63946',
    },
  },
  typography: {
    fontFamily: {
      primary: "'Chirp', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      ui: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    fontSize: {
      xs: '11px',
      sm: '12px',
      base: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '28px',
      '4xl': '32px',
      '5xl': '36px',
      '6xl': '48px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    6: '24px',
    8: '32px',
    12: '48px',
    // ...
  },
  // ... resto dos tokens
} as const;

export type Tokens = typeof tokens;
```

### 2. Tailwind Config Extension

```javascript
// tailwind.config.js
import { tokens } from './design-tokens/tokens';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: tokens.colors.brand,
        neutral: tokens.colors.neutral,
        semantic: tokens.colors.semantic,
        status: tokens.colors.status,
      },
      fontFamily: {
        primary: tokens.typography.fontFamily.primary,
        ui: tokens.typography.fontFamily.ui,
      },
      fontSize: tokens.typography.fontSize,
      spacing: tokens.spacing,
      // ...
    },
  },
};
```

---

## ⚛️ Componentes Atômicos

### Button Component

```typescript
// components/atoms/Button/Button.tsx
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cva, VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-brand-twitterBlue text-white hover:bg-brand-twitterBlueDark',
        secondary: 'bg-white border border-neutral-gray100 text-neutral-gray900 hover:bg-neutral-gray50',
        outline: 'border border-neutral-gray100 bg-transparent hover:bg-neutral-gray50',
        ghost: 'hover:bg-neutral-gray50 bg-transparent',
        danger: 'bg-semantic-error text-white hover:bg-semantic-error/90',
        success: 'bg-semantic-success text-white hover:bg-semantic-success/90',
      },
      size: {
        sm: 'h-8 px-4 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-md',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant,
  size,
  loading,
  icon,
  fullWidth,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        buttonVariants({ variant, size }),
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}
```

### Input Component

```typescript
// components/atoms/Input/Input.tsx
import { InputHTMLAttributes, forwardRef } from 'react';
import { cva, VariantProps } from 'class-variance-authority';

const inputVariants = cva(
  'w-full border border-neutral-gray100 rounded focus:outline-none focus:ring-2 focus:ring-brand-twitterBlue focus:border-transparent transition-colors',
  {
    variants: {
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-3 text-base',
        lg: 'h-12 px-4 text-md',
      },
      hasError: {
        true: 'border-semantic-error focus:ring-semantic-error',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      hasError: false,
    },
  }
);

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ size, hasError, error, className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(inputVariants({ size, hasError: !!error }), className)}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
```

### Avatar Component

```typescript
// components/atoms/Avatar/Avatar.tsx
import { ImgHTMLAttributes } from 'react';
import { cva, VariantProps } from 'class-variance-authority';

const avatarVariants = cva(
  'rounded-full border-2 border-neutral-gray100 object-cover',
  {
    variants: {
      size: {
        xs: 'w-6 h-6',
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-18 h-18',
        xl: 'w-20 h-20',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface AvatarProps
  extends ImgHTMLAttributes<HTMLImageElement>,
    VariantProps<typeof avatarVariants> {
  fallbackInitials?: string;
}

export function Avatar({
  size,
  src,
  alt = 'Avatar',
  fallbackInitials,
  className,
  ...props
}: AvatarProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={cn(
          avatarVariants({ size }),
          'flex items-center justify-center bg-neutral-gray100 text-neutral-gray600 font-medium',
          className
        )}
      >
        {fallbackInitials || alt.substring(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn(avatarVariants({ size }), className)}
      onError={() => setError(true)}
      {...props}
    />
  );
}
```

---

## 🎨 Editor Visual - Canvas Component

```typescript
// components/organisms/editor/Canvas/Canvas.tsx
import { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { useEditorStore } from '@/stores/editorStore';

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    setCanvas,
    selectedElement,
    selectElement,
    currentSlide,
  } = useEditorStore();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Fabric.js canvas
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 1080,
      height: 1350,
      backgroundColor: '#ffffff',
      selection: true,
    });

    // Set canvas in store
    setCanvas(fabricCanvas);

    // Event listeners
    fabricCanvas.on('selection:created', (e) => {
      selectElement(e.selected[0]);
    });

    fabricCanvas.on('selection:updated', (e) => {
      selectElement(e.selected[0]);
    });

    fabricCanvas.on('selection:cleared', () => {
      selectElement(null);
    });

    fabricCanvas.on('object:modified', () => {
      // Trigger auto-save
      saveToHistory();
    });

    // Cleanup
    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  // Load slide when currentSlide changes
  useEffect(() => {
    loadSlide(currentSlide);
  }, [currentSlide]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-neutral-gray50">
      {/* Safe area overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <SafeAreaGuides />
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} />

      {/* Zoom controls */}
      <ZoomControls />
    </div>
  );
}

function SafeAreaGuides() {
  return (
    <div className="absolute inset-0">
      {/* Top safe area (150px) */}
      <div className="absolute top-0 left-0 right-0 h-[150px] border-b-2 border-dashed border-semantic-warning opacity-30" />

      {/* Bottom safe area (200px) */}
      <div className="absolute bottom-0 left-0 right-0 h-[200px] border-t-2 border-dashed border-semantic-warning opacity-30" />

      {/* Left safe area (120px) */}
      <div className="absolute top-0 bottom-0 left-0 w-[120px] border-r-2 border-dashed border-semantic-warning opacity-30" />

      {/* Right safe area (120px) */}
      <div className="absolute top-0 bottom-0 right-0 w-[120px] border-l-2 border-dashed border-semantic-warning opacity-30" />
    </div>
  );
}
```

---

## 🗄️ Zustand Store - Editor State

```typescript
// stores/editorStore.ts
import { create } from 'zustand';
import { fabric } from 'fabric';

interface Slide {
  id: string;
  number: number;
  elements: fabric.Object[];
  background: string;
  thumbnail?: string;
}

interface HistoryState {
  slides: Slide[];
  currentSlide: number;
  timestamp: number;
}

interface EditorState {
  // Canvas
  canvas: fabric.Canvas | null;
  setCanvas: (canvas: fabric.Canvas) => void;

  // Slides
  slides: Slide[];
  currentSlide: number;
  addSlide: (index?: number) => void;
  deleteSlide: (index: number) => void;
  duplicateSlide: (index: number) => void;
  reorderSlides: (from: number, to: number) => void;
  goToSlide: (index: number) => void;

  // Elements
  selectedElement: fabric.Object | null;
  selectElement: (element: fabric.Object | null) => void;
  updateElement: (id: string, props: any) => void;
  deleteElement: (id: string) => void;

  // History (Undo/Redo)
  history: HistoryState[];
  historyIndex: number;
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Auto-save
  autoSaveStatus: 'idle' | 'saving' | 'saved';
  lastSaveTime: Date | null;
  save: () => Promise<void>;

  // Template
  applyTemplate: (templateId: string) => Promise<void>;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  // Initial state
  canvas: null,
  slides: [],
  currentSlide: 0,
  selectedElement: null,
  history: [],
  historyIndex: -1,
  autoSaveStatus: 'idle',
  lastSaveTime: null,
  canUndo: false,
  canRedo: false,

  // Actions
  setCanvas: (canvas) => set({ canvas }),

  addSlide: (index) => {
    const { slides, currentSlide } = get();
    const newSlide: Slide = {
      id: generateId(),
      number: slides.length + 1,
      elements: [],
      background: '#ffffff',
    };

    const insertIndex = index ?? currentSlide + 1;
    const newSlides = [
      ...slides.slice(0, insertIndex),
      newSlide,
      ...slides.slice(insertIndex),
    ];

    set({ slides: newSlides, currentSlide: insertIndex });
    get().saveToHistory();
  },

  deleteSlide: (index) => {
    const { slides } = get();
    if (slides.length <= 1) return; // Não pode deletar último slide

    const newSlides = slides.filter((_, i) => i !== index);
    set({ slides: newSlides, currentSlide: Math.max(0, index - 1) });
    get().saveToHistory();
  },

  // ... mais actions

  saveToHistory: () => {
    const { slides, currentSlide, history, historyIndex } = get();

    // Remove estados futuros se estamos no meio do histórico
    const newHistory = history.slice(0, historyIndex + 1);

    // Adiciona novo estado
    newHistory.push({
      slides: JSON.parse(JSON.stringify(slides)), // Deep clone
      currentSlide,
      timestamp: Date.now(),
    });

    // Limita histórico a 50 estados
    if (newHistory.length > 50) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: newHistory.length > 1,
      canRedo: false,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;

    const prevState = history[historyIndex - 1];
    set({
      slides: prevState.slides,
      currentSlide: prevState.currentSlide,
      historyIndex: historyIndex - 1,
      canUndo: historyIndex - 1 > 0,
      canRedo: true,
    });

    // Reload canvas
    get().loadSlide(prevState.currentSlide);
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;

    const nextState = history[historyIndex + 1];
    set({
      slides: nextState.slides,
      currentSlide: nextState.currentSlide,
      historyIndex: historyIndex + 1,
      canUndo: true,
      canRedo: historyIndex + 1 < history.length - 1,
    });

    // Reload canvas
    get().loadSlide(nextState.currentSlide);
  },

  save: async () => {
    set({ autoSaveStatus: 'saving' });

    try {
      const { slides, canvas } = get();

      // Salvar no Supabase
      await supabase
        .from('conteudos')
        .update({
          json_editavel: { slides },
          updated_at: new Date().toISOString(),
        })
        .eq('id', carrosselId);

      set({
        autoSaveStatus: 'saved',
        lastSaveTime: new Date(),
      });

      // Reset status após 2s
      setTimeout(() => {
        set({ autoSaveStatus: 'idle' });
      }, 2000);
    } catch (error) {
      console.error('Save error:', error);
      set({ autoSaveStatus: 'idle' });
    }
  },
}));
```

---

## 🎯 Auto-save Hook

```typescript
// hooks/useAutoSave.ts
import { useEffect, useRef } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { debounce } from 'lodash';

export function useAutoSave(delay = 2000) {
  const { save, slides } = useEditorStore();

  const debouncedSave = useRef(
    debounce(() => {
      save();
    }, delay)
  ).current;

  useEffect(() => {
    // Trigger auto-save quando slides mudam
    debouncedSave();

    return () => {
      debouncedSave.cancel();
    };
  }, [slides, debouncedSave]);
}
```

---

## ⌨️ Keyboard Shortcuts Hook

```typescript
// hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react';
import { useEditorStore } from '@/stores/editorStore';

export function useKeyboardShortcuts() {
  const { undo, redo, save, deleteElement, selectedElement } = useEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd + Z: Undo
      if (cmdOrCtrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z: Redo
      if (cmdOrCtrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }

      // Ctrl/Cmd + S: Save
      if (cmdOrCtrl && e.key === 's') {
        e.preventDefault();
        save();
      }

      // Delete/Backspace: Delete element
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
        e.preventDefault();
        deleteElement(selectedElement.id);
      }

      // Escape: Deselect
      if (e.key === 'Escape') {
        // Deselect all
      }

      // Spacebar: Preview (quando não está editando texto)
      if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        // Open preview modal
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, save, deleteElement, selectedElement]);
}
```

---

## 🌐 API Integration (Supabase)

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Carrossel {
  id: string;
  cliente_id: string;
  tipo: 'educacional' | 'vendas' | 'autoridade' | 'viral';
  slides: any[];
  json_editavel: any;
  legenda: string;
  status: 'rascunho' | 'editando' | 'aprovado' | 'renderizado' | 'publicado';
  num_edicoes: number;
  renderizado: boolean;
  created_at: string;
  updated_at: string;
}

// Fetch carrossel
export async function fetchCarrossel(id: string): Promise<Carrossel | null> {
  const { data, error } = await supabase
    .from('conteudos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching carrossel:', error);
    return null;
  }

  return data;
}

// Update carrossel
export async function updateCarrossel(id: string, updates: Partial<Carrossel>) {
  const { data, error } = await supabase
    .from('conteudos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating carrossel:', error);
    throw error;
  }

  return data;
}
```

---

## ☁️ Cloudinary Integration

```typescript
// lib/cloudinary.ts

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'post-express/assets');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Upload failed');
  }

  return data.secure_url;
}

export function generateCloudinaryUrl(
  publicId: string,
  transformations: string[] = []
): string {
  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const transform = transformations.join(',');

  return `${baseUrl}/${transform}/${publicId}`;
}
```

---

## ✅ Testing Strategy

### Unit Tests (Vitest + React Testing Library)

```typescript
// components/atoms/Button/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies variant styles', () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-semantic-error');
  });
});
```

### E2E Tests (Playwright)

```typescript
// e2e/editor.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Editor Visual', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/editor/123');
  });

  test('loads canvas correctly', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('adds new slide', async ({ page }) => {
    const slideCount = await page.locator('[data-testid="slide-preview"]').count();

    await page.click('text=Adicionar Slide');
    await page.click('text=Tweet Style');

    const newSlideCount = await page.locator('[data-testid="slide-preview"]').count();
    expect(newSlideCount).toBe(slideCount + 1);
  });

  test('edits text element', async ({ page }) => {
    // Select text element
    await page.click('canvas');

    // Double-click to edit
    await page.dblclick('canvas');

    // Type new text
    await page.keyboard.type('New text content');

    // Apply changes
    await page.click('text=Aplicar Mudanças');

    // Verify change saved
    expect(page.locator('text=Salvo')).toBeVisible();
  });

  test('undo/redo works', async ({ page }) => {
    // Make a change
    await page.click('text=Adicionar Slide');

    // Undo
    await page.keyboard.press('Meta+Z');

    // Verify undo worked
    // ...

    // Redo
    await page.keyboard.press('Meta+Y');

    // Verify redo worked
    // ...
  });
});
```

---

## 📊 Performance Targets

### Core Web Vitals
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

### Editor Specific
- **Canvas render:** 60fps (16.67ms per frame)
- **Auto-save debounce:** 2s
- **Undo/Redo:** < 100ms
- **Slide switch:** < 100ms
- **Asset upload:** Progress indicator, max 10MB

### Optimization Strategies
1. **Lazy load** slides (load current + prev + next)
2. **Memoize** heavy components (React.memo)
3. **Debounce** auto-save and expensive operations
4. **Virtualize** long lists (react-window)
5. **Code split** routes (Next.js automatic)
6. **Optimize images** (Next.js Image component)

---

## ♿ Accessibility Requirements

### WCAG AA Compliance
- [x] Contraste mínimo 4.5:1 (texto normal)
- [x] Contraste mínimo 3:1 (textos grandes)
- [x] Focus visível em todos os elementos interativos
- [x] Navegação por teclado completa
- [x] Aria-labels em ícones e elementos não textuais
- [x] Estrutura semântica correta (headings)
- [x] Alt text em todas as imagens

### Screen Reader Support
- Aria-live regions para feedback dinâmico
- Aria-labels descritivos
- Role attributes corretos
- Skip links para navegação rápida

### Keyboard Navigation
- Tab order lógico
- Escape fecha modais
- Enter/Space ativam botões
- Arrows navegam entre opções

---

## 🚀 Deploy & CI/CD

### Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["gru1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME": "@cloudinary-cloud-name"
  }
}
```

### GitHub Actions (CI)

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm playwright install
      - run: pnpm test:e2e
```

---

## 📝 Próximos Passos

### Sprint 1 (Semana 1-2)
- [ ] Setup projeto Next.js + Tailwind + TypeScript
- [ ] Implementar design tokens
- [ ] Criar componentes atômicos (Button, Input, Avatar, Badge)
- [ ] Setup Storybook

### Sprint 2 (Semana 2-3)
- [ ] Implementar Canvas component (Fabric.js)
- [ ] Criar Zustand store (editorStore)
- [ ] Implementar SlidesPanel
- [ ] Auto-save hook

### Sprint 3 (Semana 3-4)
- [ ] Implementar PropertiesPanel
- [ ] Toolbar component
- [ ] Keyboard shortcuts
- [ ] Undo/Redo

### Sprint 4 (Semana 4-5)
- [ ] Modal Preview (Instagram style)
- [ ] Portal do Cliente (Dashboard)
- [ ] Integração Supabase
- [ ] Testes E2E

---

## 📞 Contatos

- **PM:** Morgan (@pm)
- **Architect:** Aria (@architect)
- **Dev Lead:** Dex (@dev)
- **QA Lead:** Quinn (@qa)
- **UX/UI Designer:** Uma (@ux-design-expert)

---

## 📚 Referências

- [Fabric.js Documentation](http://fabricjs.com/docs/)
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Versão:** 1.0.0
**Data:** 2026-02-16
**Assinado:** Uma, especificando com precisão 💝
