import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

const trackedWindowDescriptors = new Map<PropertyKey, PropertyDescriptor | undefined>();
const trackedNavigatorDescriptors = new Map<PropertyKey, PropertyDescriptor | undefined>();
const trackedGlobalDescriptors = new Map<PropertyKey, PropertyDescriptor | undefined>();

function captureDescriptor(target: object | undefined, property: PropertyKey) {
  if (!target) return undefined;
  return Object.getOwnPropertyDescriptor(target, property);
}

function restoreDescriptor(target: object | undefined, property: PropertyKey, descriptor: PropertyDescriptor | undefined) {
  if (!target) return;
  if (descriptor) {
    Object.defineProperty(target, property, descriptor);
    return;
  }
  Reflect.deleteProperty(target, property);
}

function captureBrowserDescriptors() {
  if (typeof window !== "undefined") {
    for (const property of ["_hmt", "cancelAnimationFrame", "gtag", "matchMedia", "open", "requestAnimationFrame"]) {
      trackedWindowDescriptors.set(property, captureDescriptor(window, property));
    }
    if (window.navigator) {
      for (const property of ["clipboard", "share"]) {
        trackedNavigatorDescriptors.set(property, captureDescriptor(window.navigator, property));
      }
    }
  }

  for (const property of ["fetch"]) {
    trackedGlobalDescriptors.set(property, captureDescriptor(globalThis, property));
  }
}

function restoreBrowserDescriptors() {
  if (typeof window !== "undefined") {
    for (const [property, descriptor] of trackedWindowDescriptors.entries()) {
      restoreDescriptor(window, property, descriptor);
    }
    if (window.navigator) {
      for (const [property, descriptor] of trackedNavigatorDescriptors.entries()) {
        restoreDescriptor(window.navigator, property, descriptor);
      }
    }
    window.localStorage?.clear();
    window.sessionStorage?.clear();
  }

  for (const [property, descriptor] of trackedGlobalDescriptors.entries()) {
    restoreDescriptor(globalThis, property, descriptor);
  }
}

captureBrowserDescriptors();

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.useRealTimers();
  restoreBrowserDescriptors();
});
