
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Loader2, Target, Users, Zap, Palette } from "lucide-react";
import { User } from "@/api/entities";
import { Organization } from "@/api/entities";

export default function AIContentModal({ 
  isOpen, 
  onClose, 
  onGenerate, 
  isGenerating, 
  pageData, 
  isWizardMode 
}) {
  const [formData, setFormData] = useState({
    industry: '',
    target_audience: '',
    goal: 'collect_lead',
    intent: '',
    tone: 'professional'
  });
  
  const [brandKit, setBrandKit] = useState(null); // Stores the full organization object if found
  const [useBrandKit, setUseBrandKit] = useState(true); // Toggle for brand kit usage

  useEffect(() => {
    if (pageData) {
      setFormData(prev => ({ ...prev, ...pageData }));
    }
  }, [pageData, isOpen]);

  // Load brand kit when modal opens
  useEffect(() => {
    const loadBrandKit = async () => {
      if (!isOpen) return; // Only load when modal is opened

      try {
        const user = await User.me();
        if (user.current_organization_id) {
          const orgs = await Organization.list();
          const currentOrg = orgs.find(o => o.id === user.current_organization_id);
          
          if (currentOrg) {
            setBrandKit(currentOrg); // Store the entire organization object
            
            // Pre-populate form with brand kit data if available and not already set by pageData
            setFormData(prev => {
              const newFormData = { ...prev };
              // Pre-populate industry from currentOrg.industry
              if (currentOrg.industry && !prev.industry) {
                newFormData.industry = currentOrg.industry;
              }
              // Pre-populate target_audience from currentOrg.settings.advanced.icp.target_audience
              if (currentOrg.settings?.advanced?.icp?.target_audience && !prev.target_audience) {
                newFormData.target_audience = currentOrg.settings.advanced.icp.target_audience;
              }
              return newFormData;
            });
          }
        }
      } catch (error) {
        console.error("Error loading brand kit:", error);
        setBrandKit(null); // Clear brand kit on error
      }
    };
    loadBrandKit();
  }, [isOpen]); // Dependency array: run effect when isOpen changes

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass brand kit data along with form data if enabled
    const enhancedFormData = {
      ...formData,
      // If useBrandKit is true, pass the 'settings' part of the brandKit, otherwise null
      brandKit: useBrandKit && brandKit ? brandKit.settings : null
    };
    onGenerate(enhancedFormData);
  };

  const goals = [
    { value: 'collect_lead', label: 'Collect a Lead', description: 'Get email addresses, generate interest' },
    { value: 'convert_sale', label: 'Convert into Sale', description: 'Drive purchases and transactions' },
    { value: 'followup_purchase', label: 'Follow up Post-Purchase', description: 'Engage existing customers' }
  ];

  const intents = {
    collect_lead: [
      'Get more subscriptions',
      'Get more quote requests', 
      'Increase trial signups',
      'Launch a business',
      'Promote events or webinars'
    ],
    convert_sale: [
      'Sell an e-book',
      'Promote a new product',
      'Offer an upsell',
      'Drive app downloads'
    ],
    followup_purchase: [
      'Engage existing customers',
      'Gather feedback', 
      'Encourage referrals',
      'Offer support'
    ]
  };

  const tones = [
    { value: 'professional', label: 'Professional', description: 'Formal, authoritative tone' },
    { value: 'conversational', label: 'Conversational', description: 'Friendly, approachable tone' },
    { value: 'casual', label: 'Casual', description: 'Relaxed, informal tone' },
    { value: 'urgent', label: 'Urgent', description: 'Time-sensitive, action-oriented' },
    { value: 'luxury', label: 'Luxury', description: 'Premium, sophisticated tone' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <Sparkles className="w-6 h-6 mr-2 text-purple-600" />
            {isWizardMode ? 'AI Page Wizard' : 'AI Content Generator'}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {isWizardMode 
              ? 'Let AI create your entire landing page with conversion-focused content'
              : 'Generate high-converting copy using proven marketing principles'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Brand Kit Integration Card - Only show if brandKit data is loaded */}
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
                {/* Brand Kit details, only shown if useBrandKit is enabled */}
                {useBrandKit && (
                  <div className="mt-3 text-xs text-blue-600 space-y-1">
                    <p>
                      ✓ Colors: 
                      {brandKit.settings?.theme?.primaryColor ? ` ${brandKit.settings.theme.primaryColor}` : ''}
                      {brandKit.settings?.theme?.secondaryColor ? `, ${brandKit.settings.theme.secondaryColor}` : ''}
                      {!brandKit.settings?.theme?.primaryColor && !brandKit.settings?.theme?.secondaryColor ? ' N/A' : ''}
                    </p>
                    <p>
                      ✓ Fonts: 
                      {brandKit.settings?.theme?.headingFont ? ` ${brandKit.settings.theme.headingFont.replace(/['"]/g, '')}` : ' N/A'}
                    </p>
                    {brandKit.settings?.advanced?.icp?.value_proposition && (
                      <p>✓ Value Prop: {brandKit.settings.advanced.icp.value_proposition.substring(0, Math.min(brandKit.settings.advanced.icp.value_proposition.length, 50))}...</p>
                    )}
                    {brandKit.settings?.advanced?.icp?.target_audience && formData.target_audience === brandKit.settings.advanced.icp.target_audience && (
                      <p>✓ Target Audience: Pre-filled from Brand Kit</p>
                    )}
                    {brandKit.industry && formData.industry === brandKit.industry && (
                       <p>✓ Industry: Pre-filled from Brand Kit</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label className="flex items-center text-sm font-semibold">
                  <Target className="w-4 h-4 mr-2" />
                  Industry / Business Type
                </Label>
                <Input
                  value={formData.industry}
                  onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  placeholder="e.g., SaaS, E-commerce, Consulting, Healthcare"
                  required
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label className="flex items-center text-sm font-semibold">
                  <Users className="w-4 h-4 mr-2" />
                  Target Audience
                </Label>
                <Textarea
                  value={formData.target_audience}
                  onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
                  placeholder="Describe your ideal customer: demographics, pain points, goals, etc."
                  required
                  className="mt-2 min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label className="text-sm font-semibold">Primary Marketing Goal</Label>
                <Select 
                  value={formData.goal} 
                  onValueChange={(value) => setFormData({...formData, goal: value, intent: ''})}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {goals.map(goal => (
                      <SelectItem key={goal.value} value={goal.value}>
                        <div>
                          <div className="font-medium">{goal.label}</div>
                          <div className="text-xs text-gray-500">{goal.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold">Specific Intent</Label>
                <Select 
                  value={formData.intent} 
                  onValueChange={(value) => setFormData({...formData, intent: value})}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose your specific goal" />
                  </SelectTrigger>
                  <SelectContent>
                    {intents[formData.goal]?.map(intent => (
                      <SelectItem key={intent} value={intent}>
                        {intent}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div>
                <Label className="flex items-center text-sm font-semibold">
                  <Zap className="w-4 h-4 mr-2" />
                  Tone & Style
                </Label>
                <Select 
                  value={formData.tone} 
                  onValueChange={(value) => setFormData({...formData, tone: value})}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map(tone => (
                      <SelectItem key={tone.value} value={tone.value}>
                        <div>
                          <div className="font-medium">{tone.label}</div>
                          <div className="text-xs text-gray-500">{tone.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isGenerating || !formData.industry || !formData.target_audience}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Page
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
