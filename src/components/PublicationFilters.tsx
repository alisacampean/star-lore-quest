import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface PublicationFiltersProps {
  filters: {
    yearRange: [number | null, number | null];
    organisms: string[];
    researchArea: string[];
    experimentType: string[];
  };
  onFiltersChange: (filters: any) => void;
}

const ORGANISMS = [
  "Humans", "Mice", "Rats", "C. elegans", "Drosophila",
  "Plants", "Bacteria", "Yeast", "Other"
];

const RESEARCH_AREAS = [
  "Microgravity Effects", "Radiation Biology", "Life Support",
  "Plant Biology", "Neuroscience", "Cardiovascular", 
  "Bone & Muscle", "Immunology", "Genetics", "Other"
];

const EXPERIMENT_TYPES = [
  "ISS Mission", "Space Shuttle", "Ground Analog",
  "Parabolic Flight", "Laboratory Study", "Field Study"
];

export const PublicationFilters = ({ filters, onFiltersChange }: PublicationFiltersProps) => {
  const toggleArrayFilter = (key: string, value: string) => {
    const current = filters[key as keyof typeof filters] as string[];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [key]: updated });
  };

  return (
    <div className="circuit-frame bg-card p-6 space-y-6">
      <h3 className="text-lg font-bold font-mono text-primary">FILTERS</h3>

      {/* Year Range */}
      <div className="space-y-2">
        <Label className="text-sm font-mono text-accent">Year Range</Label>
        <div className="flex gap-2">
          <Select
            value={filters.yearRange[0]?.toString() || ""}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, yearRange: [parseInt(value), filters.yearRange[1]] })
            }
          >
            <SelectTrigger className="bg-input border-primary/30">
              <SelectValue placeholder="From" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-card border-primary/30">
              {[2024, 2020, 2015, 2010, 2005, 2000, 1995, 1990].map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.yearRange[1]?.toString() || ""}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, yearRange: [filters.yearRange[0], parseInt(value)] })
            }
          >
            <SelectTrigger className="bg-input border-primary/30">
              <SelectValue placeholder="To" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-card border-primary/30">
              {[2024, 2020, 2015, 2010, 2005, 2000, 1995, 1990].map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Organisms */}
      <div className="space-y-2">
        <Label className="text-sm font-mono text-accent">Organisms</Label>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {ORGANISMS.map(organism => (
            <div key={organism} className="flex items-center space-x-2">
              <Checkbox
                id={`org-${organism}`}
                checked={filters.organisms.includes(organism)}
                onCheckedChange={() => toggleArrayFilter('organisms', organism)}
              />
              <label
                htmlFor={`org-${organism}`}
                className="text-sm font-mono cursor-pointer"
              >
                {organism}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Research Areas */}
      <div className="space-y-2">
        <Label className="text-sm font-mono text-accent">Research Area</Label>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {RESEARCH_AREAS.map(area => (
            <div key={area} className="flex items-center space-x-2">
              <Checkbox
                id={`area-${area}`}
                checked={filters.researchArea.includes(area)}
                onCheckedChange={() => toggleArrayFilter('researchArea', area)}
              />
              <label
                htmlFor={`area-${area}`}
                className="text-sm font-mono cursor-pointer"
              >
                {area}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Experiment Types */}
      <div className="space-y-2">
        <Label className="text-sm font-mono text-accent">Experiment Type</Label>
        <div className="space-y-2">
          {EXPERIMENT_TYPES.map(type => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`exp-${type}`}
                checked={filters.experimentType.includes(type)}
                onCheckedChange={() => toggleArrayFilter('experimentType', type)}
              />
              <label
                htmlFor={`exp-${type}`}
                className="text-sm font-mono cursor-pointer"
              >
                {type}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
