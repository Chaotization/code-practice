// src/pages/ProfilePage/ProfilePage.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Products from '../data/products';

const ProfilePage: React.FC = () => {
  const token = localStorage.getItem('token')!;
  const { data: profile, isLoading, isError, error } = useQuery({
    queryKey: ['profile'],
    queryFn: () => Products.getProfile(token)
  });

  if (isLoading) return <p>Loading profile…</p>;
  if (isError) return <p>Error: {(error as Error).message}</p>;

  return (
    <div className="profile-page">
      <h1>My Profile</h1>
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
    </div>
  );
};

export default ProfilePage;
