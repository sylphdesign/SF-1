
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/api/entities';
import { Organization } from '@/api/entities';
import { OrganizationMember } from '@/api/entities';
import { UploadFile, InvokeLLM } from '@/api/integrations';
import { Loader2, Palette, Building, Save, Upload, Type, Users, Trash2, Send, Link as LinkIcon, PlusCircle, BrainCircuit, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import _ from 'lodash';

const GOOGLE_FONTS = [
  { value: "'Inter', sans-serif", label: 'Inter', category: 'Sans Serif' },
  { value: "'Roboto', sans-serif", label: 'Roboto', category: 'Sans Serif' },
  { value: "'Open Sans', sans-serif", label: 'Open Sans', category: 'Sans Serif' },
  { value: "'Lato', sans-serif", label: 'Lato', category: 'Sans Serif' },
  { value: "'Poppins', sans-serif", label: 'Poppins', category: 'Sans Serif' },
  { value: "'Montserrat', sans-serif", label: 'Montserrat', category: 'Sans Serif' },
  { value: "'Playfair Display', serif", label: 'Playfair Display', category: 'Serif' },
  { value: "'Merriweather', serif", label: 'Merriweather', category: 'Serif' },
  { value: "'Lora', serif", label: 'Lora', category: 'Serif' },
  { value: "'Oswald', sans-serif", label: 'Oswald', category: 'Display' },
  { value: 'Georgia, serif', label: 'Georgia', category: 'System' },
];

const INDUSTRIES = [
    "Technology", "Healthcare", "Finance", "Education", "E-commerce", 
    "Marketing Agency", "Consulting", "Real Estate", "Manufacturing", "Other"
];

const DEFAULT_ORGANIZATION_STRUCTURE = {
    id: null,
    name: "",
    description: "",
    industry: "",
    website_url: "",
    settings: {
        branding: { logoUrl: '' },
        theme: {
            primaryColor: '#3b82f6',
            secondaryColor: '#6366f1',
            accentColor: '#f59e0b',
            backgroundColor: '#ffffff',
            textColor: '#1f2937',
            headingFont: "'Inter', sans-serif",
            bodyFont: "'Inter', sans-serif"
        },
        advanced: {
            icp: {
                target_audience: '',
                motivation: '',
                value_proposition: '',
                friction: '',
                anxiety: ''
            },
            socialLinks: [],
            imageAssets: []
        }
    }
};

const loadGoogleFont = (fontFamily) => {
  const fontName = fontFamily.match(/'([^']+)'/)?.[1] || fontFamily.split(',')[0].trim();
  if (['Arial', 'Helvetica', 'Georgia', 'Times New Roman', 'Verdana'].includes(fontName)) return;

  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;700&display=swap`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
};

export default function Settings() {
    const [organization, setOrganization] = useState(_.cloneDeep(DEFAULT_ORGANIZATION_STRUCTURE));
    const [members, setMembers] = useState([]);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [isUpdatingICP, setIsUpdatingICP] = useState(false);
    const [currentUserEmail, setCurrentUserEmail] = useState('');
    const fileInputRef = useRef(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const user = await User.me();
            setCurrentUserEmail(user.email);

            if (user.current_organization_id) {
                const orgs = await Organization.list();
                const currentOrg = orgs.find(o => o.id === user.current_organization_id);

                if (currentOrg) {
                    const mergedOrg = _.merge({}, DEFAULT_ORGANIZATION_STRUCTURE, currentOrg);
                    setOrganization(mergedOrg);
                    loadGoogleFont(mergedOrg.settings.theme.headingFont);
                    loadGoogleFont(mergedOrg.settings.theme.bodyFont);

                    const allMembers = await OrganizationMember.filter({ organization_id: currentOrg.id });
                    setMembers(allMembers);
                }
            }
        } catch (error) {
            console.error("Failed to load settings:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);
    
    const handleFieldChange = (path, value) => {
        setOrganization(prev => _.set(_.cloneDeep(prev), path, value));
    };

    const handleThemeChange = (field, value) => {
        if (field === 'headingFont' || field === 'bodyFont') {
            loadGoogleFont(value);
        }
        handleFieldChange(`settings.theme.${field}`, value);
    };

    const handleSave = async () => {
        if (!organization.id) {
            alert("No organization context found.");
            return;
        }
        setIsSaving(true);
        try {
            const { id, ...dataToUpdate } = organization;
            await Organization.update(id, dataToUpdate);
            alert('Settings saved successfully!');
        } catch (error) {
            console.error("Error saving settings:", error);
            alert('Failed to save settings. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleScan = async () => {
        if (!organization.website_url) {
            alert('Please enter a website URL to scan.');
            return;
        }
        setIsScanning(true);
        try {
            const responseSchema = {
                type: "object",
                properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    primaryColor: { type: "string" },
                    secondaryColor: { type: "string" },
                    accentColor: { type: "string" },
                    logoUrl: { type: "string" },
                    headingFont: { 
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            family: { type: "string" },
                            isGoogleFont: { type: "boolean" },
                            linkTag: { type: "string" }
                        }
                    },
                    bodyFont: { 
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            family: { type: "string" },
                            isGoogleFont: { type: "boolean" },
                            linkTag: { type: "string" }
                        }
                    },
                    socialLinks: { 
                        type: "array", 
                        items: {
                            type: "object",
                            properties: {
                                platform: { type: "string" },
                                url: { type: "string" },
                                handle: { type: "string" }
                            }
                        }
                    },
                    imageAssets: { 
                        type: "array", 
                        items: { type: "string" },
                        description: "CRITICAL: Return only DIRECT, PUBLICLY EMBEDDABLE image URLs. Prioritize images hosted on CDNs or with permissive CORS policies. Use full absolute URLs. Test that they are not protected."
                    }
                }
            };

            const prompt = `You are a website analyzer. Visit "${organization.website_url}" and extract brand information.

CRITICAL INSTRUCTIONS FOR IMAGE EXTRACTION:
1. ONLY return DIRECT image URLs that are PUBLICLY EMBEDDABLE and ACCESSIBLE from other websites.
2. The URLs must not be protected by restrictive CORS policies (meaning they can be loaded by other domains without issues).
3. Use full absolute URLs (including https://).
4. Prioritize images hosted on Content Delivery Networks (CDNs) or those explicitly designed for external embedding.
5. Provide a diverse set of high-quality marketing images: logos, hero banners, product photos, team photos, background images, etc.
6. Aim for 10-20 relevant images.

Return comprehensive, structured data based on the requested schema.`;

            const response = await InvokeLLM({ 
                prompt, 
                add_context_from_internet: true, 
                response_json_schema: responseSchema 
            });

            console.log("AI Scan Response:", response);

            // Process fonts
            let headingFont = "'Inter', sans-serif";
            let bodyFont = "'Inter', sans-serif";
            
            if (response.headingFont) {
                if (response.headingFont.isGoogleFont && response.headingFont.linkTag) {
                    const link = document.createElement('link');
                    link.href = response.headingFont.linkTag;
                    link.rel = 'stylesheet';
                    document.head.appendChild(link);
                    headingFont = `"${response.headingFont.name}", ${response.headingFont.family}`;
                } else {
                    headingFont = response.headingFont.family || response.headingFont.name;
                }
            }
            
            if (response.bodyFont) {
                if (response.bodyFont.isGoogleFont && response.bodyFont.linkTag) {
                    const link = document.createElement('link');
                    link.href = response.bodyFont.linkTag;
                    link.rel = 'stylesheet';
                    document.head.appendChild(link);
                    bodyFont = `"${response.bodyFont.name}", ${response.bodyFont.family}`;
                } else {
                    bodyFont = response.bodyFont.family || response.bodyFont.name;
                }
            }

            // Directly use the image assets provided by the AI
            const imageAssets = response.imageAssets || [];

            // Process social links
            const processedSocialLinks = (response.socialLinks || []).map(link => ({
                name: link.platform || 'Social',
                url: link.url || '',
                handle: link.handle || ''
            })).filter(link => link.url);

            const updatedOrg = {
                ...organization,
                name: response.name || organization.name,
                description: response.description || organization.description,
                settings: {
                    ...organization.settings,
                    branding: { 
                        ...organization.settings.branding,
                        logoUrl: response.logoUrl || organization.settings.branding.logoUrl 
                    },
                    theme: {
                        ...organization.settings.theme,
                        primaryColor: response.primaryColor || organization.settings.theme.primaryColor,
                        secondaryColor: response.secondaryColor || organization.settings.theme.secondaryColor,
                        accentColor: response.accentColor || organization.settings.theme.accentColor,
                        headingFont: headingFont,
                        bodyFont: bodyFont,
                    },
                    advanced: {
                        ...organization.settings.advanced,
                        socialLinks: processedSocialLinks,
                        // Set the image assets directly from the AI response
                        imageAssets: _.uniq([...(organization.settings.advanced.imageAssets || []), ...imageAssets]),
                        fontMetadata: {
                            headingFont: response.headingFont,
                            bodyFont: response.bodyFont
                        }
                    }
                }
            };
            
            setOrganization(updatedOrg);
            
            alert(`Successfully scanned website! Found:
• ${imageAssets.length} image assets (some may be protected and not display)
• ${processedSocialLinks.length} social media links
• Heading font: ${response.headingFont?.name || 'Default'}
• Body font: ${response.bodyFont?.name || 'Default'}

Use the Asset Manager to upload your own files for guaranteed availability.`);

        } catch (error) {
            console.error("Scanning failed:", error);
            alert("Failed to scan website. Please check the URL and try again.");
        } finally {
            setIsScanning(false);
        }
    };

    const handleFileUpload = async (e, path) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const { file_url } = await UploadFile({ file });
            handleFieldChange(path, file_url);
        } catch (error) {
            console.error("Upload failed:", error);
            alert("File upload failed.");
        }
    };

    const handleInviteMember = async () => {
        if (!newMemberEmail) return;
        setIsInviting(true);
        try {
            await OrganizationMember.create({
                organization_id: organization.id,
                user_email: newMemberEmail,
                role: "editor",
                invited_by: currentUserEmail
            });
            setMembers([...members, { user_email: newMemberEmail, role: "editor", id: Date.now() }]);
            setNewMemberEmail('');
            alert('Invitation sent!');
        } catch (error) {
            console.error('Failed to invite member:', error);
            alert('Failed to send invitation.');
        } finally {
            setIsInviting(false);
        }
    };

    const removeMember = async (memberId) => {
        try {
            await OrganizationMember.delete(memberId);
            setMembers(members.filter(m => m.id !== memberId));
        } catch (error) {
            console.error("Failed to remove member:", error);
        }
    };

    const handleUpdateICP = async () => {
        setIsUpdatingICP(true);
        try {
            const prompt = `Based on the following business description, generate an Ideal Customer Profile (ICP) using MECLABS principles. 

Business Description: "${organization.description}"
Industry: "${organization.industry}"
Website: "${organization.website_url}"

Generate a comprehensive ICP that includes:
1. Target Audience - Who are the ideal customers (demographics, psychographics, behavior)
2. Customer Motivation - What drives them to seek a solution (desires, goals, pain points)
3. Value Proposition - What unique value does the business provide to solve their problems
4. Potential Friction - What obstacles prevent customers from taking action (cost, complexity, time, trust issues)
5. Customer Anxiety - What fears or concerns do customers have that create hesitation

Make it specific to the business and industry provided.`;

            const schema = {
                type: "object",
                properties: {
                    target_audience: { type: "string" },
                    motivation: { type: "string" },
                    value_proposition: { type: "string" },
                    friction: { type: "string" },
                    anxiety: { type: "string" }
                }
            };
            const response = await InvokeLLM({ prompt, response_json_schema: schema });
            handleFieldChange('settings.advanced.icp', response);
        } catch (error) {
            console.error("Failed to update ICP:", error);
            alert("Failed to generate ICP profile.");
        } finally {
            setIsUpdatingICP(false);
        }
    };

    const handleSocialLinkChange = (index, field, value) => {
        const updatedLinks = [...(organization.settings?.advanced?.socialLinks || [])];
        if (updatedLinks[index]) {
            updatedLinks[index][field] = value;
            handleFieldChange('settings.advanced.socialLinks', updatedLinks);
        }
    };

    const addSocialLink = () => {
        const newLinks = [...(organization.settings?.advanced?.socialLinks || []), { name: '', url: '', handle: '' }];
        handleFieldChange('settings.advanced.socialLinks', newLinks);
    };

    const removeSocialLink = (index) => {
        const newLinks = [...(organization.settings?.advanced?.socialLinks || [])];
        newLinks.splice(index, 1);
        handleFieldChange('settings.advanced.socialLinks', newLinks);
    };
    
    const getSocialIcon = (name) => {
        const socialName = name.toLowerCase();
        if (socialName.includes('facebook') || socialName.includes('fb')) return '📘';
        if (socialName.includes('instagram') || socialName.includes('ig')) return '📷';
        if (socialName.includes('twitter') || socialName.includes('x.com') || socialName === 'x') return '🐦';
        if (socialName.includes('linkedin')) return '💼';
        if (socialName.includes('youtube')) return '📺';
        if (socialName.includes('tiktok')) return '🎵';
        if (socialName.includes('pinterest')) return '📌';
        if (socialName.includes('snapchat')) return '👻';
        if (socialName.includes('discord')) return '🎮';
        if (socialName.includes('telegram')) return '✈️';
        if (socialName.includes('whatsapp')) return '💬';
        return '🔗';
    };

    // Updated ImageAssetCard to gracefully handle errors
    const ImageAssetCard = ({ url, index, onRemove }) => {
        const [imageStatus, setImageStatus] = useState('loading'); // 'loading', 'loaded', 'error'

        return (
            <div className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                    {imageStatus === 'loading' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <Loader2 className="w-6 h-6 text-gray-400 mx-auto mb-1 animate-spin" />
                                <p className="text-xs text-gray-500">Loading...</p>
                            </div>
                        </div>
                    )}
                    {imageStatus === 'error' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 p-2">
                            <div className="text-center">
                                <div className="text-2xl mb-1">🖼️</div>
                                <p className="text-xs text-gray-600 font-medium">Preview Unavailable</p>
                                <p className="text-xs text-gray-500 mt-1">Image may be protected</p>
                            </div>
                        </div>
                    )}
                    <img 
                        src={url}
                        alt={`Brand Asset ${index + 1}`}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                            imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => setImageStatus('loaded')}
                        onError={() => setImageStatus('error')}
                    />
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 bg-white shadow-md hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto rounded-full border"
                    onClick={() => onRemove(index)}
                >
                    <Trash2 className="w-3 h-3 text-red-500" />
                </Button>
            </div>
        );
    };
    
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Sticky Header */}
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b p-4">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Settings</h1>
                        <p className="text-sm text-gray-500">Manage your organization's settings, branding, and team.</p>
                    </div>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto p-6">
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="general"><Building className="w-4 h-4 mr-2" />General</TabsTrigger>
                            <TabsTrigger value="branding"><Palette className="w-4 h-4 mr-2" />Branding</TabsTrigger>
                            <TabsTrigger value="team"><Users className="w-4 h-4 mr-2" />Team</TabsTrigger>
                            <TabsTrigger value="advanced"><BrainCircuit className="w-4 h-4 mr-2" />Advanced</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="general" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>General Information</CardTitle>
                                    <CardDescription>Update your organization's basic details.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="org-name">Organization Name</Label>
                                        <Input id="org-name" value={organization.name || ''} onChange={(e) => handleFieldChange('name', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label htmlFor="org-industry">Industry</Label>
                                        <Select value={organization.industry || ''} onValueChange={(value) => handleFieldChange('industry', value)}>
                                            <SelectTrigger id="org-industry"><SelectValue placeholder="Select industry" /></SelectTrigger>
                                            <SelectContent>{INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="org-website">Website URL</Label>
                                        <div className="flex gap-2">
                                            <Input id="org-website" value={organization.website_url || ''} onChange={(e) => handleFieldChange('website_url', e.target.value)} />
                                            <Button variant="outline" onClick={handleScan} disabled={isScanning}>
                                                {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Scan'}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="branding" className="mt-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader><CardTitle>Logo & Colors</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label>Logo</Label>
                                            <div className="mt-1 flex items-center gap-4">
                                                <div className="w-20 h-20 bg-gray-100 border rounded flex items-center justify-center">
                                                    {organization.settings?.branding?.logoUrl ? <img src={organization.settings.branding.logoUrl} alt="Logo" className="max-w-full max-h-full" /> : <ImageIcon className="w-8 h-8 text-gray-400" />}
                                                </div>
                                                <Button type="button" onClick={() => fileInputRef.current?.click()} variant="outline">Upload</Button>
                                                <Input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'settings.branding.logoUrl')} accept="image/*" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div><Label>Primary</Label><Input type="color" value={organization.settings?.theme?.primaryColor || '#000000'} onChange={(e) => handleThemeChange('primaryColor', e.target.value)} className="w-full h-10 p-1" /></div>
                                            <div><Label>Secondary</Label><Input type="color" value={organization.settings?.theme?.secondaryColor || '#000000'} onChange={(e) => handleThemeChange('secondaryColor', e.target.value)} className="w-full h-10 p-1" /></div>
                                            <div><Label>Accent</Label><Input type="color" value={organization.settings?.theme?.accentColor || '#000000'} onChange={(e) => handleThemeChange('accentColor', e.target.value)} className="w-full h-10 p-1" /></div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Typography</CardTitle>
                                        <CardDescription>
                                            Fonts detected from your website or manually selected.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label>Heading Font</Label>
                                            {organization.settings?.advanced?.fontMetadata?.headingFont?.name && (
                                                <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                                                    <span className="font-semibold">Detected:</span> {organization.settings.advanced.fontMetadata.headingFont.name}
                                                    {organization.settings.advanced.fontMetadata.headingFont.isGoogleFont ? (
                                                        <span className="ml-2 text-green-600">✓ Google Font</span>
                                                    ) : (
                                                        <span className="ml-2 text-orange-600">⚠ Proprietary Font</span>
                                                    )}
                                                </div>
                                            )}
                                            <Select value={organization.settings?.theme?.headingFont} onValueChange={(value) => handleThemeChange('headingFont', value)}>
                                                <SelectTrigger><SelectValue/></SelectTrigger>
                                                <SelectContent className="max-h-64">{Object.entries(_.groupBy(GOOGLE_FONTS, 'category')).map(([category, fonts]) => (<div key={category}><div className="px-2 py-1.5 text-xs font-semibold text-gray-500">{category}</div>{fonts.map(font => (<SelectItem key={font.value} value={font.value} style={{fontFamily: font.value}}>{font.label}</SelectItem>))}</div>))}</SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Body Font</Label>
                                            {organization.settings?.advanced?.fontMetadata?.bodyFont?.name && (
                                                <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                                                    <span className="font-semibold">Detected:</span> {organization.settings.advanced.fontMetadata.bodyFont.name}
                                                    {organization.settings.advanced.fontMetadata.bodyFont.isGoogleFont ? (
                                                        <span className="ml-2 text-green-600">✓ Google Font</span>
                                                    ) : (
                                                        <span className="ml-2 text-orange-600">⚠ Proprietary Font</span>
                                                    )}
                                                </div>
                                            )}
                                            <Select value={organization.settings?.theme?.bodyFont} onValueChange={(value) => handleThemeChange('bodyFont', value)}>
                                                <SelectTrigger><SelectValue/></SelectTrigger>
                                                <SelectContent className="max-h-64">{Object.entries(_.groupBy(GOOGLE_FONTS, 'category')).map(([category, fonts]) => (<div key={category}><div className="px-2 py-1.5 text-xs font-semibold text-gray-500">{category}</div>{fonts.map(font => (<SelectItem key={font.value} value={font.value} style={{fontFamily: font.value}}>{font.label}</SelectItem>))}</div>))}</SelectContent>
                                            </Select>
                                        </div>
                                        {organization.settings?.advanced?.fontMetadata && (
                                            <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
                                                <p className="font-semibold mb-2">Font Detection Info:</p>
                                                {organization.settings.advanced.fontMetadata.headingFont?.linkTag && (
                                                    <div className="mb-2">
                                                        <span className="font-medium">Heading Link:</span>
                                                        <code className="ml-2 p-1 bg-white rounded text-xs">{organization.settings.advanced.fontMetadata.headingFont.linkTag}</code>
                                                    </div>
                                                )}
                                                {organization.settings.advanced.fontMetadata.bodyFont?.linkTag && (
                                                    <div>
                                                        <span className="font-medium">Body Link:</span>
                                                        <code className="ml-2 p-1 bg-white rounded text-xs">{organization.settings.advanced.fontMetadata.bodyFont.linkTag}</code>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="team" className="mt-6">
                            <Card>
                                <CardHeader><CardTitle>Team Members</CardTitle><CardDescription>Invite and manage your team.</CardDescription></CardHeader>
                                <CardContent>
                                    <div className="flex gap-2 mb-4">
                                        <Input placeholder="Enter member's email" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} />
                                        <Button onClick={handleInviteMember} disabled={isInviting}>{isInviting ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}</Button>
                                    </div>
                                    <div className="space-y-2">
                                        {members.map(member => (
                                            <div key={member.id || member.user_email} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium">{member.user_email}</p>
                                                    <Badge variant="secondary">{member.role}</Badge>
                                                </div>
                                                {member.user_email !== currentUserEmail && member.id && (
                                                    <Button variant="ghost" size="sm" onClick={() => removeMember(member.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        
                        <TabsContent value="advanced" className="mt-6">
                            <div className="space-y-6">
                                {/* RESTORED ICP Card - Full Width */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex justify-between items-center">
                                            Ideal Customer Profile 
                                            <Button variant="outline" size="sm" onClick={handleUpdateICP} disabled={isUpdatingICP}>
                                                {isUpdatingICP ? <Loader2 className="w-4 h-4 animate-spin"/> : <RefreshCw className="w-4 h-4"/>}
                                            </Button>
                                        </CardTitle>
                                        <CardDescription>Define your customer profile using MECLABS principles.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Target Audience</Label>
                                            <Textarea 
                                                value={organization.settings?.advanced?.icp?.target_audience || ''} 
                                                onChange={(e) => handleFieldChange('settings.advanced.icp.target_audience', e.target.value)}
                                                placeholder="Describe your ideal customer demographics, psychographics, and characteristics"
                                                className="min-h-[80px]"
                                            />
                                        </div>
                                        <div>
                                            <Label>Customer Motivation</Label>
                                            <Textarea 
                                                value={organization.settings?.advanced?.icp?.motivation || ''} 
                                                onChange={(e) => handleFieldChange('settings.advanced.icp.motivation', e.target.value)}
                                                placeholder="What drives your customers to seek a solution? What are their desires and goals?"
                                                className="min-h-[80px]"
                                            />
                                        </div>
                                        <div>
                                            <Label>Value Proposition</Label>
                                            <Textarea 
                                                value={organization.settings?.advanced?.icp?.value_proposition || ''} 
                                                onChange={(e) => handleFieldChange('settings.advanced.icp.value_proposition', e.target.value)}
                                                placeholder="What unique value do you provide? How do you solve their problem better than alternatives?"
                                                className="min-h-[80px]"
                                            />
                                        </div>
                                        <div>
                                            <Label>Potential Friction</Label>
                                            <Textarea 
                                                value={organization.settings?.advanced?.icp?.friction || ''} 
                                                onChange={(e) => handleFieldChange('settings.advanced.icp.friction', e.target.value)}
                                                placeholder="What obstacles prevent customers from taking action? (cost, complexity, time, etc.)"
                                                className="min-h-[80px]"
                                            />
                                        </div>
                                        <div className="lg:col-span-2">
                                            <Label>Customer Anxiety</Label>
                                            <Textarea 
                                                value={organization.settings?.advanced?.icp?.anxiety || ''} 
                                                onChange={(e) => handleFieldChange('settings.advanced.icp.anxiety', e.target.value)}
                                                placeholder="What fears or concerns do customers have? What might make them hesitate?"
                                                className="min-h-[80px]"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Social Media Links Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Social Media Links</CardTitle>
                                        <CardDescription>Manage your social media presence and links.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {(organization.settings?.advanced?.socialLinks || []).map((link, index) => (
                                                <div key={index} className="flex gap-3 items-center p-3 border rounded-lg">
                                                    <span className="text-2xl">{getSocialIcon(link.name)}</span>
                                                    <div className="flex-1">
                                                        <Input 
                                                            placeholder="Platform (e.g. Facebook, Instagram)" 
                                                            value={link.name || ''} 
                                                            onChange={e => handleSocialLinkChange(index, 'name', e.target.value)}
                                                            className="mb-2"
                                                        />
                                                        <Input 
                                                            placeholder="https://..." 
                                                            value={link.url || ''} 
                                                            onChange={e => handleSocialLinkChange(index, 'url', e.target.value)}
                                                        />
                                                    </div>
                                                    <Button variant="ghost" size="sm" onClick={() => removeSocialLink(index)}>
                                                        <Trash2 className="w-4 h-4 text-red-500"/>
                                                    </Button>
                                                </div>
                                            ))}
                                            {(organization.settings?.advanced?.socialLinks || []).length === 0 && (
                                                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                                    <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-500">No social links added yet.</p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Use the "Scan" button in General settings to automatically extract social links.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <Button variant="outline" size="sm" onClick={addSocialLink} className="mt-4">
                                            <PlusCircle className="w-4 h-4 mr-2"/>Add Social Link
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Image Assets Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Brand Image Assets</CardTitle>
                                        <CardDescription>
                                            Images found on your website. Previews may be unavailable for protected images.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {(organization.settings?.advanced?.imageAssets || []).length > 0 ? (
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {(organization.settings?.advanced?.imageAssets || []).map((url, index) => (
                                                    <ImageAssetCard
                                                        key={`${url}-${index}`}
                                                        url={url}
                                                        index={index}
                                                        onRemove={(idx) => {
                                                            const newAssets = [...(organization.settings?.advanced?.imageAssets || [])];
                                                            newAssets.splice(idx, 1);
                                                            handleFieldChange('settings.advanced.imageAssets', newAssets);
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                                                <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                                <p className="text-lg font-medium text-gray-500">No image assets found</p>
                                                <p className="text-sm text-gray-400 mt-2">
                                                    Use the "Scan" button in General settings to find images from your website.
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}
