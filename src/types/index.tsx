// This file defines the types used in the application.
export interface Earthquake {
  id: string;
  time: string; 
  date: string; 
  timeFormatted: string; 
  latitude: number;
  longitude: number;
  depth: number;
  mag: number;
  place: string;
  type: string;
}