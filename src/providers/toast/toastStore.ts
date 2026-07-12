import type { ToastData } from "@/components/toast/Toast";

interface ToastState {
  toasts: ToastData[];
}

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

const toast = {
  error: (message: string) => toastStore.add(message),
};

export { toastStore, toast };
