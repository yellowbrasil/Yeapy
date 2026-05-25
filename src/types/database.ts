export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          icon: string | null
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          icon?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          icon?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
      }
      cities: {
        Row: {
          id: string
          name: string
          state: string
          slug: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          state: string
          slug: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          state?: string
          slug?: string
          is_active?: boolean
          created_at?: string
        }
      }
      plans: {
        Row: {
          id: string
          name: string
          slug: string
          max_active_offers: number
          price_cents: number
          features: Json
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          max_active_offers: number
          price_cents: number
          features?: Json
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          max_active_offers?: number
          price_cents?: number
          features?: Json
          is_active?: boolean
          created_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          owner_id: string
          name: string
          slug: string
          logo_url: string | null
          description: string | null
          phone: string | null
          whatsapp: string | null
          address: string | null
          city_id: string | null
          state: string | null
          social_links: Json
          plan_id: string | null
          is_active: boolean
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          slug: string
          logo_url?: string | null
          description?: string | null
          phone?: string | null
          whatsapp?: string | null
          address?: string | null
          city_id?: string | null
          state?: string | null
          social_links?: Json
          plan_id?: string | null
          is_active?: boolean
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          description?: string | null
          phone?: string | null
          whatsapp?: string | null
          address?: string | null
          city_id?: string | null
          state?: string | null
          social_links?: Json
          plan_id?: string | null
          is_active?: boolean
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          company_id: string
          name: string
          name_normalized: string
          lowest_price_cents: number | null
          last_offer_price_cents: number | null
          total_offers: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          name_normalized: string
          lowest_price_cents?: number | null
          last_offer_price_cents?: number | null
          total_offers?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          name_normalized?: string
          lowest_price_cents?: number | null
          last_offer_price_cents?: number | null
          total_offers?: number
          created_at?: string
          updated_at?: string
        }
      }
      offers: {
        Row: {
          id: string
          company_id: string
          product_id: string
          category_id: string
          city_id: string | null
          title: string
          description: string | null
          image_url: string | null
          original_price_cents: number
          promotional_price_cents: number
          external_link: string | null
          whatsapp_link: string | null
          is_national: boolean
          status: "active" | "expired" | "cancelled"
          starts_at: string
          expires_at: string
          views_count: number
          clicks_count: number
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          product_id: string
          category_id: string
          city_id?: string | null
          title: string
          description?: string | null
          image_url?: string | null
          original_price_cents: number
          promotional_price_cents: number
          external_link?: string | null
          whatsapp_link?: string | null
          is_national?: boolean
          status?: "active" | "expired" | "cancelled"
          starts_at?: string
          expires_at?: string
          views_count?: number
          clicks_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          product_id?: string
          category_id?: string
          city_id?: string | null
          title?: string
          description?: string | null
          image_url?: string | null
          original_price_cents?: number
          promotional_price_cents?: number
          external_link?: string | null
          whatsapp_link?: string | null
          is_national?: boolean
          status?: "active" | "expired" | "cancelled"
          starts_at?: string
          expires_at?: string
          views_count?: number
          clicks_count?: number
          created_at?: string
        }
      }
      offer_history: {
        Row: {
          id: string
          product_id: string
          company_id: string
          offer_id: string
          promotional_price_cents: number
          original_price_cents: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          company_id: string
          offer_id: string
          promotional_price_cents: number
          original_price_cents: number
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          company_id?: string
          offer_id?: string
          promotional_price_cents?: number
          original_price_cents?: number
          created_at?: string
        }
      }
      platform_settings: {
        Row: {
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          updated_at?: string
        }
      }
    }
  }
}

export type Category = Database["public"]["Tables"]["categories"]["Row"]
export type City = Database["public"]["Tables"]["cities"]["Row"]
export type Plan = Database["public"]["Tables"]["plans"]["Row"]
export type Company = Database["public"]["Tables"]["companies"]["Row"]
export type Product = Database["public"]["Tables"]["products"]["Row"]
export type Offer = Database["public"]["Tables"]["offers"]["Row"]
export type OfferHistory = Database["public"]["Tables"]["offer_history"]["Row"]

export type OfferWithRelations = Offer & {
  company: Pick<Company, "id" | "name" | "slug" | "logo_url" | "whatsapp" | "is_verified">
  category: Pick<Category, "id" | "name" | "slug">
  city: Pick<City, "id" | "name" | "state" | "slug"> | null
  product: Pick<Product, "id" | "name" | "lowest_price_cents" | "total_offers">
}
