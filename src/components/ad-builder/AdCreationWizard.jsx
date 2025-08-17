
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Target, Users, Zap, ArrowRight, Lightbulb, TrendingUp, Palette } from "lucide-react";
import { User } from "@/api/entities";
import { Organization } from "@/api/entities";

// Funnel stage mapping based on the provided tables
const FUNNEL_STAGES = {
  awareness: {
    name: "Top (Awareness)",
    description: "Interrupt, educate, reframe",
    goal: "Generate interest and awareness",
    adTypes: ["Ugly_Ad", "Education_Explainer", "Founder_Story", "Problem_Stack_Agitation", "One_Page_System"],
    color: "bg-blue-100 text-blue-800"
  },
  consideration: {
    name: "Middle (Consideration)", 
    description: "Showcase value, establish uniqueness",
    goal: "Build trust and demonstrate value",
    adTypes: ["Feature_Callout", "Us_Vs_Them", "UGC_Reaction", "Problem_Solution", "Proof_And_Authority"],
    color: "bg-yellow-100 text-yellow-800"
  },
  conversion: {
    name: "Bottom (Conversion)",
    description: "Push decision, reduce risk",
    goal: "Drive immediate action",
    adTypes: ["Special_Pricing", "Before_After", "Objection_Handling", "Testimonial_Montage", "Guarantee_Offer"],
    color: "bg-green-100 text-green-800"
  },
  retargeting: {
    name: "Post-Purchase/Retargeting",
    description: "Reassure, activate advocacy",
    goal: "Maximize lifetime value",
    adTypes: ["UGC_Review", "Founder_Vision", "Loyalty_Offer", "Referral_CTA"],
    color: "bg-purple-100 text-purple-800"
  }
};

const AUDIENCE_MINDSETS = {
  innovators: {
    name: "Innovators",
    description: "What's new and cutting-edge? Novelty, status, uniqueness",
    characteristics: ["Early tech adopters", "Risk-tolerant", "Status-driven"]
  },
  early_adopters: {
    name: "Early Adopters", 
    description: "Is this better than what I'm using? Need proof and distinction",
    characteristics: ["Want competitive advantage", "Need social proof", "Quality-focused"]
  },
  early_majority: {
    name: "Early Majority",
    description: "Does it work? Is it safe and trusted? Risk-averse, practical",
    characteristics: ["Need extensive proof", "Risk-averse", "Practical benefits"]
  },
  late_majority: {
    name: "Late Majority",
    description: "Everyone else is using it? Need reassurance and strong value",
    characteristics: ["Highly risk-averse", "Need social validation", "Price-sensitive"]
  },
  laggards: {
    name: "Laggards",
    description: "Why should I change? Reluctant, price-driven, skeptical",
    characteristics: ["Change-resistant", "Price-driven", "Need compelling reasons"]
  }
};

// Enhanced ad type definitions with specific purposes
const AD_TYPE_DEFINITIONS = {
  "Ugly_Ad": {
    name: "Ugly Ad",
    description: "Simple, direct, interruptive design focused on message over aesthetics",
    bestFor: "Awareness stage, testing new audiences",
    conversionFocus: "Interrupt pattern, grab attention"
  },
  "Problem_Solution": {
    name: "Problem → Solution",
    description: "Clearly articulate a problem then present your solution",
    bestFor: "Consideration stage, addressing pain points", 
    conversionFocus: "Problem agitation → relief"
  },
  "Before_After": {
    name: "Before/After",
    description: "Show transformation and results achieved",
    bestFor: "Conversion stage, demonstrating outcomes",
    conversionFocus: "Visual proof of transformation"
  },
  "Us_Vs_Them": {
    name: "Us vs. Them",
    description: "Compare your solution against competitors",
    bestFor: "Consideration stage, differentiation",
    conversionFocus: "Competitive positioning"
  },
  "Special_Pricing": {
    name: "Special Pricing",
    description: "Limited-time offers and pricing promotions",
    bestFor: "Conversion stage, driving urgency",
    conversionFocus: "Price incentive + scarcity"
  },
  "Testimonial_Montage": {
    name: "Testimonial Montage",
    description: "Multiple customer success stories and reviews",
    bestFor: "Conversion stage, social proof",
    conversionFocus: "Social validation"
  },
  "Feature_Callout": {
    name: "Feature Callout", 
    description: "Highlight specific product features and benefits",
    bestFor: "Consideration stage, feature education",
    conversionFocus: "Feature → benefit translation"
  },
  "Founder_Story": {
    name: "Founder Story",
    description: "Personal story from the founder about why they created this",
    bestFor: "Awareness stage, building connection",
    conversionFocus: "Emotional connection + mission"
  }
};

export default function AdCreationWizard({ isOpen, onClose, onCreateAd }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    funnelStage: '',
    audienceMindset: '',
    industry: '',
    targetAudience: '',
    productService: '',
    selectedAdType: '',
    brandName: '',
    primaryBenefit: ''
  });

  const [recommendedAdTypes, setRecommendedAdTypes] = useState([]);
  const [brandKit, setBrandKit] = useState(null);
  const [useBrandKit, setUseBrandKit] = useState(true);

  // Load brand kit when modal opens
  useEffect(() => {
    const loadBrandKit = async () => {
      if (!isOpen) return; // Only load when dialog opens
      try {
        const user = await User.me();
        if (user?.current_organization_id) {
          const orgs = await Organization.list();
          const currentOrg = orgs.find(o => o.id === user.current_organization_id);
          if (currentOrg?.settings) {
            setBrandKit(currentOrg.settings);
            // Pre-populate form with brand kit data if available and not already set by user
            setFormData(prev => {
              const newFormData = { ...prev };
              if (currentOrg.industry && !prev.industry) {
                newFormData.industry = currentOrg.industry;
              }
              if (currentOrg.name && !prev.brandName) {
                newFormData.brandName = currentOrg.name;
              }
              if (currentOrg.settings.advanced?.icp?.target_audience && !prev.targetAudience) {
                newFormData.targetAudience = currentOrg.settings.advanced.icp.target_audience;
              }
              return newFormData;
            });
          }
        }
      } catch (error) {
        console.error("Error loading brand kit:", error);
      }
    };
    loadBrandKit();
  }, [isOpen]); // Depend on isOpen to trigger loading when dialog opens

  useEffect(() => {
    if (formData.funnelStage) {
      const stage = FUNNEL_STAGES[formData.funnelStage];
      setRecommendedAdTypes(stage ? stage.adTypes : []);
    }
  }, [formData.funnelStage]);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCreateAd = () => {
    // Pass brand kit data along with form data if enabled
    const enhancedFormData = {
      ...formData,
      brandKit: useBrandKit ? brandKit : null
    };
    onCreateAd(enhancedFormData);
    onClose();
  };

  const canProceedStep1 = formData.funnelStage && formData.industry && formData.targetAudience;
  const canProceedStep2 = formData.selectedAdType && formData.brandName;
  const canProceedStep3 = formData.primaryBenefit;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <Zap className="w-6 h-6 mr-2 text-purple-600" />
            AI Ad Creation Wizard
          </DialogTitle>
          <DialogDescription>
            Let's create a high-converting ad tailored to your funnel stage and audience
          </DialogDescription>
        </DialogHeader>

        {/* Brand Kit Integration */}
        {brandKit && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Palette className="w-5 h-5 mr-2 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-900">Use Brand Kit</h3>
                    <p className="text-sm text-blue-700">Apply your organization's branding and messaging</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant={useBrandKit ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseBrandKit(!useBrandKit)}
                >
                  {useBrandKit ? "Enabled" : "Disabled"}
                </Button>
              </div>
              {useBrandKit && (
                <div className="mt-3 text-xs text-blue-600 space-y-1">
                  {brandKit.theme?.primaryColor && brandKit.theme?.secondaryColor && (
                    <p>✓ Colors: {brandKit.theme.primaryColor}, {brandKit.theme.secondaryColor}</p>
                  )}
                  {brandKit.theme?.headingFont && (
                    <p>✓ Fonts: {brandKit.theme.headingFont.replace(/['"]/g, '')}</p>
                  )}
                  {brandKit.advanced?.icp?.value_proposition && (
                    <p>✓ Value Prop: {brandKit.advanced.icp.value_proposition.substring(0, 50)}{brandKit.advanced.icp.value_proposition.length > 50 ? '...' : ''}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          {[1, 2, 3].map(stepNum => (
            <div key={stepNum} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNum ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {stepNum}
              </div>
              {stepNum < 3 && (
                <ArrowRight className={`w-4 h-4 mx-2 ${step > stepNum ? 'text-purple-600' : 'text-gray-400'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Funnel Stage & Audience */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Step 1: Define Your Marketing Goal
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Where is this ad in your marketing funnel?</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {Object.entries(FUNNEL_STAGES).map(([key, stage]) => (
                      <Card 
                        key={key}
                        className={`cursor-pointer transition-all ${
                          formData.funnelStage === key ? 'border-purple-500 bg-purple-50' : 'hover:border-gray-300'
                        }`}
                        onClick={() => setFormData({...formData, funnelStage: key})}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{stage.name}</h4>
                            <Badge className={stage.color}>{stage.goal}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{stage.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Audience Mindset (Optional)</Label>
                  <Select value={formData.audienceMindset} onValueChange={(value) => setFormData({...formData, audienceMindset: value})}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select audience innovation stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(AUDIENCE_MINDSETS).map(([key, mindset]) => (
                        <SelectItem key={key} value={key}>
                          <div>
                            <div className="font-medium">{mindset.name}</div>
                            <div className="text-xs text-gray-500">{mindset.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Industry/Business Type</Label>
                    <Input
                      value={formData.industry}
                      onChange={(e) => setFormData({...formData, industry: e.target.value})}
                      placeholder="e.g., SaaS, E-commerce, Consulting"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Brand Name</Label>
                    <Input
                      value={formData.brandName}
                      onChange={(e) => setFormData({...formData, brandName: e.target.value})}
                      placeholder="Your brand/company name"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Target Audience</Label>
                  <Textarea
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                    placeholder="Describe your ideal customer: demographics, pain points, goals..."
                    className="mt-2 min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Ad Type Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Step 2: Choose Your Ad Type
              </h3>
              
              {formData.funnelStage && (
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                    <span className="text-sm font-medium">
                      Recommended for {FUNNEL_STAGES[formData.funnelStage]?.name}:
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recommendedAdTypes.map(adType => {
                      const definition = AD_TYPE_DEFINITIONS[adType];
                      if (!definition) return null;
                      
                      return (
                        <Card 
                          key={adType}
                          className={`cursor-pointer transition-all ${
                            formData.selectedAdType === adType ? 'border-purple-500 bg-purple-50' : 'hover:border-gray-300'
                          }`}
                          onClick={() => setFormData({...formData, selectedAdType: adType})}
                        >
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">{definition.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">{definition.description}</p>
                            <Badge variant="outline" className="text-xs">
                              {definition.conversionFocus}
                            </Badge>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Product/Service Description</Label>
                <Textarea
                  value={formData.productService}
                  onChange={(e) => setFormData({...formData, productService: e.target.value})}
                  placeholder="Briefly describe what you're promoting and its key features..."
                  className="mt-2 min-h-[80px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Final Details */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Step 3: Key Messaging
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Primary Benefit/Value Proposition</Label>
                  <Textarea
                    value={formData.primaryBenefit}
                    onChange={(e) => setFormData({...formData, primaryBenefit: e.target.value})}
                    placeholder="What's the main benefit or transformation your audience will get?"
                    className="mt-2 min-h-[80px]"
                  />
                </div>

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">✨ Your AI-Generated Ad Will Include:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Compelling headlines optimized for {formData.selectedAdType ? AD_TYPE_DEFINITIONS[formData.selectedAdType]?.name : 'your ad type'}</li>
                      <li>• Persuasive body copy aligned with {formData.funnelStage ? FUNNEL_STAGES[formData.funnelStage]?.name : 'your funnel stage'}</li>
                      <li>• High-converting CTAs based on proven frameworks</li>
                      <li>• Visual design elements optimized for your industry</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={step === 1 ? onClose : handlePrevious}
          >
            {step === 1 ? 'Cancel' : 'Previous'}
          </Button>
          
          {step < 3 ? (
            <Button 
              onClick={handleNext}
              disabled={
                (step === 1 && !canProceedStep1) ||
                (step === 2 && !canProceedStep2)
              }
            >
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleCreateAd}
              disabled={!canProceedStep3}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Generate AI Ad
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
