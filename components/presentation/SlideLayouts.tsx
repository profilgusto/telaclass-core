'use client'

import React, { ReactNode, useEffect, useRef, useState } from 'react'
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
  
  // Helper function to recursively check if an element contains images
  function containsImages(element: any): boolean {
    if (!React.isValidElement(element)) return false
    
    // Direct image check
    const isDirectImage = 
      element.type === 'img' ||
      element.type === 'figure' ||
      (element.props && ((element.props as any).src || (element.props as any).alt)) ||
      (typeof element.type === 'function' && /Img|Figure/i.test(element.type.name || '')) ||
      (element.props && typeof (element.props as any).className === 'string' && (
        (element.props as any).className.includes('mx-auto') ||
        (element.props as any).className.includes('figure') ||
        (element.props as any).className.includes('block') ||
        (element.props as any).className.includes('text-center')
      ))
    
    if (isDirectImage) return true
    
    // Recursively check children
    if (element.props && (element.props as any).children) {
      const children = React.Children.toArray((element.props as any).children)
      return children.some(child => containsImages(child))
    }
    
    return false
  }
  
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
      
      // Use the recursive helper to check for images
      const isImage = containsImages(child)
      
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

// Function to override image sizing for horizontal layout with viewport adaptation
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
            'w-full max-w-full h-auto object-contain adaptive-image'
          ].filter(Boolean).join(' '),
          style: {
            ...(elem.props as any)?.style,
            width: '100%',
            maxWidth: '100%',
            height: 'auto',
            maxHeight: '70vh',
            objectFit: 'contain',
            display: 'block'
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start max-h-[75vh] overflow-hidden">
        <div className="slide-text-content space-y-4 overflow-y-auto pr-2 max-h-[70vh]">
          {textContent.length > 0 ? textContent : (
            <div className="text-center text-gray-400 italic">
              [Conteúdo de texto aqui]
            </div>
          )}
        </div>
        <div className="slide-image-content flex flex-col justify-center space-y-4 max-h-[70vh] overflow-hidden">
          {overriddenImages.length > 0 ? (
            <div className="space-y-4 flex flex-col justify-center h-full max-h-[70vh]">
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