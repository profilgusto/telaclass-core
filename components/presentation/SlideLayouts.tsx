'use client'

import React, { ReactNode } from 'react'
import { useViewMode } from './useViewMode'

interface SlideLayoutProps {
  children: ReactNode
  layout?: string
}

// Helper to split children into title, text and image groups
function splitContentByType(children: ReactNode) {
  const childArray = React.Children.toArray(children)
  const titleContent: ReactNode[] = []
  const textContent: ReactNode[] = []
  const imageContent: ReactNode[] = []
  
  childArray.forEach((child) => {
    if (React.isValidElement(child)) {
      // Check if it's a heading/title element
      const isTitle = 
        child.type === 'h1' ||
        child.type === 'h2' ||
        child.type === 'h3' ||
        child.type === 'h4' ||
        child.type === 'h5' ||
        child.type === 'h6' ||
        // Check for functions that render headings (from MDX system)
        (typeof child.type === 'function' && (
          child.type.name === 'h1' ||
          child.type.name === 'h2' ||
          child.type.name === 'h3' ||
          child.type.name === 'h4' ||
          child.type.name === 'h5' ||
          child.type.name === 'h6'
        )) ||
        // Check if it's a function that generates heading elements (check string representation)
        (typeof child.type === 'function' && 
         child.type.toString().includes('"h1"') ||
         child.type.toString().includes('"h2"') ||
         child.type.toString().includes('"h3"') ||
         child.type.toString().includes('"h4"') ||
         child.type.toString().includes('"h5"') ||
         child.type.toString().includes('"h6"'))
      
      // Check if it's an image element
      const isImage = 
        // Direct image elements
        child.type === 'img' ||
        child.type === 'figure' ||
        // Check for className patterns used by the MDX system
        (child.props && typeof (child.props as any).className === 'string' && (
          (child.props as any).className.includes('mx-auto') ||
          (child.props as any).className.includes('figure') ||
          (child.props as any).className.includes('block') ||
          (child.props as any).className.includes('text-center')
        )) ||
        // Check if element has image-related props
        (child.props && ((child.props as any).src || (child.props as any).alt)) ||
        // Image components by function name
        (typeof child.type === 'function' && /Img|Figure/i.test(child.type.name || '')) ||
        // Check if it's a container with image children (recursive check)
        (child.props && (child.props as any).children && 
         React.Children.toArray((child.props as any).children).some((grandchild: any) => {
           if (React.isValidElement(grandchild)) {
             return (
               grandchild.type === 'img' ||
               grandchild.type === 'figure' ||
               (typeof grandchild.type === 'function' && /Img/i.test(grandchild.type.name || '')) ||
               (grandchild.props && ((grandchild.props as any).src || (grandchild.props as any).alt)) ||
               (grandchild.props && typeof (grandchild.props as any).className === 'string' && 
                (grandchild.props as any).className.includes('mx-auto'))
             )
           }
           return false
         }))
      
      if (isTitle) {
        titleContent.push(child)
      } else if (isImage) {
        imageContent.push(child)
      } else {
        textContent.push(child)
      }
    } else {
      textContent.push(child)
    }
  })
  
  return { titleContent, textContent, imageContent }
}

// Layout 1: Traditional vertical layout (default)
export function VerticalLayout({ children }: { children: ReactNode }) {
  const { titleContent, textContent, imageContent } = splitContentByType(children)
  
  return (
    <div className="slide-layout-vertical">
      {/* Title section - full width */}
      {titleContent.length > 0 && (
        <div className="slide-title-section mb-4">
          {titleContent}
        </div>
      )}
      
      {/* Content section - vertical flow */}
      <div className="slide-content-section space-y-4">
        {textContent}
        {imageContent}
      </div>
    </div>
  )
}

// Function to override image sizing for horizontal layout
function overrideImageSizing(imageElements: ReactNode[]): ReactNode[] {
  return imageElements.map((element, index) => {
    if (!React.isValidElement(element)) return element
    
    // Function to recursively apply width override to image elements
    function applyWidthOverride(elem: React.ReactElement): React.ReactElement {
      // If it's an img element or has image-related props, override its sizing
      const isImageElement = 
        elem.type === 'img' ||
        (elem.props && ((elem.props as any).src || (elem.props as any).alt))
      
      if (isImageElement) {
        return React.cloneElement(elem as any, {
          ...(elem.props as any),
          className: [
            (elem.props as any)?.className,
            'w-full max-w-full h-auto'
          ].filter(Boolean).join(' '),
          style: {
            ...(elem.props as any)?.style,
            width: '100%',
            maxWidth: '100%',
            height: 'auto'
          }
        })
      }
      
      // If it has children, recursively apply to children
      if (elem.props && (elem.props as any).children) {
        const updatedChildren = React.Children.map((elem.props as any).children, (child) => {
          if (React.isValidElement(child)) {
            return applyWidthOverride(child)
          }
          return child
        })
        
        return React.cloneElement(elem as any, {
          ...(elem.props as any),
          children: updatedChildren
        })
      }
      
      return elem
    }
    
    return applyWidthOverride(element as React.ReactElement)
  })
}

// Layout 2: Horizontal split layout (text left, images right)
export function HorizontalLayout({ children }: { children: ReactNode }) {
  const { titleContent, textContent, imageContent } = splitContentByType(children)
  
  // Override image sizing for horizontal layout
  const overriddenImages = overrideImageSizing(imageContent)
  
  return (
    <div className="slide-layout-horizontal">
      {/* Title section - full width */}
      {titleContent.length > 0 && (
        <div className="slide-title-section mb-4">
          {titleContent}
        </div>
      )}
      
      {/* Content section - two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 min-h-[40vh] items-start">
        <div className="slide-text-content space-y-4">
          {textContent.length > 0 ? textContent : (
            <div className="text-center text-gray-400 italic">
              [Conteúdo de texto aqui]
            </div>
          )}
        </div>
        <div className="slide-image-content flex flex-col justify-center space-y-4">
          {overriddenImages.length > 0 ? (
            <div className="space-y-4">
              {overriddenImages}
            </div>
          ) : (
            <div className="text-center text-gray-400 italic border-2 border-dashed border-gray-300 rounded-lg p-8">
              [Imagens serão exibidas aqui]
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Main layout selector component
export default function SlideLayout({ children, layout = '1' }: SlideLayoutProps) {
  const mode = useViewMode()
  
  // Only apply special layouts in presentation mode
  if (mode !== 'apresentacao') {
    return <>{children}</>
  }
  
  switch (layout) {
    case '2':
      return <HorizontalLayout>{children}</HorizontalLayout>
    case '1':
    default:
      return <VerticalLayout>{children}</VerticalLayout>
  }
}