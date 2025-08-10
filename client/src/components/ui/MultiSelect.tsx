// components/ui/MultiSelect.tsx
import * as React from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className,
}) => {
  const handleToggle = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between focus:ring-offset-2",
            className
          )}
        >
          {selected.length > 0 ? selected.join(", ") : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <div className="max-h-60 overflow-auto">
          {options.map((option) => (
            <div
              key={option}
              className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => handleToggle(option)}
            >
              <Checkbox
                checked={selected.includes(option)}
                onCheckedChange={() => handleToggle(option)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="text-sm">{option}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
