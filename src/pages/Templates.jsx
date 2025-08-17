
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTemplate } from "@/api/entities";
import { FunnelTemplate } from "@/api/entities";
import { User } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  Sparkles,
  FileText,
  BoxSelect,
  Layers,
  Zap
} from "lucide-react";
import TemplatePreviewModal from "../components/builder/TemplatePreviewModal";
import FunnelPreviewModal from "../components/builder/FunnelPreviewModal";

export default function Templates() {
  const [pageTemplates, setPageTemplates] = useState([]);
  const [funnelTemplates, setFunnelTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState(null); // For page templates
  const [selectedFunnel, setSelectedFunnel] = useState(null); // For funnel templates
  const [activeTab, setActiveTab] = useState("pages");
  const navigate = useNavigate();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const [pages, funnels] = await Promise.all([
        PageTemplate.list(),
        FunnelTemplate.list()
      ]);
      setPageTemplates(pages);
      setFunnelTemplates(funnels);
    } catch (error) {
      console.error("Error loading templates:", error);
    }
  };

  const handleUsePageTemplate = (template) => {
    sessionStorage.setItem('selectedTemplate', JSON.stringify(template));
    navigate(createPageUrl("Builder"));
  };

  const handleUseFunnelTemplate = async (funnelTemplate) => {
    try {
      const user = await User.me();
      if (!user || !user.current_organization_id) { // Added !user check for robustness
        alert('Please select an organization first.');
        return;
      }

      // Store the entire funnel data for the builder
      sessionStorage.setItem('selectedFunnel', JSON.stringify(funnelTemplate));
      navigate(createPageUrl("Builder"));
      
    } catch (error) {
      console.error("Error using funnel template:", error);
      alert("Error creating funnel. Please try again.");
    }
  };

  const filteredPageTemplates = pageTemplates.filter(template =>
    (template.name && template.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (activeCategory === "all" || (template.category && template.category === activeCategory))
  );

  const filteredFunnelTemplates = funnelTemplates.filter(template =>
    (template.name && template.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (activeCategory === "all" || (template.category && template.category === activeCategory))
  );

  const categories = [
    { id: "all", name: "All" },
    { id: "lead_generation", name: "Lead Gen" },
    { id: "sales", name: "Sales" },
    { id: "event", name: "Event" },
    { id: "product_launch", name: "Product Launch" },
    { id: "webinar", name: "Webinar" },
    { id: "ai_generated", name: "AI Generated" }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-600 mt-2">Choose from professional templates or AI-generated funnels</p>
        </div>
        <Button onClick={() => navigate(createPageUrl("FunnelCreator"))} className="bg-blue-600 hover:bg-blue-700">
          <BoxSelect className="w-5 h-5 mr-2" />
          Create Funnel from Image
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pages" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Page Templates ({filteredPageTemplates.length})
          </TabsTrigger>
          <TabsTrigger value="funnels" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Funnel Templates ({filteredFunnelTemplates.length})
          </TabsTrigger>
        </TabsList>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
                className="whitespace-nowrap"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        <TabsContent value="pages" className="space-y-6">
          {filteredPageTemplates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No page templates found</h3>
              <p className="text-gray-500">Try adjusting your search or category filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPageTemplates.map((template) => (
                <Card key={template.id} className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
                  <CardHeader className="p-0">
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                      {template.thumbnail ? (
                        <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-12 h-12 text-blue-500" />
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setSelectedTemplate(template); }}>
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); handleUsePageTemplate(template); }}>
                          <Plus className="w-4 h-4 mr-1" />
                          Use
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg mb-2 line-clamp-1">{template.name}</CardTitle>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {template.category?.replace(/_/g, ' ') || 'General'}
                      </Badge>
                      {template.is_premium && (
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">Premium</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="funnels" className="space-y-6">
          {filteredFunnelTemplates.length === 0 ? (
            <div className="text-center py-12">
              <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No funnel templates found</h3>
              <p className="text-gray-500 mb-4">Create your first funnel template from layout images.</p>
              <Button onClick={() => navigate(createPageUrl("FunnelCreator"))} variant="outline">
                <BoxSelect className="w-4 h-4 mr-2" />
                Create Funnel Template
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFunnelTemplates.map((funnel) => (
                <Card key={funnel.id} className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
                  <CardHeader className="p-0">
                    <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                      {funnel.thumbnail ? (
                        <img src={funnel.thumbnail} alt={funnel.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <Layers className="w-12 h-12 text-green-600 mx-auto mb-2" />
                          <Badge variant="secondary" className="text-xs">
                            {funnel.pages?.length || 0} Pages
                          </Badge>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setSelectedFunnel(funnel); }}>
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); handleUseFunnelTemplate(funnel); }}>
                          <Zap className="w-4 h-4 mr-1" />
                          Use Funnel
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg mb-2 line-clamp-1">{funnel.name}</CardTitle>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{funnel.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {funnel.category?.replace(/_/g, ' ') || 'General'}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          <Layers className="w-3 h-3 mr-1" />
                          {funnel.pages?.length || 0} Pages
                        </Badge>
                        {funnel.category === 'ai_generated' && (
                          <Badge className="bg-purple-100 text-purple-800 text-xs">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <TemplatePreviewModal
        template={selectedTemplate}
        isOpen={!!selectedTemplate} // Control visibility based on selectedTemplate state
        onClose={() => setSelectedTemplate(null)}
        onUse={handleUsePageTemplate}
      />

      <FunnelPreviewModal
        funnel={selectedFunnel}
        isOpen={!!selectedFunnel} // Control visibility based on selectedFunnel state
        onClose={() => setSelectedFunnel(null)}
        onUse={handleUseFunnelTemplate}
      />
    </div>
  );
}
