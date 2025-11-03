import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message?: string;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const message = (typeof error === 'object' && error && 'message' in error)
      ? String((error as { message?: unknown }).message ?? 'Something went wrong')
      : 'Something went wrong';
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, errorInfo: unknown): void {
    // Optionally log to a service
    // console.error('ErrorBoundary caught', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback message={this.state.message} />;
    }
    return this.props.children as React.ReactElement;
  }
}

function ErrorFallback({ message }: { message?: string }) {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>Oops</Text>
      <Text style={[styles.message, { color: theme.colors.text.secondary }]}>{message}</Text>
      <Text style={[styles.hint, { color: theme.colors.text.tertiary }]}>Please try again.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 6,
  },
  hint: {
    fontSize: 14,
  },
});
