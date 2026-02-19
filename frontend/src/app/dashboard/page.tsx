'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuth';
import MegaMenu from '@/app/mega-menu/megaMenu'; 

export default function DashboardPage() {



  return (
    <div className="mx-auto ">
      <MegaMenu /> 
      
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
        <button
          
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-red-700"
        >
          Logout
        </button>
      </div>


    </div>
  );
}
