/**
 * Lead Magnet Types
 * Shared type definitions for the lead magnet system
 */

export type LeadMagnetType = 'ebook' | 'checklist' | 'video' | 'template';

export interface LeadMagnet {
  id: string;
  slug: string;
  magnet_type: LeadMagnetType;
  title: string;
  description: string;
  preview_image?: string;
  file_url?: string;
  benefits?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeadMagnetDownload {
  id: string;
  lead_magnet_id: string;
  customer_email: string;
  customer_name?: string;
  customer_phone?: string;
  downloaded_at: string;
}

export interface LeadMagnetFormData {
  name: string;
  email: string;
  phone?: string;
}

export interface CreateLeadMagnetDownloadData {
  lead_magnet_id: string;
  customer_email: string;
  customer_name?: string;
  customer_phone?: string;
}
