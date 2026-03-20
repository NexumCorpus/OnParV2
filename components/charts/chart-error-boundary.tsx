'use client'

import { Component, type ReactNode } from 'react'
import { ChartErrorFallback } from './chart-error-fallback'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ChartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('[ChartErrorBoundary]', error)
  }

  render() {
    if (this.state.hasError) {
      return <ChartErrorFallback onRetry={() => this.setState({ hasError: false })} />
    }
    return this.props.children
  }
}
