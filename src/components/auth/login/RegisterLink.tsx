
import React from "react";
import { Link } from "react-router-dom";

const RegisterLink: React.FC = () => {
  return (
    <div className="pt-4 text-center text-sm">
      <p className="text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/auth/register" className="text-betting-green hover:underline transition-colors">
          Create one
        </Link>
      </p>
    </div>
  );
};

export default RegisterLink;
