import { NuqsAdapter } from "nuqs/adapters/react-router/v8";
import { Outlet } from "react-router";
import Header from "./components/Header";

// NuqsAdapter는 useSearchParams/useNavigate 훅에 의존하므로 RouterProvider 컨텍스트 안이어야 한다.
// 라우트 element(=router 트리 내부)인 이 레이아웃에서 Outlet을 감싸 모든 페이지가 nuqs를 쓸 수 있게 한다.
const DefaultLayout = () => {
  return (
    <NuqsAdapter>
      <div className="flex h-dvh flex-col">
        <Header />
        <main className="min-h-0 flex-1">
          <Outlet />
        </main>
      </div>
    </NuqsAdapter>
  );
};

export default DefaultLayout;
