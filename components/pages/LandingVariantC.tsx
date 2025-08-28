import React, { useState } from 'react';
import { ArrowRight, Play, CheckCircle, Star, Users, TrendingUp, Zap, Chrome, Shield, Mail, Brain, Target, BarChart3 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface LandingVariantCProps {
  onStartTrial: () => void;
  onSignUp: () => void;
  onViewPricing: () => void;
}

type UserRole = 'pm' | 'individual';

export const LandingVariantC: React.FC<LandingVariantCProps> = ({ onStartTrial, onSignUp, onViewPricing }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('pm');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    
    // Track role selection
    if (typeof gtag !== 'undefined') {
      gtag('event', 'role_selected', {
        variant: 'C',
        role: role,
        experiment_name: 'landing_role_targeted_v1'
      });
    }
  };

  const handleQuickStart = async () => {
    setIsLoading(true);
    
    // Track hero CTA click with role context
    if (typeof gtag !== 'undefined') {
      gtag('event', 'hero_cta_click', {
        variant: 'C',
        role: selectedRole,
        cta_text: selectedRole === 'pm' ? 'Start PM trial — No card' : 'Start skill assessment — No card',
        experiment_name: 'landing_role_targeted_v1'
      });
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Route to role-specific onboarding
      if (selectedRole === 'pm') {
        window.location.href = '/onboarding/pm';
      } else {
        window.location.href = '/onboarding/individual';
      }
      
      onStartTrial();
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsLoading(true);
    
    // Track signup start with role context
    if (typeof gtag !== 'undefined') {
      gtag('event', 'signup_start', {
        variant: 'C',
        role: selectedRole,
        email: email,
        experiment_name: 'landing_role_targeted_v1'
      });
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Track signup complete
      if (typeof gtag !== 'undefined') {
        gtag('event', 'signup_complete', {
          variant: 'C',
          role: selectedRole,
          method: 'magic_link',
          experiment_name: 'landing_role_targeted_v1'
        });
      }
      
      // Route to role-specific flow
      if (selectedRole === 'pm') {
        window.location.href = '/onboarding/pm';
      } else {
        window.location.href = '/onboarding/individual';
      }
      
      onStartTrial();
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic content based on selected role
  const roleContent = {
    pm: {
      headline: 'AI generation of tests and reports in 2 minutes — Start free',
      subheadline: 'Evaluate technical candidates and team skills faster. Generate comprehensive assessments and performance reports with AI.',
      ctaText: 'Start PM trial — No card',
      valueProps: [
        { icon: Zap, title: 'Generate technical interviews in 30 seconds', desc: 'Create customized technical interviews instantly' },
        { icon: BarChart3, title: 'Auto-create team skill gap reports', desc: 'Identify training needs and skill gaps automatically' },
        { icon: Target, title: 'Identify top performers with AI scoring', desc: 'Data-driven insights on team member performance' }
      ],
      testimonial: {
        quote: "Finally, a tool that makes technical hiring decisions data-driven instead of gut-based.",
        author: "Mike Rodriguez",
        title: "Head of Product"
      }
    },
    individual: {
      headline: 'Boost your technical skills in 2 minutes — Start free',
      subheadline: 'Take AI-powered assessments to identify your strengths and get personalized learning recommendations.',
      ctaText: 'Start skill assessment — No card',
      valueProps: [
        { icon: Brain, title: 'Discover your technical strengths', desc: 'Comprehensive skill assessment in minutes' },
        { icon: TrendingUp, title: 'Get personalized learning paths', desc: 'AI-curated courses based on your skill gaps' },
        { icon: Target, title: 'Track progress with detailed reports', desc: 'Monitor your skill development over time' }
      ],
      testimonial: {
        quote: "Identified my skill gaps in minutes, not months.",
        author: "Alex Kim",
        title: "Senior Developer"
      }
    }
  };

  const currentContent = roleContent[selectedRole];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Simplified Navigation - Muted */}
      <nav className="relative z-10 px-6 py-4 opacity-60 hover:opacity-100 transition-opacity">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">EduPlatform</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={onViewPricing}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Pricing
            </button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onSignUp}
              className="text-gray-500 hover:text-gray-700"
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Role-Targeted */}
      <div className="relative overflow-hidden">
        <div className="relative z-10 px-6 py-8 md:py-16">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Role Toggle */}
            <div className="mb-8">
              <p className="text-sm text-gray-600 mb-4">I want to:</p>
              <div className="inline-flex bg-white rounded-xl p-1 shadow-lg border border-gray-200">
                <button
                  onClick={() => handleRoleChange('pm')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    selectedRole === 'pm'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  aria-label="Select Product Manager role"
                >
                  Evaluate my team's skills
                </button>
                <button
                  onClick={() => handleRoleChange('individual')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    selectedRole === 'individual'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  aria-label="Select Individual role"
                >
                  Assess my own skills
                </button>
              </div>
            </div>

            {/* Dynamic Headline */}
            <div className="space-y-6 mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                {currentContent.headline}
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                {currentContent.subheadline}
              </p>
            </div>

            {/* Primary CTA - Role-Specific */}
            <div className="space-y-6 mb-16">
              <form onSubmit={handleEmailSignup} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your work email"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={isLoading}
                  />
                  <Button 
                    type="submit"
                    disabled={isLoading || !email.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 min-w-[200px]"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Starting...
                      </div>
                    ) : (
                      <>
                        {currentContent.ctaText}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
              
              {/* Microcopy */}
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Mail className="w-4 h-4" />
                <span>We'll send a magic link — no card</span>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-1 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>

              {/* Secondary CTA */}
              <Button 
                onClick={() => setIsVideoPlaying(true)}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium px-6 py-2"
              >
                <Play className="mr-2 w-4 h-4" />
                Watch 2-min demo
              </Button>
            </div>

            {/* Trust Row - Company Logos + Role-Specific Testimonial */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Company Logos */}
                <div className="space-y-4">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Trusted by {selectedRole === 'pm' ? 'product teams' : 'developers'} at
                  </p>
                  <div className="flex items-center justify-center md:justify-start space-x-8 opacity-60">
                    <div className="h-8 w-20 bg-gray-300 rounded flex items-center justify-center text-xs font-medium">Microsoft</div>
                    <div className="h-8 w-16 bg-gray-300 rounded flex items-center justify-center text-xs font-medium">Google</div>
                    <div className="h-8 w-14 bg-gray-300 rounded flex items-center justify-center text-xs font-medium">Slack</div>
                  </div>
                </div>

                {/* Role-Specific Testimonial */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 italic">
                    "{currentContent.testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 text-sm">{currentContent.testimonial.author}</p>
                      <p className="text-xs text-gray-500">{currentContent.testimonial.title}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section - Role-Specific */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {selectedRole === 'pm' ? 'Built for Product Managers' : 'Built for Individual Growth'}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {currentContent.valueProps.map((prop, index) => (
              <Card key={index} className="p-6 text-center space-y-4 hover:shadow-lg transition-shadow border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                  <prop.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{prop.title}</h3>
                <p className="text-gray-600 text-sm">{prop.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="py-12 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-3xl mx-auto text-center px-6 space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            {selectedRole === 'pm' 
              ? 'Ready to make data-driven hiring decisions?' 
              : 'Ready to accelerate your career growth?'
            }
          </h2>
          <Button 
            onClick={handleQuickStart}
            disabled={isLoading}
            className="bg-white text-blue-600 hover:bg-gray-100 font-bold text-lg px-8 py-3 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            {isLoading ? 'Starting...' : currentContent.ctaText}
            {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
          </Button>
          <p className="text-sm text-blue-100">
            No credit card required • Free for 14 days • Cancel anytime
          </p>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoPlaying && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedRole === 'pm' ? 'Product Manager Demo' : 'Skill Assessment Demo'}
              </h3>
              <button 
                onClick={() => setIsVideoPlaying(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">
                {selectedRole === 'pm' ? 'PM-focused demo video' : 'Individual assessment demo'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
