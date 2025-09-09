import { useAuth } from '../components/AuthProvider';
import { isAdmin } from '../lib/firebase';
import Layout from '../components/Layout';
import AdminDashboard from '../components/AdminDashboard';

export default function AdminPage() {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentUser || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin(userProfile)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don&apos;t have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <AdminDashboard />
      </div>
    </Layout>
  );
}