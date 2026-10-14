'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import DesktopNav from '@/components/DesktopNav';
import BottomNav from '@/components/BottomNav';
import ListingForm from '@/components/ListingForm';
import { DataStore } from '@/lib/store';
import { Listing } from '@/lib/types';
import { ArrowLeft, Building2 } from 'lucide-react';

function EditListingContent() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const item = DataStore.getListingById(id);
      if (item) {
        setListing(item);
      }
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-[#5A6578]">
        Loading property details...
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Building2 className="w-10 h-10 text-[#5A6578] mb-3 opacity-60" />
        <h2 className="text-base font-bold text-[#1A202C]">Property not found</h2>
        <p className="text-xs text-[#5A6578] mt-1 mb-4">
          This listing may have been deleted or does not exist.
        </p>
        <Link
          href="/listings"
          className="px-4 py-2 bg-[#0E6B50] text-white text-xs font-semibold"
        >
          Return to listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl w-full mx-auto px-4 py-6">
      <div className="max-w-3xl mx-auto mb-6">
        <Link
          href="/listings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E6B50] hover:underline mb-2 touch-target"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to listings</span>
        </Link>

        <div>
          <h1 className="text-xl font-bold text-[#1A202C]">Edit listing</h1>
          <p className="text-xs text-[#5A6578] truncate">
            {listing.title} • {listing.city}
          </p>
        </div>
      </div>

      <ListingForm initialListing={listing} isEdit={true} />
    </div>
  );
}

export default function EditListingPage() {
  return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col pb-20 md:pb-12">
      <Header />
      <DesktopNav />
      <Suspense fallback={<div className="p-12 text-center text-xs text-[#5A6578]">Loading...</div>}>
        <EditListingContent />
      </Suspense>
      <BottomNav />
    </div>
  );
}
