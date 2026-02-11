import { Routes, Route, useLocation } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { routes } from "@/config/route";
import { PrivateRoute, PublicRoute, MixedRoute } from "./routeguard";

const PageTransitionWrapper = ({ children }) => (
  <motion.div
     initial={{ opacity: 0, x: 50 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -50 }}
  transition={{ duration: 0.2, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  const renderRouteElement = (route) => {
    const { component: Component, private: isPrivate, authOnly } = route;
    
    const componentElement = (
      <PageTransitionWrapper>
        <Component />
      </PageTransitionWrapper>
    );

    // Private routes - require login
    if (isPrivate) {
      return <PrivateRoute>{componentElement}</PrivateRoute>;
    }
    
    // Auth-only routes - redirect logged-in users away
    if (authOnly) {
      return <PublicRoute>{componentElement}</PublicRoute>;
    }
    
    // Mixed routes - accessible to everyone
    return <MixedRoute>{componentElement}</MixedRoute>;
  };

  return (
    <div style={{ position: "relative" }}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {routes.map((route) => (
            <Route
              key={route.name}
              path={route.path}
              element={renderRouteElement(route)}
            />
          ))}
        </Routes>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedRoutes;
