import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Plus, Trash2, Palette, Type, Image as ImageIcon, LayoutGrid, Box, Heading1, Heading2, Pilcrow, MousePointerClick, Link as LinkIcon, X, AppWindow, Container
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import _ from 'lodash';

// Helper component for Image Inputs
const ImageInput = ({ value, onChange, onOpenAssetManager, onClear }) => (
  <div className="flex items-center gap-2">
    <Input
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter image URL..."
      className="flex-grow h-8"
    />
    <Button variant="outline" size="sm" onClick={onOpenAssetManager} className="h-8 px-2">
      Choose
    </Button>
    {onClear && (
      <Button variant="ghost" size="sm" onClick={onClear} className="h-8 w-8 p-0 text-gray-500 hover:bg-red-50 hover:text-red-500">
        <X className="w-4 h-4" />
      </Button>
    )}
  </div>
);

// Helper component for Style Inputs
const StyleInputGroup = ({ title, properties, styles, onUpdate, children }) => (
  <div className="space-y-3">
    {title && <h4 className="text-xs font-semibold uppercase text-gray-500 tracking-wider">{title}</h4>}
    <div className="space-y-4">
      {properties.map(prop => {
        const value = _.get(styles, prop.key, prop.default || '');
        if (prop.type === 'text') {
          return (
            <div key={prop.key}>
              <Label className="text-sm">{prop.label}</Label>
              <Input
                value={value}
                onChange={(e) => onUpdate(prop.key, e.target.value)}
                placeholder={prop.placeholder}
                className="mt-1 h-8"
              />
            </div>
          );
        }
        if (prop.type === 'color') {
          return (
            <div key={prop.key}>
              <Label className="text-sm">{prop.label}</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="color"
                  value={value}
                  onChange={(e) => onUpdate(prop.key, e.target.value)}
                  className="w-10 h-8 p-1 rounded border"
                />
                <Input
                  value={value}
                  onChange={(e) => onUpdate(prop.key, e.target.value)}
                  placeholder={prop.placeholder}
                  className="flex-1 h-8 text-xs"
                />
              </div>
            </div>
          );
        }
        if (prop.type === 'select') {
          return (
            <div key={prop.key}>
              <Label className="text-sm">{prop.label}</Label>
              <Select value={value} onValueChange={(val) => onUpdate(prop.key, val)}>
                <SelectTrigger className="mt-1 h-8">
                  <SelectValue placeholder={prop.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {prop.options.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }
        return null;
      })}
      {children}
    </div>
  </div>
);

const ELEMENT_CONFIG = {
    // Content Elements (these are typically parts of a block's content object)
    headline: { title: 'Headline', icon: Heading1, content: { type: 'textarea' }, styles: ['typography', 'spacing'] },
    subHeadline: { title: 'Sub-headline', icon: Heading2, content: { type: 'textarea' }, styles: ['typography', 'spacing'] },
    preHeadline: { title: 'Pre-headline', icon: Pilcrow, content: { type: 'textarea' }, styles: ['typography', 'spacing'] },
    story: { title: 'Story Text', icon: Type, content: { type: 'textarea' }, styles: ['typography', 'spacing'] },
    text: { title: 'Text', icon: Pilcrow, content: { type: 'textarea' }, styles: ['typography', 'spacing'] },
    guaranteeText: { title: 'Guarantee Text', icon: Pilcrow, content: { type: 'text' }, styles: ['typography', 'spacing'] },
    securityText: { title: 'Security Text', icon: Pilcrow, content: { type: 'text' }, styles: ['typography', 'spacing'] },
    ctaText: { title: 'Button Text', icon: MousePointerClick, content: { type: 'text' }, styles: [] },
    
    // Standalone Elements (these are typically block-level elements that have their own distinct content and styles)
    button: { title: 'Button', icon: MousePointerClick, content: [{key: 'ctaText', label: 'Button Text'}, {key: 'ctaLink', label: 'Button Link'}], styles: ['typography', 'background', 'sizing', 'spacing', 'borders'] },
    image: { title: 'Image', icon: ImageIcon, content: { type: 'image' }, styles: ['sizing', 'spacing', 'borders'] },
    sealImage: { title: 'Seal Image', icon: ImageIcon, content: { type: 'image' }, styles: ['sizing', 'spacing', 'borders'] },
    profileImage: { title: 'Profile Image', icon: ImageIcon, content: { type: 'image' }, styles: ['sizing', 'spacing', 'borders'] },
    videoPlaceholder: { title: 'Video Placeholder', icon: ImageIcon, content: { type: 'image' }, styles: ['sizing', 'spacing', 'borders'] },

    // Container Elements (these control layout and spacing of grouped items)
    itemsContainer: { title: 'Items Container', icon: Container, content: null, styles: ['layout', 'spacing', 'background', 'borders'] },
    faqContainer: { title: 'FAQ Container', icon: Container, content: null, styles: ['layout', 'spacing', 'background', 'borders'] },
    testimonialsContainer: { title: 'Testimonials Container', icon: Container, content: null, styles: ['layout', 'spacing', 'background', 'borders'] },
    countdownContainer: { title: 'Countdown Container', icon: Container, content: null, styles: ['layout', 'spacing', 'background', 'borders'] },

    // List Item Elements (handled by list editor, but config defines their properties if selected)
    item: { title: 'List Item', icon: Type, content: { type: 'text' }, styles: ['typography'] },
    question: { title: 'Question', icon: Type, content: { type: 'text' }, styles: ['typography'] },
    answer: { title: 'Answer', icon: Type, content: { type: 'textarea' }, styles: ['typography'] },
    testimonialText: { title: 'Testimonial Text', icon: Type, content: { type: 'textarea' }, styles: ['typography'] },
    testimonialName: { title: 'Name', icon: Type, content: { type: 'text' }, styles: ['typography'] },
    itemTitle: { title: 'Item Title', icon: Type, content: { type: 'text' }, styles: ['typography'] },
    itemDescription: { title: 'Item Description', icon: Type, content: { type: 'textarea' }, styles: ['typography'] },
};

const STYLE_PRESETS = {
    typography: [
        { key: 'color', label: 'Color', type: 'color' },
        { key: 'fontSize', label: 'Font Size', type: 'text', placeholder: '16px' },
        { key: 'fontWeight', label: 'Font Weight', type: 'select', options: [ {value: '300', label: 'Light'}, {value: '400', label: 'Normal'}, {value: '500', label: 'Medium'}, {value: '600', label: 'Semi-Bold'}, {value: '700', label: 'Bold'} ]},
        { key: 'textTransform', label: 'Transform', type: 'select', options: [ {value: 'none', label: 'None'}, {value: 'uppercase', label: 'Uppercase'}, {value: 'lowercase', label: 'Lowercase'}, {value: 'capitalize', label: 'Capitalize'} ]},
    ],
    layout: [
        { key: 'display', label: 'Display', type: 'select', options: [ {value: 'flex', label: 'Flex'}, {value: 'grid', label: 'Grid'}, {value: 'block', label: 'Block'} ]},
        { key: 'flexDirection', label: 'Direction', type: 'select', options: [ {value: 'row', label: 'Row'}, {value: 'column', label: 'Column'} ]},
        { key: 'justifyContent', label: 'Justify', type: 'select', options: [ {value: 'flex-start', label: 'Start'}, {value: 'center', label: 'Center'}, {value: 'flex-end', label: 'End'}, {value: 'space-between', label: 'Space Between'} ]},
        { key: 'alignItems', label: 'Align', type: 'select', options: [ {value: 'flex-start', label: 'Start'}, {value: 'center', label: 'Center'}, {value: 'flex-end', label: 'End'} ]},
        { key: 'gap', label: 'Gap', type: 'text', placeholder: '1rem' },
    ],
    background: [ { key: 'backgroundColor', label: 'Background Color', type: 'color' } ],
    sizing: [ { key: 'width', label: 'Width', type: 'text' }, { key: 'height', label: 'Height', type: 'text' }, { key: 'maxHeight', label: 'Max Height', type: 'text' } ],
    spacing: [ { key: 'padding', label: 'Padding', type: 'text' }, { key: 'margin', label: 'Margin', type: 'text' } ],
    borders: [ { key: 'borderRadius', label: 'Border Radius', type: 'text' }, { key: 'border', label: 'Border', type: 'text' } ],
};

// Main Component
export default function PropertyPanel({
  selectedBlock,
  selectedElementKey,
  onContentUpdate,
  onStylesUpdate,
  onLayoutUpdate,
  onOpenAssetManager,
  onAddListItem,
  onDeleteListItem
}) {
  if (!selectedBlock) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
              <MousePointerClick className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">Select an Element</h3>
          <p className="text-sm">Click on any element on the canvas to edit its properties.</p>
        </div>
      </div>
    );
  }

  const handleContentChange = (path, value) => {
    onContentUpdate(selectedBlock.id, path, value);
  };
  
  const handleStyleChange = (path, value) => {
    onStylesUpdate(selectedBlock.id, path, value);
  };
  
  const renderElementEditor = () => {
    if (!selectedElementKey) {
        return (
            <div className="text-center text-gray-500 p-4">
                <AppWindow className="w-12 h-12 mx-auto text-gray-400 mb-2"/>
                <h4 className="font-semibold">Block Selected</h4>
                <p className="text-sm">Click an element on the canvas to edit it.</p>
            </div>
        )
    }

    // Handle list items (e.g., "items[0]", "items[1].title")
    const listMatch = selectedElementKey.match(/^(\w+)\[(\d+)\](?:\.(\w+))?$/);

    if (listMatch) {
        const listKey = listMatch[1]; // e.g., 'items'
        const index = parseInt(listMatch[2], 10); // e.g., 0
        const subKey = listMatch[3]; // e.g., 'title' for object items, or undefined for string items

        const list = selectedBlock.content[listKey] || [];
        const item = list[index];

        const itemContentPath = subKey ? `${listKey}[${index}].${subKey}` : `${listKey}[${index}]`;
        const itemValue = subKey ? _.get(item, subKey) : item;

        // Determine if it's an object item by checking if the item itself is an object
        const isObjectItem = typeof item === 'object' && item !== null && !Array.isArray(item);

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Type className="w-4 h-4"/>
                            {`Item #${index + 1}`} {subKey ? ` - ${_.startCase(subKey)}` : ''}
                        </div>
                        <Button variant="destructive" size="sm" className="h-6 w-6 p-0" onClick={() => onDeleteListItem(selectedBlock.id, listKey, index)}>
                            <Trash2 className="w-3 h-3"/>
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isObjectItem ? (
                        // Handle object list items (e.g. testimonials, logos)
                        Object.keys(item).map(key => {
                            const path = `${listKey}[${index}].${key}`;
                            const value = item[key];
                            const isImage = key.toLowerCase().includes('image') || key.toLowerCase().includes('avatar');
                            return (
                                <div key={key}>
                                    <Label className="capitalize text-xs">{_.startCase(key)}</Label>
                                    {isImage ? (
                                        <ImageInput 
                                            value={value} 
                                            onChange={(v) => handleContentChange(path, v)} 
                                            onOpenAssetManager={() => onOpenAssetManager({ blockId: selectedBlock.id, path: `content.${path}` })} 
                                            onClear={() => handleContentChange(path, '')}
                                        />
                                    ) : (
                                        <Textarea value={value} onChange={(e) => handleContentChange(path, e.target.value)} className="text-sm"/>
                                    )}
                                </div>
                            )
                        })
                    ) : (
                        // Handle string list items
                        <Textarea value={itemValue} onChange={(e) => handleContentChange(itemContentPath, e.target.value)} />
                    )}
                </CardContent>
            </Card>
        )
    }

    const config = ELEMENT_CONFIG[selectedElementKey];
    if (!config) return <div className="p-4 text-sm text-red-500">Configuration for '{selectedElementKey}' not found.</div>;

    const Icon = config.icon || Box;
    
    // Flatten properties from presets for StyleInputGroup
    const elementStyleProperties = config.styles?.flatMap(presetKey => STYLE_PRESETS[presetKey] || []) || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <Icon className="w-4 h-4" /> {config.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Content Fields */}
                {config.content && (
                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Content</h4>
                        {Array.isArray(config.content) ? config.content.map(field => (
                           <div key={field.key}>
                               <Label className="capitalize text-xs">{_.startCase(field.label || field.key)}</Label>
                               <Input 
                                   value={_.get(selectedBlock.content, field.key) || ''} 
                                   onChange={e => handleContentChange(field.key, e.target.value)} 
                                   className="h-8"
                               />
                           </div>
                        )) : (
                             config.content.type === 'textarea' ?
                                <Textarea value={selectedBlock.content[selectedElementKey] || ''} onChange={e => handleContentChange(selectedElementKey, e.target.value)} />
                            : config.content.type === 'text' ?
                                <Input value={selectedBlock.content[selectedElementKey] || ''} onChange={e => handleContentChange(selectedElementKey, e.target.value)} className="h-8"/>
                            : config.content.type === 'image' ?
                                <ImageInput 
                                    value={selectedBlock.content[selectedElementKey] || ''}
                                    onChange={val => handleContentChange(selectedElementKey, val)}
                                    onOpenAssetManager={() => onOpenAssetManager({ blockId: selectedBlock.id, path: `content.${selectedElementKey}` })}
                                    onClear={() => handleContentChange(selectedElementKey, '')}
                                />
                            : null
                        )}
                    </div>
                )}
                
                {/* Style Fields */}
                {elementStyleProperties.length > 0 && (
                    <StyleInputGroup 
                        title="Styling" 
                        styles={selectedBlock.styles[selectedElementKey] || {}} 
                        onUpdate={(propKey, val) => handleStyleChange(`${selectedElementKey}.${propKey}`, val)}
                        properties={elementStyleProperties}
                    />
                )}
            </CardContent>
        </Card>
    )
  }

  const renderGeneralStyling = () => (
    <Accordion type="multiple" defaultValue={['general-styling']}>
      <AccordionItem value="general-styling">
        <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center gap-2"><Palette className="w-4 h-4"/>General Styling</div>
        </AccordionTrigger>
        <AccordionContent className="pt-4">
          <StyleInputGroup
            styles={selectedBlock.styles}
            onUpdate={(propKey, val) => handleStyleChange(propKey, val)}
            properties={[
              { key: 'backgroundColor', label: 'Background Color', type: 'color' },
              { key: 'padding', label: 'Padding', type: 'text', placeholder: '60px 20px' },
              { key: 'textAlign', label: 'Text Align', type: 'select', options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }] },
            ]}
          >
             <div className="space-y-2 pt-4">
                <Label className="text-sm">Background Image</Label>
                <ImageInput value={selectedBlock.styles?.backgroundImage} onChange={val => handleStyleChange('backgroundImage', val)} onOpenAssetManager={() => onOpenAssetManager({ blockId: selectedBlock.id, path: 'styles.backgroundImage' })} onClear={() => handleStyleChange('backgroundImage', '')} />
             </div>
          </StyleInputGroup>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
  
  const renderListManagement = () => {
    // Find lists in the content
    const lists = Object.entries(selectedBlock.content).filter(([key, value]) => Array.isArray(value));
    if (lists.length === 0) return null;

    return (
      <Accordion type="multiple">
        {lists.map(([listKey, listValue]) => {
          // Infer item template from the first item or a default
          const itemTemplate = listValue.length > 0 
            ? (_.isObject(listValue[0]) ? { ...listValue[0] } : '') // Clone object or use empty string
            : ((selectedBlock.type === 'checklist_feature' || selectedBlock.type === 'usp') ? '' : {title: 'New Item', description: 'Description'});
          
          return (
            <AccordionItem key={listKey} value={listKey}>
              <AccordionTrigger className="text-base font-semibold capitalize">
                <div className="flex items-center gap-2">{_.startCase(listKey)}</div>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-xs text-gray-500 mb-2">Click on list items in the canvas to edit them.</p>
                <Button onClick={() => onAddListItem(selectedBlock.id, listKey, itemTemplate)} size="sm">
                  <Plus className="w-4 h-4 mr-2"/> Add Item
                </Button>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    )
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 capitalize">
          {selectedBlock.type.replace(/_/g, ' ')}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {selectedElementKey ? `Editing: ${_.startCase(selectedElementKey.split('[')[0])}` : 'Block Properties'}
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {renderElementEditor()}
        {renderListManagement()}
        {renderGeneralStyling()}
      </div>
    </div>
  );
}