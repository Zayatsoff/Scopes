import { Component, ErrorInfo, ReactNode } from "react"
import { ErrorDetails } from "./ErrorDetails"

interface Props {
  children: ReactNode
  catchErrors: "always" | "dev" | "prod" | "never"
  componentName?: string // Add component name for better error tracking
  onError?: (error: Error, componentStack: string, componentName?: string) => void // Error callback for logging
  fallback?: (props: { error: Error; resetError: () => void }) => ReactNode // Custom fallback UI
  maxRetries?: number // Maximum number of retries before giving up
}

interface State {
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number // Track retry attempts
}

/**
 * This component handles whenever the user encounters a JS error in the
 * app. It follows the "error boundary" pattern in React. We're using a
 * class component because according to the documentation, only class
 * components can be error boundaries.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/concept/Error-Boundary/}
 * @see [React Error Boundaries]{@link https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary}
 * @param {Props} props - The props for the `ErrorBoundary` component.
 * @returns {JSX.Element} The rendered `ErrorBoundary` component.
 */
export class ErrorBoundary extends Component<Props, State> {
  static defaultProps = {
    maxRetries: 1,
  }

  state = { error: null, errorInfo: null, retryCount: 0 }

  // If an error in a child is encountered, this will run
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Only set errors if enabled
    if (!this.isEnabled()) {
      return
    }
    // Catch errors in any components below and re-render with error message
    this.setState({
      error,
      errorInfo,
    })

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo.componentStack || "", this.props.componentName)
    }

    // You can also log error messages to an error reporting service here
    // This is a great place to put BugSnag, Sentry, crashlytics, etc:
    // reportCrash(error)
  }

  // Reset the error back to null
  resetError = () => {
    const { maxRetries = 1 } = this.props

    if (this.state.retryCount >= maxRetries) {
      // If maximum retries reached, just clear the error without incrementing retry count
      this.setState({ error: null, errorInfo: null })
    } else {
      // Otherwise increment retry count and clear the error
      this.setState((prevState) => ({
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }))
    }
  }

  // To avoid unnecessary re-renders
  shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>): boolean {
    return nextState.error !== this.state.error || nextState.retryCount !== this.state.retryCount
  }

  // Only enable if we're catching errors in the right environment
  isEnabled(): boolean {
    return (
      this.props.catchErrors === "always" ||
      (this.props.catchErrors === "dev" && __DEV__) ||
      (this.props.catchErrors === "prod" && !__DEV__)
    )
  }

  // Render an error UI if there's an error; otherwise, render children
  render() {
    if (!this.isEnabled() || !this.state.error) {
      return this.props.children
    }

    // If a custom fallback is provided, use it
    if (this.props.fallback) {
      return this.props.fallback({
        error: this.state.error,
        resetError: this.resetError,
      })
    }

    // Otherwise use the default ErrorDetails component
    return (
      <ErrorDetails
        onReset={this.resetError}
        error={this.state.error}
        errorInfo={this.state.errorInfo}
      />
    )
  }
}
