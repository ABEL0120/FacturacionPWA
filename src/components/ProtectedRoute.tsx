import React from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps extends RouteProps {
  component: React.ComponentType<any>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  ...rest
}) => {
  const { isAuthenticated, token } = useAuth();

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated && token ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
};

export default ProtectedRoute;

