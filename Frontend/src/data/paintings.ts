import { Painting } from "../types";

export const paintings: Painting[] = [
  {
    id: 1,
    title: "Autumn Reflections",
    artist: "Elena Vasquez",
    year: 2023,
    medium: "Oil on canvas",
    dimensions: "36 x 48 inches",
    minBid: 16000,
    imageUrl:
      "https://images.pexels.com/photos/1568607/pexels-photo-1568607.jpeg?auto=compress&cs=tinysrgb&w=800",
    description:
      "A stunning contemporary landscape capturing the ethereal beauty of autumn's reflection on still water.",
    condition: "Excellent",
    estimate: { low: 12000, high: 18000 },
    category: "Contemporary",
    featured: true,
  },
  {
    id: 2,
    title: "Urban Symphony",
    artist: "Marcus Chen",
    year: 2022,
    medium: "Mixed media",
    dimensions: "24 x 32 inches",

    minBid: 9000,

    imageUrl:
      "https://images.pexels.com/photos/1292241/pexels-photo-1292241.jpeg?auto=compress&cs=tinysrgb&w=800",
    description:
      "A dynamic abstract composition exploring the rhythm and energy of modern city life.",

    condition: "Mint",
    estimate: { low: 7000, high: 11000 },
    category: "Abstract",
    featured: true,
  },
  {
    id: 3,
    title: "Portrait of a Lady",
    artist: "Isabella Romano",
    year: 2021,
    medium: "Oil on canvas",
    dimensions: "20 x 24 inches",

    minBid: 23000,

    imageUrl:
      "https://images.pexels.com/photos/1070254/pexels-photo-1070254.jpeg?auto=compress&cs=tinysrgb&w=800",
    description:
      "An exquisite portrait demonstrating masterful technique and emotional depth.",

    condition: "Very good",
    estimate: { low: 18000, high: 25000 },
    category: "Portrait",
    featured: true,
  },
];
