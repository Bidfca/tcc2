/**
 * Theme Provider Component for Application-Wide Theme Support
 * 
 * This component wraps the entire application with theme support using next-themes.
 * It enables light/dark mode switching throughout AgroInsight.
 * 
 * Configuration:
 * - attribute="class": Uses CSS classes for theming (light/dark)
 * - defaultTheme="system": Uses user's system preference as default
 * - enableSystem: Allows automatic detection of system theme
 * - disableTransitionOnChange: Prevents jarring transitions when theme changes
 * 
 * This provider is typically used in the root layout to ensure theme
 * availability throughout the entire application.
 * 
 * Usage (in layout.tsx):
 * ```tsx
 * import ThemeProvider from '@/components/providers/theme-provider'
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <ThemeProvider>
 *           {children}
 *         </ThemeProvider>
 *       </body>
 *     </html>
 *   )
 * }
 */

'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

/**
 * Theme provider wrapper component
 * 
 * Configures and provides theme context to all child components.
 * Uses next-themes library for seamless theme switching.
 * 
 * @param children - React components that should have theme access
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      // Use CSS class attribute for theme application
      // Adds 'light' or 'dark' class to HTML element
      attribute="class"
      
      // Default to user's system theme preference
      // Falls back to 'light' if system preference is unavailable
      defaultTheme="system"
      
      // Enable automatic system theme detection
      // Allows users to follow their OS theme settings
      enableSystem
      
      // Disable CSS transitions when theme changes
      // Prevents jarring flash when switching between themes
      disableTransitionOnChange
    >
      {/* Render all child components with theme context */}
      {children}
    </NextThemesProvider>
  )
}






