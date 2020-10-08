import React from "react";

export default class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }
  
    static getDerivedStateFromError(error) {
      // Update state so the next render will show the fallback UI.
      return { hasError: true };
    }
  
    render() {
      if (this.state.hasError) {
        // You can render any custom fallback UI
        const { contactURL, contactLabel } = this.props.config;
        return <h1>Something went wrong. You should let people know at <a href={contactURL}>{contactLabel}</a></h1>;
      }
  
      return this.props.children; 
    }
  }