import React from "react";
import AuthLayout from "./layout";
import LoginPage from "./login/page";
import RegisterPage from "./register/page";

const AuthPage = () => {
  return (
    <AuthLayout>
      {/* Login */}
      <LoginPage />
      {/* Register */}
      <RegisterPage />
    </AuthLayout>
  );
};

export default AuthPage;
