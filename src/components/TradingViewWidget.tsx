
"use client";

import React, { useEffect, useRef, useId, memo } from 'react';
import { useTheme } from 'next-themes';

interface TradingViewWidgetProps {
  marketSymbol: string; // e.g., "BTCUSDT"
  timeframe: string; // e.g., "15m", "1h", "1d"
  height?: string; // e.g., "400px", "100%"
  width?: string; // e.g., "100%"
}

const SCRIPT_ID = 'tradingview-widget-script';

const mapTimeframeToTradingViewInterval = (appTimeframe: string): string => {
  const tf = appTimeframe.toLowerCase();
  if (tf.endsWith('m')) return tf.replace('m', ''); // 1m, 5m, 15m, 30m
  if (tf.endsWith('h')) return (parseInt(tf.replace('h', '')) * 60).toString(); // 1h -> 60, 4h -> 240
  if (tf.endsWith('d')) return 'D'; // 1d
  if (tf.endsWith('w')) return 'W'; // 1w
  return 'D'; // Default to daily
};

const TradingViewWidgetComponent: React.FC<TradingViewWidgetProps> = ({
  marketSymbol,
  timeframe,
  height = "100%",
  width = "100%",
}) => {
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const widgetId = useId().replace(/:/g, ''); // Ensure ID is valid for HTML
  const tvWidgetRef = useRef<any>(null);


  useEffect(() => {
    const tradingViewSymbol = marketSymbol.includes(':') ? marketSymbol : `BINANCE:${marketSymbol.toUpperCase()}`;
    const tradingViewInterval = mapTimeframeToTradingViewInterval(timeframe);
    const currentTheme = resolvedTheme === 'dark' ? 'dark' : 'light';

    const createWidget = () => {
      if (!widgetContainerRef.current || !window.TradingView) return;

      // Clear previous widget if any
      if (widgetContainerRef.current) {
        widgetContainerRef.current.innerHTML = '';
      }
      
      const widgetOptions = {
        autosize: true,
        symbol: tradingViewSymbol,
        interval: tradingViewInterval,
        timezone: 'Etc/UTC',
        theme: currentTheme,
        style: '1',
        locale: 'en',
        enable_publishing: false,
        allow_symbol_change: true,
        container_id: widgetContainerRef.current.id, // Use the ref's id
        hide_side_toolbar: false,
      };
      
      tvWidgetRef.current = new window.TradingView.widget(widgetOptions);
    };

    const loadScriptAndCreateWidget = () => {
      if (document.getElementById(SCRIPT_ID) && window.TradingView) {
        createWidget();
        return;
      }

      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.type = 'text/javascript';
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = createWidget;
      script.onerror = () => console.error("TradingView script failed to load.");
      document.body.appendChild(script);
    };
    
    loadScriptAndCreateWidget();

    return () => {
      // Cleanup when component unmounts or dependencies change before next effect run
      if (widgetContainerRef.current) {
        widgetContainerRef.current.innerHTML = ''; // Clear the container
      }
      // Note: TradingView widgets might not have a formal destroy method accessible here.
      // Clearing the container is the primary way to remove it.
      // If script was added by this instance and no other instances need it, it could be removed,
      // but that adds complexity; typically tv.js is loaded once per page.
    };
  }, [marketSymbol, timeframe, resolvedTheme, widgetId]); // widgetId is stable per component instance

  return (
    <div className="tradingview-widget-container" style={{ height, width }}>
      <div ref={widgetContainerRef} id={`tv-widget-container-${widgetId}`} style={{ height: 'calc(100% - 30px)', width: '100%' }} />
      <div className="tradingview-widget-copyright" style={{height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <a href={`https://www.tradingview.com/symbols/${marketSymbol.toUpperCase()}/`} rel="noopener nofollow" target="_blank" style={{textDecoration: 'none'}}>
          <span style={{ color: resolvedTheme === 'dark' ? '#9DB2BF' : '#2962FF' }}>{marketSymbol.toUpperCase()} chart</span>
        </a>
        <span style={{marginLeft: '8px', color: resolvedTheme === 'dark' ? '#6A7C8C' : '#787B86' }}> by TradingView</span>
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders if props are the same.
export const TradingViewWidget = memo(TradingViewWidgetComponent);

// Declare TradingView on window type to avoid TypeScript errors
declare global {
  interface Window {
    TradingView: any;
  }
}
