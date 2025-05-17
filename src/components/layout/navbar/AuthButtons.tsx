
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AuthButtons: React.FC = () => {
  return (
    <>
      <Button variant="outline" asChild>
        <Link to="/auth/login">Login</Link>
      </Button>
      <Button asChild className="bg-betting-green hover:bg-betting-green-dark">
        <Link to="/auth/register">Register</Link>
      </Button>
    </>
  );
};

export default AuthButtons;
