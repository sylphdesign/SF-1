import Layout from "./Layout.jsx";

import Builder from "./Builder";

import Pages from "./Pages";

import Templates from "./Templates";

import Auth from "./Auth";

import AdCampaigns from "./AdCampaigns";

import AdTemplates from "./AdTemplates";

import AdBuilder from "./AdBuilder";

import FunnelCreator from "./FunnelCreator";

import Landing from "./Landing";

import Settings from "./Settings";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Builder: Builder,
    
    Pages: Pages,
    
    Templates: Templates,
    
    Auth: Auth,
    
    AdCampaigns: AdCampaigns,
    
    AdTemplates: AdTemplates,
    
    AdBuilder: AdBuilder,
    
    FunnelCreator: FunnelCreator,
    
    Landing: Landing,
    
    Settings: Settings,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Builder />} />
                
                
                <Route path="/Builder" element={<Builder />} />
                
                <Route path="/Pages" element={<Pages />} />
                
                <Route path="/Templates" element={<Templates />} />
                
                <Route path="/Auth" element={<Auth />} />
                
                <Route path="/AdCampaigns" element={<AdCampaigns />} />
                
                <Route path="/AdTemplates" element={<AdTemplates />} />
                
                <Route path="/AdBuilder" element={<AdBuilder />} />
                
                <Route path="/FunnelCreator" element={<FunnelCreator />} />
                
                <Route path="/Landing" element={<Landing />} />
                
                <Route path="/Settings" element={<Settings />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}