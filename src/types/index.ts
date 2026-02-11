import { Database } from './database.types'

export type ItemType = Database['public']['Enums']['item_type']
export type ItemStatus = Database['public']['Enums']['item_status']
export type NoteType = Database['public']['Enums']['note_type']

// Base types mapped from database
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Item = Database['public']['Tables']['items']['Row']
export type Note = Database['public']['Tables']['notes']['Row']
export type Tag = Database['public']['Tables']['tags']['Row']
export type ItemTag = Database['public']['Tables']['item_tags']['Row']

// Extended types for UI usage (e.g. including relations)
export interface ItemWithRelations extends Item {
    tags?: Tag[]
    notes?: Note[]
}

export interface NoteWithItem extends Note {
    item?: Pick<Item, 'id' | 'title' | 'type'>
}
