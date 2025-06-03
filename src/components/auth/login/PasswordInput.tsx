
import React from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Key } from "lucide-react";

interface PasswordInputProps {
  password: string;
  setPassword: (password: string) => void;
  isDisabled: boolean;
  showPassword: boolean;
  toggleShowPassword: () => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ 
  password, 
  setPassword, 
  isDisabled,
  showPassword,
  toggleShowPassword 
}) => {
  return (
    <div>
      <label htmlFor="password" className="block text-sm font-medium mb-1">
        Password
      </label>
      <div className="relative">
        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••"
          required
          className="bg-betting-light-gray border-betting-light-gray focus:border-betting-green text-white pl-10 pr-12"
          disabled={isDisabled}
        />
        <button 
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-white transition-colors p-1 rounded"
          onClick={toggleShowPassword}
          disabled={isDisabled}
          aria-label={showPassword ? "Hide password" : "Show password"}
          style={{ right: '12px' }}
        >
          {showPassword ? 
            <EyeOff className="h-4 w-4" /> : 
            <Eye className="h-4 w-4" />
          }
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;
