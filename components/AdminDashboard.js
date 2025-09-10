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
  Activity,
  DollarSign,
  Tag,
  Settings,
  Plus,
  Globe,
  Bell,
  Lock
} from 'lucide-react';
import { 
  getAllUsers, 
  banUser, 
  suspendUser, 
  reactivateUser, 
  updateSubscriptionTier,
  USER_STATUS,
  SUBSCRIPTION_TIERS,
  getPricing,
  updatePricing,
  getActiveDiscounts,
  createDiscount,
  updateDiscount,
  SUPPORTED_CURRENCIES
} from '../lib/firebase';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('users');
  const [pricing, setPricing] = useState(null);
  const [discounts, setDiscounts] = useState([]);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [appSettings, setAppSettings] = useState({
    maintenanceMode: false,
    allowNewRegistrations: true,
    maxDailyMessages: { free: 50, pro: 500, plus: Infinity },
    supportContact: {
      whatsapp: '+234 807 561 4248',
      telegram: 'Available'
    },
    currencies: ['USD', 'GBP', 'NGN'],
    defaultCurrency: 'USD'
  });

  useEffect(() => {
    loadUsers();
    loadPricingData();
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

  const loadPricingData = async () => {
    try {
      const [pricingData, discountData] = await Promise.all([
        getPricing(),
        getActiveDiscounts()
      ]);
      setPricing(pricingData);
      setDiscounts(discountData);
    } catch (error) {
      console.error('Error loading pricing data:', error);
    }
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

  const handlePricingUpdate = async (newPricing) => {
    try {
      const success = await updatePricing(newPricing);
      if (success) {
        setPricing(newPricing);
        setShowPricingModal(false);
      }
    } catch (error) {
      console.error('Error updating pricing:', error);
    }
  };

  const handleCreateDiscount = async (discountData) => {
    try {
      const success = await createDiscount(discountData);
      if (success) {
        await loadPricingData();
        setShowDiscountModal(false);
        setSelectedDiscount(null);
      }
    } catch (error) {
      console.error('Error creating discount:', error);
    }
  };

  const handleUpdateDiscount = async (discountId, updates) => {
    try {
      const success = await updateDiscount(discountId, updates);
      if (success) {
        await loadPricingData();
        setShowDiscountModal(false);
        setSelectedDiscount(null);
      }
    } catch (error) {
      console.error('Error updating discount:', error);
    }
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

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Users
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pricing'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <DollarSign className="h-4 w-4 inline mr-2" />
              Pricing & Discounts
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="h-4 w-4 inline mr-2" />
              Settings
            </button>
          </nav>
        </div>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <>
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
        </>
      )}

      {/* Pricing Tab */}
      {activeTab === 'pricing' && (
        <div className="space-y-8">
          {/* Current Pricing */}
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Current Pricing</h2>
              <button
                onClick={() => setShowPricingModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Edit Prices</span>
              </button>
            </div>
            
            {pricing && (
              <div className="space-y-6">
                {Object.entries(pricing).map(([tier, tierData]) => (
                  tier !== 'free' && (
                    <div key={tier} className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3 capitalize">{tier} Tier</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {Object.entries(tierData).map(([currency, data]) => (
                          <div key={currency} className="text-center">
                            <p className="text-lg font-bold text-gray-900">
                              {SUPPORTED_CURRENCIES[currency]?.symbol || '$'}{currency === 'NGN' ? data.price.toLocaleString() : data.price.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">{currency}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>

          {/* Active Discounts */}
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Active Discounts</h2>
              <button
                onClick={() => {
                  setSelectedDiscount(null);
                  setShowDiscountModal(true);
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Discount</span>
              </button>
            </div>
            
            {discounts.length === 0 ? (
              <p className="text-gray-500">No active discounts</p>
            ) : (
              <div className="space-y-4">
                {discounts.map((discount) => (
                  <div key={discount.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{discount.name}</h3>
                      <p className="text-sm text-gray-600">{discount.discountPercent}% off</p>
                      <p className="text-xs text-gray-500">
                        {new Date(discount.startDate.seconds * 1000).toLocaleDateString()} - 
                        {new Date(discount.endDate.seconds * 1000).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Applies to: {discount.applicableTiers.join(', ')}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedDiscount(discount);
                          setShowDiscountModal(true);
                        }}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleUpdateDiscount(discount.id, { active: false })}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Deactivate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-8">
          {/* General Settings */}
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">General Settings</h2>
              <Settings className="h-6 w-6 text-gray-400" />
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Maintenance Mode</h3>
                  <p className="text-sm text-gray-500">Temporarily disable the application for maintenance</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={appSettings.maintenanceMode}
                    onChange={(e) => setAppSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Allow New Registrations</h3>
                  <p className="text-sm text-gray-500">Enable or disable new user registrations</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={appSettings.allowNewRegistrations}
                    onChange={(e) => setAppSettings(prev => ({ ...prev, allowNewRegistrations: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Message Limits */}
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Message Limits</h2>
              <Bell className="h-6 w-6 text-gray-400" />
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Free Tier Daily Limit</label>
                <input
                  type="number"
                  value={appSettings.maxDailyMessages.free}
                  onChange={(e) => setAppSettings(prev => ({
                    ...prev,
                    maxDailyMessages: { ...prev.maxDailyMessages, free: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pro Tier Daily Limit</label>
                <input
                  type="number"
                  value={appSettings.maxDailyMessages.pro}
                  onChange={(e) => setAppSettings(prev => ({
                    ...prev,
                    maxDailyMessages: { ...prev.maxDailyMessages, pro: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plus Tier Daily Limit</label>
                <input
                  type="text"
                  value="Unlimited"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Support Contact */}
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Support Contact</h2>
              <Mail className="h-6 w-6 text-gray-400" />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                <input
                  type="text"
                  value={appSettings.supportContact.whatsapp}
                  onChange={(e) => setAppSettings(prev => ({
                    ...prev,
                    supportContact: { ...prev.supportContact, whatsapp: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telegram Support</label>
                <input
                  type="text"
                  value={appSettings.supportContact.telegram}
                  onChange={(e) => setAppSettings(prev => ({
                    ...prev,
                    supportContact: { ...prev.supportContact, telegram: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Currency Settings */}
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Currency Settings</h2>
              <Globe className="h-6 w-6 text-gray-400" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
              <select
                value={appSettings.defaultCurrency}
                onChange={(e) => setAppSettings(prev => ({ ...prev, defaultCurrency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {appSettings.currencies.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      )}

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

      {/* Pricing Management Modal */}
      {showPricingModal && pricing && (
        <PricingModal
          pricing={pricing}
          onClose={() => setShowPricingModal(false)}
          onSave={handlePricingUpdate}
        />
      )}

      {/* Discount Management Modal */}
      {showDiscountModal && (
        <DiscountModal
          discount={selectedDiscount}
          onClose={() => {
            setShowDiscountModal(false);
            setSelectedDiscount(null);
          }}
          onSave={selectedDiscount ? 
            (updates) => handleUpdateDiscount(selectedDiscount.id, updates) : 
            handleCreateDiscount
          }
        />
      )}
    </div>
  );
};

// Pricing Modal Component
const PricingModal = ({ pricing, onClose, onSave }) => {
  const [formData, setFormData] = useState(pricing);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handlePriceChange = (tier, currency, value) => {
    setFormData(prev => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        [currency]: {
          ...prev[tier][currency],
          price: parseFloat(value)
        }
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Edit Multi-Currency Pricing</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {Object.entries(formData).map(([tier, tierData]) => (
              tier !== 'free' && (
                <div key={tier} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-semibold text-gray-800 mb-4 capitalize">{tier} Tier</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(tierData).map(([currency, data]) => (
                      <div key={currency}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {currency} ({SUPPORTED_CURRENCIES[currency]?.symbol || '$'})
                        </label>
                        <input
                          type="number"
                          step={currency === 'NGN' ? '1' : '0.01'}
                          min="0"
                          value={data.price}
                          onChange={(e) => handlePriceChange(tier, currency, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
            
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Discount Modal Component
const DiscountModal = ({ discount, onClose, onSave }) => {
  const [formData, setFormData] = useState(discount || {
    name: '',
    discountPercent: 0,
    startDate: '',
    endDate: '',
    applicableTiers: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate)
    };
    onSave(submitData);
  };

  const handleTierToggle = (tier) => {
    setFormData(prev => ({
      ...prev,
      applicableTiers: prev.applicableTiers.includes(tier)
        ? prev.applicableTiers.filter(t => t !== tier)
        : [...prev.applicableTiers, tier]
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {discount ? 'Edit Discount' : 'Create Discount'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
              <input
                type="number"
                min="1"
                max="99"
                value={formData.discountPercent}
                onChange={(e) => setFormData(prev => ({ ...prev, discountPercent: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Applicable Tiers</label>
              <div className="space-y-2">
                {Object.values(SUBSCRIPTION_TIERS).filter(tier => tier !== SUBSCRIPTION_TIERS.FREE).map(tier => (
                  <label key={tier} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.applicableTiers.includes(tier)}
                      onChange={() => handleTierToggle(tier)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{tier.toUpperCase()}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                {discount ? 'Update' : 'Create'} Discount
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;