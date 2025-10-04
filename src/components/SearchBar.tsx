import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NecronButton } from "./NecronButton";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export const SearchBar = ({ onSearch, placeholder = "Search publications...", initialValue = "" }: SearchBarProps) => {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="bg-input border-primary/30 text-foreground placeholder:text-muted-foreground pr-10 font-mono"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
        <NecronButton type="submit" size="md">
          Search
        </NecronButton>
      </div>
    </form>
  );
};
