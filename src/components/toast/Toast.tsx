import ToastItem from "./components/ToastItem";
import { toastVariants } from "./Toast.style";

export interface ToastData {
  id: string;
  message: string;
}

export interface ToastProps {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

const Toast = ({ toasts, onRemove }: ToastProps) => {
  const styles = toastVariants();

  return (
    <div className={styles.container()}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} id={toast.id} message={toast.message} onRemove={onRemove} />
      ))}
    </div>
  );
};

export default Toast;
