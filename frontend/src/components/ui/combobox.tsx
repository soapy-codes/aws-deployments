"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect } from "react";

export interface ComboboxProps<T> {
  placeholder: string;
  options: ComboboxOption<T>[];
  onSelect: (a: ComboboxOption<T>) => void;
  selected: ComboboxOption<T> | null;
}
export interface ComboboxOption<T> {
  value: string;
  label: string;
  data: T;
}
export function Combobox<T>({
  placeholder,
  options,
  onSelect,
  selected,
}: ComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  useEffect(() => {
    if (selected) {
      setValue(selected?.value);
    }
  }, [selected]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? options.find((framework) => framework.value === value)?.label
            : `Select ${placeholder}...`}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput
            placeholder={`Search ${placeholder}...`}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {options.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={(currentValue: string) => {
                    const selectedOption = options.find(
                      (o) => o.value === currentValue
                    )!;
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                    if (selectedOption) {
                      onSelect(selectedOption);
                    }
                  }}
                >
                  {framework.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === framework.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
