import React, { useState } from 'react';
import { ArrowRight, Play, CheckCircle, Star, Users, TrendingUp, Zap, Chrome, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface LandingPageProps {
  onStartTrial: () => void;
  onSignUp: () => void;
  onViewPricing: () => void;
}

export const Landing: React.FC<LandingPageProps> = ({ onStartTrial, onSignUp, onViewPricing }) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handleGoogleSignIn = async () => {
    // Implement Google OAuth
    console.log('Google sign-in initiated');
    onStartTrial();
  };

  const handleLinkedInSignIn = async () => {
    // Implement LinkedIn OAuth
    console.log('LinkedIn sign-in initiated');
    onStartTrial();
  };

  const handleQuickStart = () => {
    // Start trial without signup
    onStartTrial();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Hero Section - Conversion Optimized */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='37' cy='37' r='1'/%3E%3Ccircle cx='52' cy='22' r='1'/%3E%3Ccircle cx='22' cy='52' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Navigation - Simplified for Conversion */}
        <nav className="relative z-10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">EduPlatform</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <button 
                onClick={onViewPricing}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium"
              >
                Pricing
              </button>
              <Button 
                variant="outline" 
                onClick={onSignUp}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Sign In
              </Button>
              <Button 
                onClick={handleQuickStart}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-6 py-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Content - Clear Value Proposition */}
        <div className="relative z-10 px-6 py-16 md:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Value Proposition */}
              <div className="space-y-8">
                {/* Social Proof Badge */}
                <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                  <Star className="w-4 h-4 fill-current" />
                  <span>Trusted by 10,000+ students</span>
                </div>

                {/* Main Headline - Clear Outcome Focus */}
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                    Boost Your ЕНТ Score by 
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600"> 40+ Points</span>
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    AI-powered test prep that adapts to your learning style. Start your free trial and see results in under 2 minutes.
                  </p>
                </div>

                {/* Primary CTA - High Contrast */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      onClick={handleQuickStart}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
                      size="lg"
                    >
                      <Play className="mr-3 w-5 h-5" />
                      Start Free Trial Now
                    </Button>
                    
                    <Button 
                      onClick={() => setIsVideoPlaying(true)}
                      variant="outline"
                      className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg px-8 py-4 rounded-xl"
                      size="lg"
                    >
                      Watch 2-min Demo
                    </Button>
                  </div>

                  {/* Social Sign-In Options */}
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500 text-center">Or sign up with:</p>
                    <div className="flex gap-3">
                      <Button 
                        onClick={handleGoogleSignIn}
                        variant="outline"
                        className="flex-1 border-gray-200 hover:bg-gray-50 py-3"
                      >
                        <Chrome className="w-4 h-4 mr-2" />
                        Google
                      </Button>
                      <Button 
                        onClick={handleLinkedInSignIn}
                        variant="outline"
                        className="flex-1 border-gray-200 hover:bg-gray-50 py-3"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        LinkedIn
                      </Button>
                    </div>
                  </div>

                  {/* Trust Indicators */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-1" />
                      <span>No credit card required</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span>Free for 14 days</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Social Proof */}
              <div className="space-y-6">
                {/* Results Preview Card */}
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Your Progress Preview</h3>
                      <span className="text-green-600 font-bold">+47 points</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Математика</span>
                        <span className="font-semibold">92%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">История Казахстана</span>
                        <span className="font-semibold">87%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Литература</span>
                        <span className="font-semibold">94%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Testimonial */}
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 italic">
                      "Improved my ЕНТ score by 52 points in just 3 weeks. The AI recommendations were spot-on!"
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">Айгерим К.</p>
                        <p className="text-sm text-gray-500">КазНУ, 2024</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Why Students Choose EduPlatform
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Join thousands of students who improved their scores
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <Card className="p-6 text-center space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Proven Results</h3>
              <p className="text-gray-600">Average score improvement of 40+ points within 30 days</p>
            </Card>

            {/* Benefit 2 */}
            <Card className="p-6 text-center space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">AI-Powered</h3>
              <p className="text-gray-600">Personalized study plans that adapt to your learning style</p>
            </Card>

            {/* Benefit 3 */}
            <Card className="p-6 text-center space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Expert Support</h3>
              <p className="text-gray-600">24/7 AI tutor plus access to certified teachers</p>
            </Card>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="py-16 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-6 space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Ready to Boost Your ЕНТ Score?
          </h2>
          <p className="text-xl text-green-100">
            Join 10,000+ students who improved their scores with AI-powered prep
          </p>
          <Button 
            onClick={handleQuickStart}
            className="bg-white text-green-600 hover:bg-gray-100 font-bold text-lg px-8 py-4 rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
            size="lg"
          >
            Start Your Free Trial Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <p className="text-sm text-green-100">
            No credit card required • Free for 14 days • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
};
