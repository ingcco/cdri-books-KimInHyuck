import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { toastStore } from "./toastStore";
import Toast from "@/components/toast/Toast";

const ToastProvider = () => {
  const state = useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getState,
    toastStore.getState
  );

  if (typeof document === "undefined") return null;

  return createPortal(<Toast toasts={state.toasts} onRemove={toastStore.remove} />, document.body);
};

export default ToastProvider;
