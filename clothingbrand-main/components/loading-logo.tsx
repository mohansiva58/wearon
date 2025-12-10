"use client"

import Image from "next/image"

export default function LoadingLogo({
  src = "/logo.svg",
  alt = "Loading",
}: {
  src?: string
  alt?: string
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full ring-1 ring-gray-200 flex items-center justify-center">
          {/* If the logo file exists, this will show; otherwise nothing breaks */}
          <Image
            src={src}
            alt={alt}
            width={96}
            height={96}
            className="animate-pulse"
            priority={false}
          />
        </div>
        <p className="mt-3 text-sm text-gray-600">Loading…</p>
      </div>
    </div>
  )
}
