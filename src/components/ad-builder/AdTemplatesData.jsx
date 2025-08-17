import _ from 'lodash';

// Using _ to avoid unused variable errors if some templates are not yet used.
const unused = _; 

export const AD_TEMPLATES = {
  "Problem_Solution": {
    frame: { width: 1080, height: 1350, backgroundColor: "#f8fafc" },
    layers: [
      { id: "headline", type: "text", name: "Problem Headline", x: 540, y: 150, width: 960, text: "Are You Struggling With This?", fontSize: 84, fontFamily: "Arial", fontWeight: "bold", fill: "#1e293b", textAlign: "center", originX: 'center', originY: 'center' },
      { id: "description", type: "text", name: "Problem Description", x: 540, y: 300, width: 800, text: "Many people face this challenge daily, and it's frustrating when solutions don't work.", fontSize: 32, fontFamily: "Arial", fill: "#475569", textAlign: "center", originX: 'center', originY: 'center' },
      { id: "main-image", type: "image", name: "Main Image", x: 140, y: 450, width: 800, height: 400, src: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=800&h=400&fit=crop" },
      { id: "solution-headline", type: "text", name: "Solution Headline", x: 540, y: 950, width: 960, text: "Here's Your Solution", fontSize: 64, fontFamily: "Arial", fontWeight: "bold", fill: "#1e293b", textAlign: "center", originX: 'center', originY: 'center' },
      { id: "solution-description", type: "text", name: "Solution Description", x: 540, y: 1050, width: 800, text: "Our product solves this exact problem by providing a unique approach that guarantees results.", fontSize: 28, fontFamily: "Arial", fill: "#475569", textAlign: "center", originX: 'center', originY: 'center' },
      { id: "cta-button", type: "rect", name: "CTA Button", x: 340, y: 1180, width: 400, height: 100, fill: "#2563eb", borderRadius: 50 },
      { id: "cta-text", type: "text", name: "CTA Text", x: 540, y: 1230, width: 400, text: "LEARN MORE", fontSize: 36, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff", textAlign: "center", originX: 'center', originY: 'center' }
    ]
  },
  "Before_After": {
    frame: { width: 1080, height: 1350, backgroundColor: "#f1f5f9" },
    layers: [
      { id: "headline", type: "text", name: "Main Headline", x: 540, y: 80, width: 960, text: "See The Incredible Transformation", fontSize: 80, fontFamily: "Arial", fontWeight: "bold", fill: "#1e293b", textAlign: "center", originX: 'center', originY: 'center' },
      { id: "before-bg", type: "rect", name: "Before Background", x: 40, y: 180, width: 500, height: 900, fill: "#ffffff", borderRadius: 20 },
      { id: "before-title", type: "text", name: "Before Title", x: 290, y: 240, width: 400, text: "BEFORE", fontSize: 48, fontFamily: "Arial", fontWeight: "bold", fill: "#ef4444", textAlign: "center", originX: 'center', originY: 'center' },
      { id: "before-image", type: "image", name: "Before Image", x: 90, y: 300, width: 400, height: 250, src: "https://images.unsplash.com/photo-1579532589638-683a91b5c263?w=400&h=250&fit=crop" },
      { id: "before-problems", type: "text", name: "Before Problems", x: 90, y: 600, width: 400, text: "• Problem 1\n• Problem 2\n• Problem 3\n• Problem 4", fontSize: 28, fontFamily: "Arial", fill: "#475569", textAlign: "left", lineHeight: 1.5 },
      { id: "after-bg", type: "rect", name: "After Background", x: 540, y: 180, width: 500, height: 900, fill: "#ffffff", borderRadius: 20 },
      { id: "after-title", type: "text", name: "After Title", x: 790, y: 240, width: 400, text: "AFTER", fontSize: 48, fontFamily: "Arial", fontWeight: "bold", fill: "#22c55e", textAlign: "center", originX: 'center', originY: 'center' },
      { id: "after-image", type: "image", name: "After Image", x: 590, y: 300, width: 400, height: 250, src: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=250&fit=crop" },
      { id: "after-benefits", type: "text", name: "After Benefits", x: 590, y: 600, width: 400, text: "✓ Benefit 1\n✓ Benefit 2\n✓ Benefit 3\n✓ Benefit 4", fontSize: 28, fontFamily: "Arial", fill: "#475569", textAlign: "left", lineHeight: 1.5 },
      { id: "cta-button", type: "rect", name: "CTA Button", x: 340, y: 1150, width: 400, height: 100, fill: "#2563eb", borderRadius: 50 },
      { id: "cta-text", type: "text", name: "CTA Text", x: 540, y: 1200, width: 400, text: "SEE HOW", fontSize: 36, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff", textAlign: "center", originX: 'center', originY: 'center' }
    ]
  },
  "Us_Vs_Them": {
    frame: { width: 1080, height: 1350, backgroundColor: "#f8fafc" },
    layers: [
      { id: "headline", type: "text", name: "Main Headline", x: 540, y: 80, width: 960, text: "There's A Better Way", fontSize: 80, fontFamily: "Arial", fontWeight: "bold", fill: "#1e293b", textAlign: "center", originX: 'center', originY: 'center' },
      { id: "them-bg", type: "rect", name: "Them Background", x: 40, y: 180, width: 500, height: 900, fill: "#fee2e2", borderRadius: 20 },
      { id: "them-title", type: "text", name: "Them Title", x: 290, y: 240, width: 400, text: "THE OLD WAY", fontSize: 40, fontFamily: "Arial", fontWeight: "bold", fill: "#991b1b", textAlign: "center", originX: 'center', originY: 'center' },
      { id: "them-cons", type: "text", name: "Them Cons", x: 90, y: 320, width: 400, text: "✗ Competitor Con 1\n✗ Competitor Con 2\n✗ Competitor Con 3\n✗ Competitor Con 4", fontSize: 28, fontFamily: "Arial", fill: "#475569", textAlign: "left", lineHeight: 1.6 },
      { id: "us-bg", type: "rect", name: "Us Background", x: 540, y: 180, width: 500, height: 900, fill: "#dcfce7", borderRadius: 20 },
      { id: "us-title", type: "text", name: "Us Title", x: 790, y: 240, width: 400, text: "OUR WAY", fontSize: 40, fontFamily: "Arial", fontWeight: "bold", fill: "#166534", textAlign: "center", originX: 'center', originY: 'center' },
      { id: "us-pros", type: "text", name: "Us Pros", x: 590, y: 320, width: 400, text: "✓ Our Pro 1\n✓ Our Pro 2\n✓ Our Pro 3\n✓ Our Pro 4", fontSize: 28, fontFamily: "Arial", fill: "#475569", textAlign: "left", lineHeight: 1.6 },
      { id: "vs-circle", type: "ellipse", name: "VS Circle", x: 540, y: 630, radius: 60, fill: "#1e293b", originX: 'center', originY: 'center'},
      { id: "vs-text", type: "text", name: "VS Text", x: 540, y: 630, width: 100, text: "VS", fontSize: 40, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff", textAlign: "center", originX: 'center', originY: 'center' },
      { id: "cta-button", type: "rect", name: "CTA Button", x: 340, y: 1150, width: 400, height: 100, fill: "#2563eb", borderRadius: 50 },
      { id: "cta-text", type: "text", name: "CTA Text", x: 540, y: 1200, width: 400, text: "CHOOSE BETTER", fontSize: 36, fontFamily: "Arial", fontWeight: "bold", fill: "#ffffff", textAlign: "center", originX: 'center', originY: 'center' }
    ]
  },
};