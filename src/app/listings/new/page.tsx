'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import DesktopNav from '@/components/DesktopNav';
import BottomNav from '@/components/BottomNav';
import ListingForm from '@/components/ListingForm';
import { ArrowLeft, Clock } from 'lucide-react';

export default function NewListingPage() {
  return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col pb-20 md:pb-12">
      <Header />
      <DesktopNav />

      <main className="max-w-7xl w-full mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto mb-6">
          <Link
            href="/listings"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E6B50] hover:underline mb-2 touch-target"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to listings</span>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#1A202C]">Add new listing</h1>
              <p className="text-xs text-[#5A6578]">
                Publish a property in under a minute with compressed photos
              </p>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-[#0E6B50] bg-[#E6F4F0] px-2.5 py-1 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Fast mobile entry</span>
            </span>
          </div>
        </div>

        <ListingForm isEdit={false} />
      </main>

      <BottomNav />
    </div>
  );
}
