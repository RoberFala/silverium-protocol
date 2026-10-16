import "@testing-library/jest-dom/vitest";
import type { InternetIdentityContext } from "@caffeineai/core-infrastructure";
import { cleanup, configure } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, vi } from "vitest";

configure({ testIdAttribute: "data-ocid" });
Object.defineProperty(window, "matchMedia", {
  writable: true,
  configurable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
Element.prototype.hasPointerCapture ??= () => false;
Element.prototype.setPointerCapture ??= () => {};
Element.prototype.releasePointerCapture ??= () => {};
Element.prototype.scrollIntoView ??= () => {};

const platformMock = vi.hoisted(() => ({
  useActor: vi.fn(),
  useInternetIdentity: vi.fn(),
}));
// Keep generated runtime values (enums, blobs) while replacing actor creation only.
vi.mock("@/backend", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/backend")>()),
  createActor: vi.fn(),
}));
vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: platformMock.useActor,
  useInternetIdentity: platformMock.useInternetIdentity,
  InternetIdentityProvider: ({ children }: PropsWithChildren) => children,
}));

export function setActorForTest(actor: unknown) {
  platformMock.useActor.mockReturnValue({ actor, isFetching: false });
}

/** Explicit UI state only: these mocks never sign in or prove authentication. */
export function setIdentityForTest(
  overrides: Partial<InternetIdentityContext> = {},
) {
  const loginStatus = overrides.loginStatus ?? "idle";
  const state: InternetIdentityContext = {
    identity: undefined,
    login: vi.fn(),
    clear: vi.fn(),
    loginStatus,
    isInitializing: loginStatus === "initializing",
    isLoginIdle: loginStatus === "idle",
    isLoggingIn: loginStatus === "logging-in",
    isLoginSuccess: loginStatus === "success",
    isLoginError: loginStatus === "loginError",
    isSessionExpired: loginStatus === "expired",
    isAuthenticated:
      overrides.identity !== undefined &&
      !overrides.identity.getPrincipal().isAnonymous(),
    ...overrides,
  };
  platformMock.useInternetIdentity.mockReturnValue(state);
  return state;
}

beforeEach(() => {
  setIdentityForTest();
});

afterEach(() => {
  cleanup();
  platformMock.useActor.mockReset();
  platformMock.useInternetIdentity.mockReset();
  vi.useRealTimers();
});
