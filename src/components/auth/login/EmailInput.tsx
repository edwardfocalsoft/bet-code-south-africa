
import React from "react";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";

interface EmailInputProps {
  email: string;
  setEmail: (email: string) => void;
  isDisabled: boolean;
}

const EmailInput: React.FC<EmailInputProps> = ({ email, setEmail, isDisabled }) => {
  return (
    <div>
      <label htmlFor="email" className="block text-sm font-medium mb-1">
        Email
      </label>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="bg-betting-light-gray border-betting-light-gray focus:border-betting-green text-white pl-10 transition-all"
          disabled={isDisabled}
        />
      </div>
    </div>
  );
};

export default EmailInput;
