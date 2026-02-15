"use client";

import { useState, useEffect } from "react";
import {
  Award,
  Calendar,
  Filter,
  Loader2,
  MapPin,
  Search,
  Star,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, getSpecialtyLabel } from "@/lib/utils";

interface Therapist {
  id: string;
  name: string;
  imageUrl?: string;
  specialties: string[];
  yearsOfExperience: number;
  averageRating: number;
  totalReviews: number;
  bio?: string;
}

const SPECIALTIES = [
  "ALL",
  "SPORTS_REHABILITATION",
  "ORTHOPEDIC",
  "NEUROLOGICAL",
  "CHRONIC_PAIN",
  "POST_OPERATIVE",
  "MANUAL_THERAPY",
  "GERIATRIC",
  "PEDIATRIC",
];

export default function TherapistsPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("ALL");

  useEffect(() => {
    fetchTherapists();
  }, [selectedSpecialty]);

  const fetchTherapists = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSpecialty !== "ALL") {
        params.set("specialty", selectedSpecialty);
      }

      const response = await fetch(`/api/therapists/match?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTherapists(data.therapists || []);
      }
    } catch (error) {
      console.error("Failed to fetch therapists:", error);
      // Use sample data for demo
      setTherapists(SAMPLE_THERAPISTS);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTherapists = therapists.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.specialties.some((s) =>
        getSpecialtyLabel(s).toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find a Therapist</h1>
        <p className="text-gray-500 mt-1">
          Browse our network of licensed physiotherapists
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-physio-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {SPECIALTIES.map((specialty) => (
            <Button
              key={specialty}
              variant={selectedSpecialty === specialty ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSpecialty(specialty)}
              className={cn(
                "whitespace-nowrap",
                selectedSpecialty === specialty && "bg-physio-600 hover:bg-physio-700"
              )}
            >
              {specialty === "ALL" ? "All Specialties" : getSpecialtyLabel(specialty)}
            </Button>
          ))}
        </div>
      </div>

      {/* Therapist Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-physio-600 animate-spin" />
        </div>
      ) : filteredTherapists.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTherapists.map((therapist) => (
            <Card key={therapist.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                {/* Header */}
                <div className="bg-gradient-to-r from-physio-50 to-health-50 p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center mx-auto mb-3">
                    {therapist.imageUrl ? (
                      <img
                        src={therapist.imageUrl}
                        alt={therapist.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-physio-600" />
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900">{therapist.name}</h3>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium">
                      {therapist.averageRating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({therapist.totalReviews} reviews)
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-4">
                  {/* Specialties */}
                  <div className="flex flex-wrap gap-2">
                    {therapist.specialties.slice(0, 3).map((specialty) => (
                      <span
                        key={specialty}
                        className="px-2 py-1 bg-physio-50 text-physio-700 text-xs font-medium rounded-full"
                      >
                        {getSpecialtyLabel(specialty)}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Award className="w-4 h-4" />
                      <span>{therapist.yearsOfExperience} years exp.</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>In-Person & Online</span>
                    </div>
                  </div>

                  {/* Bio */}
                  {therapist.bio && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {therapist.bio}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" size="sm">
                      View Profile
                    </Button>
                    <Button className="flex-1 bg-physio-600 hover:bg-physio-700" size="sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      Book
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">No Therapists Found</h3>
            <p className="text-gray-500 text-sm">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Sample data for demo purposes
const SAMPLE_THERAPISTS: Therapist[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialties: ["SPORTS_REHABILITATION", "ORTHOPEDIC"],
    yearsOfExperience: 12,
    averageRating: 4.9,
    totalReviews: 127,
    bio: "Specializing in sports injuries and post-surgical rehabilitation with over 12 years of experience.",
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    specialties: ["CHRONIC_PAIN", "MANUAL_THERAPY"],
    yearsOfExperience: 8,
    averageRating: 4.8,
    totalReviews: 89,
    bio: "Expert in chronic pain management using manual therapy techniques and holistic approaches.",
  },
  {
    id: "3",
    name: "Dr. Emily Rodriguez",
    specialties: ["NEUROLOGICAL", "GERIATRIC"],
    yearsOfExperience: 15,
    averageRating: 4.9,
    totalReviews: 156,
    bio: "Dedicated to neurological rehabilitation and helping elderly patients maintain mobility.",
  },
  {
    id: "4",
    name: "Dr. James Wilson",
    specialties: ["POST_OPERATIVE", "ORTHOPEDIC"],
    yearsOfExperience: 10,
    averageRating: 4.7,
    totalReviews: 98,
    bio: "Focused on post-operative recovery with personalized treatment plans for optimal outcomes.",
  },
  {
    id: "5",
    name: "Dr. Lisa Park",
    specialties: ["PEDIATRIC", "SPORTS_REHABILITATION"],
    yearsOfExperience: 7,
    averageRating: 4.8,
    totalReviews: 64,
    bio: "Passionate about pediatric physiotherapy and youth sports injury prevention.",
  },
  {
    id: "6",
    name: "Dr. David Thompson",
    specialties: ["MANUAL_THERAPY", "CHRONIC_PAIN"],
    yearsOfExperience: 20,
    averageRating: 5.0,
    totalReviews: 203,
    bio: "Veteran therapist with expertise in manual therapy and chronic pain management.",
  },
];
