
import React, { useState, useEffect, useRef, useCallback } from "react";
import { AdCampaign } from "@/api/entities";
import { User } from "@/api/entities";
import { Organization } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Save, Sparkles, Download, Eye, Undo, Redo, Home, Maximize2, Minimize2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import html2canvas from 'html2canvas';

import AdPreview from "../components/ad-builder/AdPreview";
import AdPropertiesPanel from "../components/ad-builder/AdPropertiesPanel";
import AdSidebar from "../components/ad-builder/AdSidebar";
import VersionHistory from "../components/ad-builder/VersionHistory";
import ExportModal from "../components/ad-builder/ExportModal";
import MagicResizeModal from "../components/ad-builder/MagicResizeModal";
import _ from 'lodash';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// Re-using this from Magic Resize Modal for consistency
const PLATFORM_SIZES = [
  {
    platform: 'Instagram',
    formats: [
      { name: 'Square Post', width: 1080, height: 1080 },
      { name: 'Story', width: 1080, height: 1920 },
      { name: 'Reel Cover', width: 1080, height: 1350 },
    ]
  },
  {
    platform: 'Facebook',
    formats: [
      { name: 'Feed Post', width: 1200, height: 630 },
      { name: 'Story', width: 1080, height: 1920 },
      { name: 'Cover Photo', width: 1200, height: 315 },
    ]
  },
  {
    platform: 'LinkedIn',
    formats: [
      { name: 'Feed Post', width: 1200, height: 627 },
      { name: 'Company Banner', width: 1536, height: 768 },
      { name: 'Article Header', width: 1200, height: 627 },
    ]
  },
  {
    platform: 'Twitter',
    formats: [
      { name: 'Tweet Image', width: 1024, height: 512 },
      { name: 'Header Photo', width: 1500, height: 500 },
    ]
  },
  {
    platform: 'YouTube',
    formats: [
      { name: 'Thumbnail', width: 1280, height: 720 },
      { name: 'Channel Art', width: 2560, height: 1440 },
    ]
  }
];

const getFormatName = (width, height) => {
  for (const platform of PLATFORM_SIZES) {
    for (const format of platform.formats) {
      if (format.width === width && format.height === height) {
        return `${platform.platform} ${format.name}`;
      }
    }
  }
  return null;
};


// Enhanced ad templates that match professional examples
const AD_TEMPLATES = {
  "Problem_Solution": {
    frame: { width: 1080, height: 1350, backgroundColor: "#f8fafc" },
    layers: [
      // Header/Problem Section
      { id: "problem-bg", type: "rect", name: "Problem Background", x: 0, y: 0, width: 1080, height: 400, fill: "#ef4444", borderRadius: 0 },
      { id: "headline", type: "text", name: "Problem Headline", x: 60, y: 80, width: 960, text: "Are You Struggling With This Problem?", fontSize: 56, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff", textAlign: "center" },
      { id: "description", type: "text", name: "Problem Description", x: 60, y: 200, width: 960, text: "Many people face this challenge daily...", fontSize: 24, fontFamily: "Arial", fill: "#ffffff", textAlign: "center" },
      
      // Solution Section
      { id: "solution-bg", type: "rect", name: "Solution Background", x: 0, y: 400, width: 1080, height: 400, fill: "#10b981", borderRadius: 0 },
      { id: "solution-headline", type: "text", name: "Solution Headline", x: 60, y: 480, width: 960, text: "Here's Your Solution", fontSize: 48, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff", textAlign: "center" },
      { id: "solution-description", type: "text", name: "Solution Description", x: 60, y: 580, width: 960, text: "Our product solves this exact problem by...", fontSize: 22, fontFamily: "Arial", fill: "#ffffff", textAlign: "center" },
      
      // CTA Section
      { id: "cta-bg", type: "rect", name: "CTA Background", x: 0, y: 800, width: 1080, height: 550, fill: "#ffffff", borderRadius: 0 },
      { id: "brand-logo", type: "image", name: "Brand Logo", x: 490, y: 850, width: 100, height: 100, src: "https://via.placeholder.com/100x100/3b82f6/ffffff?text=LOGO" },
      { id: "cta-button", type: "rect", name: "CTA Button", x: 340, y: 1150, width: 400, height: 80, fill: "#3b82f6", borderRadius: 40 },
      { id: "cta-text", type: "text", name: "CTA Text", x: 340, y: 1165, width: 400, text: "GET STARTED NOW", fontSize: 28, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff", textAlign: "center" }
    ]
  },
  "Before_After": {
    frame: { width: 1080, height: 1350, backgroundColor: "#f1f5f9" },
    layers: [
      // Header
      { id: "header-bg", type: "rect", name: "Header Background", x: 0, y: 0, width: 1080, height: 150, fill: "#1e293b", borderRadius: 0 },
      { id: "headline", type: "text", name: "Main Headline", x: 60, y: 50, width: 960, text: "BEFORE vs AFTER", fontSize: 64, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff", textAlign: "center" },
      
      // Before Section
      { id: "before-bg", type: "rect", name: "Before Background", x: 60, y: 200, width: 450, height: 600, fill: "#fee2e2", borderRadius: 20 },
      { id: "before-title", type: "text", name: "Before Title", x: 285, y: 240, width: 200, text: "BEFORE", fontSize: 32, fontFamily: "Arial", fontWeight: "bold", fill: "#dc2626", textAlign: "center" },
      { id: "before-image", type: "image", name: "Before Image", x: 110, y: 300, width: 350, height: 200, src: "https://via.placeholder.com/350x200/fee2e2/dc2626?text=BEFORE" },
      { id: "before-problems", type: "text", name: "Before Problems", x: 80, y: 520, width: 410, text: "• Problem 1\n• Problem 2\n• Problem 3", fontSize: 20, fontFamily: "Arial", fill: "#dc2626", textAlign: "left" },
      
      // After Section
      { id: "after-bg", type: "rect", name: "After Background", x: 570, y: 200, width: 450, height: 600, fill: "#d1fae5", borderRadius: 20 },
      { id: "after-title", type: "text", name: "After Title", x: 795, y: 240, width: 200, text: "AFTER", fontSize: 32, fontFamily: "Arial", fontWeight: "bold", fill: "#059669", textAlign: "center" },
      { id: "after-image", type: "image", name: "After Image", x: 620, y: 300, width: 350, height: 200, src: "https://via.placeholder.com/350x200/d1fae5/059669?text=AFTER" },
      { id: "after-benefits", type: "text", name: "After Benefits", x: 590, y: 520, width: 410, text: "✓ Benefit 1\n✓ Benefit 2\n✓ Benefit 3", fontSize: 20, fontFamily: "Arial", fill: "#059669", textAlign: "left" },
      
      // CTA
      { id: "cta-button", type: "rect", name: "CTA Button", x: 340, y: 1150, width: 400, height: 80, fill: "#3b82f6", borderRadius: 40 },
      { id: "cta-text", type: "text", name: "CTA Text", x: 340, y: 1165, width: 400, text: "TRANSFORM NOW", fontSize: 28, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff", textAlign: "center" }
    ]
  },
  "Us_Vs_Them": {
    frame: { width: 1080, height: 1350, backgroundColor: "#ffffff" },
    layers: [
      // Brand Header
      { id: "brand-name", type: "text", name: "Brand Name", x: 60, y: 50, width: 960, text: "YOUR BRAND", fontSize: 48, fontFamily: "Arial", fontWeight: "bold", fill: "#1f2937", textAlign: "center" },
      
      // VS Section
      { id: "vs-circle", type: "circle", name: "VS Circle", x: 480, y: 350, radius: 60, fill: "#f59e0b" },
      { id: "vs-text", type: "text", name: "VS Text", x: 465, y: 385, width: 90, text: "VS", fontSize: 32, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff", textAlign: "center" },
      
      // Our Side
      { id: "our-bg", type: "rect", name: "Our Background", x: 60, y: 200, width: 400, height: 800, fill: "#1f2937", borderRadius: 20 },
      { id: "our-title", type: "text", name: "Our Title", x: 260, y: 250, width: 200, text: "OUR PRODUCT", fontSize: 28, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff", textAlign: "center" },
      { id: "our-pros", type: "text", name: "Our Benefits", x: 80, y: 350, width: 360, text: "✓ Benefit 1\n✓ Benefit 2\n✓ Benefit 3\n✓ Benefit 4", fontSize: 22, fontFamily: "Arial", fill: "#10b981", textAlign: "left" },
      
      // Their Side
      { id: "their-bg", type: "rect", name: "Their Background", x: 620, y: 200, width: 400, height: 800, fill: "#f3f4f6", borderRadius: 20 },
      { id: "their-title", type: "text", name: "Their Title", x: 820, y: 250, width: 200, text: "COMPETITORS", fontSize: 28, fontFamily: "Arial", fontWeight: "bold", fill: "#6b7280", textAlign: "center" },
      { id: "competitor-cons", type: "text", name: "Their Problems", x: 640, y: 350, width: 360, text: "✗ Problem 1\n✗ Problem 2\n✗ Problem 3\n✗ Problem 4", fontSize: 22, fontFamily: "Arial", fill: "#ef4444", textAlign: "left" },
      
      // CTA
      { id: "cta-button", type: "rect", name: "CTA Button", x: 340, y: 1150, width: 400, height: 80, fill: "#3b82f6", borderRadius: 40 },
      { id: "cta-text", type: "text", name: "CTA Text", x: 340, y: 1165, width: 400, text: "CHOOSE BETTER", fontSize: 28, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff", textAlign: "center" }
    ]
  },
  "Special_Pricing": {
    frame: { width: 1080, height: 1350, backgroundColor: "#fef3c7" },
    layers: [
      // Urgency Banner
      { id: "urgency-bg", type: "rect", name: "Urgency Banner", x: 0, y: 0, width: 1080, height: 120, fill: "#dc2626", borderRadius: 0 },
      { id: "urgency-text", type: "text", name: "Urgency Text", x: 60, y: 35, width: 960, text: "LIMITED TIME OFFER - 50% OFF", fontSize: 32, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff", textAlign: "center" },
      
      // Main Content
      { id: "headline", type: "text", name: "Main Headline", x: 60, y: 180, width: 960, text: "Special Launch Price", fontSize: 56, fontFamily: "Arial", fontWeight: "bold", fill: "#1f2937", textAlign: "center" },
      
      // Pricing
      { id: "old-price", type: "text", name: "Old Price", x: 60, y: 320, width: 960, text: "Usually $199", fontSize: 36, fontFamily: "Arial", fontWeight: "normal", fill: "#6b7280", textAlign: "center", textDecoration: "line-through" },
      { id: "new-price", type: "text", name: "New Price", x: 60, y: 380, width: 960, text: "Today Only: $99", fontSize: 64, fontFamily: "Arial", fontWeight: "bold", fill: "#dc2626", textAlign: "center" },
      
      // Features
      { id: "features-bg", type: "rect", name: "Features Background", x: 60, y: 500, width: 960, height: 400, fill: "#ffffff", borderRadius: 20 },
      { id: "features", type: "text", name: "Features List", x: 100, y: 550, width: 880, text: "✓ Feature 1\n✓ Feature 2\n✓ Feature 3\n✓ Bonus Feature", fontSize: 28, fontFamily: "Arial", fill: "#059669", textAlign: "left" },
      
      // Guarantee
      { id: "guarantee-bg", type: "rect", name: "Guarantee Background", x: 60, y: 950, width: 960, height: 100, fill: "#10b981", borderRadius: 15 },
      { id: "guarantee", type: "text", name: "Guarantee Text", x: 60, y: 975, width: 960, text: "🛡️ 30-Day Money Back Guarantee", fontSize: 24, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff", textAlign: "center" },
      
      // CTA
      { id: "cta-button", type: "rect", name: "CTA Button", x: 340, y: 1150, width: 400, height: 80, fill: "#dc2626", borderRadius: 40 },
      { id: "cta-text", type: "text", name: "CTA Text", x: 340, y: 1165, width: 400, text: "CLAIM DISCOUNT", fontSize: 28, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff", textAlign: "center" }
    ]
  },
  "Ugly_Ad": {
    frame: { width: 1080, height: 1350, backgroundColor: "#ffffff" },
    layers: [
      // Simple, direct design
      { id: "attention", type: "text", name: "Attention Grabber", x: 60, y: 100, width: 960, text: "ATTENTION:", fontSize: 48, fontFamily: "Arial", fontWeight: "bold", fill: "#dc2626", textAlign: "left" },
      { id: "headline", type: "text", name: "Direct Headline", x: 60, y: 200, width: 960, text: "Stop Wasting Money on [Problem]", fontSize: 52, fontFamily: "Arial", fontWeight: "bold", fill: "#000000", textAlign: "left" },
      { id: "subheadline", type: "text", name: "Subheadline", x: 60, y: 350, width: 960, text: "Here's the simple solution that actually works:", fontSize: 28, fontFamily: "Arial", fill: "#374151", textAlign: "left" },
      { id: "bullet-points", type: "text", name: "Bullet Points", x: 60, y: 450, width: 960, text: "→ Benefit 1\n→ Benefit 2\n→ Benefit 3", fontSize: 24, fontFamily: "Arial", fill: "#000000", textAlign: "left" },
      { id: "proof", type: "text", name: "Social Proof", x: 60, y: 650, width: 960, text: "⭐⭐⭐⭐⭐ \"This actually works!\" - Customer Name", fontSize: 22, fontFamily: "Arial", fill: "#059669", textAlign: "left" },
      { id: "urgency", type: "text", name: "Urgency", x: 60, y: 750, width: 960, text: "Limited time: Get it for 50% off", fontSize: 32, fontFamily: "Arial", fontWeight: "bold", fill: "#dc2626", textAlign: "left" },
      { id: "cta-button", type: "rect", name: "CTA Button", x: 60, y: 850, width: 300, height: 60, fill: "#f59e0b", borderRadius: 5 },
      { id: "cta-text", type: "text", name: "CTA Text", x: 60, y: 865, width: 300, text: "GET IT NOW →", fontSize: 24, fontFamily: "Arial", fontWeight: "bold", fill: "#000000", textAlign: "center" },
      { id: "disclaimer", type: "text", name: "Disclaimer", x: 60, y: 950, width: 960, text: "P.S. Don't wait - price goes back up tomorrow", fontSize: 18, fontFamily: "Arial", fill: "#6b7280", textAlign: "left" }
    ]
  }
};

export default function AdBuilder() {
  // History state for undo/redo
  const [history, setHistory] = useState([_.cloneDeep({
    frame: { width: 1080, height: 1350, backgroundColor: "#ffffff" },
    layers: []
  })]);
  const [historyIndex, setHistoryIndex] = useState(0); // Start at index 0 for the initial empty design

  const [adData, setAdData] = useState({
    name: "Untitled Ad Campaign",
    ad_type: "",
    status: "draft",
    brand: {},
    message_blocks: {},
    design: history[historyIndex] // Initialize with the first history entry
  });
  const [currentOrgId, setCurrentOrgId] = useState(null);
  const [selectedLayerIds, setSelectedLayerIds] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  // Removed activeTab state, now managed by AdSidebar
  const [propertiesPanelWidth, setPropertiesPanelWidth] = useState(320);
  const [propertiesPanelPosition, setPropertiesPanelPosition] = useState({ x: window.innerWidth - 420, y: 100 });
  const [clipboard, setClipboard] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const previewRef = useRef();
  
  const [currentBrandKit, setCurrentBrandKit] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showMagicResizeModal, setShowMagicResizeModal] = useState(false);

  const [panelDragState, setPanelDragState] = useState({
    isDragging: false,
    isResizing: false,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startPanelX: 0,
    startPanelY: 0
  });

  const MIN_PANEL_WIDTH = 280;
  const MAX_PANEL_WIDTH = 600;

  // Update ad data and save to history
  const updateAdDataWithHistory = useCallback((newDesign) => {
    // Slice off any "future" history if we're in the middle of undo/redo
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(_.cloneDeep(newDesign));
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  }, [history, historyIndex]);

  // Sync adData.design with current history entry
  useEffect(() => {
    setAdData(prev => ({ ...prev, design: _.cloneDeep(history[historyIndex]) }));
  }, [history, historyIndex]);

  const applyBrandToTemplate = (design, brandKit) => {
    if (!design || !brandKit) return design;

    const newDesign = _.cloneDeep(design);

    const applyBrandToLayer = (layer) => {
        if (layer.type === 'text') {
            // Apply fonts based on a simple size heuristic
            layer.fontFamily = layer.fontSize > 32 ? brandKit.headingFont : brandKit.bodyFont;
            
            // Only replace default-looking dark text colors with the brand's text color
            const defaultTextColors = ['#000000', '#1f2937', '#333333', '#6b7280'];
            if (defaultTextColors.includes((layer.fill || '').toLowerCase())) {
                layer.fill = brandKit.textColor;
            }
        } else if (layer.type === 'rect' || layer.type === 'circle') { // Apply to circle as well
            // Replace common template colors with brand colors
            const defaultPrimaryColors = ['#3b82f6', '#1e293b']; // Primary button blue, dark background
            const defaultAccentColors = ['#ef4444', '#f59e0b', '#dc2626', '#10b981', '#fee2e2', '#d1fae5']; // Red, orange, green accents, and common template backgrounds
            const fillLower = (layer.fill || '').toLowerCase();

            if (defaultPrimaryColors.includes(fillLower)) {
                layer.fill = brandKit.primaryColor;
            } else if (defaultAccentColors.includes(fillLower)) {
                layer.fill = brandKit.accentColor;
            }
        } else if (layer.type === 'image' && (layer.id?.toLowerCase().includes('logo') || layer.name?.toLowerCase().includes('logo')) && brandKit.logoUrl) {
            // Replace placeholder logos
            layer.src = brandKit.logoUrl;
        } else if (layer.type === 'group' && layer.layers) {
            // Recurse into groups
            layer.layers.forEach(applyBrandToLayer);
        }
    };

    newDesign.layers.forEach(applyBrandToLayer);

    // Replace default light background colors
    const defaultBgColors = ['#ffffff', '#f8fafc', '#f1f5f9', '#fef3c7']; // Template backgrounds that are generally light or neutral
    if (defaultBgColors.includes((newDesign.frame.backgroundColor || '').toLowerCase())) {
        newDesign.frame.backgroundColor = brandKit.backgroundColor;
    }

    return newDesign;
  };

  const getAdTypeInstructions = (adType) => {
    const instructions = {
      "Problem_Solution": {
        persona: "You are a direct response copywriter. Your goal is to agitate a user's problem and present a clear solution.",
        task: "Generate a `headline` that states the problem, a `description` that elaborates on the pain points, and a `solution_headline` that introduces the solution. The `solution_description` should explain how the product resolves the specific problem mentioned.",
        schema: {
          headline: { type: "string" },
          description: { type: "string" },
          solution_headline: { type: "string" },
          solution_description: { type: "string" },
          call_to_action: { type: "string" },
        }
      },
      "Before_After": {
        persona: "You are a visual storyteller. Your task is to paint a vivid picture of transformation.",
        task: "Generate a compelling main `headline`. Then, create a list of `before_problems` (as an array of strings describing the 'before' state) and a list of `after_benefits` (as an array of strings describing the 'after' state).",
        schema: {
          headline: { type: "string" },
          before_problems: { type: "array", items: { type: "string" } },
          after_benefits: { type: "array", items: { type: "string" } },
          call_to_action: { type: "string" },
        }
      },
      "Us_Vs_Them": {
        persona: "You are a competitive positioning expert. Your goal is to clearly differentiate our product from the competition.",
        task: "Generate a `headline` that introduces the comparison. Create a list of `competitor_cons` (what's wrong with their way, as an array of strings) and a list of `our_pros` (how we are better, as an array of strings).",
        schema: {
          headline: { type: "string" },
          competitor_cons: { type: "array", items: { type: "string" } },
          our_pros: { type: "array", items: { type: "string" } },
          call_to_action: { type: "string" },
        }
      },
      "Special_Pricing": {
        persona: "You are a sales and marketing expert. Your goal is to create urgency and highlight value for a special offer.",
        task: "Generate a compelling `headline` for the special pricing. Provide `urgency_text` for a banner. Generate `call_to_action` for the offer. Also, generate a list of `key_features` (as an array of strings) that justify the value.",
        schema: {
          headline: { type: "string" },
          urgency_text: { type: "string" },
          call_to_action: { type: "string" },
          key_features: { type: "array", items: { type: "string" } },
        }
      },
      "Ugly_Ad": {
        persona: "You are a raw, direct response marketer. Your goal is to interrupt, educate, and convert without pretty visuals.",
        task: "Generate a hard-hitting `attention_grabber` (e.g., 'ATTENTION:'), a direct `headline` that states a problem, a `subheadline` offering a solution, `bullet_points` (as an array of strings) detailing benefits, and a clear `call_to_action`.",
        schema: {
          attention_grabber: { type: "string" },
          headline: { type: "string" },
          subheadline: { type: "string" },
          bullet_points: { type: "array", items: { type: "string" } },
          call_to_action: { type: "string" },
        }
      },
      // Fallback for other types
      "default": {
        persona: "You are an expert marketing copywriter.",
        task: "Generate a compelling `headline`, a persuasive `description`, and a strong `call_to_action`.",
        schema: {
          headline: { type: "string" },
          description: { type: "string" },
          call_to_action: { type: "string" },
        }
      }
    };
    return instructions[adType] || instructions["default"];
  };
  
  const buildAIPrompt = (wizardData) => {
    const { industry, brandName, productService, targetAudience, primaryBenefit, funnelStage, selectedAdType } = wizardData;
    const adTypeInstructions = getAdTypeInstructions(selectedAdType);

    return `
      **AI Persona:** ${adTypeInstructions.persona}

      **Ad Context:**
      - **Brand Name:** ${brandName}
      - **Industry:** ${industry}
      - **Product/Service:** ${productService}
      - **Target Audience:** ${targetAudience}
      - **Primary Benefit/Value Prop:** ${primaryBenefit}
      - **Marketing Funnel Stage:** ${funnelStage}
      - **Ad Type:** ${selectedAdType}

      **Your Task:**
      ${adTypeInstructions.task}
      
      Ensure the copy is persuasive, tailored to the target audience, and reflects the specified brand and product. The tone should be appropriate for the funnel stage.
    `;
  };

  const updateTemplateWithAIContent = (template, aiContent) => {
      const newLayers = template.layers.map(layer => {
          // Clone layer to avoid direct mutation
          const updatedLayer = { ...layer }; 
          const layerId = layer.id || '';
          
          if (updatedLayer.type !== 'text') return updatedLayer;
          
          let newText = updatedLayer.text; // Default to existing text
          
          // General mapping based on common AI output fields
          if (layerId.includes('headline') && aiContent.headline) newText = aiContent.headline;
          if (layerId.includes('subheadline') && aiContent.subheadline) newText = aiContent.subheadline;
          if (layerId.includes('description') && aiContent.description) newText = aiContent.description;
          if (layerId.includes('cta-text') && aiContent.call_to_action) newText = aiContent.call_to_action;
          
          // Ad-type specific mappings
          // Problem_Solution
          if (layerId.includes('solution-headline') && aiContent.solution_headline) newText = aiContent.solution_headline;
          if (layerId.includes('solution-description') && aiContent.solution_description) newText = aiContent.solution_description;

          // Before_After
          if (layerId.includes('before-problems') && Array.isArray(aiContent.before_problems)) {
            newText = aiContent.before_problems.map(item => `• ${item}`).join('\n');
          }
          if (layerId.includes('after-benefits') && Array.isArray(aiContent.after_benefits)) {
            newText = aiContent.after_benefits.map(item => `✓ ${item}`).join('\n');
          }

          // Us_Vs_Them
          if (layerId.includes('competitor-cons') && Array.isArray(aiContent.competitor_cons)) {
            newText = aiContent.competitor_cons.map(item => `✗ ${item}`).join('\n');
          }
          if (layerId.includes('our-pros') && Array.isArray(aiContent.our_pros)) {
            newText = aiContent.our_pros.map(item => `✓ ${item}`).join('\n');
          }
          
          // Special_Pricing
          if (layerId.includes('urgency') && aiContent.urgency_text) newText = aiContent.urgency_text;
          if (layerId.includes('features') && Array.isArray(aiContent.key_features)) { // Note: 'features' layer in Special_Pricing template, ai output is 'key_features'
            newText = aiContent.key_features.map(item => `✓ ${item}`).join('\n');
          }

          // Ugly_Ad
          if (layerId.includes('attention') && aiContent.attention_grabber) newText = aiContent.attention_grabber;
          if (layerId.includes('bullet-points') && Array.isArray(aiContent.bullet_points)) {
            newText = aiContent.bullet_points.map(item => `→ ${item}`).join('\n');
          }
          // The Ugly_Ad template also has 'proof', 'urgency', 'disclaimer' - if AI generated these, they'd be mapped.
          // For now, these are not in the AI schema, so they'd remain as template defaults.

          // Update brand name for Us_Vs_Them if AI provides it, otherwise default
          if (layerId === 'brand-name' && aiContent.brand_name) {
              newText = aiContent.brand_name.toUpperCase();
          }

          return { ...updatedLayer, text: newText };
      });
      return { ...template, layers: newLayers };
  };

  const handleAIGeneration = async (wizardData, brandKit) => {
    try {
      const { InvokeLLM } = await import('@/api/integrations');
      
      const adTypeInstructions = getAdTypeInstructions(wizardData.selectedAdType);
      const prompt = buildAIPrompt(wizardData);
      const responseSchema = { type: "object", properties: adTypeInstructions.schema };

      const aiContent = await InvokeLLM({
        prompt: prompt,
        response_json_schema: responseSchema,
      });

      const templateConfig = _.cloneDeep(AD_TEMPLATES[wizardData.selectedAdType] || AD_TEMPLATES["Problem_Solution"]);
      const populatedDesign = updateTemplateWithAIContent(templateConfig, aiContent);

      const finalDesign = brandKit ? applyBrandToTemplate(populatedDesign, brandKit) : populatedDesign;

      const newAdData = {
        name: `AI: ${wizardData.brandName} - ${wizardData.selectedAdType.replace(/_/g, ' ')}`,
        ad_type: wizardData.selectedAdType,
        status: "draft",
        industry: wizardData.industry,
        target_audience: wizardData.targetAudience,
        funnel_stage: wizardData.funnelStage,
        brand: { name: wizardData.brandName },
        message_blocks: aiContent,
        design: finalDesign
      };
      
      setAdData(newAdData);
      updateAdDataWithHistory(newAdData.design);
      
    } catch (error) {
      console.error("AI generation failed:", error);
      alert("AI generation failed. Please try again or use a template.");
      const templateConfig = AD_TEMPLATES[wizardData.selectedAdType] || AD_TEMPLATES["Problem_Solution"];
      const finalDesign = brandKit ? applyBrandToTemplate(templateConfig, brandKit) : templateConfig;
      const newAdData = {
        name: `New ${wizardData.selectedAdType.replace(/_/g, ' ')} Campaign`,
        ad_type: wizardData.selectedAdType,
        status: "draft",
        brand: { name: wizardData.brandName },
        message_blocks: {},
        design: finalDesign
      };
      setAdData(newAdData);
      updateAdDataWithHistory(finalDesign);
    }
  };

  const loadCurrentOrganization = async () => {
    try {
      const user = await User.me();
      setCurrentOrgId(user.current_organization_id);
      if (user.current_organization_id) {
          const orgs = await Organization.list();
          const currentOrg = orgs.find(o => o.id === user.current_organization_id);
          if (currentOrg && currentOrg.settings) {
              const brandKit = {
                  ...currentOrg.settings.theme,
                  logoUrl: currentOrg.settings.branding?.logoUrl,
              };
              setCurrentBrandKit(brandKit);
              return brandKit;
          }
      }
    } catch (error) {
      console.error("Error loading current organization:", error);
    }
    return null;
  };

  useEffect(() => {
    const initialize = async () => {
        const brandKit = await loadCurrentOrganization();

        const editingCampaignJson = sessionStorage.getItem('editingAdCampaign');
        if (editingCampaignJson) {
            const campaign = JSON.parse(editingCampaignJson);
            setAdData(campaign);
            updateAdDataWithHistory(campaign.design);
            sessionStorage.removeItem('editingAdCampaign');
            return;
        }

        const wizardDataJson = sessionStorage.getItem('adWizardData');
        if (wizardDataJson) {
            const wizardData = JSON.parse(wizardDataJson);
            await handleAIGeneration(wizardData, brandKit);
            sessionStorage.removeItem('adWizardData');
            return;
        }

        const templateJson = sessionStorage.getItem('selectedAdTemplate');
        if (templateJson) {
            const template = JSON.parse(templateJson);
            const templateConfig = _.cloneDeep(AD_TEMPLATES[template.ad_type] || AD_TEMPLATES["Problem_Solution"]);
            
            const finalDesign = brandKit ? applyBrandToTemplate(templateConfig, brandKit) : templateConfig;
            
            const newAdData = {
              name: `New ${template.name} Campaign`,
              ad_type: template.ad_type,
              status: "draft",
              brand: {},
              message_blocks: {},
              design: finalDesign
            };
            setAdData(newAdData);
            updateAdDataWithHistory(finalDesign);
            sessionStorage.removeItem('selectedAdTemplate');
        }
    };
    initialize();
  }, []);

  const saveCampaign = async () => {
    if (!currentOrgId) {
      alert('No organization selected');
      return;
    }
    try {
      const payload = { ...adData, organization_id: currentOrgId };
      if (adData.id) {
        await AdCampaign.update(adData.id, payload);
      } else {
        const savedCampaign = await AdCampaign.create(payload);
        setAdData(prev => ({ ...prev, id: savedCampaign.id }));
      }
      alert('Campaign saved successfully!');
    } catch (error) {
      console.error("Error saving campaign:", error);
      alert('Error saving campaign.');
    }
  };

  const exportAsImage = () => {
    if (previewRef.current) {
      html2canvas(previewRef.current.querySelector('.ad-canvas'), {
        useCORS: true,
        scale: 2,
        backgroundColor: adData.design.frame.backgroundColor,
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `${adData.name || 'ad'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  const handleMagicResize = async (resizedVersions) => {
    try {
      // Save each resized version as a new campaign
      for (const version of resizedVersions) {
        const newCampaignData = {
          ...adData,
          id: undefined, // Remove ID to create new campaign
          name: version.name,
          design: version.design,
          status: "draft"
        };
        
        await AdCampaign.create({ ...newCampaignData, organization_id: currentOrgId });
      }
      
      alert(`Successfully created ${resizedVersions.length} resized version${resizedVersions.length > 1 ? 's' : ''}!`);
    } catch (error) {
      console.error("Error creating resized versions:", error);
      alert("Error creating resized versions. Please try again.");
    }
  };

  // Helper function to find a layer recursively
  const findLayer = (layers, layerId) => {
    for (const layer of layers) {
      if (layer.id === layerId) return layer;
      if (layer.type === 'group' && layer.layers) {
        const found = findLayer(layer.layers, layerId);
        if (found) return found;
      }
    }
    return null;
  };

  // Helper function to find a layer and its parent
  const findLayerAndParent = (layers, targetId, parent = null) => {
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      if (layer.id === targetId) {
        return { layer, parent, index: i, parentLayers: layers };
      }
      if (layer.type === 'group' && layer.layers) {
        const found = findLayerAndParent(layer.layers, targetId, layer);
        if (found.layer) return found;
      }
    }
    return { layer: null, parent: null, index: -1, parentLayers: null };
  };

  const updateLayer = useCallback((layerId, updates) => {
    const newDesign = _.cloneDeep(adData.design);
    const layerToUpdate = findLayer(newDesign.layers, layerId);

    if (layerToUpdate) {
      Object.assign(layerToUpdate, updates);
      updateAdDataWithHistory(newDesign);
    }
  }, [adData.design, updateAdDataWithHistory]);

  const updateMultipleLayers = useCallback((updatesArray) => {
    const newDesign = _.cloneDeep(adData.design);
    updatesArray.forEach(({ id, updates }) => {
      const layerToUpdate = findLayer(newDesign.layers, id);
      if (layerToUpdate) {
        Object.assign(layerToUpdate, updates);
      }
    });
    updateAdDataWithHistory(newDesign);
  }, [adData.design, updateAdDataWithHistory]);

  const updateFrame = useCallback((updates) => {
    const newDesign = {
      ...adData.design,
      frame: { ...adData.design.frame, ...updates }
    };
    updateAdDataWithHistory(newDesign);
  }, [adData.design, updateAdDataWithHistory]);

  const addElement = useCallback((element) => {
    const newElement = {
      ...element,
      id: `${element.type}_${Date.now()}`,
      x: adData.design.frame.width / 2 - (element.width || 100) / 2,
      y: adData.design.frame.height / 2 - (element.height || 50) / 2
    };

    const newDesign = {
      ...adData.design,
      layers: [...adData.design.layers, newElement]
    };

    updateAdDataWithHistory(newDesign);
    setSelectedLayerIds([newElement.id]);
  }, [adData.design, updateAdDataWithHistory]);

  const deleteSelectedElements = useCallback(() => {
    if (selectedLayerIds.length === 0) return;

    const newDesign = _.cloneDeep(adData.design);

    // Recursive function to filter out layers by ID
    const deleteFromLayers = (layers, idsToDelete) => {
      // Iterate backwards to safely remove elements
      for (let i = layers.length - 1; i >= 0; i--) {
        if (idsToDelete.includes(layers[i].id)) {
          layers.splice(i, 1);
        } else if (layers[i].type === 'group' && layers[i].layers) {
          deleteFromLayers(layers[i].layers, idsToDelete); // Recurse into groups
        }
      }
    };

    deleteFromLayers(newDesign.layers, selectedLayerIds);
    updateAdDataWithHistory(newDesign);
    setSelectedLayerIds([]);
  }, [selectedLayerIds, adData.design, updateAdDataWithHistory]);

  const handleCopySelected = useCallback(() => {
    if (selectedLayerIds.length === 0) return;
    // For now, we'll just copy the first selected layer.
    // A more advanced implementation could copy multiple layers.
    const layerToCopy = findLayer(adData.design.layers, selectedLayerIds[0]);
    if (layerToCopy) {
      setClipboard(_.cloneDeep(layerToCopy));
    }
  }, [selectedLayerIds, adData.design]);

  const handleLayerOrderChange = useCallback((layerId, direction) => {
    const newDesign = _.cloneDeep(adData.design);
    const { layer, parentLayers, index } = findLayerAndParent(newDesign.layers, layerId);

    if (!layer || !parentLayers || index === -1) return;

    // Remove from current position
    parentLayers.splice(index, 1);

    // Add to new position
    switch (direction) {
      case 'front':
        parentLayers.push(layer);
        break;
      case 'back':
        parentLayers.unshift(layer);
        break;
      case 'forward':
        parentLayers.splice(Math.min(index + 1, parentLayers.length), 0, layer);
        break;
      case 'backward':
        parentLayers.splice(Math.max(index - 1, 0), 0, layer);
        break;
      default:
        parentLayers.splice(index, 0, layer); // Should not happen, re-insert at original position
        break;
    }

    updateAdDataWithHistory(newDesign);
  }, [adData.design, updateAdDataWithHistory]);

  const handlePaste = useCallback((position) => {
    if (!clipboard) return;

    const newElement = {
      ..._.cloneDeep(clipboard),
      id: `${clipboard.type}_${Date.now()}`,
      // Position the pasted element relative to the mouse click, accounting for its size
      x: position.x - (clipboard.width / 2 || clipboard.radius || 25),
      y: position.y - (clipboard.height / 2 || clipboard.radius || 25),
    };

    const newDesign = {
      ...adData.design,
      layers: [...adData.design.layers, newElement]
    };

    updateAdDataWithHistory(newDesign);
    setSelectedLayerIds([newElement.id]);
  }, [clipboard, adData.design, updateAdDataWithHistory]);

  const handleLayerSelect = useCallback((newlySelectedLayerIds, shiftKey) => {
    if (!Array.isArray(newlySelectedLayerIds)) {
      newlySelectedLayerIds = newlySelectedLayerIds ? [newlySelectedLayerIds] : [];
    }

    setSelectedLayerIds(prev => {
      if (shiftKey) {
        const currentSelection = new Set(prev);
        newlySelectedLayerIds.forEach(id => {
          if (currentSelection.has(id)) {
            // If already selected, deselect
            currentSelection.delete(id);
          } else {
            // If not selected, select
            currentSelection.add(id);
          }
        });
        return Array.from(currentSelection);
      } else {
        // If no shift key, just set the selection to the new layers
        return newlySelectedLayerIds;
      }
    });
  }, []);

  const handleGroupLayers = useCallback(() => {
    if (selectedLayerIds.length < 2) return;

    const newDesign = _.cloneDeep(adData.design);
    const layersToGroup = [];

    // Recursive function to extract selected layers from the layer tree
    const extractLayers = (layers, idsToExtract) => {
      for (let i = layers.length - 1; i >= 0; i--) {
        if (idsToExtract.includes(layers[i].id)) {
          layersToGroup.push(layers[i]);
          layers.splice(i, 1); // Remove from current parent
        } else if (layers[i].type === 'group' && layers[i].layers) {
          extractLayers(layers[i].layers, idsToExtract); // Recurse into groups
        }
      }
    };

    // Start extraction from the top-level layers
    extractLayers(newDesign.layers, selectedLayerIds);

    if (layersToGroup.length < 2) {
      // Re-add layers if grouping criteria not met (e.e.g., trying to group less than 2 valid layers)
      // This is a simplified fallback; a real editor might preserve original state more robustly.
      // For now, if we extracted layers but couldn't group, we don't update history.
      return;
    }

    // Calculate bounding box for the new group
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    layersToGroup.forEach(layer => {
      const layerWidth = layer.width || (layer.radius ? layer.radius * 2 : 100); // Default if width is not defined
      const layerHeight = layer.height || (layer.radius ? layer.radius * 2 : 50); // Default if height is not defined
      minX = Math.min(minX, layer.x);
      minY = Math.min(minY, layer.y);
      maxX = Math.max(maxX, layer.x + layerWidth);
      maxY = Math.max(maxY, layer.y + layerHeight);
    });

    const groupWidth = maxX - minX;
    const groupHeight = maxY - minY;

    // Make child positions relative to the new group's top-left corner
    const childLayers = layersToGroup.map(layer => ({
      ...layer,
      x: layer.x - minX,
      y: layer.y - minY,
    }));

    const newGroup = {
      id: `group_${Date.now()}`,
      type: 'group',
      name: 'New Group',
      x: minX,
      y: minY,
      width: groupWidth,
      height: groupHeight,
      rotation: 0,
      layers: childLayers
    };

    newDesign.layers.push(newGroup); // Add the new group to the top-level layers
    updateAdDataWithHistory(newDesign);
    setSelectedLayerIds([newGroup.id]); // Select the newly created group
  }, [selectedLayerIds, adData.design, updateAdDataWithHistory]);

  const handleUngroupLayers = useCallback(() => {
    // Find the first selected layer that is a group
    const groupId = selectedLayerIds.find(id => {
      const layer = findLayer(adData.design.layers, id);
      return layer && layer.type === 'group';
    });

    if (!groupId) return; // No selected group found

    const newDesign = _.cloneDeep(adData.design);
    const { layer: groupLayer, parentLayers, index } = findLayerAndParent(newDesign.layers, groupId);

    if (!groupLayer || groupLayer.type !== 'group' || !parentLayers) return; // Ensure it's a valid group and has a parent

    // Remove the group from its parent's layers array
    parentLayers.splice(index, 1);

    // Convert child positions back to absolute and add them to the same parent
    const ungroupedLayers = groupLayer.layers.map(child => ({
      ...child,
      x: groupLayer.x + child.x,
      y: groupLayer.y + child.y,
    }));

    parentLayers.push(...ungroupedLayers); // Add the ungrouped layers to the same parent array

    updateAdDataWithHistory(newDesign);
    setSelectedLayerIds(ungroupedLayers.map(l => l.id)); // Select the newly ungrouped layers
  }, [selectedLayerIds, adData.design, updateAdDataWithHistory]);

  const handleUpdateGroupOrder = useCallback((groupId, reorderedChildren) => {
    const newDesign = _.cloneDeep(adData.design);
    const group = findLayer(newDesign.layers, groupId);
    if (group && group.type === 'group') {
      group.layers = reorderedChildren; // Update the layers within the group
      updateAdDataWithHistory(newDesign);
    }
  }, [adData.design, updateAdDataWithHistory]);
  
  const handleLayerReorder = useCallback((result) => {
    if (!result.destination) return;
    
    const newDesign = _.cloneDeep(adData.design);
    const [reorderedItem] = newDesign.layers.splice(result.source.index, 1);
    newDesign.layers.splice(result.destination.index, 0, reorderedItem);
    
    updateAdDataWithHistory(newDesign);
  }, [adData.design, updateAdDataWithHistory]);

  // Undo/Redo functions
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSelectedLayerIds([]); // Clear selection on undo
    }
  }, [historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSelectedLayerIds([]); // Clear selection on redo
    }
  }, [historyIndex, history.length]);
  
  const handleRestoreVersion = useCallback((designToRestore) => {
    // When restoring a version, reset the history to that single state.
    // This effectively creates a new history branch starting from the restored design.
    const newHistory = [_.cloneDeep(designToRestore)];
    setHistory(newHistory);
    setHistoryIndex(0);
    setSelectedLayerIds([]); // Clear selection to prevent issues with old layer IDs
    // The main useEffect will sync this new state with adData.design
  }, []);

  const handleApplyBrandKit = useCallback((brandKitToApply) => {
    const newDesign = applyBrandToTemplate(adData.design, brandKitToApply);
    updateAdDataWithHistory(newDesign);
    alert('Brand kit applied successfully!');
  }, [adData.design, updateAdDataWithHistory]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Prevent shortcuts from firing when typing in input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Group/Ungroup shortcuts
      if (modKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        if (e.shiftKey) {
          handleUngroupLayers();
        } else {
          handleGroupLayers();
        }
      }

      // Undo/Redo shortcuts
      if (modKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }

      // Delete shortcut
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedLayerIds.length > 0) {
        e.preventDefault();
        deleteSelectedElements();
      }

      // Layering shortcuts (only for single selected layer)
      if (selectedLayerIds.length === 1) {
        const layerId = selectedLayerIds[0];
        if (modKey && e.shiftKey && e.key === ']') { // Cmd/Ctrl + Shift + ] (Bring to Front)
          e.preventDefault();
          handleLayerOrderChange(layerId, 'front');
        } else if (modKey && e.shiftKey && e.key === '[') { // Cmd/Ctrl + Shift + [ (Send to Back)
          e.preventDefault();
          handleLayerOrderChange(layerId, 'back');
        } else if (e.shiftKey && e.key === ']') { // Shift + ] (Bring Forward)
          e.preventDefault();
          handleLayerOrderChange(layerId, 'forward');
        } else if (e.shiftKey && e.key === '[') { // Shift + [ (Send Backward)
          e.preventDefault();
          handleLayerOrderChange(layerId, 'backward');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLayerIds, handleGroupLayers, handleUngroupLayers, handleUndo, handleRedo, deleteSelectedElements, handleLayerOrderChange]);

  const handlePanelMouseDown = useCallback((e, type) => {
    e.preventDefault();
    e.stopPropagation();

    setPanelDragState({
      isDragging: type === 'drag',
      isResizing: type === 'resize',
      startX: e.clientX,
      startY: e.clientY,
      startWidth: propertiesPanelWidth,
      startPanelX: propertiesPanelPosition.x,
      startPanelY: propertiesPanelPosition.y,
    });
  }, [propertiesPanelWidth, propertiesPanelPosition]);

  const handlePanelMouseMove = useCallback((e) => {
    if (panelDragState.isDragging) {
      const dx = e.clientX - panelDragState.startX;
      const dy = e.clientY - panelDragState.startY;
      setPropertiesPanelPosition({
        x: Math.max(0, Math.min(window.innerWidth - propertiesPanelWidth, panelDragState.startPanelX + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 600, panelDragState.startPanelY + dy)) // Cap at window bottom minus panel height
      });
    } else if (panelDragState.isResizing) {
      const dx = e.clientX - panelDragState.startX;
      const newWidth = Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, panelDragState.startWidth - dx));
      setPropertiesPanelWidth(newWidth);
    }
  }, [panelDragState, propertiesPanelWidth]);

  const handlePanelMouseUp = useCallback(() => {
    setPanelDragState(prev => ({ ...prev, isDragging: false, isResizing: false }));
  }, []);

  useEffect(() => {
    if (panelDragState.isDragging || panelDragState.isResizing) {
      document.addEventListener('mousemove', handlePanelMouseMove);
      document.addEventListener('mouseup', handlePanelMouseUp);
      return () => {
        document.removeEventListener('mousemove', handlePanelMouseMove);
        document.removeEventListener('mouseup', handlePanelMouseUp);
      };
    }
  }, [panelDragState.isDragging, panelDragState.isResizing, handlePanelMouseMove, handlePanelMouseUp]);

  if (!currentOrgId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // Get the actual selected layers based on their IDs from the current design
  const selectedLayers = selectedLayerIds.map(id => findLayer(adData.design.layers, id)).filter(Boolean);
  const formatName = getFormatName(adData.design.frame.width, adData.design.frame.height);

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center space-x-4">
          <Link to={createPageUrl("AdCampaigns")} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
            <Home className="w-5 h-5" />
          </Link>
          <div className="h-6 w-px bg-gray-300"></div>
          <Input
            value={adData.name}
            onChange={(e) => setAdData({ ...adData, name: e.target.value })}
            className="font-semibold text-lg border-0 px-2 focus-visible:ring-0 shadow-none bg-transparent min-w-[300px]"
            placeholder="Untitled design"
          />
          <Badge variant="outline" className="text-xs whitespace-nowrap">
            {formatName ? `${formatName} - ` : ''}
            {adData.design.frame.width} × {adData.design.frame.height}
          </Badge>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
          >
            <Redo className="w-4 h-4" />
          </Button>
          <div className="h-6 w-px bg-gray-300"></div>
          <VersionHistory 
            campaignId={adData.id}
            currentDesign={adData.design}
            onRestoreVersion={handleRestoreVersion}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-gray-600 hover:text-gray-900"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowMagicResizeModal(true)}
            className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100 text-purple-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Magic Resize
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowExportModal(true)}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={saveCampaign} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className={`flex-1 flex overflow-hidden ${isFullscreen ? 'absolute inset-0 top-[57px] bg-gray-100' : ''}`}>
        {!isFullscreen && (
            <AdSidebar
                onAddElement={addElement}
                layers={adData.design.layers}
                selectedLayerIds={selectedLayerIds}
                onLayerSelect={handleLayerSelect}
                onToggleVisibility={id => updateLayer(id, { isVisible: !findLayer(adData.design.layers, id)?.isVisible })}
                onToggleLock={id => updateLayer(id, { isLocked: !findLayer(adData.design.layers, id)?.isLocked })}
                onReorder={handleLayerReorder}
                design={adData.design}
                adType={adData.ad_type}
                onUpdateDesign={updateAdDataWithHistory}
                onApplyBrandKit={handleApplyBrandKit}
                currentBrandKit={currentBrandKit}
                onBrandKitChange={setCurrentBrandKit}
                frame={adData.design.frame}
                onUpdateFrame={updateFrame}
            />
        )}

        {/* Main Content Area */}
        <main className="flex-1 bg-gray-100 overflow-auto">
          <div className="flex items-center justify-center p-8 min-h-full">
            <AdPreview
              ref={previewRef}
              design={adData.design}
              selectedLayerIds={selectedLayerIds}
              clipboard={clipboard}
              onLayerSelect={handleLayerSelect}
              onLayerUpdate={updateLayer}
              onUpdateMultipleLayers={updateMultipleLayers}
              onLayerOrderChange={handleLayerOrderChange}
              onCopy={handleCopySelected}
              onPaste={handlePaste}
              onDelete={deleteSelectedElements}
              onGroup={handleGroupLayers}
              onUngroup={handleUngroupLayers}
              zoomLevel={zoomLevel}
            />
          </div>
        </main>
      </div>

      {/* Floating Zoom Controls */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2 flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoomLevel(Math.max(0.1, zoomLevel - 0.1))}
            className="h-6 w-6 p-0 text-gray-600 hover:bg-gray-100"
          >
            -
          </Button>
          <span className="text-xs font-medium text-gray-700 min-w-[35px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
            className="h-6 w-6 p-0 text-gray-600 hover:bg-gray-100"
          >
            +
          </Button>
          <div className="h-4 w-px bg-gray-300 mx-1"></div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoomLevel(1.0)}
            className="h-6 px-2 py-0 text-xs text-gray-600 hover:bg-gray-100"
          >
            Fit
          </Button>
        </div>
      </div>

      {/* Floating Properties Panel */}
      {selectedLayers.length > 0 && (
        <div
          className="fixed bg-white border border-gray-200 shadow-2xl rounded-lg z-50 flex flex-col"
          style={{
            left: `${propertiesPanelPosition.x}px`,
            top: `${propertiesPanelPosition.y}px`,
            width: `${propertiesPanelWidth}px`,
            height: '600px', // Fixed height for consistency or could be dynamic
            maxWidth: '90vw',
            maxHeight: '80vh'
          }}
        >
          <div
            className="flex items-center justify-between p-3 border-b border-gray-200 cursor-move bg-gray-50 rounded-t-lg"
            onMouseDown={(e) => handlePanelMouseDown(e, 'drag')}
          >
            <h3 className="font-semibold text-sm text-gray-900">Properties</h3>
          </div>
          <div className="flex-1 overflow-auto">
            <AdPropertiesPanel
              key={selectedLayerIds.join('-')} // Key changes when selection changes, forcing remount
              selectedLayers={selectedLayers}
              onUpdate={updateLayer}
              onGroup={handleGroupLayers}
              onUngroup={handleUngroupLayers}
              onDelete={deleteSelectedElements}
              onCopy={handleCopySelected}
              onDeselect={() => setSelectedLayerIds([])}
              onUpdateGroupOrder={handleUpdateGroupOrder}
            />
          </div>

          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize bg-gray-300 hover:bg-gray-400"
            onMouseDown={(e) => handlePanelMouseDown(e, 'resize')}
          />
        </div>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        adData={adData}
        previewRef={previewRef}
      />

      {/* Magic Resize Modal */}
      <MagicResizeModal
        isOpen={showMagicResizeModal}
        onClose={() => setShowMagicResizeModal(false)}
        adData={adData}
        onResize={handleMagicResize}
      />
    </div>
  );
}
