export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string;
          status: 'pending' | 'completed' | 'urgent';
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          status?: 'pending' | 'completed' | 'urgent';
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          status?: 'pending' | 'completed' | 'urgent';
          created_at?: string;
          completed_at?: string | null;
        };
      };
      missions: {
        Row: {
          id: string;
          title: string;
          description: string;
          scheduled_date: string;
          status: 'pending' | 'completed' | 'urgent';
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          scheduled_date: string;
          status?: 'pending' | 'completed' | 'urgent';
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          scheduled_date?: string;
          status?: 'pending' | 'completed' | 'urgent';
          created_at?: string;
          completed_at?: string | null;
        };
      };
      notes: {
        Row: {
          id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      purchases: {
        Row: {
          id: string;
          item: string;
          quantity: number;
          price: number;
          status: 'pending' | 'completed';
          created_at: string;
        };
        Insert: {
          id?: string;
          item: string;
          quantity?: number;
          price?: number;
          status?: 'pending' | 'completed';
          created_at?: string;
        };
        Update: {
          id?: string;
          item?: string;
          quantity?: number;
          price?: number;
          status?: 'pending' | 'completed';
          created_at?: string;
        };
      };
      sales: {
        Row: {
          id: string;
          item: string;
          quantity: number;
          price: number;
          buyer: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          item: string;
          quantity?: number;
          price: number;
          buyer?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          item?: string;
          quantity?: number;
          price?: number;
          buyer?: string;
          created_at?: string;
        };
      };
      deliveries: {
        Row: {
          id: string;
          description: string;
          recipient: string;
          status: 'pending' | 'completed';
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          description: string;
          recipient: string;
          status?: 'pending' | 'completed';
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          description?: string;
          recipient?: string;
          status?: 'pending' | 'completed';
          created_at?: string;
          completed_at?: string | null;
        };
      };
    };
  };
}
