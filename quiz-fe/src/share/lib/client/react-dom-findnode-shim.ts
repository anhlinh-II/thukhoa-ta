"use client";

// Polyfill for environments/bundlers where `react-dom` doesn't expose
// `findDOMNode` on the default/namespace object (some bundlers/interop can
// strip it). Some older libraries (or wrappers) rely on findDOMNode.
// This file should be imported before those libraries are dynamically
// imported (for example, before ReactQuill) so the function exists.

import * as ReactDOM from 'react-dom';

try {
  const has = (ReactDOM as any).findDOMNode;
  if (typeof has !== 'function') {
    const shim = function (compOrElement: any) {
      if (!compOrElement) return null;
      if (compOrElement.nodeType === 1) return compOrElement;
      if (compOrElement.current && compOrElement.current.nodeType === 1) return compOrElement.current;
      if (compOrElement instanceof Element) return compOrElement;
      try {
        if (typeof compOrElement.getDOMNode === 'function') return compOrElement.getDOMNode();
      } catch (e) {
        // ignore
      }
      return null;
    };

    // Some bundlers or runtime environments expose a non-extensible ReactDOM
    // namespace (for example when exports are frozen). Trying to add a new
    // property then throws. Detect that and avoid mutating the object.
    try {
      if (Object.isExtensible && Object.isExtensible(ReactDOM)) {
        (ReactDOM as any).findDOMNode = shim;
      } else {
        // Cannot add to ReactDOM: provide a safe global fallback. This won't
        // make third-party libs magically call it, but it avoids throwing an
        // error during module evaluation and is useful for debugging.
        (globalThis as any).__findDOMNodeShim = shim;
        // eslint-disable-next-line no-console
        console.warn('react-dom is not extensible; skipping findDOMNode polyfill. A fallback is available at globalThis.__findDOMNodeShim');
      }
    } catch (e) {
      // If even checking extensibility fails, don't crash the app.
      // eslint-disable-next-line no-console
      console.warn('react-dom findDOMNode shim failed to install', e);
    }
  }
} catch (e) {
  // If anything goes wrong during shim, don't crash the app — the error
  // will be visible in dev console but we fall back to letting the host
  // library fail with its original issue.
  // eslint-disable-next-line no-console
  console.warn('react-dom findDOMNode shim failed to install', e);
}

export {};
