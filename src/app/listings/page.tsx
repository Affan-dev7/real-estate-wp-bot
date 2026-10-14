'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import DesktopNav from '@/components/DesktopNav';
import BottomNav from '@/components/BottomNav';
import { DataStore } from '@/lib/store';
import { Listing, ListingType, BuyOrRent, ListingStatus } from '@/lib/types';
import { formatPkr } from '@/lib/formatters';
import {
  Plus,
  Search,
  Eye,
  EyeOff,
  Building2,
  CheckCircle,
  Tag,
  Edit2,
  Filter,
} from 'lucide-react';

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const reloadListings = () => {
    const list = DataStore.getListings();
    setListings([...list]);
  };

  useEffect(() => {
    reloadListings();
  }, []);

  const handleToggleSold = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    DataStore.markListingAsSold(id);
    reloadListings();
  };

  const handleToggleBot = (id: string, currentVal: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    DataStore.toggleListingBotVisibility(id, !currentVal);
    reloadListings();
  };

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchArea = item.area.toLowerCase().includes(q);
        const matchCity = item.city.toLowerCase().includes(q);
        if (!matchTitle && !matchArea && !matchCity) return false;
      }

      if (cityFilter !== 'all' && item.city.toLowerCase() !== cityFilter.toLowerCase()) {
        return false;
      }

      if (typeFilter !== 'all' && item.type !== typeFilter) {
        return false;
      }

      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [listings, searchQuery, cityFilter, typeFilter, statusFilter]);

  const uniqueCities = useMemo(() => {
    return Array.from(new Set(listings.map((l) => l.city)));
  }, [listings]);

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col pb-20 md:pb-12">
      <Header />
      <DesktopNav />

      <main className="max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1A202C]">Properties & listings</h1>
            <p className="text-xs text-[#5A6578]">
              {filteredListings.length} of {listings.length} properties managed
            </p>
          </div>

          <Link
            href="/listings/new"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#0E6B50] hover:bg-[#0A4D3A] text-white text-xs font-bold transition-colors touch-target shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add listing</span>
          </Link>
        </div>

        {/* Filters Bar */}
        <div className="bg-white border border-[#E2E8F0] p-3 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#5A6578]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, DHA, Clifton, Johar Town..."
              className="w-full text-xs pl-9 pr-3 py-2 border border-[#CBD5E1] rounded-none focus:outline-none focus:border-[#0E6B50] touch-target"
            />
          </div>

          {/* City filter */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="text-xs px-2.5 py-2 bg-white border border-[#CBD5E1] text-[#1A202C] focus:outline-none focus:border-[#0E6B50] touch-target"
          >
            <option value="all">All cities</option>
            {uniqueCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs px-2.5 py-2 bg-white border border-[#CBD5E1] text-[#1A202C] focus:outline-none focus:border-[#0E6B50] touch-target"
          >
            <option value="all">All types</option>
            <option value="house">House</option>
            <option value="flat">Flat</option>
            <option value="plot">Plot</option>
            <option value="commercial">Commercial</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-2 bg-white border border-[#CBD5E1] text-[#1A202C] focus:outline-none focus:border-[#0E6B50] touch-target"
          >
            <option value="all">All statuses</option>
            <option value="available">Available</option>
            <option value="booked">Booked</option>
            <option value="sold">Sold</option>
          </select>
        </div>

        {/* Listings Table / Plain Rows Layout */}
        <div className="bg-white border border-[#E2E8F0]">
          {filteredListings.length === 0 ? (
            <div className="p-8 text-center">
              <Building2 className="w-8 h-8 text-[#5A6578] mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold text-[#1A202C]">No properties found</p>
              <p className="text-xs text-[#5A6578] mt-1 mb-4">
                No listings match your search or filter criteria.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCityFilter('all');
                  setTypeFilter('all');
                  setStatusFilter('all');
                }}
                className="px-3 py-1.5 text-xs font-semibold text-[#0E6B50] border border-[#0E6B50] hover:bg-[#E6F4F0] touch-target"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#E2E8F0]">
              {filteredListings.map((listing) => {
                const photo = listing.photo_urls[0];
                return (
                  <div
                    key={listing.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F7FAFC] transition-colors"
                  >
                    {/* Left: Thumbnail & Details */}
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      {photo ? (
                        <img
                          src={photo}
                          alt={listing.title}
                          className="w-18 h-18 sm:w-20 sm:h-20 object-cover border border-[#E2E8F0] shrink-0 bg-gray-100"
                        />
                      ) : (
                        <div className="w-18 h-18 sm:w-20 sm:h-20 bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center shrink-0 text-[#5A6578]">
                          <Building2 className="w-6 h-6" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-[#1A202C] line-clamp-1">
                            {listing.title}
                          </span>

                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${
                              listing.status === 'available'
                                ? 'bg-[#E6F4F0] text-[#0E6B50]'
                                : listing.status === 'booked'
                                ? 'bg-[#FEF3C7] text-[#92400E]'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            {listing.status}
                          </span>

                          {!listing.visible_to_bot && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-gray-100 text-[#5A6578] px-1.5 py-0.5 rounded">
                              <EyeOff className="w-3 h-3" />
                              Bot hidden
                            </span>
                          )}
                        </div>

                        {/* Price in Lakh / Crore */}
                        <p className="text-sm font-bold text-[#0E6B50] tabular-nums mt-1">
                          {formatPkr(listing.price_pkr)}
                          {listing.buy_or_rent === 'rent' && (
                            <span className="text-xs font-normal text-[#5A6578] ml-1">/month</span>
                          )}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-[#5A6578] mt-1 flex-wrap">
                          <span className="font-medium text-[#1A202C]">
                            {listing.area}, {listing.city}
                          </span>
                          <span>•</span>
                          <span className="tabular-nums">
                            {listing.size_value} {listing.size_unit}
                          </span>
                          {listing.bedrooms && (
                            <>
                              <span>•</span>
                              <span>{listing.bedrooms} bed</span>
                            </>
                          )}
                          {listing.photo_urls.length > 0 && (
                            <>
                              <span>•</span>
                              <span>{listing.photo_urls.length} photos</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Quick Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center flex-wrap">
                      <button
                        onClick={(e) => handleToggleSold(listing.id, e)}
                        className={`text-xs font-semibold px-2.5 py-2 border transition-colors touch-target ${
                          listing.status === 'sold'
                            ? 'bg-[#1A202C] text-white border-[#1A202C]'
                            : 'bg-white text-[#1A202C] border-[#CBD5E1] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        {listing.status === 'sold' ? 'Mark as available' : 'Mark as sold'}
                      </button>

                      <button
                        onClick={(e) => handleToggleBot(listing.id, listing.visible_to_bot, e)}
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-2 border transition-colors touch-target ${
                          listing.visible_to_bot
                            ? 'bg-white text-[#5A6578] border-[#CBD5E1] hover:bg-[#F8FAFC]'
                            : 'bg-[#E6F4F0] text-[#0E6B50] border-[#0E6B50]'
                        }`}
                      >
                        {listing.visible_to_bot ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Hide from bot</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Show to bot</span>
                          </>
                        )}
                      </button>

                      <Link
                        href={`/listings/${listing.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-white border border-[#CBD5E1] text-[#0E6B50] hover:bg-[#E6F4F0] transition-colors touch-target"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
