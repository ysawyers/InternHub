import type { Component } from "solid-js";
import { Routes, Route } from "@solidjs/router";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";

const AppRouter: Component = () => {
  return (
    <div class="h-screen w-full">
      <Routes>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/explore/:view" component={Dashboard} />
        <Route path="/explore/messages/:uuid" component={Dashboard} />
        <Route path="/explore/profile/:userId" component={Dashboard} />
      </Routes>
    </div>
  );
};

export default AppRouter;
