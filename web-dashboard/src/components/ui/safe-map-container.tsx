"use client";

import { LeafletContext, createLeafletContext, type LeafletContextInterface } from "@react-leaflet/core";
import { Map as LeafletMap, type MapOptions } from "leaflet";
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export interface SafeMapContainerProps extends MapOptions {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: React.ReactNode;
  whenReady?: () => void;
}

export const SafeMapContainer = forwardRef<LeafletMap, SafeMapContainerProps>(
  function SafeMapContainer(
    {
      center,
      zoom,
      minZoom,
      maxZoom,
      scrollWheelZoom,
      children,
      className,
      style,
      placeholder,
      whenReady,
      ...options
    },
    forwardedRef
  ) {
    const [context, setContext] = useState<LeafletContextInterface | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useImperativeHandle(
      forwardedRef,
      () => (context?.map ?? null) as LeafletMap,
      [context]
    );

    useEffect(() => {
      const node = containerRef.current;
      if (!node) return;

      const map = new LeafletMap(node, {
        center,
        zoom,
        minZoom,
        maxZoom,
        scrollWheelZoom,
        ...options,
      });

      if (whenReady) {
        map.whenReady(whenReady);
      }

      setContext(createLeafletContext(map));

      return () => {
        map.remove();
        setContext(null);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const contents = context
      ? React.createElement(LeafletContext, { value: context }, children)
      : (placeholder ?? null);

    return (
      <div ref={containerRef} className={className} style={style}>
        {contents}
      </div>
    );
  }
);
SafeMapContainer.displayName = "SafeMapContainer";
