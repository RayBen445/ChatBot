import { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  Crown, 
  Ban, 
  Clock, 
  CheckCircle, 
  UserX,
  Calendar,
  Mail,
  Activity
} from 'lucide-react';
import { 
  getAllUsers, 
  banUser, 
  suspendUser, 
  reactivateUser, 
  updateSubscriptionTier,
  USER_STATUS,
  SUBSCRIPTION_TIERS 
} from '../lib/firebase';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
    setLoading(false);
  };

  const handleUserAction = async (userId, action, duration = null) => {
    setActionLoading(true);
    try {
      let success = false;
      
      switch (action) {
        case 'ban':
          success = await banUser(userId);
          break;
        case 'suspend':
          success = await suspendUser(userId, duration || '7d');
          break;
        case 'reactivate':
          success = await reactivateUser(userId);
          break;
        default:
          break;
      }
      
      if (success) {
        await loadUsers(); // Refresh the user list
        setSelectedUser(null);
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
    setActionLoading(false);
  };

  const handleSubscriptionChange = async (userId, tier) => {
    setActionLoading(true);
    try {
      const success = await updateSubscriptionTier(userId, tier);
      if (success) {
        await loadUsers();
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
    setActionLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case USER_STATUS.ACTIVE:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case USER_STATUS.BANNED:
        return <Ban className="h-4 w-4 text-red-500" />;
      case USER_STATUS.SUSPENDED:
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <UserX className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSubscriptionIcon = (tier) => {
    switch (tier) {
      case SUBSCRIPTION_TIERS.FREE:
        return <Users className="h-4 w-4 text-gray-500" />;
      case SUBSCRIPTION_TIERS.PRO:
        return <Shield className="h-4 w-4 text-blue-500" />;
      case SUBSCRIPTION_TIERS.PLUS:
        return <Crown className="h-4 w-4 text-yellow-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    if (filter === 'active') return user.status === USER_STATUS.ACTIVE;
    if (filter === 'banned') return user.status === USER_STATUS.BANNED;
    if (filter === 'suspended') return user.status === USER_STATUS.SUSPENDED;
    if (filter === 'pro') return user.subscriptionTier === SUBSCRIPTION_TIERS.PRO;
    if (filter === 'plus') return user.subscriptionTier === SUBSCRIPTION_TIERS.PLUS;
    return true;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === USER_STATUS.ACTIVE).length,
    banned: users.filter(u => u.status === USER_STATUS.BANNED).length,
    suspended: users.filter(u => u.status === USER_STATUS.SUSPENDED).length,
    free: users.filter(u => u.subscriptionTier === SUBSCRIPTION_TIERS.FREE).length,
    pro: users.filter(u => u.subscriptionTier === SUBSCRIPTION_TIERS.PRO).length,
    plus: users.filter(u => u.subscriptionTier === SUBSCRIPTION_TIERS.PLUS).length
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users, subscriptions, and system health</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Banned</p>
              <p className="text-2xl font-bold text-red-600">{stats.banned}</p>
            </div>
            <Ban className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Suspended</p>
              <p className="text-2xl font-bold text-orange-600">{stats.suspended}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Free</p>
              <p className="text-2xl font-bold text-gray-600">{stats.free}</p>
            </div>
            <Users className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pro</p>
              <p className="text-2xl font-bold text-blue-600">{stats.pro}</p>
            </div>
            <Shield className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Plus</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.plus}</p>
            </div>
            <Crown className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {['all', 'active', 'banned', 'suspended', 'pro', 'plus'].map(filterType => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterType
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.displayName || 'No Name'}
                          {user.role === 'admin' && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(user.status)}
                      <span className={`ml-2 text-sm font-medium ${
                        user.status === USER_STATUS.ACTIVE ? 'text-green-600' :
                        user.status === USER_STATUS.BANNED ? 'text-red-600' :
                        user.status === USER_STATUS.SUSPENDED ? 'text-orange-600' :
                        'text-gray-600'
                      }`}>
                        {user.status?.charAt(0).toUpperCase() + user.status?.slice(1) || 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getSubscriptionIcon(user.subscriptionTier)}
                      <span className={`ml-2 text-sm font-medium ${
                        user.subscriptionTier === SUBSCRIPTION_TIERS.FREE ? 'text-gray-600' :
                        user.subscriptionTier === SUBSCRIPTION_TIERS.PRO ? 'text-blue-600' :
                        user.subscriptionTier === SUBSCRIPTION_TIERS.PLUS ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        {user.subscriptionTier?.toUpperCase() || 'FREE'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Activity className="h-3 w-3 mr-1" />
                      {user.lastActive?.toDate?.()?.toLocaleDateString() || 
                       (user.lastActive && new Date(user.lastActive.seconds * 1000).toLocaleDateString()) ||
                       'Never'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        disabled={actionLoading}
                      >
                        Manage
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Management Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Manage User: {selectedUser.displayName || selectedUser.email}
                </h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Change Status</h4>
                  <div className="space-y-2">
                    {selectedUser.status !== USER_STATUS.ACTIVE && (
                      <button
                        onClick={() => handleUserAction(selectedUser.id, 'reactivate')}
                        className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                        disabled={actionLoading}
                      >
                        Reactivate User
                      </button>
                    )}
                    
                    {selectedUser.status === USER_STATUS.ACTIVE && (
                      <>
                        <button
                          onClick={() => handleUserAction(selectedUser.id, 'suspend', '7d')}
                          className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
                          disabled={actionLoading}
                        >
                          Suspend (7 days)
                        </button>
                        <button
                          onClick={() => handleUserAction(selectedUser.id, 'suspend', '30d')}
                          className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
                          disabled={actionLoading}
                        >
                          Suspend (30 days)
                        </button>
                        <button
                          onClick={() => handleUserAction(selectedUser.id, 'ban')}
                          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                          disabled={actionLoading}
                        >
                          Ban User
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Change Subscription</h4>
                  <div className="space-y-2">
                    {Object.values(SUBSCRIPTION_TIERS).map(tier => (
                      <button
                        key={tier}
                        onClick={() => handleSubscriptionChange(selectedUser.id, tier)}
                        className={`w-full px-4 py-2 rounded text-white disabled:opacity-50 ${
                          tier === SUBSCRIPTION_TIERS.FREE ? 'bg-gray-500 hover:bg-gray-600' :
                          tier === SUBSCRIPTION_TIERS.PRO ? 'bg-blue-500 hover:bg-blue-600' :
                          'bg-yellow-500 hover:bg-yellow-600'
                        } ${selectedUser.subscriptionTier === tier ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                        disabled={actionLoading || selectedUser.subscriptionTier === tier}
                      >
                        {tier.toUpperCase()} {selectedUser.subscriptionTier === tier ? '(Current)' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;