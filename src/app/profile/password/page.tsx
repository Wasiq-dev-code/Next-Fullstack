'use client';

import { useState } from 'react';
import { apiClient } from '@/src/lib/api-client';

type FieldErrors = {
  oldPassword?: string[];
  newPassword?: string[];
};

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSuccess('');
    setLoading(true);

    try {
      const res = await apiClient.passwordChange(oldPassword, newPassword);

      setSuccess(res.message || 'Password updated successfully');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      if (err?.response?.data?.issues) {
        setErrors(err.response.data.issues);
      } else {
        setErrors({ oldPassword: ['Something went wrong'] });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Change Password</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Old Password</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.oldPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.oldPassword[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.newPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.newPassword[0]}</p>
          )}
        </div>

        <button
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>

        {success && (
          <p className="text-green-600 text-sm text-center">{success}</p>
        )}
      </form>
    </div>
  );
}
