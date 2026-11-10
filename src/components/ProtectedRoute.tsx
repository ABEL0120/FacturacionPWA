import React from "react";
import { Route, Redirect, RouteProps, RouteComponentProps } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps extends RouteProps {
  component: React.ComponentType<RouteComponentProps>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  ...rest
}) => {
  const { isAuthenticated, token } = useAuth();

  return (
    <Route
      {...rest}
      render={(props) => {
        if (isAuthenticated && token) {
          return <Component {...props} />;
        }
        if (props.location.pathname === "/login") {
          return null;
        }
        return (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location },
            }}
          />
        );
      }}
    />
  );
};

export default ProtectedRoute;

