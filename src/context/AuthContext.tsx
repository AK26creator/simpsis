import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, type Employee } from '../lib/supabase';

type AuthContextType = {
    user: Employee | null;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    updateUser: (updates: Partial<Employee>) => void;
    isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<Employee | null>(null);

    useEffect(() => {
        // Check local storage on mount
        const storedUser = localStorage.getItem('simpsis_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = async (email: string, password: string) => {
        // For Admin: Hardcoded check for demo purposes (as per previous flow)
        if (email === 'admin@simpsis.com' && password === 'admin123') {
            const adminUser: Employee = {
                id: '00000000-0000-0000-0000-000000000000',
                full_name: 'Admin User',
                email: 'admin@simpsis.com',
                role: 'Admin',
                department: 'Management',
                is_admin: true,
                status: 'Active',
                created_at: new Date().toISOString()
            };
            setUser(adminUser);
            localStorage.setItem('simpsis_user', JSON.stringify(adminUser));
            return { success: true };
        }

        // For Employees: Check against database
        try {
            const { data, error } = await supabase
                .from('employees')
                .select('*')
                .eq('email', email)
                .eq('password', password) // In real app, verify hash
                .single();

            if (error || !data) {
                return { success: false, error: 'Invalid email or password' };
            }

            // Check if active
            if (data.status !== 'Active') {
                return { success: false, error: 'Account is inactive. Contact admin.' };
            }

            setUser(data);
            localStorage.setItem('simpsis_user', JSON.stringify(data));
            return { success: true };
        } catch (err) {
            console.error('Login error:', err);
            return { success: false, error: 'An unexpected error occurred' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('simpsis_user');
    };

    const updateUser = (updates: Partial<Employee>) => {
        if (!user) return;
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('simpsis_user', JSON.stringify(updatedUser));
    };

    const isAdmin = user?.is_admin === true || user?.role === 'Admin';

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
