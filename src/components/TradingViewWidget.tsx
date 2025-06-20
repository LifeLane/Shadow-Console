
"use client";

import React from 'react';

const TradingViewWidgetComponent: React.FC = () => {
  // This component is no longer in use.
  // It can be safely deleted from the project.
  return null;
};

export const TradingViewWidget = TradingViewWidgetComponent;

// Declare TradingView on window type to avoid TypeScript errors if other parts of the code might use it.
// However, since the widget is removed, this is likely not strictly necessary anymore.
declare global {
  interface Window {
    TradingView?: any; // Optional, as it's not expected to be loaded
  }
}
