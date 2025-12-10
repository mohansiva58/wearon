"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import Link from "next/link"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600 mb-4">
                We encountered an unexpected error. Don't worry, it's not your fault.
              </p>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mb-6 text-left">
                <details className="bg-gray-50 rounded p-4 cursor-pointer">
                  <summary className="font-semibold text-sm text-gray-700 mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="text-xs text-red-600 font-mono overflow-auto max-h-48">
                    <p className="font-bold mb-2">{this.state.error.message}</p>
                    <pre className="whitespace-pre-wrap">
                      {this.state.error.stack}
                    </pre>
                    {this.state.errorInfo && (
                      <pre className="mt-2 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null })
                  window.location.reload()
                }}
                className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="block w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                Go to Homepage
              </Link>
            </div>

            <p className="mt-6 text-xs text-gray-500">
              If this problem persists, please{" "}
              <a
                href="mailto:support@thehouseofrare.com"
                className="text-black underline"
              >
                contact support
              </a>
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
