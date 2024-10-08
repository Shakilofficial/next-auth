'use client';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function Profile() {
  const router = useRouter();
  const logout = async () => {
    try {
      const res = await axios.get('/api/users/logout');
      if (res.data.success) {
        toast.success(res.data.message);
        router.push('/login');
      }
      return res.data;
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-center">Profile</h1>
      <div className="flex justify-center mt-4">
        <button onClick={logout} className="bg-blue-500 text-white px-4 py-2 rounded-md">
          Logout
        </button>
      </div>
    </div>
  );
}
