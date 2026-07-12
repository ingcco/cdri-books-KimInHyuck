import { createBrowserRouter } from "react-router";
import { ROUTES } from "@/constants/routes";
import DefaultLayout from "@/layouts/DefaultLayout";
import ErrorPage from "@/pages/error/ErrorPage";
import NotFoundPage from "@/pages/error/NotFoundPage";
import FavoritesPage from "@/pages/favorites/FavoritesPage";
import HomePage from "@/pages/home/HomePage";

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
