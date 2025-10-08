'use client'

import React, { ReactNode } from 'react'
import { useViewMode } from './useViewMode'

interface SlideLayoutProps {
  children: ReactNode
  layout?: string
}

// Helper to split children into text and image groups
function splitContentByType(children: ReactNode) {
  const childArray = React.Children.toArray(children)
  const textContent: ReactNode[] = []
  const imageContent: ReactNode[] = []
  
  childArray.forEach((child) => {
    if (React.isValidElement(child)) {
      // Comprehensive image detection
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
      
      if (isImage) {
        imageContent.push(child)
      } else {
        textContent.push(child)
      }
    } else {
      textContent.push(child)
    }
  })
  
  return { textContent, imageContent }
}

// Layout 1: Traditional vertical layout (default)
export function VerticalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="slide-layout-vertical">
      {children}
    </div>
  )
}

// Layout 2: Horizontal split layout (text left, images right)
export function HorizontalLayout({ children }: { children: ReactNode }) {
  const { textContent, imageContent } = splitContentByType(children)
  
  return (
    <div className="slide-layout-horizontal grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 min-h-[50vh] items-start">
      <div className="slide-text-content space-y-4 flex flex-col justify-center">
        {textContent.length > 0 ? textContent : (
          <div className="text-center text-gray-400 italic">
            [Conteúdo de texto aqui]
          </div>
        )}
      </div>
      <div className="slide-image-content flex flex-col justify-center space-y-4">
        {imageContent.length > 0 ? (
          <div className="space-y-4">
            {imageContent}
          </div>
        ) : (
          <div className="text-center text-gray-400 italic border-2 border-dashed border-gray-300 rounded-lg p-8">
            [Imagens serão exibidas aqui]
          </div>
        )}
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