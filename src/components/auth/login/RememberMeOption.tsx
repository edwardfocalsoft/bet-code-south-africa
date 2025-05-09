
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface RememberMeOptionProps {
  rememberMe: boolean;
  setRememberMe: (value: boolean) => void;
  isDisabled: boolean;
}

const RememberMeOption: React.FC<RememberMeOptionProps> = ({ 
  rememberMe, 
  setRememberMe, 
  isDisabled 
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox 
        id="remember" 
        checked={rememberMe} 
        onCheckedChange={(checked) => setRememberMe(!!checked)} 
        className="h-4 w-4 rounded border-betting-light-gray bg-betting-light-gray text-betting-green focus:ring-betting-green"
        disabled={isDisabled}
      />
      <label 
        htmlFor="remember" 
        className="text-sm cursor-pointer select-none"
        onClick={() => !isDisabled && setRememberMe(!rememberMe)}
      >
        Remember me
      </label>
    </div>
  );
};

export default RememberMeOption;
