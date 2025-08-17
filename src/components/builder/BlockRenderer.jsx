
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Star, Shield, Zap, CircleUserRound, Mail, PlayCircle, Lock, ChevronDown } from "lucide-react";

const CountdownTimer = ({ endDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(endDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    if (!timeLeft.hours && !timeLeft.minutes && !timeLeft.seconds) {
      clearTimeout(timer);
    }

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const formatTime = (time) => (time < 10 ? `0${time}` : time);

  return (
    <div className="flex items-center justify-center gap-4 text-center">
      <div>
        <div className="text-4xl font-bold">{formatTime(timeLeft.hours) || '00'}</div>
        <div className="text-xs uppercase">Hours</div>
      </div>
      <div className="text-4xl font-bold">:</div>
      <div>
        <div className="text-4xl font-bold">{formatTime(timeLeft.minutes) || '00'}</div>
        <div className="text-xs uppercase">Minutes</div>
      </div>
       <div className="text-4xl font-bold">:</div>
      <div>
        <div className="text-4xl font-bold">{formatTime(timeLeft.seconds) || '00'}</div>
        <div className="text-xs uppercase">Seconds</div>
      </div>
    </div>
  );
};

const EditableElement = ({ 
  elementKey, 
  blockId, 
  onSelect, 
  activeSelection, 
  children, 
  as: Component = 'div', 
  style, 
  className = '',
  isContainer = false,
  ...props 
}) => {
  const isEditable = typeof onSelect === 'function';

  if (!isEditable) {
    // This is preview mode. Just render the component without editing features.
    return <Component style={style} className={className} {...props}>{children}</Component>;
  }

  const [isHovered, setIsHovered] = useState(false);
  const isSelected = activeSelection?.blockId === blockId && activeSelection?.elementKey === elementKey;

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(blockId, elementKey);
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const combinedStyle = {
    ...style,
    position: 'relative',
    ...(isSelected ? { 
      outline: '2px solid #3b82f6', 
      outlineOffset: '2px', 
      borderRadius: '4px',
      backgroundColor: isContainer ? 'rgba(59, 130, 246, 0.05)' : undefined
    } : {}),
    ...(isHovered && !isSelected ? { 
      outline: '1px dashed #93c5fd', 
      outlineOffset: '1px', 
      borderRadius: '4px',
      backgroundColor: isContainer ? 'rgba(147, 197, 253, 0.05)' : undefined
    } : {})
  };

  const combinedClassName = `${className} cursor-pointer transition-all duration-150`;

  return (
    <Component 
      onClick={handleClick} 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={combinedStyle} 
      className={combinedClassName}
      {...props}
    >
      {children}
      {(isSelected || isHovered) && (
        <div className="absolute -top-6 left-0 z-10">
          <div className={`text-xs px-2 py-1 rounded-full font-medium shadow-sm ${
            isSelected 
              ? 'bg-blue-600 text-white' 
              : 'bg-blue-100 text-blue-700 border border-blue-200'
          }`}>
            {isContainer ? `${elementKey} Container` : elementKey}
          </div>
        </div>
      )}
    </Component>
  );
};

// New component to render custom generated blocks
const CustomGeneratedBlock = ({ block, deviceMode, onElementSelect, activeSelection }) => {
  const handleElementClick = (elementKey, event) => {
    event.stopPropagation();
    onElementSelect(block.id, elementKey);
  };

  // Parse and render the custom HTML structure with React-safe transformations
  const renderCustomHTML = () => {
    try {
      // For now, we'll render a placeholder that shows the custom content
      // In a full implementation, you'd parse the HTML and make it interactive
      return (
        <div 
          style={{ ...block.styles, position: 'relative' }} // Ensure position relative for EditableElement
          className="custom-generated-block"
        >
          {/* Apply EditableElement wrapper for the whole block if onSelect is available */}
          <EditableElement 
            elementKey="blockContainer" 
            blockId={block.id} 
            onSelect={onElementSelect} 
            activeSelection={activeSelection} 
            as="div" 
            style={{ 
              padding: '20px', 
              border: '2px dashed #3b82f6', 
              borderRadius: '8px', 
              backgroundColor: '#f8fafc',
              minHeight: '100px', // Ensure block has some height
              position: 'relative' // Needed for the label within EditableElement
            }}
            isContainer={true}
          >
            <div style={{ marginBottom: '16px', color: '#1e40af', fontWeight: 'bold', fontSize: '14px' }}>
              ✨ Custom Generated Block: {block.name}
            </div>
            
            {/* Render editable content fields */}
            {Object.entries(block.content || {}).map(([key, value]) => (
              <EditableElement 
                key={key} 
                elementKey={key} 
                blockId={block.id} 
                onSelect={onElementSelect} 
                activeSelection={activeSelection} 
                as="div"
                style={{ 
                  marginBottom: '12px', 
                  padding: '8px',
                  borderRadius: '4px',
                  minHeight: '20px' // Give some min height for selection
                }}
              >
                {key.toLowerCase().includes('image') ? (
                  value ? <img src={value} alt={key} style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }} /> : <div>Image placeholder</div>
                ) : (
                  <div style={{ fontSize: key.includes('headline') ? '24px' : '16px', fontWeight: key.includes('headline') ? 'bold' : 'normal' }}>
                    {value || `[${key}]`}
                  </div>
                )}
              </EditableElement>
            ))}
            
            <div style={{ marginTop: '16px', fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>
              This block was generated from your uploaded image. Click elements to edit them.
            </div>
          </EditableElement>
        </div>
      );
    } catch (error) {
      console.error("Error rendering custom block:", error);
      return (
        <div style={{ padding: '20px', color: 'red', border: '1px solid red' }}>
          Error rendering custom block: {block.name}
        </div>
      );
    }
  };

  return renderCustomHTML();
};


export default function BlockRenderer({ block, deviceMode, onElementSelect, activeSelection }) {
  // Handle custom generated blocks
  if (block.isCustomGenerated && block.customCode) {
    return (
      <CustomGeneratedBlock 
        block={block}
        deviceMode={deviceMode}
        onElementSelect={onElementSelect}
        activeSelection={activeSelection}
      />
    );
  }

  // standard block rendering
  const isMobile = deviceMode === 'mobile';

  const backgroundStyles = {
    backgroundColor: block.styles?.backgroundColor || 'transparent',
    backgroundImage: block.styles?.backgroundImage ? `url('${block.styles.backgroundImage}')` : 'none',
    backgroundSize: block.styles?.backgroundSize || 'cover',
    backgroundPosition: block.styles?.backgroundPosition || 'center',
    color: block.styles?.color || '#000000',
    padding: block.styles?.padding || '60px 20px',
    position: 'relative',
    minHeight: '150px'
  };
  
  const layoutStyles = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : (block.layout?.gridTemplateColumns || '1fr'),
    gap: isMobile ? '24px' : (block.layout?.gap || '24px'),
    alignItems: block.layout?.alignItems || 'center',
    justifyItems: block.layout?.justifyItems || 'center'
  };

  const getStyle = (element) => {
    return block.styles?.[element] || {};
  }

  const getContainerStyle = (containerKey) => {
    return {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      ...getStyle(containerKey)
    };
  };
  
  const renderContentWithLayout = (content) => (
    <div style={layoutStyles}>
      {content}
    </div>
  );

  return (
    <div style={backgroundStyles} className="relative w-full">
      {block.styles?.backgroundImage && block.styles?.backgroundOverlayColor && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: block.styles.backgroundOverlayColor,
            opacity: block.styles.backgroundOverlayOpacity || 0.5
          }}
        />
      )}
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 w-full" style={{textAlign: block.styles?.textAlign || 'center'}}>
        {block.type === 'hero_image_split' && (
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'} gap-12 items-center`}>
            <div className="text-left space-y-6">
               <EditableElement elementKey="headline" blockId={block.id} onSelect={onElementSelect} activeSelection={activeSelection} as="h1" style={getStyle('headline')} className="text-4xl md:text-5xl font-bold leading-tight">
                {block.content.headline || "Your Amazing Headline"}
               </EditableElement>
              {block.content.subHeadline && 
                <EditableElement elementKey="subHeadline" blockId={block.id} onSelect={onElementSelect} activeSelection={activeSelection} as="p" style={getStyle('subHeadline')} className="text-lg opacity-80">
                    {block.content.subHeadline}
                </EditableElement>}
              <div className="pt-4">
                <EditableElement elementKey="button" blockId={block.id} onSelect={onElementSelect} activeSelection={activeSelection} as="div" className="inline-block">
                    <Button style={getStyle('button')} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">{block.content.ctaText || "Get Started"}</Button>
                </EditableElement>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <EditableElement elementKey="image" blockId={block.id} onSelect={onElementSelect} activeSelection={activeSelection}>
                <img style={getStyle('image')} src={block.content.image} alt="Feature" className="max-w-sm w-full drop-shadow-2xl" />
              </EditableElement>
            </div>
          </div>
        )}
        
        {block.type === 'big_promise' && (
          <div className="space-y-4">
            {block.content.preHeadline && 
                <EditableElement elementKey="preHeadline" blockId={block.id} onSelect={onElementSelect} activeSelection={activeSelection} as="p" style={getStyle('preHeadline')} className="text-sm font-semibold uppercase tracking-wider opacity-80">
                    {block.content.preHeadline}
                </EditableElement>}
            <EditableElement elementKey="headline" blockId={block.id} onSelect={onElementSelect} activeSelection={activeSelection} as="h1" style={getStyle('headline')} className="text-4xl md:text-5xl font-bold leading-tight">
                {block.content.headline || "Your Amazing Headline"}
            </EditableElement>
            {block.content.subHeadline && 
                <EditableElement elementKey="subHeadline" blockId={block.id} onSelect={onElementSelect} activeSelection={activeSelection} as="p" style={getStyle('subHeadline')} className="text-lg opacity-80 max-w-2xl mx-auto">
                    {block.content.subHeadline}
                </EditableElement>}
            <div className="pt-4">
              <EditableElement elementKey="button" blockId={block.id} onSelect={onElementSelect} activeSelection={activeSelection} as="div" className="inline-block">
                <Button style={getStyle('button')} size="lg">{block.content.ctaText || "Get Started"}</Button>
              </EditableElement>
            </div>
            {block.content.guaranteeText && 
                <EditableElement elementKey="guarantee" blockId={block.id} onSelect={onElementSelect} activeSelection={activeSelection} as="p" style={getStyle('guarantee')} className="text-xs opacity-60 mt-2">
                    {block.content.guaranteeText}
                </EditableElement>}
          </div>
        )}

        {block.type === 'checklist_feature' && (
          <div className="text-left max-w-2xl mx-auto">
            <EditableElement elementKey="headline" blockId={block.id} onSelect={onElementSelect} activeSelection={activeSelection} as="h2" style={getStyle('headline')} className="text-3xl md:text-4xl font-bold mb-8 text-center">
              {block.content.headline || "You will learn:"}
            </EditableElement>
            <EditableElement 
              elementKey="itemsContainer" 
              blockId={block.id} 
              onSelect={onElementSelect} 
              activeSelection={activeSelection} 
              as="ul" 
              style={getContainerStyle('itemsContainer')}
              className="space-y-4"
              isContainer={true}
            >
              {block.content.items?.map((item, index) => (
                <EditableElement key={index} elementKey={`items[${index}]`} blockId={block.id} onSelect={onElementSelect} activeSelection={activeSelection} as="li" style={getStyle('item')} className="flex items-start text-lg">
                  <Check className="w-6 h-6 mr-4 mt-1 text-blue-500 flex-shrink-0" />
                  <span>{item}</span>
                </EditableElement>
              ))}
            </EditableElement>
          </div>
        )}

        {block.type === 'faq' && (
          <div className="max-w-3xl mx-auto">
            {block.content.preHeadline && 
              <EditableElement elementKey="preHeadline" blockId={block.id} onSelect={onElementSelect} activeSelection={activeSelection} as="p" style={getStyle('preHeadline')} className="text-sm font-semibold uppercase tracking-wider opacity-80 mb-4">
                {block.content.preHeadline}
              </EditableElement>}
            <EditableElement elementKey="headline" blockId={block.id} onSelect={onElementSelect} activeSelection={activeSelection} as="h2" style={getStyle('headline')} className="text-3xl md:text-4xl font-bold mb-8 text-center">
              {block.content.headline || "Frequently Asked Questions"}
            </EditableElement>
            <EditableElement 
              elementKey="faqContainer" 
              blockId={block.id} 
              onSelect={onElementSelect} 
              activeSelection={activeSelection} 
              as="div" 
              style={getContainerStyle('faqContainer')}
              className="space-y-4 w-full text-left"
              isContainer={true}
            >
              {block.content.faqs?.map((faq, index) => (
                <div key={index} className="bg-white/5 p-4 rounded-lg">
                  <EditableElement elementKey={`faqs[${index}].question`} blockId={block.id} onSelect={onElementSelect} activeSelection={activeSelection} as="h3" style={getStyle('faqQuestion')} className="font-semibold cursor-pointer text-lg mb-2 flex items-center justify-between">
                    {faq.question}
                    <ChevronDown className="w-5 h-5 ml-2" />
                  </EditableElement>
                  <EditableElement elementKey={`faqs[${index}].answer`} blockId={block.id} onSelect={onElementSelect} activeSelection={activeSelection} as="p" style={getStyle('faqAnswer')} className="pt-2 opacity-80">
                    {faq.answer}
                  </EditableElement>
                </div>
              ))}
            </EditableElement>
          </div>
        )}

        {block.type === 'social_proof' && (
          <div className="max-w-5xl mx-auto">
            <EditableElement elementKey="headline" blockId={block.id} onSelect={onElementSelect} activeSelection={activeSelection} as="h2" style={getStyle('headline')} className="text-3xl font-bold mb-6 text-center">
              {block.content.headline || "What People Say"}
            </EditableElement>
            <EditableElement 
              elementKey="testimonialsContainer" 
              blockId={block.id} 
              onSelect={onElementSelect} 
              activeSelection={activeSelection} 
              as="div" 
              style={getContainerStyle('testimonialsContainer')}
              className={`grid ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'} gap-6`}
              isContainer={true}
            >
              {block.content.testimonials?.map((t, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-lg text-left w-full">
                  <div className="flex text-yellow-400 mb-4">{[...Array(5)].map((_, j) => <Star key={j} className="w-5 h-5 fill-current" />)}</div>
                  <EditableElement elementKey={`testimonials[${i}].text`} blockId={block.id} onSelect={onElementSelect} activeSelection={activeSelection} as="p" style={getStyle('testimonialText')} className="italic mb-4">
                    "{t.text}"
                  </EditableElement>
                  <div className="flex items-center gap-4">
                    {t.avatar ? (
                      <EditableElement elementKey={`testimonials[${i}].avatar`} blockId={block.id} onSelect={onElementSelect} activeSelection={activeSelection} as="div">
                        <img style={getStyle('testimonialAvatar')} src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover"/>
                      </EditableElement>
                    ) : (
                      <EditableElement elementKey={`testimonials[${i}].avatar`} blockId={block.id} onSelect={onElementSelect} activeSelection={activeSelection} as="div">
                        <CircleUserRound className="w-12 h-12 opacity-50"/>
                      </EditableElement>
                    )}
                    <EditableElement elementKey={`testimonials[${i}].name`} blockId={block.id} onSelect={onElementSelect} activeSelection={activeSelection} as="p" style={getStyle('testimonialName')} className="font-semibold">
                      — {t.name}
                    </EditableElement>
                  </div>
                </div>
              ))}
            </EditableElement>
          </div>
        )}

        {block.type === 'offer_stack' && (
          <div className="space-y-6">
            <EditableElement elementKey="headline" blockId={block.id} onSelect={onElementSelect} activeSelection={activeSelection} as="h2" style={getStyle('headline')} className="text-3xl font-bold">
              {block.content.headline}
            </EditableElement>
            <EditableElement 
              elementKey="itemsContainer" 
              blockId={block.id} 
              onSelect={onElementSelect} 
              activeSelection={activeSelection} 
              as="div" 
              style={getContainerStyle('itemsContainer')}
              className="space-y-4 max-w-2xl mx-auto"
              isContainer={true}
            >
              {block.content.items?.map((item, i) => (
                <div key={i} className="flex items-start gap-4 text-left p-4 bg-white/10 rounded-lg">
                  <span style={getStyle('itemIcon')} className="text-2xl mt-1">{item.icon}</span>
                  <div>
                    <EditableElement elementKey={`items[${i}].title`} blockId={block.id} onSelect={onElementSelect} activeSelection={activeSelection} as="h3" style={getStyle('itemTitle')} className="font-bold text-lg">{item.title}</EditableElement>
                    <EditableElement elementKey={`items[${i}].description`} blockId={block.id} onSelect={onElementSelect} activeSelection={activeSelection} as="p" style={getStyle('itemDescription')} className="opacity-80">{item.description}</EditableElement>
                  </div>
                </div>
              ))}
            </EditableElement>
          </div>
        )}

        {block.type === 'countdown_cta' && (
          <div className="text-center max-w-2xl mx-auto space-y-6">
            <EditableElement elementKey="preHeadline" blockId={block.id} onSelect={onElementSelect} activeSelection={activeSelection} as="p" style={getStyle('preHeadline')} className="font-semibold text-red-500">
              {block.content.preHeadline}
            </EditableElement>
            
            <EditableElement 
              elementKey="countdownContainer" 
              blockId={block.id} 
              onSelect={onElementSelect} 
              activeSelection={activeSelection} 
              as="div" 
              style={getContainerStyle('countdownContainer')}
              className="bg-gray-100 p-8 rounded-lg mb-8"
              isContainer={true}
            >
              {/* This CountdownTimer component will actually render the countdown */}
              <CountdownTimer endDate={block.content.endDate} />
            </EditableElement>
            
            <div className="space-y-4">
              <EditableElement elementKey="button" blockId={block.id} onSelect={onElementSelect} activeSelection={activeSelection} as="div" className="w-full max-w-md mx-auto">
                <Button style={getStyle('button')} size="lg" className="w-full bg-red-600 hover:bg-red-700 text-white h-14 font-bold text-xl">{block.content.ctaText || "CLAIM THIS OFFER NOW"}</Button>
              </EditableElement>
              {block.content.subCtaText && 
                <EditableElement elementKey="subCtaText" blockId={block.id} onSelect={onElementSelect} activeSelection={activeSelection} as="p" style={getStyle('subCtaText')} className="text-sm opacity-80">
                  {block.content.subCtaText}
                </EditableElement>}
            </div>
          </div>
        )}
        
        {/* Placeholder blocks for remaining types */}
        {block.type === 'empathy' && ( <div className="p-4 bg-gray-200 text-gray-500"> Empathy Block (conversion pending) </div> )}
        {block.type === 'authority' && ( <div className="p-4 bg-gray-200 text-gray-500"> Authority Block (conversion pending) </div> )}
        {block.type === 'sales_video' && ( <div className="p-4 bg-gray-200 text-gray-500"> Sales Video Block (conversion pending) </div> )}
        {block.type === 'vehicle' && ( <div className="p-4 bg-gray-200 text-gray-500"> Vehicle Block (conversion pending) </div> )}
        {block.type === 'image_and_text' && ( <div className="p-4 bg-gray-200 text-gray-500"> Image & Text Block (conversion pending) </div> )}
        {block.type === 'opportunity' && ( <div className="p-4 bg-gray-200 text-gray-500"> Opportunity Block (conversion pending) </div> )}
        {block.type === 'usp' && ( <div className="p-4 bg-gray-200 text-gray-500"> USP Block (conversion pending) </div> )}
        {block.type === 'offer' && ( <div className="p-4 bg-gray-200 text-gray-500"> Offer Block (conversion pending) </div> )}
        {block.type === 'bonuses' && ( <div className="p-4 bg-gray-200 text-gray-500"> Bonuses Block (conversion pending) </div> )}
        {block.type === 'logo_cloud' && ( <div className="p-4 bg-gray-200 text-gray-500"> Logo Cloud Block (conversion pending) </div> )}
        {block.type === 'team_showcase' && ( <div className="p-4 bg-gray-200 text-gray-500"> Team Showcase Block (conversion pending) </div> )}
        {block.type === 'video_testimonials' && ( <div className="p-4 bg-gray-200 text-gray-500"> Video Testimonials Block (conversion pending) </div> )}
        {block.type === 'risk_reversal' && ( <div className="p-4 bg-gray-200 text-gray-500"> Risk Reversal Block (conversion pending) </div> )}
        {block.type === 'optin_form' && ( <div className="p-4 bg-gray-200 text-gray-500"> Opt-in Form Block (conversion pending) </div> )}
        {block.type === 'urgency' && ( <div className="p-4 bg-gray-200 text-gray-500"> Urgency Block (conversion pending) </div> )}
        {block.type === 'booking_calendar' && ( <div className="p-4 bg-gray-200 text-gray-500"> Booking Calendar Block (conversion pending) </div> )}
      </div>
    </div>
  );
}
