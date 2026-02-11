export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    display_name: string | null
                    full_name: string | null
                    avatar_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    display_name?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    display_name?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_id_fkey"
                        columns: ["id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            items: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    type: Database["public"]["Enums"]["item_type"]
                    status: Database["public"]["Enums"]["item_status"]
                    rating: number | null
                    progress_value: number | null
                    progress_unit: string | null
                    started_at: string | null
                    finished_at: string | null
                    short_note: string | null
                    review: string | null
                    cover_url: string | null
                    is_favorite: boolean
                    visibility: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    type: Database["public"]["Enums"]["item_type"]
                    status?: Database["public"]["Enums"]["item_status"]
                    rating?: number | null
                    progress_value?: number | null
                    progress_unit?: string | null
                    started_at?: string | null
                    finished_at?: string | null
                    short_note?: string | null
                    review?: string | null
                    cover_url?: string | null
                    is_favorite?: boolean
                    visibility?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    type?: Database["public"]["Enums"]["item_type"]
                    status?: Database["public"]["Enums"]["item_status"]
                    rating?: number | null
                    progress_value?: number | null
                    progress_unit?: string | null
                    started_at?: string | null
                    finished_at?: string | null
                    short_note?: string | null
                    review?: string | null
                    cover_url?: string | null
                    is_favorite?: boolean
                    visibility?: string
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "items_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            notes: {
                Row: {
                    id: string
                    user_id: string
                    item_id: string
                    type: Database["public"]["Enums"]["note_type"]
                    content: string
                    is_spoiler: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    item_id: string
                    type?: Database["public"]["Enums"]["note_type"]
                    content: string
                    is_spoiler?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    item_id?: string
                    type?: Database["public"]["Enums"]["note_type"]
                    content?: string
                    is_spoiler?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "notes_item_id_fkey"
                        columns: ["item_id"]
                        referencedRelation: "items"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "notes_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            tags: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "tags_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            item_tags: {
                Row: {
                    item_id: string
                    tag_id: string
                    user_id: string
                    created_at: string
                }
                Insert: {
                    item_id: string
                    tag_id: string
                    user_id: string
                    created_at?: string
                }
                Update: {
                    item_id?: string
                    tag_id?: string
                    user_id?: string
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "item_tags_item_id_fkey"
                        columns: ["item_id"]
                        referencedRelation: "items"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "item_tags_tag_id_fkey"
                        columns: ["tag_id"]
                        referencedRelation: "tags"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "item_tags_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            item_type: 'series' | 'movie' | 'book' | 'manga' | 'game' | 'podcast' | 'documentary'
            item_status: 'planned' | 'in_progress' | 'completed' | 'dropped' | 'rewatch'
            note_type: 'quick' | 'spoiler' | 'quote' | 'insight'
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
