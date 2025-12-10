import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"

export async function GET() {
  try {
    await connectDB()
    return NextResponse.json({ 
      success: true, 
      message: "MongoDB connection successful!",
      database: "thehouseofrare"
    })
  } catch (error) {
    console.error("MongoDB connection error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    )
  }
}
