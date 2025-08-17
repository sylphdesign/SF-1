
import React, { useState, useCallback, useEffect, useRef } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { LandingPage } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Organization } from "@/api/entities";
import { Undo, Redo, Loader2 } from 'lucide-react';

import BuilderHeader from "../components/builder/BuilderHeader";
import BuilderSidebar from "../components/builder/BuilderSidebar";
import BuilderCanvas from "../components/builder/BuilderCanvas";
import PropertyPanel from "../components/builder/PropertyPanel";
import DevicePreview from "../components/builder/DevicePreview";
import AIContentModal from "../components/builder/AIContentModal";
import AssetManagerModal from "../components/builder/AssetManagerModal";
import { PageVersion } from "@/api/entities";
import _ from 'lodash';

export const UNIVERSAL_BLOCKS = [
  {
    id: "hero_image_split",
    name: "Hero Image Split",
    category: "headers",
    icon: "📖",
    description: "Headline on the left, floating image on the right.",
    defaultContent: {
      headline: "Write Your Headline Here! Make it interesting and eye-catching",
      subHeadline: "A Subheadline That Challenges The Common Beliefs Of Your Audience Here!",
      ctaText: "GET YOUR FREE COPY!",
      image: "https://i.imgur.com/2aTLn0b.png"
    },
    defaultStyles: {
      headline: { fontSize: '48px', fontWeight: 'bold', color: '#1f2937' },
      subHeadline: { fontSize: '18px', opacity: 0.8, color: '#4b5563' },
      button: { backgroundColor: '#2563EB', color: '#FFFFFF', padding: '12px 24px', borderRadius: '4px' },
      image: { borderRadius: '8px' }
    }
  },
  {
    id: "big_promise",
    name: "Hero Promise",
    category: "headers",
    icon: "🎯",
    description: "Bold promise with CTA",
    defaultContent: {
      preHeadline: "THE SOLUTION FOR YOUR BUSINESS",
      headline: "Get Amazing Results and Feel confident",
      subHeadline: "Even if you've struggled before or have doubts",
      ctaText: "Get Started Now",
      guaranteeText: "30-Day Money Back Guarantee"
    },
    defaultStyles: {
      preHeadline: { textTransform: 'uppercase', fontSize: '14px', color: '#6b7280' },
      headline: { fontSize: '48px', fontWeight: 'bold', color: '#1f2937' },
      subHeadline: { fontSize: '18px', opacity: 0.8, color: '#4b5563' },
      button: { backgroundColor: '#2563EB', color: '#FFFFFF', padding: '12px 24px', borderRadius: '4px' },
      guarantee: { fontSize: '12px', opacity: 0.6, color: '#6b7280' }
    }
  },
  {
    id: "checklist_feature",
    name: "Checklist Feature",
    category: "content",
    icon: "✅",
    description: "Highlight key benefits or features with a checklist.",
    defaultContent: {
      headline: "In This FREE Guide You Will Learn:",
      items: [
        "Praesent nec nisi a purus blandit viverra.",
        "Nullam quis ante. In auctor lobortis lacus.",
        "Praesent nec nisi a purus blandit viverra."
      ]
    },
    defaultStyles: {
      headline: { fontSize: '36px', fontWeight: 'bold', color: '#1f2937' },
      item: { fontSize: '18px', color: '#4b5563', lineHeight: '1.8' }
    }
  },
  {
    id: "empathy",
    name: "Problem & Pain",
    category: "content",
    icon: "💔",
    description: "Connect with customer pain points",
    defaultContent: {
      headline: "Struggling with Common Problems?",
      painPoints: [
        "Dealing with overwhelming challenges",
        "Fear of wasting time and money",
        "Not having a clear path forward"
      ]
    },
    defaultStyles: {
      headline: { fontSize: '36px', fontWeight: 'bold', color: '#1f2937' },
      painPoint: { fontSize: '18px', color: '#4b5563', lineHeight: '1.8' }
    }
  },
  {
    id: "authority",
    name: "Authority Story",
    category: "credibility",
    icon: "👑",
    description: "Build trust through personal story",
    defaultContent: {
      profileImage: "https://images.unsplash.com/photo-1557862921-3782951cc4c5?w=100&h=100&fit:crop",
      headline: "Meet Your Guide",
      story: "I used to struggle with the same problems you face, spending countless hours trying to figure it all out with little to no results. After years of trial and error, I discovered a system that changed everything, and now I'm here to share it with you.",
      results: [
        "Achieved remarkable outcome",
        "Helped 1000+ clients",
        "Featured in major publications"
      ]
    },
    defaultStyles: {
      headline: { fontSize: '36px', fontWeight: 'bold', color: '#1f2937' },
      story: { fontSize: '18px', color: '#4b5563', lineHeight: '1.6' },
      result: { fontSize: '16px', color: '#4b5563' },
      profileImage: { borderRadius: '50%', border: '2px solid #3B82F6' }
    }
  },
  {
    id: "sales_video",
    name: "Sales Video",
    category: "content",
    icon: "▶️",
    description: "Embed a sales video with a headline.",
    defaultContent: {
      headline: "Watch This Video To See How We Can Help You",
      subHeadline: "A short, intriguing sentence about the video's content.",
      videoPlaceholder: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=450&fit:crop",
      ctaText: "Get Started Now"
    },
    defaultStyles: {
      headline: { fontSize: '36px', fontWeight: 'bold', color: '#1f2937' },
      subHeadline: { fontSize: '18px', opacity: 0.8, color: '#4b5563' },
      button: { backgroundColor: '#2563EB', color: '#FFFFFF', padding: '12px 24px', borderRadius: '4px' },
      videoPlaceholder: { borderRadius: '8px' }
    }
  },
  {
    id: "vehicle",
    name: "Process Steps",
    category: "content",
    icon: "🚀",
    description: "Show your unique method",
    defaultContent: {
      headline: "The Proven Process",
      steps: [
        { title: "Step 1", description: "First step description" },
        { title: "Step 2", description: "Second step description" },
        { title: "Step 3", description: "Third step description" }
      ]
    },
    defaultStyles: {
      headline: { fontSize: '36px', fontWeight: 'bold', color: '#1f2937' },
      stepTitle: { fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' },
      stepDescription: { fontSize: '16px', color: '#4b5563' }
    }
  },
  {
    id: "image_and_text",
    name: "Image & Text",
    category: "content",
    icon: "🖼️",
    description: "A versatile section with an image and text content.",
    defaultContent: {
      image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit:crop",
      headline: "Headline About This Section",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras sed sapien id massa consectetur.",
      ctaText: "Learn More"
    },
    defaultStyles: {
      headline: { fontSize: '36px', fontWeight: 'bold', color: '#1f2937' },
      text: { fontSize: '18px', color: '#4b5563', lineHeight: '1.6' },
      button: { backgroundColor: '#2563EB', color: '#FFFFFF', padding: '12px 24px', borderRadius: '4px' },
      image: { borderRadius: '8px' }
    }
  },
  {
    id: "opportunity",
    name: "Opportunity",
    category: "content",
    icon: "💡",
    description: "Introduce a better alternative",
    defaultContent: {
      preHeadline: "FINALLY, A PROCESS THAT WORKS",
      headline: "There's a Better Way to Get Results",
      subHeadline: "And it's not doing more of what you've already tried...",
      oldWayTitle: "The old way is frustrating",
      oldWayDescription: "and it doesn't work because it's only causing you more problems...",
      newWayTitle: "Instead, you need a new way to succeed",
      newWayDescription: "so that you can finally experience the dream outcome."
    },
    defaultStyles: {
      preHeadline: { textTransform: 'uppercase', fontSize: '14px', color: '#6b7280' },
      headline: { fontSize: '36px', fontWeight: 'bold', color: '#1f2937' },
      subHeadline: { fontSize: '18px', opacity: 0.8, color: '#4b5563' },
      sectionTitle: { fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' },
      sectionDescription: { fontSize: '16px', color: '#4b5563' }
    }
  },
  {
    id: "usp",
    name: "Before vs. After",
    category: "credibility",
    icon: "📊",
    description: "Contrast the old way with your new way",
    defaultContent: {
      preHeadline: "WHY WE'RE DIFFERENT",
      headline: "See The Transformation",
      beforeItems: [
        "Old, slow, and ineffective method",
        "Frustrating and costly",
        "Produces poor results"
      ],
      afterItems: [
        "New, fast, and revolutionary way",
        "Simple and affordable",
        "Guarantees success"
      ]
    },
    defaultStyles: {
      preHeadline: { textTransform: 'uppercase', fontSize: '14px', color: '#6b7280' },
      headline: { fontSize: '36px', fontWeight: 'bold', color: '#1f2937' },
      item: { fontSize: '18px', color: '#4b5563', lineHeight: '1.8' }
    }
  },
  {
    id: "offer",
    name: "Offer Positioning",
    category: "conversion",
    icon: "🎁",
    description: "Present your core offer and pricing",
    defaultContent: {
      preHeadline: "INTRODUCING, THE ONLY SOLUTION YOU NEED",
      headline: "Get The Ultimate Package",
      rating: 4.9,
      ratingText: "4.9 / 5 stars by 100+ customers",
      title: "Offer Name",
      subtitle: "The #1 solution for your market",
      inclusions: [
        "Main offer stack item 1",
        "Main offer stack item 2",
        "Main offer stack item 3"
      ],
      regularPrice: "$297",
      salePrice: "$147",
      ctaText: "Get Instant Access",
      guaranteeText: "30-Day Money Back Guarantee"
    },
    defaultStyles: {
      preHeadline: { textTransform: 'uppercase', fontSize: '14px', color: '#6b7280' },
      headline: { fontSize: '36px', fontWeight: 'bold', color: '#1f2937' },
      ratingText: { fontSize: '14px', color: '#6b7280' },
      title: { fontSize: '30px', fontWeight: 'bold', color: '#1f2937' },
      subtitle: { fontSize: '18px', color: '#4b5563' },
      inclusion: { fontSize: '16px', color: '#4b5563' },
      regularPrice: { fontSize: '20px', textDecoration: 'line-through', color: '#6b7280' },
      salePrice: { fontSize: '48px', fontWeight: 'bold', color: '#3b82f6' },
      button: { backgroundColor: '#2563EB', color: '#FFFFFF', padding: '16px 32px', borderRadius: '4px' },
      guarantee: { fontSize: '12px', opacity: 0.6, color: '#6b7280' }
    }
  },
  {
    id: "offer_stack",
    name: "Offer Stack",
    category: "conversion",
    icon: "📚",
    description: "Detail the items included in your offer.",
    defaultContent: {
      headline: "Here Is What You'll Get When You Upgrade",
      items: [
        { icon: "📦", title: "Core Product Name", description: "The main solution to their primary problem." },
        { icon: "🎁", title: "Bonus #1: Quickstart Guide", description: "Helps them get results even faster." },
        { icon: "🤝", title: "Bonus #2: Community Access", description: "Connect with like-minded individuals." },
      ]
    },
    defaultStyles: {
      headline: { fontSize: '36px', fontWeight: 'bold', color: '#1f2937' },
      itemIcon: { fontSize: '32px' },
      itemTitle: { fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' },
      itemDescription: { fontSize: '16px', color: '#4b5563' }
    }
  },
  {
    id: "bonuses",
    name: "Bonuses",
    category: "conversion",
    icon: "✨",
    description: "Increase value with exclusive bonuses",
    defaultContent: {
      preHeadline: "PLUS, YOU ALSO GET",
      headline: "Amazing Bonuses When You Act Today",
      bonuses: [
        { title: "Bonus #1: The Quickstart Guide", description: "Get up and running in minutes." },
        { title: "Bonus #2: Private Community Access", description: "Connect with like-minded individuals." },
        { title: "Bonus #3: Expert Checklist", description: "Never miss a critical step." }
      ]
    },
    defaultStyles: {
      preHeadline: { textTransform: 'uppercase', fontSize: '14px', color: '#6b7280' },
      headline: { fontSize: '36px', fontWeight: 'bold', color: '#1f2937' },
      bonusTitle: { fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' },
      bonusDescription: { fontSize: '16px', color: '#4b5563' }
    }
  },
  {
    id: "logo_cloud",
    name: "Logo Cloud",
    category: "credibility",
    icon: "🏢",
    description: "Display logos of companies you've worked with.",
    defaultContent: {
      headline: "AS SEEN ON",
      logos: [
        { src: "https://i.imgur.com/K1k0r2M.png", alt: "Company 1" },
        { src: "https://i.imgur.com/K1k0r2M.png", alt: "Company 2" },
        { src: "https://i.imgur.com/K1k0r2M.png", alt: "Company 3" },
        { src: "https://i.imgur.com/K1k0r2M.png", alt: "Company 4" }
      ]
    },
    defaultStyles: {
      headline: { fontSize: '24px', fontWeight: 'bold', color: '#1f2937', textTransform: 'uppercase' },
      logo: { maxHeight: '60px', filter: 'grayscale(100%) opacity(0.7)' }
    }
  },
  {
    id: "team_showcase",
    name: "Team Showcase",
    category: "credibility",
    icon: "👥",
    description: "Showcase the team behind the product.",
    defaultContent: {
      headline: "Meet Our Experts",
      members: [
        { image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit:crop", name: "John Doe", title: "CEO & Founder" },
        { image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit:crop", name: "Jane Smith", title: "Head of Product" },
        { image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&fit:crop", name: "Mike Johnson", title: "Lead Developer" },
      ]
    },
    defaultStyles: {
      headline: { fontSize: '36px', fontWeight: 'bold', color: '#1f2937' },
      memberName: { fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' },
      memberTitle: { fontSize: '16px', color: '#4b5563' },
      memberImage: { borderRadius: '50%' }
    }
  },
  {
    id: "social_proof",
    name: "Testimonials",
    category: "credibility",
    icon: "⭐",
    description: "Customer success stories",
    defaultContent: {
      headline: "What Customers Say",
      testimonials: [
        { name: "John Smith", text: "Amazing results in just 30 days!", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit:crop" },
        { name: "Sarah Johnson", text: "This changed my business completely.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit:crop" },
        { name: "Mike Davis", text: "Best investment I ever made.", avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=64&h=64&fit:crop" }
      ]
    },
    defaultStyles: {
      headline: { fontSize: '36px', fontWeight: 'bold', color: '#1f2937' },
      testimonialText: { fontSize: '18px', fontStyle: 'italic', color: '#4b5563' },
      testimonialName: { fontSize: '16px', fontWeight: 'bold', color: '#3b82f6' },
      testimonialAvatar: { borderRadius: '50%' }
    }
  },
  {
    id: "video_testimonials",
    name: "Video Testimonials",
    category: "credibility",
    icon: "📹",
    description: "Showcase customer success stories with video.",
    defaultContent: {
        headline: "What others are saying about us",
        testimonials: [
            { videoThumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=225&fit:crop", quote: "Best experience I've had. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras sed sapien", name: "Client Name" },
            { videoThumbnail: "https://images.unsplash.com/photo-1501426026826-31c667bdf23d?w=400&h=225&fit:crop", quote: "This tool changed everything for me. Lorem ipsum dolor sit amet, consectetur adipiscing elit.", name: "Client Name" },
        ]
    },
    defaultStyles: {
        headline: { fontSize: '36px', fontWeight: 'bold', color: '#1f2937' },
        quote: { fontSize: '18px', fontStyle: 'italic', color: '#4b5563' },
        name: { fontSize: '16px', fontWeight: 'bold', color: '#3b82f6' },
        videoThumbnail: { borderRadius: '8px' }
    }
  },
  {
    id: "risk_reversal",
    name: "Risk Reversal",
    category: "credibility",
    icon: "🛡️",
    description: "Eliminate risk with a strong guarantee",
    defaultContent: {
      preHeadline: "TRY IT OUT RISK-FREE",
      headline: "Get a 30-Day No-Questions Money Back Guarantee",
      subHeadline: "That's how confident we are that you'll love your experience.",
      description: "Just say maybe and try us out for 30 days, and if you aren't super excited, we'll give you your money back, no questions asked. Simply email us and we'll handle the rest.",
      sealImage: "https://i.imgur.com/v1S3sSg.png"
    },
    defaultStyles: {
      preHeadline: { textTransform: 'uppercase', fontSize: '14px', color: '#6b7280' },
      headline: { fontSize: '36px', fontWeight: 'bold', color: '#1f2937' },
      subHeadline: { fontSize: '18px', opacity: 0.8, color: '#4b5563' },
      description: { fontSize: '16px', color: '#4b5563', lineHeight: '1.6' },
      sealImage: { maxHeight: '120px' }
    }
  },
  {
    id: "optin_form",
    name: "Opt-in Form",
    category: "conversion",
    icon: "✉️",
    description: "A lead capture form to collect user details.",
    defaultContent: {
      headline: "Enter Your Details Below To Download It Now!",
      namePlaceholder: "Enter Your Name Here",
      emailPlaceholder: "Enter Your Email Address Here",
      ctaText: "GET YOUR FREE COPY",
      securityText: "Your Data Is Secure With Us"
    },
    defaultStyles: {
      headline: { fontSize: '36px', fontWeight: 'bold', color: '#1f2937' },
      input: { padding: '10px 15px', borderRadius: '4px', border: '1px solid #ccc' },
      button: { backgroundColor: '#2563EB', color: '#FFFFFF', padding: '12px 24px', borderRadius: '4px' },
      securityText: { fontSize: '12px', opacity: 0.6, color: '#6b7280' }
    }
  },
  {
    id: "countdown_cta",
    name: "Countdown CTA",
    category: "conversion",
    icon: "⏱️",
    description: "Drive urgency with a countdown timer and CTA.",
    defaultContent: {
      preHeadline: "Once The Timer Hits Zero, This Offer Disappears For Good ⚠️",
      endDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // Set expiry 2 hours from now
      ctaText: "YES! I WANT TO CLAIM THIS EXCLUSIVE OFFER",
      subCtaText: "Ordering here will add XX to your order for just $XX.XX (XX% OFF)"
    },
    defaultStyles: {
      preHeadline: { textTransform: 'uppercase', fontSize: '18px', fontWeight: 'bold', color: '#EF4444' },
      countdown: { fontSize: '48px', fontWeight: 'bold', color: '#1f2937' }, // Placeholder for actual timer style
      button: { backgroundColor: '#2563EB', color: '#FFFFFF', padding: '16px 32px', borderRadius: '4px' },
      subCtaText: { fontSize: '14px', opacity: 0.8, color: '#4b5563' }
    }
  },
  {
    id: "urgency",
    name: "Urgency",
    category: "conversion",
    icon: "⏳",
    description: "Drive immediate action with scarcity",
    defaultContent: {
      preHeadline: "ACT NOW TO SECURE THE DISCOUNT",
      headline: "Time is Running Out, Act Now Before It's Too Late",
      body: "We're currently running a special deal, but it's ending soon so join now before prices go up. You can always ask for a refund later if you're not 100% happy.",
      ctaText: "Get Instant Access"
    },
    defaultStyles: {
      preHeadline: { textTransform: 'uppercase', fontSize: '14px', color: '#6b7280' },
      headline: { fontSize: '36px', fontWeight: 'bold', color: '#EF4444' },
      body: { fontSize: '18px', color: '#4b5563', lineHeight: '1.6' },
      button: { backgroundColor: '#2563EB', color: '#FFFFFF', padding: '12px 24px', borderRadius: '4px' }
    }
  },
  {
    id: "faq",
    name: "FAQ",
    category: "content",
    icon: "❓",
    description: "Address last-minute objections",
    defaultContent: {
      preHeadline: "STILL NOT SURE IF THIS IS FOR YOU?",
      headline: "Frequently Asked Questions",
      faqs: [
        { question: "Who's this perfect for?", answer: "This is perfect for anyone looking to achieve amazing results quickly and efficiently." },
        { question: "What exactly do I get?", answer: "You get access to our complete system, all the bonuses, and our private support community." },
        { question: "Is there a satisfaction guarantee?", answer: "Yes! We offer a 30-day no-questions-asked money-back guarantee. Your satisfaction is our priority." }
      ]
    },
    defaultStyles: {
      preHeadline: { textTransform: 'uppercase', fontSize: '14px', color: '#6b7280' },
      headline: { fontSize: '36px', fontWeight: 'bold', color: '#1f2937' },
      question: { fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' },
      answer: { fontSize: '16px', color: '#4b5563', lineHeight: '1.6' }
    }
  },
  {
    id: "booking_calendar",
    name: "Booking Calendar",
    category: "conversion",
    icon: "🗓️",
    description: "Embed a calendar for booking appointments.",
    defaultContent: {
        headline: "Book your free 1 on 1 strategy call now to create your roadmap",
        description: "Pick a time that works for you. Add this guide to your order for only $XX.XX today.",
        calendarPlaceholderImage: "https://i.imgur.com/iO025nB.png"
    },
    defaultStyles: {
        headline: { fontSize: '36px', fontWeight: 'bold', color: '#1f2937' },
        description: { fontSize: '18px', color: '#4b5563', lineHeight: '1.6' },
        calendarPlaceholder: { borderRadius: '8px' }
    }
  }
];

export default function Builder() {
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const blocks = history[historyIndex];

  const setBlocksAndRecord = useCallback((newBlocks) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newBlocks);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);
  
  const [activeSelection, setActiveSelection] = useState({ blockId: null, elementKey: null });
  const [deviceMode, setDeviceMode] = useState('desktop');
  const [showAIModal, setShowAIModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [page, setPage] = useState({ 
    title: "Untitled Page",
    industry: "",
    target_audience: "",
    goal: "collect_lead",
    intent: "",
    tone: "professional",
    meta_description: ""
  });
  const [templateToPopulate, setTemplateToPopulate] = useState(null);
  const [assetTarget, setAssetTarget] = useState(null); 
  const [theme, setTheme] = useState(null); 
  const [isLoading, setIsLoading] = useState(true); 

  const [funnelPages, setFunnelPages] = useState(null); 
  const [currentPageIndex, setCurrentPageIndex] = useState(0); 

  const [showAssetManager, setShowAssetManager] = useState(false); // New state for AssetManagerModal visibility
  const canvasRef = useRef(null); // New ref for BuilderCanvas


  useEffect(() => {
    const loadPageAndTheme = async () => {
      setIsLoading(true);
      const urlParams = new URLSearchParams(window.location.search);
      const pageId = urlParams.get('id');

      if (pageId) {
        try {
          const loadedPage = await LandingPage.get(pageId);
          setPage(loadedPage);
          setBlocksAndRecord(loadedPage.content?.blocks || []);

          if (loadedPage.organization_id) {
            const orgs = await Organization.list();
            const currentOrg = orgs.find(o => o.id === loadedPage.organization_id);
            if (currentOrg?.settings?.theme) {
              setTheme(currentOrg.settings.theme);
            }
          }
        } catch (error) {
          console.error("Failed to load page:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Handle session storage logic if no page ID is in URL
        const editingPageJson = sessionStorage.getItem('editingPage');
        const templateJson = sessionStorage.getItem('selectedTemplate');
        const funnelDataJson = sessionStorage.getItem('selectedFunnel'); 

        if (editingPageJson) {
          const loadedPage = JSON.parse(editingPageJson);
          setPage(loadedPage);
          setBlocksAndRecord(loadedPage.content?.blocks || []);
          sessionStorage.removeItem('editingPage');
        } else if (funnelDataJson) {
          // Handle funnel template
          const funnelData = JSON.parse(funnelDataJson);
          if (funnelData.pages && funnelData.pages.length > 0) {
            const pages = funnelData.pages.map(pageData => ({
              title: pageData.page_name,
              blocks: pageData.page_blocks || [],
            }));
            setFunnelPages(pages);
            setBlocksAndRecord(pages[0].blocks);
            setPage(prev => ({
              ...prev,
              title: pages[0].title,
              industry: funnelData.category || ''
            }));
            setCurrentPageIndex(0);
          }
          sessionStorage.removeItem('selectedFunnel');
        } else if (templateJson) {
          const template = JSON.parse(templateJson);
          if (template?.content?.blocks) {
            setTemplateToPopulate(template);
            setShowAIModal(true);
            setPage(prev => ({
              ...prev,
              title: `New Page from ${template.name || 'Template'}`,
              industry: template.tags?.[0] || ''
            }));
          }
          sessionStorage.removeItem('selectedTemplate');
        }

        // Load default organization theme if not loading a specific page
        try {
          const user = await User.me();
          if (user.current_organization_id) {
            const orgs = await Organization.list();
            const org = orgs.find(o => o.id === user.current_organization_id);
            if (org?.settings?.theme) {
              setTheme(org.settings.theme);
            }
            // For new pages, set the organization_id to the default current organization
            setPage(prev => ({ ...prev, organization_id: prev.organization_id || user.current_organization_id }));
          }
        } catch (error) {
          console.error("Error loading current organization theme:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadPageAndTheme();
  }, [setBlocksAndRecord]);


  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  }, [historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  }, [historyIndex, history.length]);

  const onDragEnd = useCallback((result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId === 'block-library') {
      const blockTemplate = UNIVERSAL_BLOCKS[source.index];
      const newBlock = {
        id: `${blockTemplate.id}_${Date.now()}`,
        type: blockTemplate.id,
        content: JSON.parse(JSON.stringify(blockTemplate.defaultContent)),
        styles: {
          padding: '60px 20px',
          backgroundColor: '#ffffff',
          backgroundImage: '',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundOverlayColor: '',
          backgroundOverlayOpacity: 0.5,
          textAlign: 'center',
          color: '#000000',
          ...(blockTemplate.defaultStyles || {}) 
        },
        layout: {
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '24px',
          alignItems: 'center',
          justifyItems: 'center'
        }
      };
      const newBlocks = [...blocks];
      newBlocks.splice(destination.index, 0, newBlock);
      setBlocksAndRecord(newBlocks);
      const defaultElementKey = Object.keys(blockTemplate.defaultContent || {}).length > 0 ? Object.keys(blockTemplate.defaultContent)[0] : null;
      setActiveSelection({ blockId: newBlock.id, elementKey: defaultElementKey });
    } else if (source.droppableId === 'canvas') {
      const newBlocks = Array.from(blocks);
      const [reorderedBlock] = newBlocks.splice(source.index, 1);
      newBlocks.splice(destination.index, 0, reorderedBlock);
      setBlocksAndRecord(newBlocks);
    }
  }, [blocks, setBlocksAndRecord]);
  
  const handleBlockSelect = useCallback((blockId) => {
      setActiveSelection({ blockId, elementKey: null });
  }, []);

  const handleElementSelect = useCallback((blockId, elementKey) => {
      setActiveSelection({ blockId, elementKey });
  }, []);

  const updateBlockContent = useCallback((blockId, contentPath, value) => {
    const newBlocks = _.cloneDeep(blocks); 
    const blockIndex = newBlocks.findIndex(b => b.id === blockId);
    if (blockIndex !== -1) {
        _.set(newBlocks[blockIndex].content, contentPath, value); 
        setBlocksAndRecord(newBlocks);
    }
  }, [blocks, setBlocksAndRecord]);

  const updateBlockStyles = useCallback((blockId, stylePath, value) => {
    const newBlocks = _.cloneDeep(blocks);
    const blockIndex = newBlocks.findIndex(b => b.id === blockId);
    if (blockIndex !== -1) {
        _.set(newBlocks[blockIndex].styles, stylePath, value); 
        setBlocksAndRecord(newBlocks);
    }
  }, [blocks, setBlocksAndRecord]);

  const updateBlockLayout = useCallback((blockId, newLayout) => {
    const newBlocks = blocks.map(b => 
      b.id === blockId ? { ...b, layout: { ...b.layout, ...newLayout } } : b
    );
    setBlocksAndRecord(newBlocks);
  }, [blocks, setBlocksAndRecord]);

  const deleteBlock = useCallback((blockId) => {
    setBlocksAndRecord(blocks.filter(b => b.id !== blockId));
    setActiveSelection({ blockId: null, elementKey: null });
  }, [blocks, setBlocksAndRecord]);
  
  const addListItem = useCallback((blockId, listKey, itemTemplate) => {
    const newBlocks = _.cloneDeep(blocks);
    const blockIndex = newBlocks.findIndex(b => b.id === blockId);
    if (blockIndex !== -1) {
        const list = _.get(newBlocks[blockIndex].content, listKey, []); 
        list.push(typeof itemTemplate === 'string' ? '' : { ...itemTemplate }); 
        _.set(newBlocks[blockIndex].content, listKey, list);
        setBlocksAndRecord(newBlocks);
    }
  }, [blocks, setBlocksAndRecord]);

  const deleteListItem = useCallback((blockId, listKey, itemIndex) => {
    const newBlocks = _.cloneDeep(blocks);
    const blockIndex = newBlocks.findIndex(b => b.id === blockId);
    if (blockIndex !== -1) {
        const list = _.get(newBlocks[blockIndex].content, listKey, []);
        list.splice(itemIndex, 1);
        _.set(newBlocks[blockIndex].content, listKey, list);
        setBlocksAndRecord(newBlocks);
    }
  }, [blocks, setBlocksAndRecord]);

  // Fixed multi-page support functions
  const handlePageSwitch = useCallback((pageIndex) => {
    console.log('Switching to page:', pageIndex, 'Current pages:', funnelPages);
    
    if (!funnelPages || pageIndex < 0 || pageIndex >= funnelPages.length) {
      console.warn('Invalid page switch attempt:', { pageIndex, funnelPagesLength: funnelPages?.length });
      return;
    }
    
    // Save current page state before switching
    const updatedPages = [...funnelPages];
    updatedPages[currentPageIndex] = {
      ...updatedPages[currentPageIndex],
      blocks: _.cloneDeep(blocks) // Save current blocks to the current page
    };
    
    // Update funnel pages state
    setFunnelPages(updatedPages);
    
    // Switch to new page
    const newPageBlocks = updatedPages[pageIndex].blocks || [];
    setCurrentPageIndex(pageIndex);
    setBlocksAndRecord(newPageBlocks);
    
    // Update page title in header
    setPage(prev => ({
      ...prev,
      title: updatedPages[pageIndex].title
    }));
    
    // Clear active selection on page switch
    setActiveSelection({ blockId: null, elementKey: null });
    
    console.log('Switched to page:', pageIndex, 'New blocks count:', newPageBlocks.length);
  }, [funnelPages, currentPageIndex, blocks, setBlocksAndRecord]);

  const handleAddPage = useCallback(() => {
    let currentPages = funnelPages; // Refers to the current state of funnelPages

    // If funnelPages is null, it means we started with a single page, so initialize it with the current blocks
    if (!currentPages) {
      currentPages = [{ title: page.title, blocks: _.cloneDeep(blocks) }];
      setCurrentPageIndex(0); // Set current page index to 0 for this newly initialized funnel
      // We will then set this to state at the end
    } else {
      // If funnelPages already exists, save the current blocks to the current page in the funnel
      // Make a copy of the funnelPages array to avoid direct mutation
      const updatedPagesForCurrentSave = [...currentPages];
      updatedPagesForCurrentSave[currentPageIndex] = {
        ...updatedPagesForCurrentSave[currentPageIndex],
        blocks: _.cloneDeep(blocks) // Deep clone to ensure current blocks are saved properly
      };
      currentPages = updatedPagesForCurrentSave; // Use this updated version for adding the new page
    }

    // Create the new page object
    const newPage = {
      title: `Page ${currentPages.length + 1}`,
      blocks: [] // New page starts with no blocks
    };
    
    // Add the new page to the (potentially updated) currentPages array
    const finalUpdatedPages = [...currentPages, newPage];
    
    setFunnelPages(finalUpdatedPages); // Update the state
    
    console.log('Added new page. Total pages:', finalUpdatedPages.length);
  }, [funnelPages, page, blocks, currentPageIndex]);

  const savePage = async () => {
    // If we're working on a funnel, we need to save all pages
    if (funnelPages) {
      // For now, just save the current page as a single page
      // Future enhancement: save entire funnel structure
      alert('Multi-page funnel saving will be implemented in the next phase.');
      return;
    }
    
    let orgIdToUse = page.organization_id;
    if (!orgIdToUse) {
      try {
        const user = await User.me();
        orgIdToUse = user.current_organization_id;
        setPage(prev => ({ ...prev, organization_id: orgIdToUse }));
      } catch (e) {
        console.error("Could not determine organization ID for new page:", e);
        alert('Could not determine organization. Please reload or contact support.');
        return;
      }
    }
    if (!orgIdToUse) {
      alert('No organization selected or found to save the page under.');
      return;
    }

    try {
      const payload = {
        ...page,
        content: { blocks },
        status: 'draft',
        organization_id: orgIdToUse
      };
      
      let savedPage;
      if (page.id) {
        savedPage = await LandingPage.update(page.id, payload);
      } else {
        savedPage = await LandingPage.create(payload);
        setPage(prev => ({ ...prev, id: savedPage.id }));
      }
      
      if (savedPage.id) {
        await createAutoVersion(savedPage.id, 'major_change', 'Auto-saved after page save');
      }
      
      alert('Page saved successfully!');
    } catch (error) {
      console.error("Error saving page:", error);
      alert('Error saving page.');
    }
  };

  const publishPage = async () => {
    let orgIdToUse = page.organization_id;
    if (!orgIdToUse) {
      try {
        const user = await User.me();
        orgIdToUse = user.current_organization_id;
        setPage(prev => ({ ...prev, organization_id: orgIdToUse }));
      } catch (e) {
        console.error("Could not determine organization ID for new page:", e);
        alert('Could not determine organization. Please reload or contact support.');
        return;
      }
    }
    if (!orgIdToUse) {
      alert('No organization selected or found to publish the page under.');
      return;
    }

    try {
      const html = generateHTML(blocks, theme); 
      const css = generateCSS(theme); 
      const payload = {
        ...page,
        content: { blocks },
        html,
        css,
        status: 'published',
        slug: page.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        organization_id: orgIdToUse
      };

      if (page.id) {
        await LandingPage.update(page.id, payload);
      } else {
        const newPage = await LandingPage.create(payload);
        setPage(prev => ({ ...prev, id: newPage.id }));
      }

      alert('Page published successfully!');
    } catch (error) {
      console.error("Error publishing page:", error);
      alert('Error publishing page.');
    }
  };

  const handleApplyAIContent = async (aiParams) => { 
    setIsGenerating(true);
    setPage(prev => ({ ...prev, ...aiParams }));
    
    // Save version before AI generation
    if (page.id && blocks.length > 0) {
      await createAutoVersion(page.id, 'ai_generation', 'Before AI content generation');
    }
    
    try {
      // Enhanced prompt with brand kit integration
      let brandKitContext = '';
      if (aiParams.brandKit) {
        const kit = aiParams.brandKit;
        brandKitContext = `
        
BRAND KIT CONTEXT:
- Primary Color: ${kit.theme?.primaryColor || 'N/A'}
- Secondary Color: ${kit.theme?.secondaryColor || 'N/A'}
- Heading Font: ${kit.theme?.headingFont || 'N/A'}
- Body Font: ${kit.theme?.bodyFont || 'N/A'}
- Value Proposition: ${kit.advanced?.icp?.value_proposition || 'N/A'}
- Target Audience Insights: ${kit.advanced?.icp?.target_audience || 'N/A'}
- Customer Motivation: ${kit.advanced?.icp?.motivation || 'N/A'}
- Potential Friction: ${kit.advanced?.icp?.friction || 'N/A'}
- Customer Anxiety: ${kit.advanced?.icp?.anxiety || 'N/A'}

Use this brand context to make the content more personalized and on-brand.`;
      }

      // If we have a template to populate, use it
      if (templateToPopulate) {
        const blockTypes = [...new Set(templateToPopulate.content.blocks.map(b => b.type))];
        const propertiesSchema = {};
        
        blockTypes.forEach(type => {
          const blockTemplate = UNIVERSAL_BLOCKS.find(b => b.id === type);
          if (!blockTemplate) return;
          
          const contentSchema = {};
          for (const key in blockTemplate.defaultContent) {
            const value = blockTemplate.defaultContent[key];
            if (Array.isArray(value)) {
              if (value.length > 0 && typeof value[0] === 'object') {
                  const itemProps = {};
                  for (const itemKey in value[0]) {
                    itemProps[itemKey] = { type: "string" };
                  }
                  contentSchema[key] = { type: "array", items: { type: "object", properties: itemProps } };
              } else {
                contentSchema[key] = { type: "array", items: { type: "string" } };
              }
            } else {
              contentSchema[key] = { type: "string" };
            }
          }
          propertiesSchema[type] = { type: "object", properties: contentSchema };
        });

        const responseSchema = { type: "object", properties: propertiesSchema };

        const aiPrompt = `You are an expert marketer well-versed in MECLABS methodology. Generate a landing page content for ${aiParams.industry} with the following requirements:

Target Audience: ${aiParams.target_audience}
Goal: ${aiParams.goal}
Intent: ${aiParams.intent}
Tone and Style: ${aiParams.tone}

${brandKitContext}

MECLABS Implementation: Focus on key principles like clarity, motivation, perceived value, and friction reduction. Ensure that each section aligns with these principles.

Generate content for the following landing page sections: ${blockTypes.join(', ')}.

Return a single JSON object where keys are the section types (e.g., "big_promise", "usp"), and values are objects containing the specific content fields for that section.

Make the content compelling, specific to the industry, and conversion-focused.`;

        const response = await InvokeLLM({ 
          prompt: aiPrompt, 
          response_json_schema: responseSchema 
        });

        const populatedBlocks = templateToPopulate.content.blocks.map(block => {
          const aiContentForBlock = response[block.type];
          const blockTemplate = UNIVERSAL_BLOCKS.find(b => b.id === block.type);
          
          // Apply brand kit styling if available
          let brandStyles = {};
          if (aiParams.brandKit?.theme) {
            brandStyles = {
              backgroundColor: aiParams.brandKit.theme.backgroundColor,
              color: aiParams.brandKit.theme.textColor,
              headline: {
                fontFamily: aiParams.brandKit.theme.headingFont,
                color: aiParams.brandKit.theme.primaryColor
              },
              button: {
                backgroundColor: aiParams.brandKit.theme.primaryColor,
                color: '#ffffff'
              }
            };
          }
          
          return {
            ...block,
            id: `${block.type}_${Date.now()}_${Math.random()}`,
            type: block.type,
            content: aiContentForBlock ? { ...block.content, ...aiContentForBlock } : block.content,
            styles: { 
              padding: '60px 20px',
              backgroundColor: brandStyles.backgroundColor || '#ffffff',
              backgroundImage: '',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundOverlayColor: '',
              backgroundOverlayOpacity: 0.5,
              textAlign: 'center',
              color: brandStyles.color || '#000000',
              ...(blockTemplate?.defaultStyles || {}), 
              ...brandStyles
            },
            layout: block.layout || {
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '24px',
              alignItems: 'center',
              justifyItems: 'center'
            }
          };
        });
        
        setBlocksAndRecord(populatedBlocks);
        setTemplateToPopulate(null);
        setActiveSelection({ blockId: populatedBlocks[0]?.id || null, elementKey: Object.keys(populatedBlocks[0]?.content || {})[0] || null });

      } else {
        // Generate content for existing blocks or create new blocks if none exist
        if (blocks.length === 0) {
          // Create a default set of blocks for a complete landing page
          const defaultBlockTypes = ['big_promise', 'empathy', 'authority', 'offer', 'social_proof', 'risk_reversal'];
          const propertiesSchema = {};
          
          defaultBlockTypes.forEach(type => {
            const blockTemplate = UNIVERSAL_BLOCKS.find(b => b.id === type);
            if (!blockTemplate) return;
            
            const contentSchema = {};
            for (const key in blockTemplate.defaultContent) {
              const value = blockTemplate.defaultContent[key];
              if (Array.isArray(value)) {
                if (value.length > 0 && typeof value[0] === 'object') {
                  const itemProps = {};
                  for (const itemKey in value[0]) {
                    itemProps[itemKey] = { type: "string" };
                  }
                  contentSchema[key] = { type: "array", items: { type: "object", properties: itemProps } };
                } else {
                  contentSchema[key] = { type: "array", items: { type: "string" } };
                }
              } else {
                contentSchema[key] = { type: "string" };
              }
            }
            propertiesSchema[type] = { type: "object", properties: contentSchema };
          });

          const responseSchema = { type: "object", properties: propertiesSchema };

          const aiPrompt = `You are an expert marketer well-versed in MECLABS methodology. Generate a complete landing page content for ${aiParams.industry} with the following requirements:

Target Audience: ${aiParams.target_audience}
Goal: ${aiParams.goal}
Intent: ${aiParams.intent}
Tone and Style: ${aiParams.tone}

${brandKitContext}

MECLABS Implementation: Focus on key principles like clarity, motivation, perceived value, and friction reduction. Ensure that each section aligns with these principles.

Create content for these sections: ${defaultBlockTypes.join(', ')}.

Return a single JSON object where keys are the section types (e.g., "big_promise", "usp"), and values are objects containing the specific content fields for that section.

Make the content compelling, specific to the industry, and conversion-focused.`;

          const response = await InvokeLLM({ 
            prompt: aiPrompt, 
            response_json_schema: responseSchema 
          });

          let brandStyles = {};
          if (aiParams.brandKit?.theme) {
            brandStyles = {
              backgroundColor: aiParams.brandKit.theme.backgroundColor,
              color: aiParams.brandKit.theme.textColor,
              headline: {
                fontFamily: aiParams.brandKit.theme.headingFont,
                color: aiParams.brandKit.theme.primaryColor
              },
              button: {
                backgroundColor: aiParams.brandKit.theme.primaryColor,
                color: '#ffffff'
              }
            };
          }

          const newBlocks = defaultBlockTypes.map(blockType => {
            const blockTemplate = UNIVERSAL_BLOCKS.find(b => b.id === blockType);
            const aiContentForBlock = response[blockType];
            
            return {
              id: `${blockType}_${Date.now()}_${Math.random()}`,
              type: blockType,
              content: aiContentForBlock ? { ...blockTemplate.defaultContent, ...aiContentForBlock } : blockTemplate.defaultContent,
              styles: {
                padding: '60px 20px',
                backgroundColor: brandStyles.backgroundColor || '#ffffff',
                backgroundImage: '',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundOverlayColor: '',
                backgroundOverlayOpacity: 0.5,
                textAlign: 'center',
                color: brandStyles.color || '#000000',
                ...(blockTemplate.defaultStyles || {}), 
                ...brandStyles
              },
              layout: {
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '24px',
                alignItems: 'center',
                justifyItems: 'center'
              }
            };
          });
          
          setBlocksAndRecord(newBlocks);
          setActiveSelection({ blockId: newBlocks[0]?.id || null, elementKey: Object.keys(newBlocks[0]?.content || {})[0] || null });
        } else {
          // Update existing blocks with AI content
          const blockTypes = [...new Set(blocks.map(b => b.type))];
          const propertiesSchema = {};
          
          blockTypes.forEach(type => {
            const blockTemplate = UNIVERSAL_BLOCKS.find(b => b.id === type);
            if (!blockTemplate) return;
            
            const contentSchema = {};
            for (const key in blockTemplate.defaultContent) {
              const value = blockTemplate.defaultContent[key];
              if (Array.isArray(value)) {
                if (value.length > 0 && typeof value[0] === 'object') {
                  const itemProps = {};
                  for (const itemKey in value[0]) {
                    itemProps[itemKey] = { type: "string" };
                  }
                  contentSchema[key] = { type: "array", items: { type: "object", properties: itemProps } };
                } else {
                  contentSchema[key] = { type: "array", items: { type: "string" } };
                }
              } else {
                contentSchema[key] = { type: "string" };
              }
            }
            propertiesSchema[type] = { type: "object", properties: contentSchema };
          });

          const responseSchema = { type: "object", properties: propertiesSchema };

          const aiPrompt = `You are an expert marketer well-versed in MECLABS methodology. Generate updated content for existing landing page blocks for ${aiParams.industry} with the following requirements:

Target Audience: ${aiParams.target_audience}
Goal: ${aiParams.goal}
Intent: ${aiParams.intent}
Tone and Style: ${aiParams.tone}

${brandKitContext}

MECLABS Implementation: Focus on key principles like clarity, motivation, perceived value, and friction reduction. Ensure that each section aligns with these principles.

Update content for these sections: ${blockTypes.join(', ')}.

Return a single JSON object where keys are the section types (e.g., "big_promise", "usp"), and values are objects containing the specific content fields for that section.
Make the content compelling, specific to the industry, and conversion-focused.`;

          const response = await InvokeLLM({
            prompt: aiPrompt, 
            response_json_schema: responseSchema 
          });

          const updatedBlocks = blocks.map(block => {
            const aiContentForBlock = response[block.type];
            return {
              ...block,
              content: aiContentForBlock ? { ...block.content, ...aiContentForBlock } : block.content
            };
          });
          
          setBlocksAndRecord(updatedBlocks);
        }
      }
      
      setShowAIModal(false);
    } catch (error) {
      console.error("Error generating AI content:", error);
      alert("There was an error generating content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const createAutoVersion = async (pageId, action, description) => {
    try {
      const versions = await PageVersion.filter({ page_id: pageId }, '-version_number', 1);
      const nextVersionNumber = versions.length > 0 ? versions[0].version_number + 1 : 1;
      
      await PageVersion.create({
        page_id: pageId,
        version_number: nextVersionNumber,
        title: `Auto-save v${nextVersionNumber}`,
        description,
        content: { blocks },
        metadata: {
          block_count: blocks.length,
          block_types: [...new Set(blocks.map(b => b.type))],
          timestamp: new Date().toISOString()
        },
        is_auto_saved: true,
        created_by_action: action
      });
    } catch (error) {
      console.error("Error creating auto version:", error);
    }
  };

  const handleRestoreVersion = useCallback((versionBlocks) => {
    setBlocksAndRecord(versionBlocks);
    setActiveSelection({ blockId: null, elementKey: null });
  }, [setBlocksAndRecord]);

  const handleCreateVersion = async (versionData) => {
    console.log('Version created:', versionData);
  };
  
  const generateHTML = (pageBlocks, theme) => {
    const styleToString = (stylesObj) => 
      Object.entries(stylesObj || {})
        .filter(([k, v]) => typeof v === 'string' || typeof v === 'number') 
        .map(([k, v]) => {
          if (v === '' || v === undefined || v === null) return '';
          const cssProperty = k.replace(/([A-Z])/g, '-$1').toLowerCase();
          return `${cssProperty}:${v}`;
        })
        .filter(Boolean)
        .join(';');
        
    const body = pageBlocks.map(block => {
        const headline = block.content?.headline || block.type.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        const subHeadline = block.content?.subHeadline || '';

        const combinedBlockStyles = {};
        for (const key in block.styles) {
            if (typeof block.styles[key] !== 'object') { 
                combinedBlockStyles[key] = block.styles[key];
            }
        }
        const combinedStyles = { ...combinedBlockStyles, ...block.layout };

        const hasOverlay = block.styles?.backgroundOverlayColor && block.styles?.backgroundOverlayOpacity;
        const overlayStyle = hasOverlay ? 
          `position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: ${block.styles.backgroundOverlayColor}; opacity: ${block.styles.backgroundOverlayOpacity}; z-index: 1;` : '';

        const contentWrapperStyle = hasOverlay ? 'position: relative; z-index: 2;' : '';

        return `
      <section style="${styleToString(combinedStyles)}">
        ${hasOverlay ? `<div style="${overlayStyle}"></div>` : ''}
        <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 20px; ${contentWrapperStyle}">
          <h2>${headline}</h2>
          <p>${subHeadline}</p>
        </div>
      </section>
    `;
    }).join('');
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${page.title}</title>
  <meta name="description" content="${page.meta_description}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${generateCSS(theme)}</style>
</head>
<body>
  ${body}
</body>
</html>`;
  };

  const generateCSS = (theme) => {
    const themeVars = theme ? `
    :root {
      --primary-color: ${theme.primaryColor || '#3b82f6'};
      --secondary-color: ${theme.secondaryColor || '#6366f1'};
      --background-color: ${theme.backgroundColor || '#ffffff'};
      --text-color: ${theme.textColor || '#1f2937'};
      --heading-font: ${theme.headingFont || 'Georgia, serif'};
      --body-font: ${theme.bodyFont || 'Helvetica, sans-serif'};
    }
    ` : '';
    
    return `
    ${themeVars}
    body { font-family: var(--body-font, sans-serif); margin: 0; padding: 0; color: var(--text-color); background-color: var(--background-color); }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    section { position: relative; }
    h1, h2, h3, h4, h5, h6 { font-family: var(--heading-font, serif); margin: 0 0 1rem 0; }
    p { margin: 0 0 1rem 0; line-height: 1.6; }
    .btn-primary { background-color: var(--primary-color); color: white; }
    .btn-secondary { background-color: var(--secondary-color); color: white; }
  `;
  }
  
  const applyBrandKit = useCallback(async () => {
    try {
      const user = await User.me();
      if (!user.current_organization_id) {
        alert('No organization found to apply brand kit from.');
        return;
      }
      const orgs = await Organization.list();
      const currentOrg = orgs.find(o => o.id === user.current_organization_id);
      const orgTheme = currentOrg?.settings?.theme;

      if (!orgTheme) {
        alert('No brand kit theme found for your organization.');
        return;
      }
      setTheme(orgTheme); 

      const updatedBlocks = blocks.map(block => {
        const newStyles = { ...block.styles };

        if (orgTheme.backgroundColor) newStyles.backgroundColor = orgTheme.backgroundColor;
        if (orgTheme.textColor) newStyles.color = orgTheme.textColor;

        newStyles.headline = {
          ...(newStyles.headline || {}), 
          ...(orgTheme.headingFont && { fontFamily: orgTheme.headingFont }),
          ...(orgTheme.primaryColor && { color: orgTheme.primaryColor })
        };

        newStyles.button = {
          ...(newStyles.button || {}), 
          ...(orgTheme.primaryColor && { backgroundColor: orgTheme.primaryColor }),
          color: '#ffffff' 
        };

        return {
          ...block,
          styles: newStyles 
        };
      });
      
      setBlocksAndRecord(updatedBlocks);
      alert('Brand kit applied successfully!');
    } catch (error) {
      console.error("Error applying brand kit:", error);
      alert("Error applying brand kit.");
    }
  }, [blocks, setBlocksAndRecord, setTheme]);
  
  const selectedBlock = blocks.find(b => b.id === activeSelection.blockId) || null;

  // Debug: Log funnel pages state
  useEffect(() => {
    console.log('Funnel Pages State:', {
      funnelPages,
      currentPageIndex,
      blocksCount: blocks.length,
      isMultiPage: funnelPages && funnelPages.length > 1
    });
  }, [funnelPages, currentPageIndex, blocks.length]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="h-screen bg-white flex flex-col">
        <BuilderHeader 
          pageData={page}
          onPageDataChange={setPage}
          onSave={savePage} 
          onPublish={publishPage} 
          onAIGenerate={() => setShowAIModal(true)} 
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onRestoreVersion={handleRestoreVersion}
          onCreateVersion={handleCreateVersion}
          blocks={blocks}
        />
        <DevicePreview 
          deviceMode={deviceMode} 
          onDeviceModeChange={setDeviceMode} 
        />
        <div className="flex-1 flex overflow-y-hidden">
          <BuilderSidebar 
            universalBlocks={UNIVERSAL_BLOCKS} 
            onApplyBrandKit={applyBrandKit}
            onOpenAssetManager={() => {
              setAssetTarget({});
              setShowAssetManager(true);
            }}
            funnelPages={funnelPages}
            currentPageIndex={currentPageIndex}
            onPageSwitch={handlePageSwitch}
            onAddPage={handleAddPage}
          />
          
          <main className="flex-1 flex flex-col overflow-y-hidden">
            <BuilderCanvas 
              ref={canvasRef}
              blocks={blocks} 
              activeSelection={activeSelection} 
              onBlockSelect={handleBlockSelect}
              onElementSelect={handleElementSelect}
              onBlockDelete={deleteBlock} 
              deviceMode={deviceMode} 
              theme={theme} 
            />
          </main>
          
          <PropertyPanel 
            key={activeSelection ? `${activeSelection.blockId}-${activeSelection.elementKey || 'no-element'}` : 'no-selection'}
            selectedBlock={selectedBlock}
            selectedElementKey={activeSelection.elementKey}
            onContentUpdate={updateBlockContent}
            onStylesUpdate={updateBlockStyles}
            onLayoutUpdate={updateBlockLayout}
            onAddListItem={addListItem}
            onDeleteListItem={deleteListItem}
            onOpenAssetManager={(target) => {
              setAssetTarget(target);
              setShowAssetManager(true);
            }}
          />
        </div>
        
        <AIContentModal 
          isOpen={showAIModal} 
          onClose={() => setShowAIModal(false)} 
          onGenerate={handleApplyAIContent}
          isGenerating={isGenerating} 
          page={page} 
          isWizardMode={!!templateToPopulate} 
          brandKit={theme ? { theme: theme } : null} 
        />

        <AssetManagerModal
          isOpen={showAssetManager}
          onClose={() => setShowAssetManager(false)}
          onSelectImage={(url) => {
            if (assetTarget) {
              if (assetTarget.path.startsWith('content.')) {
                  updateBlockContent(assetTarget.blockId, assetTarget.path.substring('content.'.length), url);
              } else if (assetTarget.path.startsWith('styles.')) {
                  updateBlockStyles(assetTarget.blockId, assetTarget.path.substring('styles.'.length), url);
              }
            } else {
              navigator.clipboard.writeText(url);
              alert('Image URL copied to clipboard!');
            }
            setAssetTarget(null);
            setShowAssetManager(false);
          }}
        />
      </div>
    </DragDropContext>
  );
}
