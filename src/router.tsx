import { createBrowserRouter } from "react-router";
import { ROUTES } from "@/constants/routes";
import DefaultLayout from "@/layouts/DefaultLayout";
import ErrorPage from "@/pages/error/ErrorPage";
import NotFoundPage from "@/pages/error/NotFoundPage";
import FavoritesPage from "@/pages/favorites/FavoritesPage";
import HomePage from "@/pages/home/HomePage";

// object 배열 config — 인증 가드가 없어 createRoutesFromElements(JSX 트리)가 불필요.
// DefaultLayout(Header + Outlet) 아래 모든 라우트를 배치한다.
export const router = createBrowserRouter([
  {
    element: <DefaultLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: ROUTES.favorites, element: <FavoritesPage /> },
      { path: ROUTES.error, element: <ErrorPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
