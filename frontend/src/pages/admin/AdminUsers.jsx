import React, { useState, useEffect } from 'react';
import api from '../../utils/adminApi';
import { Trash2, Shield, UserX, Search, RefreshCw } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            console.log('Fetching users from /auth/users...');
            const { data } = await api.get('/auth/users');
            console.log('Users fetched:', data);
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            console.error('Error response:', error.response);
            alert(`Failed to fetch users: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/auth/users/${id}`);
                setUsers(users.filter(user => user.id !== id));
                alert('User deleted successfully');
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Failed to delete user');
            }
        }
    };

    const handleRoleUpdate = async (id, currentRole) => {
        const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
        if (window.confirm(`Change role to ${newRole}?`)) {
            try {
                await api.put(`/auth/users/${id}`, { role: newRole });
                fetchUsers();
            } catch (error) {
                console.error('Error updating role:', error);
            }
        }
    };

    const filteredUsers = users.filter(user =>
        (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-white">User Management</h1>
                    <button
                        onClick={fetchUsers}
                        className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-slate-300"
                        title="Refresh Users"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-slate-300">
                        <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {loading ? (
                                <tr><td colSpan="4" className="text-center py-8">Loading...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan="4" className="text-center py-8">No users found</td></tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{user.fullName}</div>
                                            <div className="text-sm text-slate-500">{user.email}</div>
                                            <div className="text-xs text-slate-600">{user.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN'
                                                ? 'bg-purple-500/20 text-purple-400'
                                                : user.role === 'SHOP_OWNER'
                                                    ? 'bg-blue-500/20 text-blue-400'
                                                    : 'bg-slate-600/20 text-slate-400'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleRoleUpdate(user.id, user.role)}
                                                className="p-2 hover:bg-slate-600 rounded-lg text-blue-400 transition-colors"
                                                title="Toggle Admin Role"
                                            >
                                                <Shield className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="p-2 hover:bg-red-900/30 rounded-lg text-red-400 transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
