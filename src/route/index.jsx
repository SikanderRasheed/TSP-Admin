import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import { App as AntApp } from "antd";
import Loader from "@/components/shared/loader";
import { routes } from "@/config/route";
import AnimatedRoutes from "./animatedroute";
import { QueryClientProvider } from "@tanstack/react-query";

const App = () => {
  return (
    <AntApp>
      <Suspense fallback={<Loader />}>
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </Suspense>
    </AntApp>
  );
};

export default App;
