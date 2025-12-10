"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface ProjectCardProps {
  image: string
  label?: string
  labelColor?: string
  topRightBadge?: boolean
  overlayTitle?: string
  overlaySubtitle?: string
  ctaText?: string
  ctaColor?: string
  description: string
  response: string
  author: string
  authorTitle: string
  authorImage: string
}

export function ProjectCard({
  image,
  label,
  labelColor,
  topRightBadge,
  overlayTitle,
  overlaySubtitle,
  ctaText,
  ctaColor,
  description,
  response,
  author,
  authorTitle,
  authorImage,
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="group relative overflow-hidden rounded-3xl bg-card border border-border/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Project Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={image}
          alt={overlayTitle || "Project"}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Top Label or Badge */}
        {label && !topRightBadge && (
          <div className={cn("absolute top-4 left-4 px-3 py-1 rounded-full text-white text-sm font-medium", labelColor)}>
            {label}
          </div>
        )}
        {topRightBadge && label && (
          <div className={cn("absolute top-4 right-4 px-3 py-1 rounded-full text-white text-sm font-medium", labelColor)}>
            {label}
          </div>
        )}

        {/* Overlay Content */}
        {overlayTitle && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
            <h3 className="text-white text-xl font-bold mb-1">{overlayTitle}</h3>
            {overlaySubtitle && (
              <p className="text-white/80 text-sm mb-3">{overlaySubtitle}</p>
            )}
            {ctaText && (
              <Button
                className={cn(
                  "w-fit text-white transition-all duration-300",
                  ctaColor || "bg-primary hover:bg-primary/90"
                )}
              >
                {ctaText} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Testimonial Section */}
      <div className="p-6 space-y-4">
        <p className="text-muted-foreground italic leading-relaxed">
          "{description}"
        </p>
        
        <p className="text-sm font-medium text-primary">
          {response}
        </p>

        {/* Author Info */}
        <div className="flex items-center gap-3 pt-2">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-border">
            <Image
              src={authorImage}
              alt={author}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-semibold text-sm">{author}</p>
            <p className="text-xs text-muted-foreground">{authorTitle}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
