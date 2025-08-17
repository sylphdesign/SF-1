
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Organization } from "@/api/entities";
import { OrganizationMember } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Building2, Users, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import BrandScannerStep from "../components/auth/BrandScannerStep";

export default function Auth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  const [organizations, setOrganizations] = useState([]);
  const [showBrandScanner, setShowBrandScanner] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const navigate = useNavigate();

  const [newOrgForm, setNewOrgForm] = useState({
    name: "",
    description: "",
    industry: "",
    website_url: "",
    settings: {
      branding: { logoUrl: '', faviconUrl: '' },
      theme: {
        primaryColor: '',
        secondaryColor: '',
        accentColor: '',
        textColor: '',
        headingFont: '',
        bodyFont: '',
      },
      advanced: {
        icp: {},
        socialLinks: [],
        imageAssets: [],
      }
    }
  });

  const industries = [
    "Technology", "Healthcare", "Finance", "Education", "E-commerce", 
    "Marketing Agency", "Consulting", "Real Estate", "Manufacturing", "Other"
  ];

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Separate effect for handling redirect to avoid race conditions
  useEffect(() => {
    if (shouldRedirect) {
      // Using a micro-task delay to ensure state updates propagate before navigation
      queueMicrotask(() => {
        navigate(createPageUrl("Pages"));
      });
    }
  }, [shouldRedirect, navigate]);

  const checkAuthStatus = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const urlParams = new URLSearchParams(window.location.search);
      const forceOrgSelection = urlParams.get('force') === 'true';
      
      const memberships = await OrganizationMember.filter({ user_email: currentUser.email });
      const memberOrgIds = new Set(memberships.map(m => m.organization_id));
      
      if (currentUser.current_organization_id && !forceOrgSelection && memberOrgIds.size > 0) {
        setShouldRedirect(true);
        return;
      }

      if (memberOrgIds.size > 0) {
        const allOrgs = await Organization.list();
        const userOrgs = allOrgs.filter(o => memberOrgIds.has(o.id));
        setOrganizations(userOrgs);

        if (userOrgs.length > 0 && !currentUser.current_organization_id) {
          setActiveTab("join");
        }
      }
    } catch (error) {
      console.log("User not authenticated or has no orgs yet.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      await User.login();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleBrandDataScanned = (scannedData) => {
    setNewOrgForm({
      name: scannedData.name || '',
      description: scannedData.longDescription || scannedData.description || '',
      industry: scannedData.company?.industries?.[0]?.name || '',
      website_url: scannedData.domain || '',
      settings: {
        branding: {
          logoUrl: scannedData.logos?.find(l => l.type === 'logo')?.formats?.[0]?.src || '',
          faviconUrl: scannedData.logos?.find(l => l.type === 'favicon')?.formats?.[0]?.src || '',
        },
        theme: {
          primaryColor: scannedData.colors?.find(c => c.type === 'primary')?.hex || scannedData.colors?.[0]?.hex ||'#3b82f6',
          secondaryColor: scannedData.colors?.find(c => c.type === 'secondary')?.hex || scannedData.colors?.[1]?.hex || '#6366f1',
          accentColor: scannedData.colors?.find(c => c.type === 'accent')?.hex || scannedData.colors?.[2]?.hex || '#f59e0b',
          textColor: scannedData.colors?.find(c => c.type === 'text')?.hex || '#1f2937',
          headingFont: scannedData.fonts?.find(f => f.type === 'title')?.name || "'Georgia', serif",
          bodyFont: scannedData.fonts?.find(f => f.type === 'body')?.name || "'Helvetica', sans-serif",
        },
        advanced: {
          icp: scannedData.icp || {},
          socialLinks: scannedData.links || [],
          imageAssets: scannedData.imageAssets || [], // Changed from scannedData.images to scannedData.imageAssets
        }
      }
    });
    setShowBrandScanner(false);
  };

  const createOrganization = async () => {
    if (!newOrgForm.name.trim()) return;
    
    setIsCreating(true);
    try {
      const slug = newOrgForm.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const organization = await Organization.create({
        ...newOrgForm,
        slug,
        plan: "free"
      });

      await OrganizationMember.create({
        organization_id: organization.id,
        user_email: user.email,
        role: "owner",
        joined_date: new Date().toISOString()
      });

      await User.updateMyUserData({
        current_organization_id: organization.id
      });

      navigate(createPageUrl("Pages"));
    } catch (error) {
      console.error("Failed to create organization:", error);
      alert("Failed to create organization. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const joinOrganization = async (orgId) => {
    try {
      await User.updateMyUserData({
        current_organization_id: orgId
      });
      navigate(createPageUrl("Pages"));
    } catch (error) {
      console.error("Failed to join organization:", error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">PageCraft AI</h1>
            </div>
            <CardTitle className="text-xl">Welcome Back</CardTitle>
            <p className="text-gray-600">Sign in to continue building amazing landing pages</p>
          </CardHeader>
          <CardContent>
            <Button onClick={handleLogin} className="w-full" size="lg">
              Sign In with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (showBrandScanner) {
    return (
      <BrandScannerStep 
        onComplete={handleBrandDataScanned}
        onSkip={() => {
          setNewOrgForm({
            name: "", description: "", industry: "", website_url: "",
            settings: { 
              branding: { logoUrl: '', faviconUrl: '' }, 
              theme: {
                primaryColor: '',
                secondaryColor: '',
                accentColor: '',
                textColor: '',
                headingFont: '',
                bodyFont: '',
              }, 
              advanced: {
                icp: {},
                socialLinks: [],
                imageAssets: [],
              } 
            }
          });
          setShowBrandScanner(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">PageCraft AI</h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {user.full_name}!</h2>
          <p className="text-gray-600">Let's set up your organization to start building landing pages</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Organization Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">Create New</TabsTrigger>
                <TabsTrigger value="join" disabled={organizations.length === 0}>
                  Join Existing {organizations.length > 0 && `(${organizations.length})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-4 mt-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-700">Want to auto-fill your brand details?</p>
                  <Button 
                    variant="link" 
                    className="text-blue-600"
                    onClick={() => setShowBrandScanner(true)}
                  >
                    Scan your website with AI
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Organization Name *</Label>
                    <Input
                      value={newOrgForm.name}
                      onChange={(e) => setNewOrgForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your company or brand name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Industry</Label>
                    <Select 
                      value={newOrgForm.industry} 
                      onValueChange={(value) => setNewOrgForm(prev => ({ ...prev, industry: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map(industry => (
                          <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Website URL</Label>
                    <Input
                      value={newOrgForm.website_url}
                      onChange={(e) => setNewOrgForm(prev => ({ ...prev, website_url: e.target.value }))}
                      placeholder="https://yourwebsite.com"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={newOrgForm.description}
                      onChange={(e) => setNewOrgForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of your organization"
                      className="mt-1"
                    />
                  </div>

                  <Button 
                    onClick={createOrganization} 
                    className="w-full mt-6" 
                    size="lg"
                    disabled={!newOrgForm.name.trim() || isCreating}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Create Organization
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="join" className="space-y-4 mt-6">
                {organizations.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-4">
                      You have been invited to the following organizations:
                    </p>
                    {organizations.map(org => (
                      <Card key={org.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{org.name}</h3>
                              {org.industry && <p className="text-sm text-gray-600">{org.industry}</p>}
                            </div>
                          </div>
                          <Button onClick={() => joinOrganization(org.id)}>
                            Join
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No organization invitations found.</p>
                    <p className="text-sm mt-2">Create a new organization to get started.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
