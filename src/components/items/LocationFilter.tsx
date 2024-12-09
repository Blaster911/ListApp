import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const locations = [
  'toutes les pièces',
  'entrée',
  'salon',
  'cuisine',
  'grande chambre',
  'dressing',
  'petite chambre',
  'salle de bain',
  'toilettes',
  'cave',
  'buanderie',
  'autres'
];

interface LocationFilterProps {
  selectedLocation: string;
  onLocationChange: (location: string) => void;
}

export function LocationFilter({ selectedLocation, onLocationChange }: LocationFilterProps) {
  return (
    <Select value={selectedLocation} onValueChange={onLocationChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Filtrer par pièce" />
      </SelectTrigger>
      <SelectContent>
        {locations.map((location) => (
          <SelectItem key={location} value={location}>
            {location}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}