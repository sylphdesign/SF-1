import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "@/api/entities";
import { 
  Zap, 
  ArrowRight, 
  Check, 
  Star, 
  Users, 
  TrendingUp,
  Palette,
  FileText,
  Megaphone,
  Sparkles,
  Globe
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const features = [
  {
    icon: FileText,
    title: "Landing Page Builder",
    description: "Create high-converting landing pages with our drag-and-drop builder and AI-powered content generation."
  },
  {
    icon: Megaphone,
    title: "Ad Campaign Creator", 
    description: "Design professional ad creatives for Facebook, Instagram, LinkedIn and more platforms."
  },
  {
    icon: Sparkles,
    title: "AI Content Generation",
    description: "Let AI write compelling copy based on proven marketing frameworks and your brand voice."
  },
  {
    icon: Palette,
    title: "Brand Kit Integration",
    description: "Automatically extract your brand colors, fonts, and assets from your website."
  },
  {
    icon: Globe,
    title: "Multi-Platform Export",
    description: "Export your designs in the perfect dimensions for any social media platform or advertising channel."
  },
  {
    icon: TrendingUp,
    title: "Conversion Optimization",
    description: "Built-in best practices and templates based on proven conversion optimization principles."
  }
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Marketing Director",
    company: "TechCorp",
    content: "PageCraft AI helped us increase our conversion rates by 340% in just 30 days. The AI-generated content is incredibly effective.",
    rating: 5
  },
  {
    name: "Michael Chen", 
    role: "Startup Founder",
    company: "InnovateLab",
    content: "As a non-designer, I was able to create professional landing pages and ads that look like they came from a top agency.",
    rating: 5
  },
  {
    name: "Emily Rodriguez",
    role: "E-commerce Manager", 
    company: "ShopSmart",
    content: "The brand kit extraction feature saved us hours of work. It perfectly captured our visual identity across all campaigns.",
    rating: 5
  }
];

export default function Landing() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      // Don't auto-redirect from Landing page - let user choose
    } catch (error) {
      // User not authenticated, which is fine for Landing page
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetStarted = async () => {
    if (user) {
      // User is logged in, check if they have an org
      if (user.current_organization_id) {
        navigate(createPageUrl("Pages"));
      } else {
        navigate(createPageUrl("Auth"));
      }
    } else {
      // User needs to log in
      try {
        await User.login();
      } catch (error) {
        console.error("Login failed:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center animate-pulse">
          <Zap className="w-5 h-5 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">PageCraft AI</h1>
            </div>
            <Button onClick={handleGetStarted} className="bg-blue-600 hover:bg-blue-700">
              {user ? 
                (user.current_organization_id ? "Go to Dashboard" : "Complete Setup") 
                : "Get Started"
              }
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Marketing
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Create High-Converting
            <span className="text-blue-600 block">Landing Pages & Ads</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Build professional marketing campaigns in minutes with AI-generated content, 
            drag-and-drop design tools, and proven conversion optimization frameworks.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4"
            >
              Start Building for Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-sm text-gray-500">No credit card required</p>
          </div>

          {/* Social Proof */}
          <div className="flex justify-center items-center gap-8 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>10,000+ users</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span>4.9/5 rating</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>340% avg. conversion increase</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Scale Your Marketing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From landing pages to ad creatives, create professional marketing materials 
              that convert visitors into customers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Marketing Teams Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See how businesses are scaling their growth with PageCraft AI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Marketing?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of marketers who are already creating high-converting 
            campaigns with PageCraft AI.
          </p>
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4"
          >
            Get Started Free Today
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">PageCraft AI</h3>
          </div>
          <p className="text-gray-400 mb-6">
            AI-powered marketing tools for modern businesses
          </p>
          <p className="text-sm text-gray-500">
            © 2024 PageCraft AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}