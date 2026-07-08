import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { RouterProvider } from "react-router";
import { ROUTES } from "@/constants/routes";
import ToastProvider from "@/providers/toast/ToastProvider";
import { toast } from "@/providers/toast/toastStore";
import { router } from "@/router";

// critical(에러 페이지) vs recoverable(토스트)은 HTTP status로만 판정 — 소비 시점 분류.
const CRITICAL_STATUS = new Set([401, 403, 404, 503]);

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (status !== undefined && (CRITICAL_STATUS.has(status) || status >= 500)) {
        void router.navigate(ROUTES.error);
        return;
      }
      toast.error("검색 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.");
    },
  }),
  // 카카오 API는 읽기 전용 — 실패 자동 재시도는 사용자 체감 지연만 늘리므로 비활성.
  defaultOptions: {
    queries: { retry: false },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ToastProvider />
    </QueryClientProvider>
  );
};

export default App;
