# UI & Styling Files Reference

Complete list of all files associated with UI, styling, and theming in the app.

## 🎨 Theme System (Core Styling)

### Theme Configuration
- **`src/theme/colors.ts`** - Central color palette definitions
  - Primary, secondary, background, text colors
  - Status colors (success, error, warning, info)
  - Resume template accent colors
  - Gradient definitions

- **`src/theme/index.ts`** - React Native Paper theme configuration
  - Light theme setup
  - Dark theme setup (ready for future use)
  - Typography configuration
  - Material Design 3 integration

- **`src/theme/styles.ts`** - Common style utilities
  - Shadow presets
  - Border radius constants
  - Spacing system
  - Container styles
  - Text styles
  - Button styles

- **`src/theme/README.md`** - Theme documentation

### Root Theme Application
- **`app/_layout.tsx`** - App root layout with PaperProvider theme setup

---

## 📱 Screen Files (App Screens with Styling)

### Tab Screens
- **`app/(tabs)/index.tsx`** - Documents screen
  - Document list styling
  - Search bar styling
  - Card layouts
  - Type chips styling

- **`app/(tabs)/resumes.tsx`** - Resumes list screen
  - Resume card styling
  - FAB styling
  - Empty state styling

- **`app/(tabs)/create.tsx`** - General/Create screen
  - Option card styling
  - Icon containers
  - Badge styling

- **`app/(tabs)/_layout.tsx`** - Tab navigation layout
  - Tab bar styling
  - Active/inactive tab colors
  - Tab icons

- **`app/(tabs)/pdfs.tsx`** - PDFs list screen (if exists)

### Resume Screens
- **`app/resumes/questionnaire.tsx`** - Questionnaire screen
  - Chip selection styling
  - Card layouts
  - Dialog styling

- **`app/resumes/select-template.tsx`** - Template selection screen
  - Template card styling
  - Preview container styling
  - Selection indicators
  - Sticky footer styling

- **`app/resumes/[id]/index.tsx`** - Resume view screen
  - Paginated resume display styling

- **`app/resumes/[id]/edit.tsx`** - Resume editor screen
  - Form styling
  - Section layouts
  - Dialog styling
  - Input field styling
  - Button styling

### Document & PDF Screens
- **`app/editor/[id].tsx`** - Document editor screen
  - Editor toolbar styling
  - Rich text editor styling

- **`app/pdf/[id].tsx`** - PDF viewer screen
  - PDF viewer container
  - Annotation tools styling
  - Toolbar styling

### Create Screens
- **`app/create/meeting-notes.tsx`** - Meeting notes screen
  - Form styling
  - Calendar styling
  - Attendee list styling

- **`app/create/voice.tsx`** - Voice input screen
  - Recording interface styling
  - Waveform display

### Settings
- **`app/settings.tsx`** - Settings screen
  - Card layouts
  - Switch styling
  - Button styling

---

## 🧩 Component Files (Reusable UI Components)

### Resume Components
- **`src/components/resume/PaginatedResume.tsx`** - Paginated resume display
  - Page container styling
  - Content clipping
  - Page navigation styling

- **`src/components/resume/TemplatePreview.tsx`** - Template preview component
  - Preview container styling
  - Scaling and positioning

- **`src/components/resume/templates/index.tsx`** - Template router

- **`src/components/resume/templates/Template1.tsx`** - Template 1 styling
  - Resume layout
  - Section styling
  - Typography

- **`src/components/resume/templates/Template2.tsx`** - Template 2 styling

- **`src/components/resume/templates/Template3.tsx`** - Template 3 styling

- **`src/components/resume/templates/Template4.tsx`** - Template 4 styling

- **`src/components/resume/templates/Template5.tsx`** - Template 5 styling

### PDF Components
- **`src/components/PDFViewer.tsx`** - PDF viewer component
  - PDF container styling
  - Annotation overlay styling
  - Toolbar styling

- **`src/components/PDFViewerNative.tsx`** - Native PDF viewer (if used)

- **`src/components/SignatureCanvas.tsx`** - Signature canvas
  - Canvas container styling
  - Drawing interface

### Editor Components
- **`src/components/RichTextEditor.tsx`** - Rich text editor
  - Editor toolbar styling
  - Text input styling
  - Format button styling

- **`src/components/MarkdownViewer.tsx`** - Markdown renderer
  - Markdown content styling
  - Typography

### Utility Components
- **`src/components/SkeletonLoader.tsx`** - Loading skeleton
  - Skeleton animation styling
  - Placeholder layouts

- **`src/components/LoadingScreen.tsx`** - Loading screen
  - Loading indicator styling
  - Background styling

- **`src/components/ErrorBoundary.tsx`** - Error boundary
  - Error message styling
  - Error UI layout

---

## 📋 Summary by Category

### Core Theme Files (4 files)
1. `src/theme/colors.ts`
2. `src/theme/index.ts`
3. `src/theme/styles.ts`
4. `src/theme/README.md`

### Screen Files with Styling (14 files)
1. `app/_layout.tsx`
2. `app/(tabs)/_layout.tsx`
3. `app/(tabs)/index.tsx`
4. `app/(tabs)/resumes.tsx`
5. `app/(tabs)/create.tsx`
6. `app/resumes/questionnaire.tsx`
7. `app/resumes/select-template.tsx`
8. `app/resumes/[id]/index.tsx`
9. `app/resumes/[id]/edit.tsx`
10. `app/editor/[id].tsx`
11. `app/pdf/[id].tsx`
12. `app/create/meeting-notes.tsx`
13. `app/create/voice.tsx`
14. `app/settings.tsx`

### Component Files with Styling (13 files)
1. `src/components/resume/PaginatedResume.tsx`
2. `src/components/resume/TemplatePreview.tsx`
3. `src/components/resume/templates/Template1.tsx`
4. `src/components/resume/templates/Template2.tsx`
5. `src/components/resume/templates/Template3.tsx`
6. `src/components/resume/templates/Template4.tsx`
7. `src/components/resume/templates/Template5.tsx`
8. `src/components/PDFViewer.tsx`
9. `src/components/SignatureCanvas.tsx`
10. `src/components/RichTextEditor.tsx`
11. `src/components/MarkdownViewer.tsx`
12. `src/components/SkeletonLoader.tsx`
13. `src/components/LoadingScreen.tsx`

---

## 🎯 Quick Reference

### To Change App Colors
- Edit: `src/theme/colors.ts`

### To Change Theme Configuration
- Edit: `src/theme/index.ts`

### To Add Common Styles
- Edit: `src/theme/styles.ts`

### To Update Screen Styling
- Find the screen file in `app/` directory
- Update the `StyleSheet.create()` section

### To Update Component Styling
- Find the component file in `src/components/`
- Update the `StyleSheet.create()` section

---

## 📊 Total Files: 31 UI/Styling Files

**Theme System:** 4 files  
**Screen Files:** 14 files  
**Component Files:** 13 files

---

*Last Updated: Based on current codebase structure*

