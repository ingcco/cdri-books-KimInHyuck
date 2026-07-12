import { QueryCache, QueryClient } from "@tanstack/react-query";
import { ROUTES } from "@/constants/routes";
import { classifyQueryError } from "@/lib/api/shared/classifyQueryError";
import { toast } from "@/providers/toast/toastStore";
import { router } from "@/router";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (classifyQueryError(error) === "critical") {
        void router.navigate(ROUTES.error);
        return;
      }
      const message = query.meta?.errorMessage;
      toast.error(
        typeof message === "string"
          ? message
          : "일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요."
      );
    },
  }),
  // 카카오 API는 읽기 전용 — 실패 자동 재시도는 체감 지연만 늘리므로 비활성.
  defaultOptions: {
    queries: { retry: false },
  },
});
