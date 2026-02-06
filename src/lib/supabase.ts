import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials are missing! Check your .env file.');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// Define types for our database tables
export type Employee = {
    id: string;
    full_name: string;
    email: string;
    department: string;
    role: string;
    is_admin?: boolean;
    is_team_leader?: boolean;
    reports_to?: string;
    avatar_url?: string;
    banner_url?: string;
    status: 'Active' | 'Inactive';
    created_at: string;
}

export type Report = {
    id: string;
    title: string;
    author_id: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    type: string;
    description?: string;
    proof_url?: string;
    created_at: string;
}

export type LeaveRequest = {
    id: string;
    employee_id: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    approver_id?: string;
    created_at: string;
    updated_at: string;
}

export type Announcement = {
    id: string;
    title: string;
    content: string;
    created_by: string;
    type: string;
    created_at: string;
}

export type Notification = {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: 'Announcement' | 'ReportStatus' | 'LeaveRequest' | 'General';
    read: boolean;
    link?: string;
    created_at: string;
}
