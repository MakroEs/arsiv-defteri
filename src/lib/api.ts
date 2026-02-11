import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { Item, Note, Tag, Profile } from '@/types'

// Items
export async function getItems() {
    const supabase = createClient()
    return await supabase
        .from('items')
        .select(`
      *,
      tags:item_tags(
        tag:tags(*)
      )
    `)
        .order('updated_at', { ascending: false })
}

export async function getItem(id: string) {
    const supabase = createClient()
    return await supabase
        .from('items')
        .select(`
      *,
      tags:item_tags(
        tag:tags(*)
      ),
      notes(*)
    `)
        .eq('id', id)
        .single()
}

export async function createItem(item: Database['public']['Tables']['items']['Insert']) {
    const supabase = createClient()
    return await supabase.from('items').insert(item).select().single()
}

export async function updateItem(id: string, updates: Database['public']['Tables']['items']['Update']) {
    const supabase = createClient()
    return await supabase.from('items').update(updates).eq('id', id).select().single()
}

export async function deleteItem(id: string) {
    const supabase = createClient()
    return await supabase.from('items').delete().eq('id', id)
}

// Notes
export async function getNotes(itemId?: string) {
    const supabase = createClient()
    let query = supabase.from('notes').select(`
    *,
    item:items(id, title, type)
  `).order('created_at', { ascending: false })

    if (itemId) {
        query = query.eq('item_id', itemId)
    }

    return await query
}

export async function createNote(note: Database['public']['Tables']['notes']['Insert']) {
    const supabase = createClient()
    return await supabase.from('notes').insert(note).select().single()
}

export async function updateNote(id: string, updates: Database['public']['Tables']['notes']['Update']) {
    const supabase = createClient()
    return await supabase.from('notes').update(updates).eq('id', id).select().single()
}

export async function deleteNote(id: string) {
    const supabase = createClient()
    return await supabase.from('notes').delete().eq('id', id)
}

// Tags
export async function getTags() {
    const supabase = createClient()
    return await supabase.from('tags').select('*').order('name')
}

export async function createTag(tag: Database['public']['Tables']['tags']['Insert']) {
    const supabase = createClient()
    return await supabase.from('tags').insert(tag).select().single()
}

// Profiles
export async function getProfile(userId: string) {
    const supabase = createClient()
    return await supabase.from('profiles').select('*').eq('id', userId).single()
}

export async function updateProfile(userId: string, updates: Database['public']['Tables']['profiles']['Update']) {
    const supabase = createClient()
    return await supabase.from('profiles').update(updates).eq('id', userId).select().single()
}
