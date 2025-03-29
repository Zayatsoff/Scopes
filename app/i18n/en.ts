const en = {
  common: {
    ok: "OK!",
    cancel: "Cancel",
    back: "Back",
    retry: "Try Again",
  },
  welcomeScreen: {
    postscript:
      "psst  — This probably isn't what your app looks like. (Unless your designer handed you these screens, and in that case, ship it!)",
    readyForLaunch: "Your app, almost ready for launch!",
    exciting: "(ohh, this is exciting!)",
  },
  errorScreen: {
    title: "Something went wrong!",
    friendlySubtitle:
      "This is the screen that your users will see in production when an error is thrown. You'll want to customize this message (located in `app/i18n/en.ts`) and probably the layout as well (`app/screens/ErrorScreen`). If you want to remove this entirely, check `app/app.tsx` for the <ErrorBoundary> component.",
    reset: "RESET APP",
    errorDetails: "Error Details",
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
      networkError: "Couldn't connect to the server. Please check your internet connection and try again.",
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
