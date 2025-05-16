"use client"
import React, { useEffect, useState } from 'react';
import {
  Star,
  Phone,
  Mail,
  BadgeCheck,
  X,
  MapPin,
  Calendar,
  Building,
  ArrowRight,
  Search,
  Filter,
  MessageSquare,
  Award,
  MessageCircle,
  Clock,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Copy
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from '@/config/apiClient';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FaWhatsapp } from 'react-icons/fa';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Define TypeScript interfaces based on API response
interface Agent {
  id: number;
  user: string;
  avatar: string | null;
  agency_name: string;
  agency_address: string;
  phone_number: string;
  whatsapp_number: string;
  experience_years: number;
  preferred_contact_mode: string;
  verified: boolean;
  featured: boolean;
  bio: string;
  created_at: string;
  updated_at: string;
  rating?: number;
  total_reviews?: number;
  average_rating: number
  services?: string[];
}

interface Property {
  id: number;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  main_image: string | null;
}

interface AgentWithListings extends Agent {
  listings?: Property[];
}

interface AgentCardProps {
  agent: Agent;
  onDetailsClick: (id: number) => void;
}

interface PropertyCardProps {
  property: Property;
}

interface AgentDetailModalProps {
  agentId: number;
  onClose: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onDetailsClick }) => {
  // Create default services array if none provided by API
  const services = agent.services || [
    agent.agency_name ? "Agency Representation" : "Independent Agent",
    `${agent.experience_years}+ Years Experience`
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl">
      <div className="relative">
        <img
          src={agent.avatar || "/api/placeholder/400/400"}
          alt={agent.agency_name}
          className="w-full h-64 object-cover"
        />
        {agent.verified && (
          <div className="absolute top-4 right-4 bg-teal-500 text-white px-3 py-1 rounded-full flex items-center">
            <BadgeCheck className="mr-2 w-4 h-4" /> Verified
          </div>
        )}
        {agent.featured && (
          <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full">
            Featured
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{agent.agency_name}</h3>
            <p className="text-gray-600">{agent.user}</p>
          </div>
          <div className="flex items-center">
            <Star className="text-yellow-500 mr-1" />
            <span className="font-semibold">{agent?.average_rating || 5.0}</span>
            <span className="text-gray-500 ml-1">({agent.total_reviews || 0})</span>
          </div>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-3">{agent.bio}</p>

        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-2">Services</h4>
          <div className="flex flex-wrap gap-2">
            {services.map((service, index) => (
              <span
                key={index}
                className="bg-teal-50 text-teal-600 text-sm px-3 py-1 rounded-full"
              >
                {service}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center mb-1">
              <Phone className="w-4 h-4 mr-2 text-teal-500" />
              <span>{agent.phone_number}</span>
            </div>
            {agent.preferred_contact_mode === "whatsapp" && (
              <div className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-2 text-teal-500" />
                <span className="text-sm">WhatsApp Preferred</span>
              </div>
            )}
          </div>
          <button
            onClick={() => onDetailsClick(agent.id)}
            className="bg-teal-500 text-white cursor-pointer text-nowrap px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <img
          src={property.main_image || "/api/placeholder/400/300"}
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <span className="text-white font-bold text-lg">${property.price.toLocaleString()}</span>
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-bold text-gray-800 mb-2">{property.title}</h4>
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <Building className="w-4 h-4 mr-1" />
            <span>{property.bedrooms} bd | {property.bathrooms} ba</span>
          </div>
          <div>
            <span>{property.area} sqft</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AgentDetailModal: React.FC<AgentDetailModalProps> = ({ agentId, onClose }) => {
  const [agent, setAgent] = useState<AgentWithListings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(true);
  const [agentListings, setAgentListings] = useState<any[]>([]);
  const primaryColor = "#348b8b"; // Default primary color
  const [isShareDialogOpen, setIsShareDialogOpen] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>("");
  const router = useRouter()

  useEffect(() => {
    const fetchAgentDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/agents/${agentId}/`);
        setAgent(response.data);
        setAgentListings(response.data.properties || []);
      } catch (error) {
        console.error("Error fetching agent details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (agentId) {
      fetchAgentDetails();
    }
  }, [agentId]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    onClose();
  };

  if (!agent) {
    return null;
  }

  const generateShareUrl = () => {
    // Use window.location to get the base URL of the current page
    const baseUrl = window.location.origin;
    // Construct a URL for the agent's profile
    return `${baseUrl}/agents/${selectedAgent.id}`;
  };

  // Update the button click handler
  const handleOpenShareDialog = () => {
    // Set the share URL before opening the dialog
    setShareUrl(generateShareUrl());
    setIsShareDialogOpen(true);
  };

  const selectedAgent = agent;

  const handleShare = (platform: string) => {
    let shareLink = '';
    const agentName = selectedAgent?.agency_name || 'Real Estate Agent';
    const shareText = `Check out ${agentName}'s real estate profile!`;

    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        shareLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
      default:
        return;
    }

    // First close the dialog
    setIsShareDialogOpen(false);

    // Then open the share link in a new window/tab
    setTimeout(() => {
      window.open(shareLink, '_blank', 'noopener,noreferrer');
    }, 100);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setIsShareDialogOpen(false);
    toast("Link copied!, The agent's profile link has been copied to your clipboard.")
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
          {selectedAgent && (
            <>
              <DialogHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <DialogTitle className="text-2xl font-bold">{selectedAgent.agency_name}</DialogTitle>
                  <div className="flex gap-2">
                    {selectedAgent.verified && (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        <Star className="w-3 h-3 mr-1 fill-green-800" /> Verified
                      </Badge>
                    )}
                    {selectedAgent.featured && (
                      <Badge style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                        <Award className="w-3 h-3 mr-1" /> Featured
                      </Badge>
                    )}
                  </div>
                </div>
                <DialogDescription>
                  Professional real estate agent with {selectedAgent.experience_years} {selectedAgent.experience_years === 1 ? 'year' : 'years'} of experience
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col md:flex-row gap-8 py-6">
                <div className="md:w-1/3 flex flex-col items-center">
                  <Avatar className="w-32 h-32 mb-6 border-4 border-white shadow-md">
                    {selectedAgent.avatar ? (
                      <AvatarImage src={selectedAgent.avatar} alt={selectedAgent.agency_name} />
                    ) : (
                      <AvatarFallback style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                        {getInitials(selectedAgent.agency_name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="w-full p-4 flex items-center justify-center mt-[-10px] gap-2 rounded-lg">
                    <h2>Ratings:</h2>
                    <div className="flex items-center">
                      <Star className="text-yellow-500 mr-1" />
                      <span className="font-semibold">{selectedAgent?.average_rating || 5.0}</span>
                    </div>
                  </div>
                  <div className="space-y-3 w-full bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 text-center" style={{ color: primaryColor }}>Contact Information</h4>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full" style={{ backgroundColor: `${primaryColor}20` }}>
                        <Phone className="h-4 w-4" style={{ color: primaryColor }} />
                      </div>
                      <span className="text-sm">{selectedAgent.phone_number}</span>
                    </div>
                    {selectedAgent.whatsapp_number && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full" style={{ backgroundColor: `${primaryColor}20` }}>
                          <MessageCircle className="h-4 w-4" style={{ color: primaryColor }} />
                        </div>
                        <span className="text-sm">{selectedAgent.whatsapp_number}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full" style={{ backgroundColor: `${primaryColor}20` }}>
                        <Mail className="h-4 w-4" style={{ color: primaryColor }} />
                      </div>
                      <span className="text-sm">{selectedAgent.user}</span>
                    </div>
                    {selectedAgent.agency_address && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full" style={{ backgroundColor: `${primaryColor}20` }}>
                          <MapPin className="h-4 w-4" style={{ color: primaryColor }} />
                        </div>
                        <span className="text-sm">{selectedAgent.agency_address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full" style={{ backgroundColor: `${primaryColor}20` }}>
                        <Clock className="h-4 w-4" style={{ color: primaryColor }} />
                      </div>
                      <span className="text-sm">Member since {new Date(selectedAgent.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {/* Share Agent Profile */}
                  <div className="mt-6 w-full">
                    <Button
                      variant="outline"
                      className="w-full flex cursor-pointer items-center justify-center gap-2 border-dashed border-gray-300"
                      onClick={handleOpenShareDialog}
                    >
                      <Share2 className="h-4 w-4" />
                      Share Profile
                    </Button>
                    <Button
                      className="w-full flex mt-4 cursor-pointer items-center justify-center gap-2 h-11"
                      style={{ backgroundColor: primaryColor }}
                      onClick={() => router.push(`/agents/${selectedAgent.id}`)}
                    >
                      <Star className="h-4 w-4" />
                      Rate This Agent
                    </Button>
                  </div>
                  <div className="mt-6 w-full">
                    <h4 className="font-medium mb-2">Preferred Contact Method</h4>
                    <Badge className="w-full justify-center py-2 capitalize" style={{ backgroundColor: primaryColor }}>
                      {selectedAgent.preferred_contact_mode}
                    </Badge>
                  </div>
                </div>

                <div className="md:w-2/3">
                  <Tabs defaultValue="about">
                    <TabsList className="grid w-full grid-cols-2" style={{ backgroundColor: `${primaryColor}20` }}>
                      <TabsTrigger
                        value="about"
                        className="data-[state=active]:text-white"
                        style={{
                          color: primaryColor,
                          "--accent-foreground": "white",
                          "--accent": primaryColor
                        } as React.CSSProperties}
                      >
                        About
                      </TabsTrigger>
                      <TabsTrigger
                        value="listings"
                        className="data-[state=active]:text-white"
                        style={{
                          color: primaryColor,
                          "--accent-foreground": "white",
                          "--accent": primaryColor
                        } as React.CSSProperties}
                      >
                        Properties
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="about" className="mt-6">
                      <h4 className="font-medium mb-3 text-lg" style={{ color: primaryColor }}>Agent Bio</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 mb-4 leading-relaxed">
                          {selectedAgent.bio || "No bio information available. This agent has not provided a detailed bio yet."}
                        </p>
                      </div>

                      <h4 className="font-medium mb-3 mt-6 text-lg" style={{ color: primaryColor }}>Expertise</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Residential</Badge>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Commercial</Badge>
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Luxury</Badge>
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Investment</Badge>
                      </div>
                    </TabsContent>

                    <TabsContent value="listings" className="mt-6">
                      {loading ? (
                        <div className="flex justify-center py-12">
                          <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: `${primaryColor} transparent ${primaryColor} ${primaryColor}` }}></div>
                        </div>
                      ) : agentListings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {agentListings.map(listing => (
                            <Card key={listing.id} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all">
                              <div className="h-44 bg-gray-200 relative">
                                {listing.images && listing.images.length > 0 ? (
                                  <img
                                    src={listing.images[0]}
                                    alt={listing.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                    <Building className="h-8 w-8 text-gray-400" />
                                  </div>
                                )}
                                <Badge
                                  className="absolute top-2 right-2 text-white"
                                  style={{ backgroundColor: primaryColor }}
                                >
                                  {listing.property_type}
                                </Badge>
                                <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-sm px-2 py-1 rounded">
                                  {listing.currency} {parseFloat(listing.price).toLocaleString()}
                                </div>
                              </div>
                              <CardContent className="p-4">
                                <h5 className="font-medium line-clamp-1 text-lg">{listing.title}</h5>
                                <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="capitalize">{listing.city}, {listing.state}</span>
                                </div>
                                <div className="flex justify-between items-center mt-3">
                                  <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 capitalize">
                                    {listing.property_type}
                                  </Badge>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-8 cursor-pointer"
                                    style={{ borderColor: primaryColor, color: primaryColor }}
                                    onClick={() => window.location.href = `/listings/${listing.id}`}
                                  >
                                    View Details
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                          <Building className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                          <p className="text-gray-500">No active listings available from this agent.</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Agent Profile</DialogTitle>
            <DialogDescription>
              Choose a platform to share this agent's profile
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-6 py-4">
            <div className="flex justify-center gap-6">
              <button
                onClick={() => handleShare('facebook')}
                className="p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center justify-center"
                aria-label="Share on Facebook"
              >
                <Facebook className="h-6 w-6" />
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="p-3 rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors flex items-center justify-center"
                aria-label="Share on Twitter"
              >
                <Twitter className="h-6 w-6" />
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="p-3 rounded-full bg-blue-700 text-white hover:bg-blue-800 transition-colors flex items-center justify-center"
                aria-label="Share on LinkedIn"
              >
                <Linkedin className="h-6 w-6" />
              </button>
              <button
                onClick={() => handleShare('whatsapp')}
                className="p-3 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center justify-center"
                aria-label="Share on WhatsApp"
              >
                <FaWhatsapp className="h-6 w-6" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="share-url" className="text-sm font-medium">
                Or copy this link
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="share-url"
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const AgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterVerified, setFilterVerified] = useState<boolean>(false);
  const [filterFeatured, setFilterFeatured] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [experienceFilter, setExperienceFilter] = useState<string>("all");
  const [isShareDialogOpen, setIsShareDialogOpen] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>("");

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      try {
        const response = await api.get('/agents/');
        setAgents(response.data);
        setFilteredAgents(response.data);
      } catch (error) {
        console.error("Error fetching agents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  useEffect(() => {
    let result = [...agents];

    // Apply verified filter if selected
    if (filterVerified) {
      result = result.filter(agent => agent.verified);
    }

    // Apply featured filter if selected
    if (filterFeatured) {
      result = result.filter(agent => agent.featured);
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(agent =>
        agent.agency_name.toLowerCase().includes(term) ||
        agent.bio.toLowerCase().includes(term) ||
        agent.agency_address.toLowerCase().includes(term)
      );
    }

    // Apply experience filter
    if (experienceFilter !== "all") {
      const minExperience = parseInt(experienceFilter);
      result = result.filter(agent => agent.experience_years >= minExperience);
    }

    setFilteredAgents(result);
  }, [agents, filterVerified, filterFeatured, searchTerm, experienceFilter]);

  const handleAgentDetailsClick = (agentId: number) => {
    setSelectedAgentId(agentId);
  };

  const handleCloseModal = () => {
    setSelectedAgentId(null);
  };

  if (loading) {
    return (
      <div className="bg-teal-50 min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-teal-50 to-white min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Our Real Estate Experts
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our team of dedicated professionals is committed to helping you find your perfect property.
            With extensive market knowledge and personalized service, we turn your real estate dreams into reality.
          </p>
        </div>

        {/* Search and Filters */}
        {/* <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-1/3">
                <Search className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="verified"
                    checked={filterVerified}
                    onChange={() => setFilterVerified(!filterVerified)}
                    className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <label htmlFor="verified" className="ml-2 text-gray-700">
                    Verified
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={filterFeatured}
                    onChange={() => setFilterFeatured(!filterFeatured)}
                    className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <label htmlFor="featured" className="ml-2 text-gray-700">
                    Featured
                  </label>
                </div>

                <div className="relative w-full md:w-auto">
                  <Filter className="absolute left-3 top-3 text-gray-400" />
                  <select
                    value={experienceFilter}
                    onChange={(e) => setExperienceFilter(e.target.value)}
                    className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 px-10 rounded-full leading-tight focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="all">All Experience Levels</option>
                    <option value="1">At least 1 year</option>
                    <option value="3">At least 3 years</option>
                    <option value="5">At least 5 years</option>
                    <option value="10">At least 10 years</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                    <ArrowRight className="w-4 h-4 text-gray-400 transform rotate-90" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> */}

        {filteredAgents.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAgents.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onDetailsClick={handleAgentDetailsClick}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">No agents found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any agents matching your current filters. Please try adjusting your search criteria.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterVerified(false);
                setFilterFeatured(false);
                setExperienceFilter("all");
              }}
              className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Agent Detail Modal */}
        {selectedAgentId && (
          <AgentDetailModal
            agentId={selectedAgentId}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
};

export default AgentsPage;