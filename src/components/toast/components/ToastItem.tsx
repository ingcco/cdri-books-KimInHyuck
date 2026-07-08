import { useToastItem } from "../hooks/useToastItem";
import { toastVariants } from "../Toast.style";

interface ToastItemProps {
  id: string;
  message: string;
  onRemove: (id: string) => void;
}

const ToastItem = ({ id, message, onRemove }: ToastItemProps) => {
  const { isExiting, handleClose } = useToastItem({ id, onRemove });

  const styles = toastVariants({ exiting: isExiting });

  return (
    <div role="alert" aria-live="assertive" className={styles.item()}>
      <p className={styles.message()}>{message}</p>
      <button type="button" aria-label="닫기" className={styles.close()} onClick={handleClose}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M4 4L12 12M12 4L4 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default ToastItem;
