import type { ToastData } from "@/components/toast/Toast";

interface ToastState {
  toasts: ToastData[];
}

// 동시에 쌓이는 최대 개수 — 초과 시 오래된 것부터 밀어냄
const LIMIT = 3;

let state: ToastState = { toasts: [] };
let counter = 0;
const listeners = new Set<() => void>();

const emit = () => {
  listeners.forEach((listener) => listener());
};

const setState = (next: ToastState) => {
  state = next;
  emit();
};

const toastStore = {
  getState: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  add: (message: string) => {
    counter += 1;
    const item: ToastData = { id: `toast-${counter}`, message };
    setState({ toasts: [...state.toasts, item].slice(-LIMIT) });
  },
  remove: (id: string) => {
    setState({ toasts: state.toasts.filter((toast) => toast.id !== id) });
  },
};

/** 컴포넌트 밖(React Query onError, api 레이어 등)에서도 호출 가능한 imperative API */
const toast = {
  error: (message: string) => toastStore.add(message),
};

export { toastStore, toast };
