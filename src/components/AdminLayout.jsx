import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="d-flex min-vh-100">
      <AdminSidebar />
      <div className="flex-grow-1 p-4" style={{ backgroundColor: '#090b10' }}>
        <Outlet />
      </div>
    </div>
  );
}