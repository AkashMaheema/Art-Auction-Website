import { Painting } from '../types';

export const paintings: Painting[] = [
  {
    id: 1,
    title: "Autumn Reflections",
    artist: "Elena Vasquez",
    year: 2023,
    medium: "Oil on canvas",
    dimensions: "36 x 48 inches",
    currentBid: 15000,
    minBid: 16000,
    bidCount: 23,
    timeLeft: "2h 34m",
    image: "https://images.pexels.com/photos/1568607/pexels-photo-1568607.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "A stunning contemporary landscape capturing the ethereal beauty of autumn's reflection on still water.",
    provenance: "Private collection, New York",
    condition: "Excellent",
    estimate: { low: 12000, high: 18000 },
    category: "Contemporary",
    featured: true,
    virtualTour: "https://example.com/virtual-tour/1",
    aiAnalysis: {
      style: "Contemporary Impressionism with bold brushstrokes",
      emotion: "Peaceful and contemplative, evoking tranquility",
      technique: "Masterful use of light and shadow with impasto technique",
      historicalContext: "Reflects modern environmental consciousness in art"
    },
    bidHistory: [
      { id: 1, paintingId: 1, userId: 1, amount: 12000, timestamp: "2024-01-15T10:30:00Z", userName: "ArtLover123" },
      { id: 2, paintingId: 1, userId: 2, amount: 13500, timestamp: "2024-01-15T11:15:00Z", userName: "Collector_NY" },
      { id: 3, paintingId: 1, userId: 3, amount: 15000, timestamp: "2024-01-15T12:00:00Z", userName: "ModernArt_Fan" }
    ],
    watchedBy: 47,
    similarPaintings: [2, 4]
  },
  {
    id: 2,
    title: "Urban Symphony",
    artist: "Marcus Chen",
    year: 2022,
    medium: "Mixed media",
    dimensions: "24 x 32 inches",
    currentBid: 8500,
    minBid: 9000,
    bidCount: 17,
    timeLeft: "5h 12m",
    image: "https://images.pexels.com/photos/1292241/pexels-photo-1292241.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "A dynamic abstract composition exploring the rhythm and energy of modern city life.",
    provenance: "Artist's studio",
    condition: "Mint",
    estimate: { low: 7000, high: 11000 },
    category: "Abstract",
    featured: true,
    aiAnalysis: {
      style: "Neo-Abstract Expressionism with geometric influences",
      emotion: "Dynamic and energetic, representing urban vitality",
      technique: "Mixed media layering with contemporary materials",
      historicalContext: "Influenced by digital age and urban architecture"
    },
    bidHistory: [
      { id: 4, paintingId: 2, userId: 2, amount: 7500, timestamp: "2024-01-15T09:00:00Z", userName: "Collector_NY" },
      { id: 5, paintingId: 2, userId: 4, amount: 8500, timestamp: "2024-01-15T10:45:00Z", userName: "AbstractArt_Pro" }
    ],
    watchedBy: 32,
    similarPaintings: [6]
  },
  {
    id: 3,
    title: "Portrait of a Lady",
    artist: "Isabella Romano",
    year: 2021,
    medium: "Oil on canvas",
    dimensions: "20 x 24 inches",
    currentBid: 22000,
    minBid: 23000,
    bidCount: 31,
    timeLeft: "1h 45m",
    image: "https://images.pexels.com/photos/1070254/pexels-photo-1070254.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "An exquisite portrait demonstrating masterful technique and emotional depth.",
    provenance: "European private collection",
    condition: "Very good",
    estimate: { low: 18000, high: 25000 },
    category: "Portrait",
    featured: true,
    aiAnalysis: {
      style: "Classical Realism with Renaissance influences",
      emotion: "Mysterious and introspective, capturing inner depth",
      technique: "Traditional oil painting with glazing techniques",
      historicalContext: "Revival of classical portraiture in contemporary art"
    },
    bidHistory: [
      { id: 6, paintingId: 3, userId: 1, amount: 18000, timestamp: "2024-01-15T08:30:00Z", userName: "ArtLover123" },
      { id: 7, paintingId: 3, userId: 5, amount: 20000, timestamp: "2024-01-15T09:15:00Z", userName: "Portrait_Collector" },
      { id: 8, paintingId: 3, userId: 6, amount: 22000, timestamp: "2024-01-15T10:00:00Z", userName: "ClassicArt_Expert" }
    ],
    watchedBy: 63,
    similarPaintings: [5]
  },
  {
    id: 4,
    title: "Mountain Majesty",
    artist: "David Thompson",
    year: 2023,
    medium: "Watercolor",
    dimensions: "18 x 24 inches",
    currentBid: 3200,
    minBid: 3500,
    bidCount: 12,
    timeLeft: "3h 20m",
    image: "https://images.pexels.com/photos/1167355/pexels-photo-1167355.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "A breathtaking watercolor landscape showcasing the grandeur of mountain vistas.",
    provenance: "Gallery acquisition",
    condition: "Excellent",
    estimate: { low: 2500, high: 4000 },
    category: "Landscape",
    featured: false,
    aiAnalysis: {
      style: "Traditional Watercolor Landscape with modern sensibility",
      emotion: "Serene and majestic, inspiring awe of nature",
      technique: "Wet-on-wet watercolor with precise detail work",
      historicalContext: "Contemporary landscape art celebrating natural beauty"
    },
    bidHistory: [
      { id: 9, paintingId: 4, userId: 3, amount: 2800, timestamp: "2024-01-15T11:30:00Z", userName: "ModernArt_Fan" },
      { id: 10, paintingId: 4, userId: 7, amount: 3200, timestamp: "2024-01-15T12:15:00Z", userName: "Nature_Lover" }
    ],
    watchedBy: 28,
    similarPaintings: [1]
  },
  {
    id: 5,
    title: "Still Life with Flowers",
    artist: "Sophie Martin",
    year: 2022,
    medium: "Acrylic on canvas",
    dimensions: "16 x 20 inches",
    currentBid: 1800,
    minBid: 2000,
    bidCount: 8,
    timeLeft: "4h 55m",
    image: "https://images.pexels.com/photos/1037992/pexels-photo-1037992.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "A delicate still life composition featuring vibrant seasonal flowers.",
    provenance: "Artist's studio",
    condition: "Mint",
    estimate: { low: 1500, high: 2500 },
    category: "Still Life",
    featured: false,
    aiAnalysis: {
      style: "Contemporary Still Life with vibrant color palette",
      emotion: "Joyful and life-affirming, celebrating beauty in simplicity",
      technique: "Acrylic painting with bold color application",
      historicalContext: "Modern interpretation of classical still life tradition"
    },
    bidHistory: [
      { id: 11, paintingId: 5, userId: 4, amount: 1600, timestamp: "2024-01-15T10:00:00Z", userName: "AbstractArt_Pro" },
      { id: 12, paintingId: 5, userId: 8, amount: 1800, timestamp: "2024-01-15T11:00:00Z", userName: "FlowerArt_Fan" }
    ],
    watchedBy: 19,
    similarPaintings: []
  },
  {
    id: 6,
    title: "Cosmic Dance",
    artist: "Alex Rivera",
    year: 2023,
    medium: "Digital art on canvas",
    dimensions: "30 x 40 inches",
    currentBid: 6800,
    minBid: 7200,
    bidCount: 19,
    timeLeft: "6h 08m",
    image: "https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "An innovative digital artwork exploring themes of space and movement.",
    provenance: "Contemporary art fair",
    condition: "Perfect",
    estimate: { low: 5000, high: 8000 },
    category: "Digital",
    featured: false,
    aiAnalysis: {
      style: "Digital Art with cosmic and futuristic themes",
      emotion: "Wonder and exploration, evoking cosmic mystery",
      technique: "Digital painting with advanced rendering techniques",
      historicalContext: "Represents the intersection of technology and traditional art"
    },
    bidHistory: [
      { id: 13, paintingId: 6, userId: 5, amount: 5500, timestamp: "2024-01-15T09:30:00Z", userName: "Portrait_Collector" },
      { id: 14, paintingId: 6, userId: 9, amount: 6800, timestamp: "2024-01-15T10:30:00Z", userName: "DigitalArt_Pioneer" }
    ],
    watchedBy: 35,
    similarPaintings: [2]
  }
];