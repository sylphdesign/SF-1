import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Target, Zap, TrendingUp, Megaphone, Lightbulb, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Enhanced template categories with funnel stage mapping
const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'All Templates', color: 'bg-slate-100' },
  { id: 'awareness', name: 'Awareness', color: 'bg-blue-100', stage: 'Top Funnel' },
  { id: 'consideration', name: 'Consideration', color: 'bg-yellow-100', stage: 'Middle Funnel' },
  { id: 'conversion', name: 'Conversion', color: 'bg-green-100', stage: 'Bottom Funnel' },
  { id: 'retargeting', name: 'Retargeting', color: 'bg-purple-100', stage: 'Post-Purchase' },
];

// Enhanced ad templates with funnel stage mapping and performance data
const SAMPLE_AD_TEMPLATES = [
  // AWARENESS STAGE TEMPLATES
  { 
    id: 1, 
    name: "Problem Agitation", 
    ad_type: "Problem_Solution",
    description: "Hook attention by highlighting a painful problem", 
    category: "awareness",
    funnel_stage: "awareness",
    thumbnail: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=500&fit=crop&q=80", 
    platforms: ["Facebook", "Instagram"],
    performance: "23.4% CTR",
    effectiveness: "High",
    recommended: true,
    goal: "Interrupt patterns, create awareness"
  },
  { 
    id: 2, 
    name: "Founder Story", 
    ad_type: "Founder_Story",
    description: "Build connection through personal narrative", 
    category: "awareness",
    funnel_stage: "awareness", 
    thumbnail: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=500&fit=crop&q=80", 
    platforms: ["LinkedIn", "Facebook"],
    performance: "18.7% CTR",
    effectiveness: "Medium",
    recommended: false,
    goal: "Establish trust and relatability"
  },
  { 
    id: 3, 
    name: "Education Hook", 
    ad_type: "Education_Explainer",
    description: "Teach something valuable to build authority", 
    category: "awareness",
    funnel_stage: "awareness",
    thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=500&fit=crop&q=80", 
    platforms: ["LinkedIn", "Instagram"],
    performance: "21.2% CTR",
    effectiveness: "High",
    recommended: true,
    goal: "Educate and establish expertise"
  },
  { 
    id: 4, 
    name: "Ugly Ad", 
    ad_type: "Ugly_Ad",
    description: "Direct, no-nonsense approach for testing", 
    category: "awareness",
    funnel_stage: "awareness",
    thumbnail: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=500&fit=crop&q=80", 
    platforms: ["Facebook", "Google"],
    performance: "31.8% CTR",
    effectiveness: "Very High",
    recommended: true,
    goal: "Pattern interrupt, direct messaging"
  },

  // CONSIDERATION STAGE TEMPLATES  
  { 
    id: 5, 
    name: "Us vs Them", 
    ad_type: "Us_Vs_Them",
    description: "Position against competitors clearly", 
    category: "consideration",
    funnel_stage: "consideration",
    thumbnail: "https://images.unsplash.com/photo-1551836022-cea26a7e4fb4?w=400&h=500&fit=crop&q=80", 
    platforms: ["LinkedIn", "Facebook"],
    performance: "19.3% CTR",
    effectiveness: "High",
    recommended: true,
    goal: "Differentiation and positioning"
  },
  { 
    id: 6, 
    name: "Feature Spotlight", 
    ad_type: "Feature_Callout",
    description: "Highlight key product capabilities", 
    category: "consideration",
    funnel_stage: "consideration",
    thumbnail: "https://images.unsplash.com/photo-1551836022-f316fb9c7f59?w=400&h=500&fit=crop&q=80", 
    platforms: ["LinkedIn", "Google"],
    performance: "16.8% CTR",
    effectiveness: "Medium",
    recommended: false,
    goal: "Feature education and benefits"
  },
  { 
    id: 7, 
    name: "Social Proof", 
    ad_type: "UGC_Reaction",
    description: "Customer reactions and testimonials", 
    category: "consideration",
    funnel_stage: "consideration",
    thumbnail: "https://images.unsplash.com/photo-1551836022-aadb801c60ae?w=400&h=500&fit=crop&q=80", 
    platforms: ["Instagram", "Facebook"],
    performance: "22.1% CTR",
    effectiveness: "High",
    recommended: true,
    goal: "Build trust through social proof"
  },

  // CONVERSION STAGE TEMPLATES
  { 
    id: 8, 
    name: "Before/After", 
    ad_type: "Before_After",
    description: "Show clear transformation results", 
    category: "conversion",
    funnel_stage: "conversion",
    thumbnail: "https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=400&h=500&fit=crop&q=80", 
    platforms: ["Instagram", "Facebook"],
    performance: "25.7% CTR",
    effectiveness: "Very High",
    recommended: true,
    goal: "Demonstrate clear outcomes"
  },
  { 
    id: 9, 
    name: "Special Pricing", 
    ad_type: "Special_Pricing",
    description: "Limited time offers with urgency", 
    category: "conversion",
    funnel_stage: "conversion",
    thumbnail: "https://images.unsplash.com/photo-1551836022-ce96ac2d7b81?w=400&h=500&fit=crop&q=80", 
    platforms: ["Facebook", "Google"],
    performance: "28.3% CTR",
    effectiveness: "Very High",
    recommended: true,
    goal: "Drive immediate purchase decisions"
  },
  { 
    id: 10, 
    name: "Testimonial Stack", 
    ad_type: "Testimonial_Montage",
    description: "Multiple success stories for credibility", 
    category: "conversion",
    funnel_stage: "conversion",
    thumbnail: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=500&fit=crop&q=80", 
    platforms: ["Facebook", "LinkedIn"],
    performance: "24.1% CTR",
    effectiveness: "High",
    recommended: true,
    goal: "Social validation for conversions"
  },

  // RETARGETING STAGE TEMPLATES
  { 
    id: 11, 
    name: "Loyalty Offer", 
    ad_type: "Loyalty_Offer",
    description: "Exclusive deals for existing customers", 
    category: "retargeting",
    funnel_stage: "retargeting",
    thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=500&fit=crop&q=80", 
    platforms: ["Facebook", "Email"],
    performance: "15.2% CTR",
    effectiveness: "Medium",
    recommended: false,
    goal: "Increase customer lifetime value"
  },
  { 
    id: 12, 
    name: "Review Request", 
    ad_type: "UGC_Review",
    description: "Encourage customer advocacy", 
    category: "retargeting", 
    funnel_stage: "retargeting",
    thumbnail: "https://images.unsplash.com/photo-1559526324-c1f275fbfa32?w=400&h=500&fit=crop&q=80", 
    platforms: ["Facebook", "Instagram"],
    performance: "12.8% CTR",
    effectiveness: "Medium",
    recommended: true,
    goal: "Generate reviews and referrals"
  }
];

export default function AdTemplates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState('all');
  const navigate = useNavigate();

  const filteredTemplates = SAMPLE_AD_TEMPLATES.filter(t => 
    (t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     t.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (activeCategory === 'all' || t.category === activeCategory)
  );

  // Sort templates: recommended first, then by effectiveness
  const sortedTemplates = filteredTemplates.sort((a, b) => {
    if (a.recommended && !b.recommended) return -1;
    if (!a.recommended && b.recommended) return 1;
    
    const effectivenessOrder = { 'Very High': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
    return effectivenessOrder[b.effectiveness] - effectivenessOrder[a.effectiveness];
  });

  const handleUseTemplate = (template) => {
    sessionStorage.setItem('selectedAdTemplate', JSON.stringify(template));
    navigate(createPageUrl("AdBuilder"));
  };

  const getEffectivenessColor = (effectiveness) => {
    switch(effectiveness) {
      case 'Very High': return 'bg-emerald-100 text-emerald-800';
      case 'High': return 'bg-green-100 text-green-800'; 
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Megaphone className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Smart Ad Templates</h1>
        </div>
        <p className="text-slate-600">AI-recommended templates based on funnel stage and performance data.</p>
      </div>
      
      <div className="flex gap-4 mb-8 flex-wrap">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search templates..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10"/>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {TEMPLATE_CATEGORIES.map(cat => (
            <Badge 
              key={cat.id} 
              variant={activeCategory === cat.id ? "default" : "outline"} 
              onClick={() => setActiveCategory(cat.id)} 
              className={`cursor-pointer ${activeCategory === cat.id ? 'bg-blue-600' : ''}`}
            >
              {cat.name}
              {cat.stage && <span className="ml-1 text-xs opacity-75">({cat.stage})</span>}
            </Badge>
          ))}
        </div>
      </div>

      {/* Performance Insights Banner */}
      {activeCategory !== 'all' && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">
              {TEMPLATE_CATEGORIES.find(c => c.id === activeCategory)?.name} Stage Insights
            </h3>
          </div>
          <p className="text-sm text-blue-700">
            {activeCategory === 'awareness' && "Focus on interrupting patterns and creating interest. Use bold headlines and educational content."}
            {activeCategory === 'consideration' && "Showcase unique value and build trust. Compare benefits and demonstrate social proof."}
            {activeCategory === 'conversion' && "Drive immediate action with urgency, proof, and risk reversal. Show clear outcomes."}
            {activeCategory === 'retargeting' && "Re-engage previous visitors and maximize customer lifetime value with personalized offers."}
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedTemplates.map((template) => (
          <Card key={template.id} className={`group hover:shadow-lg transition-all ${template.recommended ? 'ring-2 ring-blue-200 shadow-md' : ''}`}>
            <CardHeader className="p-0 relative">
              <img 
                src={template.thumbnail} 
                alt={template.name} 
                className="w-full h-60 object-cover rounded-t-lg"
              />
              {template.recommended && (
                <div className="absolute top-3 left-3">
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    Recommended
                  </Badge>
                </div>
              )}
              <div className="absolute top-3 right-3">
                <Badge className={getEffectivenessColor(template.effectiveness)}>
                  {template.effectiveness}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-lg mb-2 flex items-start justify-between">
                <span>{template.name}</span>
              </CardTitle>
              <p className="text-sm text-slate-600 mb-3 line-clamp-2">{template.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-1 text-slate-500">
                    <Target className="w-4 h-4" /> 
                    {template.platforms.slice(0, 2).join(', ')}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <TrendingUp className="w-4 h-4" /> 
                    {template.performance}
                  </span>
                </div>
                <p className="text-xs text-slate-500 italic">{template.goal}</p>
              </div>
              
              <Button 
                className="w-full" 
                onClick={() => handleUseTemplate(template)}
                variant={template.recommended ? "default" : "outline"}
              >
                <Zap className="w-4 h-4 mr-2" />
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {sortedTemplates.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-500">Try adjusting your search or category filters</p>
        </div>
      )}
    </div>
  );
}