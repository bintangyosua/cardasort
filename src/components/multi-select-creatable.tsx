'use client';

import * as React from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckIcon, ChevronDown, XIcon, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiSelectCreatableOption {
  value: string;
  label: string;
}

interface MultiSelectCreatableProps {
  options: MultiSelectCreatableOption[];
  defaultValue?: string[];
  onValueChange: (values: string[]) => void;
  placeholder?: string;
  maxCount?: number;
  onCreateOption?: (value: string) => Promise<any>;
  className?: string;
}

export function MultiSelectCreatable({
  options,
  defaultValue = [],
  onValueChange,
  placeholder = 'Select items...',
  maxCount = 3,
  onCreateOption,
  className
}: MultiSelectCreatableProps) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string[]>(defaultValue);
  const [searchValue, setSearchValue] = React.useState('');
  const [isCreating, setIsCreating] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sync selected state when defaultValue changes (e.g., after creating a tag)
  React.useEffect(() => {
    setSelected(defaultValue);
  }, [defaultValue]);

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];

    setSelected(newSelected);
    onValueChange(newSelected);
    setSearchValue('');
  };

  const handleRemove = (value: string) => {
    const newSelected = selected.filter((item) => item !== value);
    setSelected(newSelected);
    onValueChange(newSelected);
  };

  const handleCreateNew = async () => {
    if (!searchValue.trim() || !onCreateOption || isCreating) return;

    setIsCreating(true);
    try {
      const newOption = await onCreateOption(searchValue.trim());
      if (newOption) {
        // The parent will update the options list
        // Clear the search and focus back to input
        setSearchValue('');
        // Small delay to ensure DOM is updated
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  const showCreateOption =
    onCreateOption &&
    searchValue.trim() !== '' &&
    !filteredOptions.some(
      (opt) => opt.label.toLowerCase() === searchValue.toLowerCase()
    );

  const selectedOptions = options.filter((opt) => selected.includes(opt.value));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
        >
          <div className='flex flex-1 flex-wrap gap-1'>
            {selectedOptions.length === 0 ? (
              <span className='text-muted-foreground'>{placeholder}</span>
            ) : selectedOptions.length <= maxCount ? (
              selectedOptions.map((option) => (
                <Badge key={option.value} variant='secondary' className='mr-1'>
                  {option.label}
                  <span
                    role='button'
                    tabIndex={0}
                    className='ring-offset-background focus:ring-ring ml-1 cursor-pointer rounded-full outline-none focus:ring-2 focus:ring-offset-2'
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleRemove(option.value);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemove(option.value);
                    }}
                  >
                    <XIcon className='hover:text-foreground text-muted-foreground h-3 w-3' />
                  </span>
                </Badge>
              ))
            ) : (
              <Badge variant='secondary'>
                {selectedOptions.length} selected
              </Badge>
            )}
          </div>
          <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full p-0' align='start'>
        <Command shouldFilter={false}>
          <CommandInput
            ref={inputRef}
            placeholder='Search or type to create...'
            value={searchValue}
            onValueChange={setSearchValue}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && showCreateOption) {
                e.preventDefault();
                handleCreateNew();
              }
            }}
          />
          <CommandList>
            <CommandEmpty className='py-0'>
              {showCreateOption ? (
                <Button
                  variant='ghost'
                  className='w-full justify-start'
                  onClick={handleCreateNew}
                  disabled={isCreating}
                >
                  <PlusCircle className='mr-2 h-4 w-4' />
                  {isCreating ? 'Creating...' : `Create "${searchValue}"`}
                </Button>
              ) : (
                <div className='py-6 text-center text-sm'>
                  No results found.
                </div>
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <div
                    className={cn(
                      'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                      selected.includes(option.value)
                        ? 'bg-primary text-primary-foreground'
                        : 'opacity-50 [&_svg]:invisible'
                    )}
                  >
                    <CheckIcon className='h-4 w-4' />
                  </div>
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
            {showCreateOption && filteredOptions.length > 0 && (
              <>
                <CommandGroup>
                  <CommandItem onSelect={handleCreateNew} disabled={isCreating}>
                    <PlusCircle className='mr-2 h-4 w-4' />
                    {isCreating ? 'Creating...' : `Create "${searchValue}"`}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
