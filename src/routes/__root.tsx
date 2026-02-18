/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import { createTheme, CssBaseline, ThemeProvider, Typography } from '@mui/material'
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0891B2', light: '#22D3EE', dark: '#0E7490' },
    secondary: { main: '#F59E0B' },
    error: { main: '#FF7043' },
    success: { main: '#2E7D32' },
    background: { default: '#FDF6EC', paper: '#FFFFFF' },
    text: { primary: '#3E2723', secondary: '#795548' },
    divider: '#E8D5B8',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Nunito", "Roboto", "Helvetica", "Arial", sans-serif',
    button: { textTransform: 'none' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          'background': 'linear-gradient(135deg, #0891B2, #22D3EE)',
          '&:hover': { background: 'linear-gradient(135deg, #0E7490, #0891B2)' },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: '#E8D5B8' },
            '&:hover fieldset': { borderColor: '#0891B2' },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16 },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          'borderRadius': 8,
          'marginInline': 4,
          '&.Mui-selected': {
            backgroundColor: 'rgba(8,145,178,0.12)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, #0891B2, #22D3EE)',
          color: '#FFFFFF',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: '#E8D5B8' },
      },
    },
  },
})

const RootDocument = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <link rel="icon" href="/palm.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

const RootComponent = () => {
  return (
    <RootDocument>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Outlet />
      </ThemeProvider>
    </RootDocument>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => <Typography>Page not found</Typography>,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'TanChat' },
    ],
  }),
})
