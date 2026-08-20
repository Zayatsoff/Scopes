const en = {
  common: {
    ok: "OK!",
    cancel: "Cancel",
    back: "Back",
    retry: "Try Again",
  },
  errorScreen: {
    title: "Oops! Something went wrong",
    friendlySubtitle:
      "We've encountered an unexpected issue. Our team has been notified and is working on a fix.",
    reset: "Restart App",
    errorDetails: "Technical Details",
  },
  errorBoundary: {
    component: {
      title: "Component Error",
      message: "There was a problem displaying this component.",
    },
    navigation: {
      title: "Navigation Error",
      message: "There was a problem with this screen. Please try going back or restarting the app.",
    },
    dataFetching: {
      title: "Failed to Load Data",
      message: "We couldn't load the required data. Please try again.",
      networkError:
        "Couldn't connect to the server. Please check your internet connection and try again.",
      serverError: "The server encountered a problem. Please try again later.",
      notFoundError: "The requested data could not be found.",
      authError: "You don't have permission to access this data. Please log in again.",
    },
  },
  emptyStateComponent: {
    generic: {
      heading: "So empty... so sad",
      content: "No data found yet. Try clicking the button to refresh or reload the app.",
      button: "Let's try this again",
    },
  },
}

export default en
export type Translations = typeof en
