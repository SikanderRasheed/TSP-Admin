import { lazy } from "react";

// Public Routes (No login required)
export const routes = [
  // { path: "/", name: "home", component: lazy(() => import("@/pages/home")) },
  
  
  {
    path: "/",
    name: "login",
    component: lazy(() => import("@/pages/auth/login")),
    authOnly: true,
  },
  {
    path: "/register",
    name: "login",
    component: lazy(() => import("@/pages/auth/register")),
    authOnly: true,
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: lazy(() => import("@/pages/dashboard")),
   private: true,
  },
  {
    path: "/certificates/:id",
    name: "certificate-detail",
    component: lazy(() => import("@/pages/certificates/detail")),
    private: true,
  },

  // Private Routes (Require login)
 
  // {
  //   path: "/chat-screen",
  //   name: "chat-screen",
  //   component: lazy(() => import("@/pages/chatscreen")),
  //   private: true,
  // },
];
