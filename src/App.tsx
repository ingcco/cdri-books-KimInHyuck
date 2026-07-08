import { QueryClientProvider } from "@tanstack/react-query";
import { LazyMotion, domMax } from "framer-motion";
import { RouterProvider } from "react-router";
import { queryClient } from "@/lib/api/queryClient";
import ToastProvider from "@/providers/toast/ToastProvider";
import { router } from "@/router";

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LazyMotion features={domMax} strict>
        <RouterProvider router={router} />
      </LazyMotion>
      <ToastProvider />
    </QueryClientProvider>
  );
};

export default App;
