import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl
    
    const category = searchParams.get('category')
    const size = searchParams.get('size')
    const sort = searchParams.get('sort')
    const page = searchParams.get('page')
    const limit = searchParams.get('limit')
    const featured = searchParams.get('featured')

    const pageNum = parseInt(page) || 1
    const limitNum = parseInt(limit) || 12
    const from = (pageNum - 1) * limitNum
    const to = from + limitNum - 1

    // 1. Data Query
    let query = supabaseAdmin
      .from('products')
      .select('*, product_variants(*)')
      .eq('is_active', true)

    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (sort === 'sale') {
      query = query.not('sale_price', 'is', null)
    }

    // Sorting
    if (sort === 'price_asc') {
      query = query.order('base_price', { ascending: true })
    } else if (sort === 'price_desc') {
      query = query.order('base_price', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    // Pagination
    query = query.range(from, to)

    const { data, error } = await query

    if (error) {
      throw error
    }

    let filteredData = data

    // Memory filter for size
    if (size) {
      filteredData = filteredData.filter(product => {
        if (!product.product_variants) return false
        return product.product_variants.some(
          v => v.size === size && v.stock_quantity > 0
        )
      })
    }

    // 2. Count Query
    let countQuery = supabaseAdmin
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)

    if (featured === 'true') {
      countQuery = countQuery.eq('is_featured', true)
    }

    if (category) {
      countQuery = countQuery.eq('category', category)
    }

    if (sort === 'sale') {
      countQuery = countQuery.not('sale_price', 'is', null)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      throw countError
    }

    return NextResponse.json({
      products: filteredData,
      total: count,
      page: pageNum,
      totalPages: Math.ceil(count / limitNum)
    })

  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
