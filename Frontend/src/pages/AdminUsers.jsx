// src/pages/admin/AdminUsers.jsx

import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { getAdminUsers, updateUserRole, deleteUser } from '../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // ✅ FETCH REAL USERS FROM DATABASE
  const fetchUsers = async (page = 1, search = '', role = '') => {
    setLoading(true);
    try {
      const response = await getAdminUsers({
        page,
        limit: 10,
        search: search.trim(),
        role
      });

      console.log('📥 Users API Response:', response);

      // ✅ FIX: Handle different response structures
      if (response.success) {
        // Check if response.data exists and has users
        if (response.data) {
          // Case 1: response.data.users (from updated controller)
          if (response.data.users) {
            setUsers(response.data.users);
            setPagination(response.data.pagination || {
              page: 1,
              limit: 10,
              total: response.data.users.length,
              pages: Math.ceil(response.data.users.length / 10)
            });
          } 
          // Case 2: response.data is directly the users array
          else if (Array.isArray(response.data)) {
            setUsers(response.data);
            setPagination({
              page: 1,
              limit: 10,
              total: response.data.length,
              pages: Math.ceil(response.data.length / 10)
            });
          }
          // Case 3: response.data has data property
          else if (response.data.data) {
            setUsers(response.data.data);
            setPagination(response.data.pagination || {
              page: 1,
              limit: 10,
              total: response.data.data.length,
              pages: Math.ceil(response.data.data.length / 10)
            });
          }
        } else if (Array.isArray(response)) {
          // Case 4: response is directly the users array
          setUsers(response);
          setPagination({
            page: 1,
            limit: 10,
            total: response.length,
            pages: Math.ceil(response.length / 10)
          });
        } else {
          // Fallback: empty state
          setUsers([]);
          setPagination({
            page: 1,
            limit: 10,
            total: 0,
            pages: 0
          });
        }
      } else {
        console.warn('API returned error:', response);
        setUsers([]);
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.length >= 2 || searchTerm.length === 0) {
        fetchUsers(1, searchTerm, selectedRole);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await updateUserRole(userId, newRole);
      if (response.success) {
        fetchUsers(pagination.page, searchTerm, selectedRole);
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await deleteUser(userId);
      if (response.success) {
        fetchUsers(pagination.page, searchTerm, selectedRole);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-500 mt-1">
            Manage your users and their permissions
            <span className="ml-2 text-sm text-indigo-600 font-medium">
              ({pagination.total || users.length} total users)
            </span>
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
          <PlusIcon className="h-5 w-5" />
          Add User
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              fetchUsers(1, searchTerm, e.target.value);
            }}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      {/* Users Table - DISPLAYING REAL DATA */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id || user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.profilePicture ? (
                          <img 
                            src={user.profilePicture} 
                            alt={user.username}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <UserCircleIcon className="h-10 w-10 text-slate-400" />
                        )}
                        <div>
                          <span className="font-medium text-slate-900 block">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="text-xs text-slate-500">@{user.username}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <EnvelopeIcon className="h-4 w-4" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <PhoneIcon className="h-4 w-4" />
                        {user.mobileNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id || user.id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-indigo-500 ${
                          user.role === 'admin' 
                            ? 'bg-indigo-100 text-indigo-700' 
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <CalendarIcon className="h-4 w-4" />
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm mr-3">
                        <PencilIcon className="h-4 w-4 inline" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user._id || user.id)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                      >
                        <TrashIcon className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} -{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchUsers(pagination.page - 1, searchTerm, selectedRole)}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-slate-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                onClick={() => fetchUsers(pagination.page + 1, searchTerm, selectedRole)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 border border-slate-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}