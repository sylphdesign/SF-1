
import React, { useState, useEffect } from "react";
import { AdCampaign } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Search, MoreVertical, Edit3, Target, Copy, Trash2, Calendar, TrendingUp, Megaphone } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import AdCreationWizard from "../components/ad-builder/AdCreationWizard";

export default function AdCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentOrgId, setCurrentOrgId] = useState(null);
  const navigate = useNavigate();
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  useEffect(() => {
    loadCurrentOrganization();
  }, []);

  useEffect(() => {
    if (currentOrgId) {
      loadCampaigns();
    }
  }, [currentOrgId]);

  const loadCurrentOrganization = async () => {
    try {
      const user = await User.me();
      setCurrentOrgId(user.current_organization_id);
    } catch (error) {
      console.error("Error loading current organization:", error);
    }
  };

  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      const data = await AdCampaign.filter({ organization_id: currentOrgId }, '-updated_date');
      setCampaigns(data);
    } catch (error) {
      console.error("Error loading ad campaigns:", error);
    }
    setIsLoading(false);
  };

  const editCampaign = (campaign) => {
    sessionStorage.setItem('editingAdCampaign', JSON.stringify(campaign));
    navigate(createPageUrl("AdBuilder"));
  };

  const deleteCampaign = async (campaignId) => {
    if (window.confirm("Are you sure you want to delete this ad campaign?")) {
      try {
        await AdCampaign.delete(campaignId);
        loadCampaigns();
      } catch (error) {
        console.error("Error deleting campaign:", error);
      }
    }
  };

  const duplicateCampaign = async (campaign) => {
    try {
      const newCampaignData = { 
        ...campaign, 
        name: `${campaign.name} (Copy)`, 
        status: 'draft',
        organization_id: currentOrgId 
      };
      delete newCampaignData.id;
      delete newCampaignData.created_date;
      delete newCampaignData.updated_date;
      await AdCampaign.create(newCampaignData);
      loadCampaigns();
    } catch (error) {
      console.error("Error duplicating campaign:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-600 hover:bg-green-700';
      case 'archived': return 'bg-gray-500 hover:bg-gray-600';
      default: return 'bg-yellow-600 hover:bg-yellow-700';
    }
  };

  const getPlatformIcons = (platforms) => {
    if (!platforms || platforms.length === 0) return null;
    return platforms.slice(0, 3).join(', ') + (platforms.length > 3 ? '...' : '');
  };

  const handleCreateWithAI = (wizardData) => {
    sessionStorage.setItem('adWizardData', JSON.stringify(wizardData));
    navigate(createPageUrl("AdBuilder"));
  };

  const filteredCampaigns = campaigns.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (!currentOrgId) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500">No organization selected. Please select an organization from the sidebar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Megaphone className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Ad Campaigns</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsWizardOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            AI Campaign Wizard
          </Button>
          <Link to={createPageUrl("AdTemplates")}>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Browse Templates
            </Button>
          </Link>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search campaigns..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10"/>
          </div>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading campaigns...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12">
          <Megaphone className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns yet</h3>
          <p className="text-gray-500 mb-6">Create your first ad campaign to get started</p>
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={() => setIsWizardOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              AI Campaign Wizard
            </Button>
            <Link to={createPageUrl("AdTemplates")}>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Browse Templates
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map(campaign => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="truncate pr-2">{campaign.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => editCampaign(campaign)}>
                        <Edit3 className="w-4 h-4 mr-2" />Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicateCampaign(campaign)}>
                        <Copy className="w-4 h-4 mr-2" />Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteCampaign(campaign.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                        <Trash2 className="w-4 h-4 mr-2" />Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant={campaign.status === 'published' ? 'default' : 'secondary'} className={campaign.status === 'published' ? getStatusColor(campaign.status) : ''}>
                    {campaign.status}
                  </Badge>
                  {campaign.ad_type && <Badge variant="outline">{campaign.ad_type.replace(/_/g, ' ')}</Badge>}
                  {campaign.goal && <Badge variant="outline" className="bg-blue-50 text-blue-700">{campaign.goal}</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="aspect-[4/5] bg-slate-100 rounded-lg mb-4 flex items-center justify-center border">
                  <span className="text-slate-500 text-sm">Ad Preview</span>
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  {campaign.platform && campaign.platform.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      <span>{getPlatformIcons(campaign.platform)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Updated {format(new Date(campaign.updated_date), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AdCreationWizard 
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCreateAd={handleCreateWithAI}
      />
    </div>
  );
}
