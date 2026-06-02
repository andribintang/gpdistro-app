export {};

type SnapResult = Record<string, unknown>;
interface SnapPayOptions {
  onSuccess?: (result: SnapResult) => void;
  onPending?: (result: SnapResult) => void;
  onError?: (result: SnapResult) => void;
  onClose?: () => void;
}
interface SnapInstance {
  pay: (token: string, options?: SnapPayOptions) => void;
}
declare global {
  interface Window {
    snap?: SnapInstance;
  }
}
