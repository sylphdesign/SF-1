import React, { useState, useEffect } from "react";
import { LandingPage } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Search, MoreVertical, Edit3, Globe, Copy, Trash2, Calendar, TrendingUp } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

export default function Pages() {
  const [pages, setPages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentOrgId, setCurrentOrgId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCurrentOrganization();
  }, []);

  useEffect(() => {
    if (currentOrgId) {
      loadPages();
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

  const loadPages = async () => {
    setIsLoading(true);
    try {
      const data = await LandingPage.filter({ organization_id: currentOrgId }, '-updated_date');
      setPages(data);
    } catch (error) {
      console.error("Error loading pages:", error);
    }
    setIsLoading(false);
  };

  const viewLivePage = (page) => {
    if (page.status === 'published' && page.html) {
      const newWindow = window.open();
      newWindow.document.write(page.html);
      newWindow.document.close();
    } else {
      alert('Page is not published yet.');
    }
  };

  const editPage = (page) => {
    sessionStorage.setItem('editingPage', JSON.stringify(page));
    navigate(createPageUrl("Builder"));
  };

  const deletePage = async (pageId) => {
    if (window.confirm("Are you sure you want to delete this page?")) {
      try {
        await LandingPage.delete(pageId);
        loadPages(); // Refresh the list
      } catch (error) {
        console.error("Error deleting page:", error);
      }
    }
  };

  const duplicatePage = async (page) => {
    try {
      const newPageData = { 
        ...page, 
        title: `${page.title} (Copy)`, 
        status: 'draft',
        organization_id: currentOrgId 
      };
      delete newPageData.id; // Remove id to create a new record
      delete newPageData.created_date;
      delete newPageData.updated_date;
      await LandingPage.create(newPageData);
      loadPages();
    } catch (error) {
      console.error("Error duplicating page:", error);
    }
  };

  const filteredPages = pages.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

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
        <h1 className="text-3xl font-bold">Landing Pages</h1>
        <Link to={createPageUrl("Templates")}>
          <Button><Plus className="w-4 h-4 mr-2" />New Page</Button>
        </Link>
      </div>
      <Card className="mb-6"><CardContent className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search pages..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10"/>
        </div>
      </CardContent></Card>
      {isLoading ? <p>Loading pages...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPages.map(page => (
            <Card key={page.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="truncate pr-2">{page.title}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => editPage(page)}><Edit3 className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicatePage(page)}><Copy className="w-4 h-4 mr-2" />Duplicate</DropdownMenuItem>
                      {page.status === 'published' && <DropdownMenuItem onClick={() => viewLivePage(page)}><Globe className="w-4 h-4 mr-2" />View Live</DropdownMenuItem>}
                      <DropdownMenuItem onClick={() => deletePage(page.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant={page.status === 'published' ? 'default' : 'secondary'} className={page.status === 'published' ? 'bg-green-600 hover:bg-green-700' : ''}>{page.status}</Badge>
                  {page.industry && <Badge variant="outline">{page.industry}</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-slate-100 rounded-lg mb-4 flex items-center justify-center border"><span className="text-slate-500 text-sm">Preview Thumbnail</span></div>
                <div className="text-sm text-slate-600 flex items-center gap-2"><Calendar className="w-4 h-4" /><span>Updated {format(new Date(page.updated_date), 'MMM d, yyyy')}</span></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}