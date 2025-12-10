import { MongoClient, ObjectId } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local')
}

const uri = process.env.MONGODB_URI

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const client = new MongoClient(uri)
  const { id } = await params

  try {
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return Response.json({ success: false, error: "Invalid product ID" }, { status: 400 })
    }

    await client.connect()
    const db = client.db("thehouseofrare")

    // Get all product collections
    const collections = await db.listCollections().toArray()
    const productCollections = collections
      .filter(c => c.name.startsWith('products'))
      .map(c => c.name)

    // Search across all collections
    let product = null
    for (const collectionName of productCollections) {
      product = await db.collection(collectionName).findOne({
        _id: new ObjectId(id),
      })
      if (product) break
    }

    if (!product) {
      return Response.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    return Response.json({ success: true, data: product })
  } catch (error) {
    console.error("[v0] MongoDB error:", error)
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  } finally {
    await client.close()
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const client = new MongoClient(uri)
  const { id } = await params

  try {
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return Response.json({ success: false, error: "Invalid product ID" }, { status: 400 })
    }

    const body = await request.json()
    await client.connect()
    const db = client.db("thehouseofrare")

    // Get all product collections
    const collections = await db.listCollections().toArray()
    const productCollections = collections
      .filter(c => c.name.startsWith('products'))
      .map(c => c.name)

    // Find and update across all collections
    let result = null
    for (const collectionName of productCollections) {
      const updateResult = await db.collection(collectionName).updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...body,
            updatedAt: new Date(),
          },
        },
      )
      if (updateResult.matchedCount > 0) {
        result = updateResult
        break
      }
    }

    if (!result || result.matchedCount === 0) {
      return Response.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    return Response.json({ success: true, data: result })
  } catch (error) {
    console.error("[v0] MongoDB error:", error)
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  } finally {
    await client.close()
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const client = new MongoClient(uri)
  const { id } = await params

  try {
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return Response.json({ success: false, error: "Invalid product ID" }, { status: 400 })
    }

    await client.connect()
    const db = client.db("thehouseofrare")

    // Get all product collections
    const collections = await db.listCollections().toArray()
    const productCollections = collections
      .filter(c => c.name.startsWith('products'))
      .map(c => c.name)

    // Find and delete across all collections
    let deleted = false
    for (const collectionName of productCollections) {
      const result = await db.collection(collectionName).deleteOne({
        _id: new ObjectId(id),
      })
      if (result.deletedCount > 0) {
        deleted = true
        break
      }
    }

    if (!deleted) {
      return Response.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    return Response.json({ success: true, message: "Product deleted successfully" })
  } catch (error) {
    console.error("[v0] MongoDB error:", error)
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  } finally {
    await client.close()
  }
}
