import React, { useState } from 'react';
import { Chrome, Linkedin, Mail, ArrowRight, Shield, Clock } from 'lucide-react';
import { Button } from './button';

interface SocialAuthProps {
  onGoogleSignIn: () => Promise<void>;
  onLinkedInSignIn: () => Promise<void>;
  onEmailSignIn: (email: string) => Promise<void>;
  onSkipSignIn: () => void;
  className?: string;
  showSkipOption?: boolean;
}

export const SocialAuth: React.FC<SocialAuthProps> = ({
  onGoogleSignIn,
  onLinkedInSignIn,
  onEmailSignIn,
  onSkipSignIn,
  className = '',
  showSkipOption = true
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'linkedin' | 'email' | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setLoadingProvider('google');
    try {
      await onGoogleSignIn();
    } catch (error) {
      console.error('Google sign-in failed:', error);
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleLinkedInSignIn = async () => {
    setIsLoading(true);
    setLoadingProvider('linkedin');
    try {
      await onLinkedInSignIn();
    } catch (error) {
      console.error('LinkedIn sign-in failed:', error);
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsLoading(true);
    setLoadingProvider('email');
    try {
      await onEmailSignIn(email.trim());
    } catch (error) {
      console.error('Email sign-in failed:', error);
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Quick Start Options */}
      <div className="space-y-3">
        <p className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Start your free trial in under 2 minutes
        </p>

        {/* Google Sign-In */}
        <Button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="cta-social google w-full justify-center relative"
          variant="outline"
        >
          <Chrome className="w-5 h-5 mr-3 text-red-500" />
          <span>Continue with Google</span>
          {loadingProvider === 'google' && (
            <div className="absolute right-4">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
            </div>
          )}
        </Button>

        {/* LinkedIn Sign-In */}
        <Button
          onClick={handleLinkedInSignIn}
          disabled={isLoading}
          className="cta-social linkedin w-full justify-center relative"
          variant="outline"
        >
          <Linkedin className="w-5 h-5 mr-3 text-blue-600" />
          <span>Continue with LinkedIn</span>
          {loadingProvider === 'linkedin' && (
            <div className="absolute right-4">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          )}
        </Button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">or</span>
        </div>
      </div>

      {/* Email Sign-In */}
      <form onSubmit={handleEmailSignIn} className="space-y-3">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            disabled={isLoading}
            required
          />
        </div>
        
        <Button
          type="submit"
          disabled={isLoading || !email.trim()}
          className="cta-primary w-full relative"
        >
          <span>Start Free Trial</span>
          <ArrowRight className="w-4 h-4 ml-2" />
          {loadingProvider === 'email' && (
            <div className="absolute right-4">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </Button>
      </form>

      {/* Skip Option for Trial */}
      {showSkipOption && (
        <div className="text-center">
          <Button
            onClick={onSkipSignIn}
            variant="ghost"
            className="text-gray-500 hover:text-gray-700 text-sm"
            disabled={isLoading}
          >
            Skip for now - Try without account
          </Button>
        </div>
      )}

      {/* Trust Indicators */}
      <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 pt-4 border-t border-gray-200">
        <div className="trust-indicator">
          <Shield className="trust-indicator-icon" />
          <span>No credit card required</span>
        </div>
        <div className="trust-indicator">
          <Clock className="trust-indicator-icon" />
          <span>14-day free trial</span>
        </div>
      </div>

      {/* Privacy Notice */}
      <p className="text-xs text-center text-gray-400 leading-relaxed">
        By continuing, you agree to our{' '}
        <a href="#" className="text-green-600 hover:text-green-700 underline">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className="text-green-600 hover:text-green-700 underline">
          Privacy Policy
        </a>
        . We'll never spam you or share your email.
      </p>
    </div>
  );
};

// Quick trial component for immediate access
interface QuickTrialProps {
  onStartTrial: () => void;
  className?: string;
}

export const QuickTrial: React.FC<QuickTrialProps> = ({ onStartTrial, className = '' }) => {
  return (
    <div className={`text-center space-y-4 ${className}`}>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">
          Try EduPlatform Free
        </h3>
        <p className="text-gray-600">
          No signup required • Start in 30 seconds
        </p>
      </div>
      
      <Button
        onClick={onStartTrial}
        className="cta-primary"
        size="lg"
      >
        <ArrowRight className="w-5 h-5 mr-2" />
        Start Free Trial Now
      </Button>
      
      <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
        <div className="trust-indicator">
          <Shield className="w-4 h-4 mr-1 text-green-500" />
          <span>No credit card</span>
        </div>
        <div className="trust-indicator">
          <Clock className="w-4 h-4 mr-1 text-green-500" />
          <span>2-min setup</span>
        </div>
      </div>
    </div>
  );
};

export default SocialAuth;
