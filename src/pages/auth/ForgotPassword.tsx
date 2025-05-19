
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      setIsSubmitted(true);
    } catch (error: any) {
      toast.error(error.error_description || error.message || 'Failed to send password reset link');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="container max-w-md py-16">
        <div className="betting-card p-6 md:p-8">
          {!isSubmitted ? (
            <>
              <div className="mb-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-betting-green-dark/10 rounded-full p-3">
                    <Mail className="h-6 w-6 text-betting-green" />
                  </div>
                </div>
                <Heading as="h1" size="xl" className="mb-2">Reset Your Password</Heading>
                <p className="text-muted-foreground">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>
              
              <form onSubmit={handleResetPassword}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                      className="w-full"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-betting-green hover:bg-betting-green-dark"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </div>
              </form>
              
              <div className="mt-6 text-center">
                <Link to="/auth/login" className="inline-flex items-center text-sm text-betting-green hover:text-betting-green-dark">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <div className="bg-green-50 rounded-full p-3">
                  <Mail className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <Heading as="h2" size="lg" className="mb-2">Check Your Email</Heading>
              <p className="text-muted-foreground mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Didn't receive an email? Check your spam folder or 
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="text-betting-green hover:text-betting-green-dark ml-1"
                >
                  try again
                </button>
              </p>
              <div className="mt-6">
                <Link to="/auth/login">
                  <Button variant="outline" className="w-full">
                    Return to Login
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
