import { atom, computed } from 'nanostores';
import { supabase, type Employee } from '../lib/supabase';

// User state atom
export const $user = atom<Employee | null>(null);

// Initialize from localStorage on load (client-side only)
if (typeof window !== 'undefined') {
    const storedUser = localStorage.getItem('synopgen_user');
    if (storedUser) {
        try {
            $user.set(JSON.parse(storedUser));
        } catch (e) {
            console.error('Failed to parse stored user:', e);
            localStorage.removeItem('synopgen_user');
        }
    }
}

// Computed store for admin check
export const $isAdmin = computed($user, (user) =>
    user?.is_admin === true || user?.role === 'Admin'
);

// Login function
export async function login(email: string, password: string): Promise<{
    success: boolean;
    user?: Employee;
    error?: string;
}> {
    // Admin hardcoded check
    if (email === 'admin@synopgen.com' && password === 'admin123') {
        const adminUser: Employee = {
            id: '00000000-0000-0000-0000-000000000000',
            full_name: 'Admin User',
            email: 'admin@synopgen.com',
            role: 'Admin',
            department: 'Management',
            is_admin: true,
            status: 'Active',
            created_at: new Date().toISOString()
        };

        $user.set(adminUser);
        if (typeof window !== 'undefined') {
            localStorage.setItem('synopgen_user', JSON.stringify(adminUser));
        }

        return { success: true, user: adminUser };
    }

    // Employee database check
    try {
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .eq('email', email)
            .eq('password', password)
            .single();

        if (error || !data) {
            return { success: false, error: 'Invalid email or password' };
        }

        if (data.status !== 'Active') {
            return { success: false, error: 'Account is inactive. Contact admin.' };
        }

        $user.set(data as Employee);
        if (typeof window !== 'undefined') {
            localStorage.setItem('synopgen_user', JSON.stringify(data));
        }

        return { success: true, user: data as Employee };
    } catch (err) {
        console.error('Login error:', err);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

// Logout function
export function logout() {
    $user.set(null);
    if (typeof window !== 'undefined') {
        localStorage.removeItem('synopgen_user');
    }
}

// Update user function
export function updateUser(updates: Partial<Employee>) {
    const currentUser = $user.get();
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...updates };
    $user.set(updatedUser);

    if (typeof window !== 'undefined') {
        localStorage.setItem('synopgen_user', JSON.stringify(updatedUser));
    }
}
