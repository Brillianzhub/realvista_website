/* eslint-disable */
"use client"
import React, { useState, useEffect } from 'react';
import {
  MapPin,
  BedDouble,
  Bath,
  SquareIcon,
  Star,
  ChevronDown,
  Search,
  Heart,
  SlidersHorizontal,
  Calendar,
  DollarSign,
  X,
  Share2
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/config/apiClient';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface PropertyImage {
  file: string;
  id: number;
}

interface Property {
  id: number;
  title: string;
  description?: string;
  slug:string;
  price: string;
  currency: string;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  lot_size: number | null;
  year_built: number | null;
  address: string;
  city: string;
  state: string;
  zip_code?: string;
  country?: string;
  listing_purpose: string;
  property_type: string;
  listed_date: string;
  image_files: PropertyImage[];
  views: number;
}

interface FilterBadgeProps {
  label: string;
  value: string;
  onRemove: () => void;
}

interface PropertyCardProps {
  property: Property;
}

interface FilterState {
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  purpose: string;
  propertyType: string;
  yearBuilt: string;
  searchQuery: string;
  listingCategory: string;
}

interface ActiveFilter {
  key: keyof FilterState;
  label: string;
  value: string;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Property[];
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [bookmarks, setBookmarks] = useState<Record<number, number>>({});
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const router = useRouter()

  useEffect(() => {
    const fetchUserBookmarks = async () => {
      if (!token) return;

      try {
        const response = await api.get('/market/user-bookmarks/', {
          headers: {
            Authorization: `Token ${token}`
          }
        });

        if (response.status === 200) {
          const bookmarkMap: Record<number, number> = {};
          response.data.forEach((bookmark: any) => {
            bookmarkMap[bookmark.property_id] = bookmark.bookmark_id;
          });
          setBookmarks(bookmarkMap);
        }
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
      }
    };

    fetchUserBookmarks();
  }, [token]);

  const isBookmarked = (propertyId: any) => {
    return propertyId in bookmarks;
  };

  const toggleFavorite = async (propertyId: any) => {
    if (!token) {
      console.error('Authentication required to manage favorites');
      router.push("/sign-in");
      return;
    }

    try {
      let response;
      const isFavorite = isBookmarked(propertyId);

      if (isFavorite) {
        const bookmarkId = bookmarks[propertyId];
        response = await api.post(`/market/remove-bookmark/${bookmarkId}/`, {}, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`
          }
        });

        if (response.status === 200) {
          setBookmarks(prev => {
            const updated = { ...prev };
            delete updated[propertyId];
            return updated;
          });
        }
      } else {
        response = await api.post(`/market/bookmark-property/${propertyId}/`, {}, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`
          }
        });

        if (response.status === 201) {
          const newBookmarkId = response.data.bookmark_id;
          setBookmarks(prev => ({
            ...prev,
            [propertyId]: newBookmarkId
          }));
        }
        window.location.reload();
      }

      if (response && (response.status === 200 || response.status === 201)) {
        toast(`Property ${isFavorite ? 'removed from' : 'added to'} favorites successfully`);
      }
    } catch (error: any) {
      console.error('Error toggling favorite status:', error);
      toast.error('Failed to update favorites. Please try again.');
    }
  };

  const formatPrice = (price: string) => {
    return parseFloat(price).toLocaleString();
  };

  const getPropertyImage = () => {
    if (property.image_files && property.image_files.length > 0) {
      return property.image_files[0].file;
    }
    return "/default-property.jpg";
  };

  const handleViewListing = async (slug:string) => {
    try {
      await api.post(`/market/view-property/${slug}`, {}, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`
        }
      });

      router.push(`/listings/${slug}`);
    } catch (error) {
      console.error('Error tracking property view:', error);
      router.push(`/listings/${slug}`);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="block">
        <div className="relative">
          <div className="relative overflow-hidden" style={{ height: "240px" }}>
            <img
              src={getPropertyImage()}
              alt={property.title}
              className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70"></div>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
            <div className="text-white text-2xl font-bold drop-shadow-lg">
              {property.currency} {formatPrice(property.price)}
            </div>
            {property.views > 100 && (
              <div className="bg-[#348b8b] text-white px-3 py-1 rounded-full text-sm flex items-center">
                <Star className="mr-1 w-4 h-4 fill-white" /> Popular
              </div>
            )}
          </div>
          <div className="absolute top-4 right-4 flex space-x-2">
            <button
              onClick={(e) => { toggleFavorite(property.id); e.preventDefault(); }}
              className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-md hover:bg-white transition-colors z-10"
              aria-label={isBookmarked(property.id) ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart
                className={`w-5 h-5 ${isBookmarked(property.id) ? 'text-teal-600 fill-teal-600' : 'text-gray-600'}`}
              />
            </button>
          </div>
        </div>
      </div>

      <div onClick={() => handleViewListing(property.slug)} className="p-5 cursor-pointer">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">{property.title}</h3>
        <div className="flex items-center mb-3">
          <MapPin className="mr-2 text-[#348b8b] w-4 h-4" />
          <span className="text-gray-600 text-sm">{property.address}, {property.city}, {property.state}</span>
        </div>

        <div className="flex items-center mb-2">
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full mr-2">
            {property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)}
          </span>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full flex items-center">
            <Calendar className="w-3 h-3 mr-1" /> {property.year_built || 'N/A'}
          </span>
        </div>

        <div className="grid grid-cols-4 text-center border-t pt-4 mt-4">
          {property.bedrooms !== null && (
            <div className="flex flex-col items-center">
              <BedDouble className="text-[#348b8b] mb-1 w-5 h-5" />
              <span className="text-xs font-medium">{property.bedrooms} BD</span>
            </div>
          )}
          {property.bathrooms !== null && (
            <div className="flex flex-col items-center">
              <Bath className="text-[#348b8b] mb-1 w-5 h-5" />
              <span className="text-xs font-medium">{property.bathrooms} BA</span>
            </div>
          )}
          {property.square_feet !== null && (
            <div className="flex flex-col items-center">
              <SquareIcon className="text-[#348b8b] mb-1 w-5 h-5" />
              <span className="text-xs font-medium">{property.square_feet} SQ M</span>
            </div>
          )}
          {property.lot_size !== null && (
            <div className="flex flex-col items-center">
              <SquareIcon className="text-[#348b8b] mb-1 w-5 h-5" />
              <span className="text-xs font-medium">{property.lot_size} PLOT SIZE</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const FilterBadge: React.FC<FilterBadgeProps> = ({ label, value, onRemove }) => (
  <div className="flex items-center bg-white rounded-full px-3 py-1 text-sm border border-gray-200 mr-2 mb-2">
    <span className="font-medium text-gray-700 mr-1">{label}:</span>
    <span className="text-[#348b8b]">{value}</span>
    <button onClick={onRemove} className="ml-1 text-gray-400 hover:text-gray-700">
      <X className="w-4 h-4" />
    </button>
  </div>
);

const ListingsPage: React.FC = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    purpose: '',
    propertyType: '',
    yearBuilt: '',
    searchQuery: '',
    listingCategory: '' // Add this
  });
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  // Build query params for API call
  const buildQueryParams = (page: number) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());

    if (filters.searchQuery) {
      params.append('search', filters.searchQuery);
    }
    if (filters.minPrice) {
      params.append('min_price', filters.minPrice);
    }
    if (filters.maxPrice) {
      params.append('max_price', filters.maxPrice);
    }
    if (filters.bedrooms) {
      params.append('bedrooms', filters.bedrooms);
    }
    if (filters.purpose) {
      params.append('purpose', filters.purpose);
    }
    if (filters.propertyType) {
      params.append('property_type', filters.propertyType);
    }
    if (filters.yearBuilt) {
      params.append('year_built', filters.yearBuilt);
    }

    // Add sorting
    if (sortBy === 'corporate') {
      params.append('listing_category', 'corporate');
    } else if (sortBy === 'p2p') {
      params.append('listing_category', 'p2p');
    } else if (sortBy === 'price_low') {
      params.append('ordering', 'price');
    } else if (sortBy === 'price_high') {
      params.append('ordering', '-price');
    } else if (sortBy === 'beds') {
      params.append('ordering', '-bedrooms');
    } else {
      params.append('ordering', '-listed_date');
    }

    return params.toString();
  };

  // Fetch properties from backend
  const fetchProperties = async (page: number) => {
    setLoading(true);
    try {
      const queryParams = buildQueryParams(page);
      const response = await api.get(`/market/fetch-listed-properties/?${queryParams}`);
      const data: ApiResponse = response.data;

      setProperties(data.results || []);
      setTotalCount(data.count);
      setTotalPages(Math.ceil(data.count / itemsPerPage));
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchProperties(1);
  }, []);

  // Refetch when filters or sorting changes
  useEffect(() => {
    fetchProperties(1);
  }, [filters, sortBy]);

  // Handle page changes
  const handlePageChange = (page: number) => {
    fetchProperties(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRemoveFilter = (filterKey: keyof FilterState) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: ''
    }));
  };

  const handleClearAllFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      purpose: '',
      propertyType: '',
      yearBuilt: '',
      searchQuery: '',
      listingCategory: ''
    });
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  // Build active filters display
  useEffect(() => {
    const newActiveFilters: ActiveFilter[] = [];
    if (filters.searchQuery) newActiveFilters.push({ key: 'searchQuery', label: 'Search', value: filters.searchQuery });
    if (filters.minPrice) newActiveFilters.push({ key: 'minPrice', label: 'Min Price', value: `${filters.minPrice}` });
    if (filters.maxPrice) newActiveFilters.push({ key: 'maxPrice', label: 'Max Price', value: `${filters.maxPrice}` });
    if (filters.bedrooms) newActiveFilters.push({ key: 'bedrooms', label: 'Bedrooms', value: `${filters.bedrooms}+` });
    if (filters.purpose) newActiveFilters.push({ key: 'purpose', label: 'Purpose', value: filters.purpose });
    if (filters.propertyType) newActiveFilters.push({
      key: 'propertyType',
      label: 'Type',
      value: filters.propertyType.charAt(0).toUpperCase() + filters.propertyType.slice(1)
    });
    if (filters.yearBuilt) newActiveFilters.push({ key: 'yearBuilt', label: 'Year', value: `Since ${filters.yearBuilt}` });

    setActiveFilters(newActiveFilters);
  }, [filters]);

  const renderPaginationItems = () => {
    const items = [];

    items.push(
      <PaginationItem key="first">
        <PaginationLink
          isActive={currentPage === 1}
          onClick={() => handlePageChange(1)}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i <= 1 || i >= totalPages) continue;
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={currentPage === i}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink
            isActive={currentPage === totalPages}
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-[#348b8b] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Dream Home</h1>
            <p className="text-xl opacity-90 mb-8">Discover the perfect property that matches your lifestyle and preferences.</p>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 opacity-10">
          <svg width="400" height="400" viewBox="0 0 200 200">
            <path d="M30,60 L50,30 L70,60 L50,90 Z" fill="#ffffff" />
            <path d="M80,40 L100,10 L120,40 L100,70 Z" fill="#ffffff" />
            <path d="M130,60 L150,30 L170,60 L150,90 Z" fill="#ffffff" />
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Search and Filter Section */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <form onSubmit={handleSearch} className="relative flex-grow">
              <input
                type="text"
                name="searchQuery"
                value={filters.searchQuery}
                onChange={handleFilterChange}
                placeholder="Search by location, neighborhood, or property"
                className="w-full p-4 pl-12 pr-4 rounded-lg border border-gray-300 focus:border-[#348b8b] focus:ring-1 focus:ring-[#348b8b] focus:outline-none transition-colors shadow-sm"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <button
                type="submit"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-[#348b8b] text-white p-2 rounded-lg hover:bg-[#2d7a7a] transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="bg-[#348b8b] text-white p-4 rounded-lg hover:bg-[#2d7a7a] transition-colors flex items-center justify-center shadow-sm"
            >
              <SlidersHorizontal className="mr-2" />
              <span>Filters</span>
              {activeFilters.length > 0 && (
                <span className="ml-2 bg-white text-[#348b8b] rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                  {activeFilters.length}
                </span>
              )}
            </button>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap items-center">
                {activeFilters.map((filter) => (
                  <FilterBadge
                    key={filter.key}
                    label={filter.label}
                    value={filter.value}
                    onRemove={() => handleRemoveFilter(filter.key)}
                  />
                ))}
                <button
                  onClick={handleClearAllFilters}
                  className="text-sm text-[#348b8b] hover:text-[#2d7a7a] font-medium ml-2"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}

          {/* Expandable Filter Section */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Min Price</label>
                      <div className="relative">
                        <input
                          type="number"
                          name="minPrice"
                          value={filters.minPrice}
                          onChange={handleFilterChange}
                          placeholder="Min"
                          className="w-full p-2 pl-10 border rounded-lg focus:ring-1 focus:ring-[#348b8b] focus:border-[#348b8b] outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Max Price</label>
                      <div className="relative">
                        <input
                          type="number"
                          name="maxPrice"
                          value={filters.maxPrice}
                          onChange={handleFilterChange}
                          placeholder="Max"
                          className="w-full p-2 pl-10 border rounded-lg focus:ring-1 focus:ring-[#348b8b] focus:border-[#348b8b] outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Bedrooms</label>
                      <select
                        name="bedrooms"
                        value={filters.bedrooms}
                        onChange={handleFilterChange}
                        className="w-full p-2 border rounded-lg appearance-none bg-select-arrow bg-no-repeat bg-[right_0.75rem_center] pr-8 focus:ring-1 focus:ring-[#348b8b] focus:border-[#348b8b] outline-none transition-colors"
                      >
                        <option value="">Any</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                        <option value="4">4+</option>
                        <option value="5">5+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Purpose</label>
                      <select
                        name="purpose"
                        value={filters.purpose}
                        onChange={handleFilterChange}
                        className="w-full p-2 border rounded-lg appearance-none bg-select-arrow bg-no-repeat bg-[right_0.75rem_center] pr-8 focus:ring-1 focus:ring-[#348b8b] focus:border-[#348b8b] outline-none transition-colors"
                      >
                        <option value="">Any</option>
                        <option value="rent">Rent</option>
                        <option value="lease">Lease</option>
                        <option value="sale">Sale</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Property Type</label>
                      <select
                        name="propertyType"
                        value={filters.propertyType}
                        onChange={handleFilterChange}
                        className="w-full p-2 border rounded-lg appearance-none bg-select-arrow bg-no-repeat bg-[right_0.75rem_center] pr-8 focus:ring-1 focus:ring-[#348b8b] focus:border-[#348b8b] outline-none transition-colors"
                      >
                        <option value="">All Types</option>
                        <option value="house">House</option>
                        <option value="apartment">Apartment</option>
                        <option value="land">Land</option>
                        <option value="commercial">Commercial</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">Year Built</label>
                      <select
                        name="yearBuilt"
                        value={filters.yearBuilt}
                        onChange={handleFilterChange}
                        className="w-full p-2 border rounded-lg appearance-none bg-select-arrow bg-no-repeat bg-[right_0.75rem_center] pr-8 focus:ring-1 focus:ring-[#348b8b] focus:border-[#348b8b] outline-none transition-colors"
                      >
                        <option value="">Any Year</option>
                        <option value="2020">2020 or newer</option>
                        <option value="2015">2015 or newer</option>
                        <option value="2010">2010 or newer</option>
                        <option value="2000">2000 or newer</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={handleClearAllFilters}
                      className="text-gray-600 hover:text-gray-800 mr-4"
                    >
                      Clear Filters
                    </button>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="bg-[#348b8b] text-white px-6 py-2 rounded-lg hover:bg-[#2d7a7a] transition-colors"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results summary and sort controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-2xl font-bold text-gray-800">
              {loading ? 'Finding properties...' : `${totalCount} Properties Available`}
            </h2>
            <p className="text-gray-600 text-sm">
              {!loading && totalCount > 0 ? `Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, totalCount)} of ${totalCount}` : 'No properties found'}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-[#348b8b] text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-[#348b8b] text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-[#348b8b] focus:border-[#348b8b] cursor-pointer"
              >
                <option value="corporate">Corporate</option>
                <option value="p2p">P2P</option>
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="beds">Most Bedrooms</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Properties Grid/List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#348b8b]"></div>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <MapPin className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Properties Found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search criteria</p>
            <button
              onClick={handleClearAllFilters}
              className="bg-[#348b8b] text-white px-6 py-3 rounded-lg hover:bg-[#2d7a7a] transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-6'
            }>
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>

                    {renderPaginationItems()}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ListingsPage;