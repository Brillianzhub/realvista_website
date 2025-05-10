"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Heart, Star, BedDouble, Bath, Square } from 'lucide-react';
import Link from 'next/link';
import api from '@/config/apiClient';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Define TypeScript interfaces
interface PropertyImage {
  file: string;
  id?: string;
}

interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  featured: boolean;
  currency: string;
  image_files: PropertyImage[];
}

interface FavoritesState {
  [key: string]: boolean;
}

const FeaturedProperties = () => {
  const [favorites, setFavorites] = useState<FavoritesState>({});
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const slideIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter()
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Fetch properties from API
  useEffect(() => {
    const getListings = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/market/fetch-listed-properties/`);
        // Assuming the API returns an array of properties or has a results property
        const fetchedProperties = response.data.results;
        setProperties(fetchedProperties);
      } catch (error) {
        console.error("Error fetching properties:", error);
        // Fallback to empty array if API call fails
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    getListings();
  }, []);

  // Initialize favorites when component mounts
  useEffect(() => {
    initializeFavorites();
  }, []);

  // Function to fetch user's favorites when component loads
  const initializeFavorites = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push("/sign-in")
    }

  try {
         const response = await api.get("/market/user-bookmarks/", {
  headers: {
    "Content-Type": "Application/json",
      Authorization: `Token ${token}`
  }
});

    if (response.data && Array.isArray(response.data)) {
      // Convert the array of favorite property IDs to an object for easier lookup
      const favoritesObject = response.data.reduce((acc: any, propertyId: string) => {
        acc[propertyId] = true;
        return acc;
      }, {});

      setFavorites(favoritesObject);
    }
  } catch (error) {
    console.error('Error fetching user favorites:', error);
  }
};


console.log("favorites--->", favorites)

// Function to toggle favorite status
const toggleFavorite = async (propertyId: any) => {
  // Get current favorite status
  const isFavorite = favorites[propertyId] || false;

  console.log("token-->", token);

  if (!token) {
    // Handle unauthenticated users
    console.error('Authentication required to manage favorites');
    router.push("/sign-in");
    return; // Exit function early if not authenticated
  }

  try {
    let response;

    // Determine which endpoint to use based on current status
    if (isFavorite) {
      // Remove from favorites if it's currently favorited
      response = await api.post(`/market/remove-bookmark/${propertyId}/`, {}, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`
        }
      });
    } else {
      // Add to favorites if it's not currently favorited
      response = await api.post(`/market/bookmark-property/${propertyId}/`, {}, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`
        }
      });
    }

    // Check if the request was successful
    if (response && (response.status === 200 || response.status === 201)) {
      // Update local state to reflect the change
      setFavorites(prev => ({
        ...prev,
        [propertyId]: !isFavorite
      }));

      // Optionally show a success message
      toast(`Property ${isFavorite ? 'removed from' : 'added to'} favorites successfully`);
    }
  } catch (error: any) {
    // Handle error scenarios
    console.error('Error toggling favorite status:', error);
    toast.error('Failed to update favorites. Please try again.');
  }
};


// Number of cards to display at once based on screen size
const getVisibleCount = (): number => {
  if (typeof window !== 'undefined') {
    if (window.innerWidth >= 1024) return 3; // lg screens
    if (window.innerWidth >= 640) return 2;  // sm screens
    return 1; // mobile
  }
  return 3; // Default for SSR
};

const totalSlides = Math.max(1, properties.length - getVisibleCount() + 1);

// Start auto-sliding
useEffect(() => {
  const startSlideInterval = () => {
    if (slideIntervalRef.current) {
      clearInterval(slideIntervalRef.current);
    }

    slideIntervalRef.current = setInterval(() => {
      if (!isPaused) {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
      }
    }, 3000);
  };

  startSlideInterval();

  // Handle window resize
  const handleResize = () => {
    // Recalculate visible count and adjust currentIndex if needed
    const newTotalSlides = Math.max(1, properties.length - getVisibleCount() + 1);
    setCurrentIndex(prev => Math.min(prev, newTotalSlides - 1));
    startSlideInterval();
  };

  window.addEventListener('resize', handleResize);

  return () => {
    if (slideIntervalRef.current) {
      clearInterval(slideIntervalRef.current);
    }
    window.removeEventListener('resize', handleResize);
  };
}, [isPaused, properties.length, totalSlides]);

const goToSlide = (index: number) => {
  setCurrentIndex(index);
};

const nextSlide = () => {
  setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
};

const prevSlide = () => {
  setCurrentIndex((prevIndex) => (prevIndex === 0 ? totalSlides - 1 : prevIndex - 1));
};

// Show loading state
if (loading) {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            <span className="text-[#348b8b]">Featured Properties</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Loading properties...
          </p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#348b8b]"></div>
        </div>
      </div>
    </section>
  );
}

// Show empty state if no properties
if (properties.length === 0) {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            <span className="text-[#348b8b]">Featured Properties</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            No properties available at the moment. Please check back later.
          </p>
        </div>
      </div>
    </section>
  );
}

return (
  <section className="py-20 bg-gradient-to-b from-white to-gray-50">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
          <span className="text-[#348b8b]">Featured Properties</span>
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
          Discover our carefully curated selection of exceptional properties that combine luxury, comfort, and prime locations.
        </p>
      </div>

      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (100 / getVisibleCount())}%)` }}
          >
            {properties.map((property, index) => (
              <div
                key={property.id || index}
                className="flex-none w-full sm:w-1/2 lg:w-1/3 p-3"
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group h-full">
                  <div className="relative">
                    <div className="relative h-48 sm:h-60 w-full overflow-hidden">
                      <img
                        src={property.image_files?.[0]?.file || '/placeholder-property.jpg'}
                        alt={property.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    <button
                      onClick={() => toggleFavorite(property.id)}
                      className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-md hover:bg-white transition-colors z-10"
                      aria-label="Add to favorites"
                    >
                      <Heart
                        className={`w-5 h-5 ${favorites[property.id] ? 'text-teal-600 fill-teal-600' : 'text-gray-600'}`}
                      />
                    </button>
                    {property.featured && (
                      <div className="absolute top-4 left-4 bg-[#348b8b] text-white px-3 py-1 rounded-full text-xs flex items-center shadow-md z-10">
                        <Star className="mr-1 w-3 h-3 fill-white" /> Featured
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent h-24 pointer-events-none"></div>
                  </div>
                  <div className="relative p-6">
                    <div className="absolute -top-10 right-6 bg-white rounded-lg shadow-lg py-2 px-3">
                      <div className="text-lg lg:text-xl font-bold text-[#348b8b]">
                        <span className='mr-1'>{property.currency} </span>{Number(property?.price).toLocaleString()}
                      </div>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 mt-2 line-clamp-1">{property.title}</h3>
                    <div className="flex items-center mb-4 text-sm text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#348b8b] mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {property.address}, {property.city}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center border-t border-gray-100 pt-4">
                      <div className="flex flex-col items-center">
                        <BedDouble className="text-[#348b8b] mb-1 h-5 w-5" />
                        <span className="text-xs font-medium">{property.bedrooms || 0} Beds</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Bath className="text-[#348b8b] mb-1 h-5 w-5" />
                        <span className="text-xs font-medium">{property.bathrooms || 0} Baths</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Square className="text-[#348b8b] mb-1 h-5 w-5" />
                        <span className="text-xs font-medium">{property.area || 0} Sq Ft</span>
                      </div>
                    </div>
                    <Link href={`/listings/${property.id}`} className="block cursor-pointer">
                      <button className="w-full mt-6 bg-[#348b8b] text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#297b7b] transition-colors shadow-sm">
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation buttons - only show if there are enough properties */}
        {properties.length > getVisibleCount() && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md z-10"
              aria-label="Previous property"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md z-10"
              aria-label="Next property"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Dots indicator - only show if there are enough properties */}
        {properties.length > getVisibleCount() && (
          <div className="flex justify-center mt-6">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={`dot-${index}`}
                onClick={() => goToSlide(index)}
                className={`h-2 w-2 mx-1 rounded-full ${currentIndex === index ? 'bg-[#348b8b]' : 'bg-gray-300'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="text-center mt-16">
        <Link
          href="/listings"
          className="inline-flex items-center px-8 py-3 rounded-full text-white font-medium bg-[#348b8b] shadow-md hover:shadow-lg hover:bg-[#297b7b] transition-all"
        >
          Browse All Properties
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  </section>
);
};

export default FeaturedProperties;