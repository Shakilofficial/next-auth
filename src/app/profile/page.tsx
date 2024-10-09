"use client";

import AuthGuard from "@/components/AuthGuard";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";

export default function Profile() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(session?.user?.username || "");
  const [avatar, setAvatar] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("username", username);
    if (avatar) {
      formData.append("avatar", avatar);
    }

    try {
      const response = await fetch("/api/user/update", {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        setIsEditing(false);
        // Refresh the session to get updated data
        window.location.reload();
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-6 mb-6">
            {session?.user?.avatar && (
              <div className="w-24 h-24 relative">
                <Image
                  src={session.user.avatar}
                  alt="Profile"
                  fill
                  className="rounded-full"
                />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold">{session?.user?.username}</h2>
              <p className="text-gray-600">{session?.user?.email}</p>
              <p className="text-gray-600 capitalize">
                Role: {session?.user?.role}
              </p>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  New Avatar
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                  className="mt-1 block w-full"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
