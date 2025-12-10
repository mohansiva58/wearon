import { MongoClient } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local')
}

const uri = process.env.MONGODB_URI

export async function POST(request: Request) {
  const client = new MongoClient(uri)

  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return Response.json({ success: false, error: "Email and password required" }, { status: 400 })
    }

    await client.connect()
    const db = client.db("thehouseofrare")

    const user = await db.collection("users").findOne({ email })

    if (!user) {
      return Response.json({ success: false, error: "User not found" }, { status: 404 })
    }

    if (user.password !== password) {
      return Response.json({ success: false, error: "Invalid credentials" }, { status: 401 })
    }

    return Response.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error("[v0] Auth error:", error)
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  } finally {
    await client.close()
  }
}
