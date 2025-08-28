import React, { useState } from 'react';
import { ArrowRight, Play, CheckCircle, Star, Users, TrendingUp, Zap, Chrome, Shield, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface LandingVariantBProps {
  onStartTrial: () => void;
  onSignUp: () => void;
  onViewPricing: () => void;
}

export const LandingVariantB: React.FC<LandingVariantBProps> = ({ onStartTrial, onSignUp, onViewPricing }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handleQuickStart = async () => {
    setIsLoading(true);
    // Track hero CTA click
    if (typeof gtag !== 'undefined') {
      gtag('event', 'hero_cta_click', {
        variant: 'B',
        cta_text: 'Start free — No card',
        experiment_name: 'landing_headline_cta_v1'
      });
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onStartTrial();
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsLoading(true);
    
    // Track signup start
    if (typeof gtag !== 'undefined') {
      gtag('event', 'signup_start', {
        variant: 'B',
        email: email,
        experiment_name: 'landing_headline_cta_v1'
      });
    }
    
    try {
      // Simulate magic link send
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Track signup complete
      if (typeof gtag !== 'undefined') {
        gtag('event', 'signup_complete', {
          variant: 'B',
          method: 'magic_link',
          experiment_name: 'landing_headline_cta_v1'
        });
      }
      
      onStartTrial();
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Hero Section - Conversion Optimized */}
      <div className="relative overflow-hidden">
        <div className="relative z-10 px-6 py-8 md:py-16">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Result-Oriented Headline */}
            <div className="space-y-6 mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                AI generation of tests and reports in 2 minutes — 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Start free</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Skip the manual work. Generate comprehensive skill assessments and team reports instantly with AI.
              </p>
            </div>

            {/* Primary CTA - Prominent */}
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
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 min-w-[180px]"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Starting trial...
                      </div>
                    ) : (
                      <>
                        Start free — No card
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

            {/* Trust Row - Company Logos + Testimonial */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Company Logos */}
                <div className="space-y-4">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Trusted by teams at</p>
                  <div className="flex items-center justify-center md:justify-start space-x-8 opacity-60">
                    {/* Placeholder logos - replace with actual client logos */}
                    <div className="h-8 w-20 bg-gray-300 rounded flex items-center justify-center text-xs font-medium">Microsoft</div>
                    <div className="h-8 w-16 bg-gray-300 rounded flex items-center justify-center text-xs font-medium">Google</div>
                    <div className="h-8 w-14 bg-gray-300 rounded flex items-center justify-center text-xs font-medium">Slack</div>
                  </div>
                </div>

                {/* Testimonial */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 italic">
                    "Reduced our hiring assessment time from 2 weeks to 2 hours"
                  </blockquote>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 text-sm">Sarah Chen</p>
                      <p className="text-xs text-gray-500">VP Product at TechCorp</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section - Simplified */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Why Product Managers Choose EduPlatform
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center space-y-4 hover:shadow-lg transition-shadow border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Generate in 30 seconds</h3>
              <p className="text-gray-600 text-sm">Create technical interviews and assessments instantly</p>
            </Card>

            <Card className="p-6 text-center space-y-4 hover:shadow-lg transition-shadow border-0 bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Auto-create reports</h3>
              <p className="text-gray-600 text-sm">Team skill gap analysis with AI-powered insights</p>
            </Card>

            <Card className="p-6 text-center space-y-4 hover:shadow-lg transition-shadow border-0 bg-gradient-to-br from-green-50 to-teal-50">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Identify top performers</h3>
              <p className="text-gray-600 text-sm">AI scoring to find your best team members</p>
            </Card>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="py-12 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-3xl mx-auto text-center px-6 space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Ready to save 15+ hours per week?
          </h2>
          <Button 
            onClick={handleQuickStart}
            disabled={isLoading}
            className="bg-white text-blue-600 hover:bg-gray-100 font-bold text-lg px-8 py-3 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            {isLoading ? 'Starting trial...' : 'Start free — No card'}
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
              <h3 className="text-lg font-semibold">Product Demo</h3>
              <button 
                onClick={() => setIsVideoPlaying(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Demo video placeholder</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
