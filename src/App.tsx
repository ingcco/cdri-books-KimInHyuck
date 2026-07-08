import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { queryClient } from "@/lib/api/queryClient";
import ToastProvider from "@/providers/toast/ToastProvider";
import { router } from "@/router";

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ToastProvider />
    </QueryClientProvider>
  );
};

export default App;
