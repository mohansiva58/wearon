import connectDB from "@/lib/mongodb"
import { NextResponse } from "next/server"
import mongoose from "mongoose"

const subcollections = [
	{ id: 'shirts', category: 'Shirts', collectionName: 'products_shirts' },
	{ id: 'jeans', category: 'Pants', collectionName: 'products_jeans' },
	{ id: 'jackets', category: 'Jackets', collectionName: 'products_jackets' },
	{ id: 'sweaters', category: 'Hoodies', collectionName: 'products_sweaters' },
	{ id: 'sweatshirts', category: 'Activewear', collectionName: 'products_sweatshirts' },
	{ id: 'tshirts', category: 'T-Shirts', collectionName: 'products_tshirts' },
	{ id: 'trousers', category: 'Pants', collectionName: 'products_trousers' },
	{ id: 'polos', category: 'Shirts', collectionName: 'products_polos' },
]

const categoryToCollections: Record<string, string[]> = {
	'Shirts': ['products_shirts', 'products_polos'],
	'Pants': ['products_jeans', 'products_trousers'],
	'Jackets': ['products_jackets'],
	'Hoodies': ['products_sweaters'],
	'Activewear': ['products_sweatshirts'],
	'T-Shirts': ['products_tshirts'],
}

export async function GET(request: Request) {
	try {
		await connectDB()
    
		const { searchParams } = new URL(request.url)
		const category = searchParams.get('category')
		const collection = searchParams.get('collection')

		const db = mongoose.connection.db
		if (!db) {
			return NextResponse.json(
				{ success: false, error: 'Database connection failed' },
				{ status: 500 }
			)
		}

		let products: any[] = []

		if (collection) {
			// Get products from specific sub-collection
			const collName = `products_${collection}`
			const col = db.collection(collName)
			products = await col.find({}).toArray()
		} else if (category) {
			// Get products from all collections of this category
			const collectionNames = categoryToCollections[category] || []
			for (const collName of collectionNames) {
				const col = db.collection(collName)
				const docs = await col.find({}).toArray()
				products = [...products, ...docs]
			}
		} else {
			// Get all products from all sub-collections
			for (const sub of subcollections) {
				const col = db.collection(sub.collectionName)
				const docs = await col.find({}).toArray()
				products = [...products, ...docs]
			}
		}

		return NextResponse.json({
			success: true,
			products,
			count: products.length,
		})
	} catch (error: any) {
		console.error('Failed to fetch products:', error)
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		)
	}
}

export async function POST(request: Request) {
	try {
		await connectDB()
    
		const body = await request.json()
		const { category, ...productData } = body

		const db = mongoose.connection.db
		if (!db) {
			return NextResponse.json(
				{ success: false, error: 'Database connection failed' },
				{ status: 500 }
			)
		}

		// Determine which sub-collection to save to
		let targetCollection = 'products'
    
		if (category === 'Shirts') {
			targetCollection = 'products_shirts'
		} else if (category === 'Pants') {
			// Determine if it's jeans or trousers based on product name
			const name = productData.name?.toLowerCase() || ''
			targetCollection = name.includes('jean') ? 'products_jeans' : 'products_trousers'
		} else if (category === 'Jackets') {
			targetCollection = 'products_jackets'
		} else if (category === 'Hoodies') {
			targetCollection = 'products_sweaters'
		} else if (category === 'Activewear') {
			targetCollection = 'products_sweatshirts'
		} else if (category === 'T-Shirts') {
			targetCollection = 'products_tshirts'
		}

		const collection = db.collection(targetCollection)
    
		const result = await collection.insertOne({
			...productData,
			category,
			createdAt: new Date(),
			updatedAt: new Date(),
		})

		return NextResponse.json({
			success: true,
			productId: result.insertedId,
			collection: targetCollection,
		})
	} catch (error: any) {
		console.error('Failed to create product:', error)
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		)
	}
}
