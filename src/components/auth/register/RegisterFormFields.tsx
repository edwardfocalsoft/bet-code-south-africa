
import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const RegisterFormFields: React.FC = () => {
  const { control } = useFormContext();
  
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">Email</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="email"
                placeholder="your@email.com"
                className="bg-betting-light-gray border-betting-light-gray focus:border-betting-green text-white"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">Password</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="password"
                placeholder="••••••••••"
                className="bg-betting-light-gray border-betting-light-gray focus:border-betting-green text-white"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">Confirm Password</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="password"
                placeholder="••••••••••"
                className="bg-betting-light-gray border-betting-light-gray focus:border-betting-green text-white"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default RegisterFormFields;
