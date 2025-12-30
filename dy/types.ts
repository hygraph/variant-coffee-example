/**
 * Dynamic Yield Client-Side Types
 * These types extend the global Window interface to include DY API methods
 */

export interface DYUserContext {
  userId?: string;
  email?: string;
  [key: string]: unknown;
}

export interface DYPageContext {
  type:
    | "HOMEPAGE"
    | "CATEGORY"
    | "PRODUCT"
    | "CART"
    | "POST"
    | "SEARCH"
    | "OTHER";
  data?: string[];
  lng?: string;
}

export interface DYSpaContext {
  path: string;
  title?: string;
  context?: DYPageContext;
}

export interface DYEventProperties {
  productId?: string;
  value?: number;
  currency?: string;
  quantity?: number;
  [key: string]: unknown;
}

export interface DYEvent {
  name: string;
  properties?: DYEventProperties;
}

export interface DYConsentContext {
  consent: boolean;
}

export interface DYAPI {
  (method: "spa", context: DYSpaContext): void;
  (method: "event", event: DYEvent): void;
  (method: "setContext", context: { user: DYUserContext }): void;
  (method: "consent", context: DYConsentContext): void;
  (method: "selector", selector: string): void;
  (method: string, ...args: unknown[]): void;
}

export interface DYObject {
  API: DYAPI;
  recommendationContext?: DYPageContext;
  ServerUtil?: {
    getClientData: () => {
      pageType: string;
      [key: string]: unknown;
    };
  };
}

declare global {
  interface Window {
    DY?: DYObject;
    DYO?: {
      ActiveGroups?: string[];
      [key: string]: unknown;
    };
  }
}

export {};

