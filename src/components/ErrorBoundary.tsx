import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  /** Shown above the message, e.g. "Profile". Helps users say what broke. */
  area?: string;
}

interface State {
  error: Error | null;
}

/* Without this, a single throw during render unmounts the whole tree and the
   visitor gets a blank white page -- no navigation, no message, nothing to
   report. React has no built-in recovery: an error boundary is the only way
   to catch a render exception.

   Deliberately wraps the routed page rather than the whole app, so the navbar
   survives and the user can still go somewhere else. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keeps the component stack in the console for anyone debugging a report.
    console.error('Unhandled render error:', error, info.componentStack);
  }

  private reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <div className="mb-5 flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="size-5 text-destructive" />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">
          Something broke on this page
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {this.props.area
            ? `The ${this.props.area} page hit an error and could not finish loading.`
            : 'This page hit an error and could not finish loading.'}{' '}
          The rest of FameSync still works — use the menu above to carry on.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={this.reset} variant="outline">
            <RefreshCw className="size-4" />
            Try again
          </Button>
          <Button onClick={() => window.location.reload()} variant="form">
            Reload the page
          </Button>
        </div>

        {/* Collapsed by default: reassuring for visitors, and the one thing
            that turns "it went blank" into an actionable bug report. */}
        <details className="mt-8 w-full text-left">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
            Technical details
          </summary>
          <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-muted p-3 text-left text-xs leading-relaxed text-muted-foreground">
            {error.message}
            {error.stack ? `\n\n${error.stack}` : ''}
          </pre>
        </details>

        <p className="mt-6 text-xs text-muted-foreground">
          If this keeps happening, send the technical details to{' '}
          <a
            href="mailto:info@famesync.com"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            info@famesync.com
          </a>
          .
        </p>
      </div>
    );
  }
}
