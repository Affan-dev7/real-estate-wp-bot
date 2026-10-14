'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Listing,
  ListingType,
  BuyOrRent,
  SizeUnit,
  ListingStatus,
} from '@/lib/types';
import { DataStore } from '@/lib/store';
import { formatPkr } from '@/lib/formatters';
import { compressImage } from '@/lib/imageCompressor';
import {
  Upload,
  X,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Video,
  Check,
} from 'lucide-react';

interface ListingFormProps {
  initialListing?: Listing;
  isEdit?: boolean;
}

export default function ListingForm({ initialListing, isEdit = false }: ListingFormProps) {
  const router = useRouter();
  const agency = DataStore.getAgency();

  const [title, setTitle] = useState(initialListing?.title || '');
  const [type, setType] = useState<ListingType>(initialListing?.type || 'house');
  const [buyOrRent, setBuyOrRent] = useState<BuyOrRent>(initialListing?.buy_or_rent || 'buy');
  const [area, setArea] = useState(initialListing?.area || '');
  const [city, setCity] = useState(initialListing?.city || 'Karachi');
  const [sizeValue, setSizeValue] = useState<number | ''>(initialListing?.size_value ?? 10);
  const [sizeUnit, setSizeUnit] = useState<SizeUnit>(initialListing?.size_unit || 'marla');
  const [bedrooms, setBedrooms] = useState<number | ''>(initialListing?.bedrooms ?? 4);
  const [bathrooms, setBathrooms] = useState<number | ''>(initialListing?.bathrooms ?? 4);
  const [pricePkr, setPricePkr] = useState<number | ''>(initialListing?.price_pkr ?? 25000000);
  const [description, setDescription] = useState(initialListing?.description || '');
  const [featuresInput, setFeaturesInput] = useState(
    initialListing?.features?.join(', ') || 'Corner, Near Park, Solid Construction'
  );

  // Photos: max 8
  const [photoUrls, setPhotoUrls] = useState<string[]>(initialListing?.photo_urls || []);
  const [compressing, setCompressing] = useState(false);
  const [compressionLogs, setCompressionLogs] = useState<string[]>([]);

  // Video URLs: Instagram
  const [videoUrlInput, setVideoUrlInput] = useState(initialListing?.video_urls?.[0] || '');
  const [videoUrlError, setVideoUrlError] = useState<string | null>(null);

  // Status & Bot Visibility
  const [status, setStatus] = useState<ListingStatus>(initialListing?.status || 'available');
  const [visibleToBot, setVisibleToBot] = useState<boolean>(initialListing?.visible_to_bot ?? true);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Instagram URL validation regex
  const validateInstagramUrl = (url: string): boolean => {
    if (!url.trim()) return true;
    const igRegex = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[\w-]+\/?(\?.*)?$/i;
    return igRegex.test(url.trim());
  };

  const handleVideoUrlChange = (val: string) => {
    setVideoUrlInput(val);
    if (val && !validateInstagramUrl(val)) {
      setVideoUrlError('Please enter a valid Instagram reel or post link (e.g. https://www.instagram.com/reel/...)');
    } else {
      setVideoUrlError(null);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    const availableSlots = 8 - photoUrls.length;

    if (availableSlots <= 0) {
      setErrorMsg('Maximum 8 photos allowed per listing.');
      return;
    }

    const filesToProcess = files.slice(0, availableSlots);
    setCompressing(true);
    setErrorMsg(null);

    const logs: string[] = [];
    const newPhotos: string[] = [];

    for (const file of filesToProcess) {
      try {
        const result = await compressImage(file);
        logs.push(
          `${file.name}: ${result.originalSizeKb} KB compressed to ${result.compressedSizeKb} KB (${result.width}px)`
        );
        newPhotos.push(result.previewUrl);
      } catch (err) {
        console.error('Error compressing image', err);
        logs.push(`Error compressing ${file.name}`);
      }
    }

    setCompressionLogs(logs);
    setPhotoUrls((prev) => [...prev, ...newPhotos]);
    setCompressing(false);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMsg('Listing title is required.');
      return;
    }
    if (!area.trim() || !city.trim()) {
      setErrorMsg('Area and City are required.');
      return;
    }
    if (!pricePkr || Number(pricePkr) <= 0) {
      setErrorMsg('Valid price in PKR is required.');
      return;
    }
    if (!sizeValue || Number(sizeValue) <= 0) {
      setErrorMsg('Valid property size is required.');
      return;
    }
    if (videoUrlInput && !validateInstagramUrl(videoUrlInput)) {
      setErrorMsg('Instagram video link is invalid.');
      return;
    }

    setSaving(true);

    const featuresArray = featuresInput
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    const listingData: Listing = {
      id: initialListing?.id || 'list_' + Date.now(),
      agency_id: initialListing?.agency_id || agency.id,
      title: title.trim(),
      type,
      buy_or_rent: buyOrRent,
      area: area.trim(),
      city: city.trim(),
      size_value: Number(sizeValue),
      size_unit: sizeUnit,
      bedrooms: bedrooms === '' ? null : Number(bedrooms),
      bathrooms: bathrooms === '' ? null : Number(bathrooms),
      price_pkr: Number(pricePkr),
      description: description.trim() || null,
      features: featuresArray,
      photo_urls: photoUrls,
      video_urls: videoUrlInput.trim() ? [videoUrlInput.trim()] : [],
      status,
      visible_to_bot: visibleToBot,
      created_at: initialListing?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    DataStore.saveListing(listingData);
    setSaving(false);
    router.push('/listings');
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6 pb-20">
      {errorMsg && (
        <div className="bg-[#FDF2E9] border-l-4 border-[#D9480F] p-3 text-xs text-[#9C3608] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Quick Status / Bot Visibility Controls */}
      <div className="bg-white border border-[#E2E8F0] p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#1A202C] block">Listing state</span>
          <span className="text-xs text-[#5A6578]">Quick actions for property status</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setStatus((prev) => (prev === 'sold' ? 'available' : 'sold'))}
            className={`px-3 py-2 text-xs font-semibold border transition-colors touch-target ${
              status === 'sold'
                ? 'bg-[#1A202C] text-white border-[#1A202C]'
                : 'bg-white text-[#1A202C] border-[#CBD5E1] hover:bg-[#F8FAFC]'
            }`}
          >
            {status === 'sold' ? 'Mark as available' : 'Mark as sold'}
          </button>

          <button
            type="button"
            onClick={() => setVisibleToBot((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border transition-colors touch-target ${
              visibleToBot
                ? 'bg-[#E6F4F0] text-[#0E6B50] border-[#0E6B50]'
                : 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]'
            }`}
          >
            {visibleToBot ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Visible to bot</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Hidden from bot</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Core Details */}
      <div className="bg-white border border-[#E2E8F0] p-4 sm:p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#1A202C] border-b border-[#E2E8F0] pb-2">
          Property details
        </h3>

        {/* Title */}
        <div>
          <label htmlFor="title-input" className="block text-xs font-medium text-[#1A202C] mb-1">
            Listing title *
          </label>
          <input
            id="title-input"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 500 Sq Yd Luxury Designer Bungalow - DHA Phase 6"
            className="w-full text-xs px-3 py-2 border border-[#CBD5E1] rounded-none focus:outline-none focus:border-[#0E6B50] touch-target"
          />
        </div>

        {/* Type & Buy/Rent */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="type-select" className="block text-xs font-medium text-[#1A202C] mb-1">
              Property type *
            </label>
            <select
              id="type-select"
              value={type}
              onChange={(e) => setType(e.target.value as ListingType)}
              className="w-full text-xs px-3 py-2 border border-[#CBD5E1] bg-white rounded-none focus:outline-none focus:border-[#0E6B50] touch-target"
            >
              <option value="house">House / Bungalow</option>
              <option value="flat">Apartment / Flat</option>
              <option value="plot">Plot</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>

          <div>
            <label htmlFor="purpose-select" className="block text-xs font-medium text-[#1A202C] mb-1">
              Purpose *
            </label>
            <select
              id="purpose-select"
              value={buyOrRent}
              onChange={(e) => setBuyOrRent(e.target.value as BuyOrRent)}
              className="w-full text-xs px-3 py-2 border border-[#CBD5E1] bg-white rounded-none focus:outline-none focus:border-[#0E6B50] touch-target"
            >
              <option value="buy">For sale (Buy)</option>
              <option value="rent">For rent</option>
            </select>
          </div>
        </div>

        {/* Location: Area & City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="area-input" className="block text-xs font-medium text-[#1A202C] mb-1">
              Area / Sector / Phase *
            </label>
            <input
              id="area-input"
              type="text"
              required
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. DHA Phase 6 or Clifton Block 4"
              className="w-full text-xs px-3 py-2 border border-[#CBD5E1] rounded-none focus:outline-none focus:border-[#0E6B50] touch-target"
            />
          </div>

          <div>
            <label htmlFor="city-input" className="block text-xs font-medium text-[#1A202C] mb-1">
              City *
            </label>
            <input
              id="city-input"
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Karachi, Lahore, Islamabad, etc."
              className="w-full text-xs px-3 py-2 border border-[#CBD5E1] rounded-none focus:outline-none focus:border-[#0E6B50] touch-target"
            />
          </div>
        </div>

        {/* Size Value & Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="size-value-input" className="block text-xs font-medium text-[#1A202C] mb-1">
              Size value *
            </label>
            <input
              id="size-value-input"
              type="number"
              step="any"
              required
              value={sizeValue}
              onChange={(e) => setSizeValue(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 5, 10, 500"
              className="w-full text-xs px-3 py-2 border border-[#CBD5E1] rounded-none focus:outline-none focus:border-[#0E6B50] touch-target tabular-nums"
            />
          </div>

          <div>
            <label htmlFor="size-unit-select" className="block text-xs font-medium text-[#1A202C] mb-1">
              Size unit *
            </label>
            <select
              id="size-unit-select"
              value={sizeUnit}
              onChange={(e) => setSizeUnit(e.target.value as SizeUnit)}
              className="w-full text-xs px-3 py-2 border border-[#CBD5E1] bg-white rounded-none focus:outline-none focus:border-[#0E6B50] touch-target"
            >
              <option value="marla">Marla</option>
              <option value="kanal">Kanal</option>
              <option value="sq_yd">Sq. Yards (Gaz)</option>
              <option value="sq_ft">Sq. Feet</option>
            </select>
          </div>
        </div>

        {/* Bedrooms & Bathrooms */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="bedrooms-input" className="block text-xs font-medium text-[#1A202C] mb-1">
              Bedrooms (optional)
            </label>
            <input
              id="bedrooms-input"
              type="number"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 4"
              className="w-full text-xs px-3 py-2 border border-[#CBD5E1] rounded-none focus:outline-none focus:border-[#0E6B50] touch-target tabular-nums"
            />
          </div>

          <div>
            <label htmlFor="bathrooms-input" className="block text-xs font-medium text-[#1A202C] mb-1">
              Bathrooms (optional)
            </label>
            <input
              id="bathrooms-input"
              type="number"
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 5"
              className="w-full text-xs px-3 py-2 border border-[#CBD5E1] rounded-none focus:outline-none focus:border-[#0E6B50] touch-target tabular-nums"
            />
          </div>
        </div>

        {/* Price PKR with Live Lakh/Crore Preview */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="price-input" className="text-xs font-medium text-[#1A202C]">
              Price (PKR) *
            </label>
            <span className="text-xs font-bold text-[#0E6B50] bg-[#E6F4F0] px-2 py-0.5 rounded">
              {formatPkr(Number(pricePkr))}
            </span>
          </div>
          <input
            id="price-input"
            type="number"
            step="1000"
            required
            value={pricePkr}
            onChange={(e) => setPricePkr(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="e.g. 25000000"
            className="w-full text-xs px-3 py-2 border border-[#CBD5E1] rounded-none focus:outline-none focus:border-[#0E6B50] touch-target tabular-nums"
          />
          <p className="text-[11px] text-[#5A6578] mt-1">
            Tip: 10,000,000 = 1 Crore | 100,000 = 1 Lakh
          </p>
        </div>

        {/* Description & Features */}
        <div>
          <label htmlFor="desc-input" className="block text-xs font-medium text-[#1A202C] mb-1">
            Description
          </label>
          <textarea
            id="desc-input"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key architectural highlights, fittings, facing..."
            className="w-full text-xs p-2.5 border border-[#CBD5E1] rounded-none focus:outline-none focus:border-[#0E6B50]"
          />
        </div>

        <div>
          <label htmlFor="features-input" className="block text-xs font-medium text-[#1A202C] mb-1">
            Features (comma separated)
          </label>
          <input
            id="features-input"
            type="text"
            value={featuresInput}
            onChange={(e) => setFeaturesInput(e.target.value)}
            placeholder="Corner, West Open, Solar, Basement, Near Mosque"
            className="w-full text-xs px-3 py-2 border border-[#CBD5E1] rounded-none focus:outline-none focus:border-[#0E6B50] touch-target"
          />
        </div>
      </div>

      {/* Photo Upload with Browser Compression */}
      <div className="bg-white border border-[#E2E8F0] p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
          <div>
            <h3 className="text-sm font-bold text-[#1A202C]">Property photos</h3>
            <p className="text-xs text-[#5A6578]">
              Up to 8 photos. Automatically compressed in browser to &lt; 300 KB (max 1600px width).
            </p>
          </div>
          <span className="text-xs font-semibold text-[#1A202C]">
            {photoUrls.length} / 8
          </span>
        </div>

        {/* Upload Button */}
        {photoUrls.length < 8 && (
          <div>
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#CBD5E1] hover:border-[#0E6B50] cursor-pointer bg-[#F8FAFC] transition-colors">
              <Upload className="w-6 h-6 text-[#0E6B50] mb-2" />
              <span className="text-xs font-semibold text-[#1A202C]">
                Tap to upload photos
              </span>
              <span className="text-[11px] text-[#5A6578] mt-0.5">
                PNG, JPG, WebP supported
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={compressing}
                className="hidden"
              />
            </label>
          </div>
        )}

        {compressing && (
          <p className="text-xs text-[#0E6B50] font-medium animate-pulse">
            Compressing photos in browser...
          </p>
        )}

        {compressionLogs.length > 0 && (
          <div className="bg-[#F8FAFC] p-2 text-[11px] text-[#5A6578] space-y-0.5 border border-[#E2E8F0]">
            {compressionLogs.map((log, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <Check className="w-3 h-3 text-[#0E6B50]" />
                <span>{log}</span>
              </div>
            ))}
          </div>
        )}

        {/* Photos Grid */}
        {photoUrls.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {photoUrls.map((url, index) => (
              <div key={index} className="relative group aspect-square border border-[#E2E8F0] bg-gray-100">
                <img
                  src={url}
                  alt={`Listing photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full hover:bg-black transition-colors touch-target"
                  aria-label="Remove photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video URLs (Instagram links) */}
      <div className="bg-white border border-[#E2E8F0] p-4 sm:p-6 space-y-3">
        <div className="border-b border-[#E2E8F0] pb-2">
          <h3 className="text-sm font-bold text-[#1A202C] flex items-center gap-1.5">
            <Video className="w-4 h-4 text-[#0E6B50]" />
            Instagram video tour link
          </h3>
          <p className="text-xs text-[#5A6578]">
            Valid Instagram Reel or Post link for WhatsApp bot preview
          </p>
        </div>

        <div>
          <input
            type="url"
            value={videoUrlInput}
            onChange={(e) => handleVideoUrlChange(e.target.value)}
            placeholder="https://www.instagram.com/reel/C8qA12bI3dO/"
            className={`w-full text-xs px-3 py-2 border rounded-none focus:outline-none touch-target ${
              videoUrlError
                ? 'border-[#D9480F] focus:border-[#D9480F]'
                : 'border-[#CBD5E1] focus:border-[#0E6B50]'
            }`}
          />
          {videoUrlError && (
            <p className="text-xs text-[#D9480F] mt-1">{videoUrlError}</p>
          )}
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 border border-[#CBD5E1] text-[#5A6578] text-xs font-semibold rounded-none hover:bg-[#F8FAFC] touch-target"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving || compressing}
          className="px-6 py-2.5 bg-[#0E6B50] hover:bg-[#0A4D3A] text-white text-xs font-bold rounded-none transition-colors touch-target shadow-sm"
        >
          {saving ? 'Saving...' : isEdit ? 'Save listing changes' : 'Add listing'}
        </button>
      </div>
    </form>
  );
}
