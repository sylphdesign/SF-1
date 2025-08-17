
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Organization } from '@/api/entities';
import { OrganizationMember } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronsUpDown, Check, PlusCircle, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function OrganizationSwitcher() {
  const [user, setUser] = useState(null);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        const [allOrgs, memberships] = await Promise.all([
          Organization.list(),
          OrganizationMember.filter({ user_email: currentUser.email })
        ]);
        
        const memberOrgIds = new Set(memberships.map(m => m.organization_id));
        const userOrgs = allOrgs.filter(o => memberOrgIds.has(o.id));
        setOrganizations(userOrgs);

        if (currentUser.current_organization_id) {
          const org = userOrgs.find(o => o.id === currentUser.current_organization_id);
          setCurrentOrg(org);
        } else if (userOrgs.length > 0) {
          // If no current org is set, but user is member of some, set the first one as current.
          await handleSwitch(userOrgs[0].id);
        }

      } catch (error) {
        console.error("Failed to fetch organization data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSwitch = async (orgId) => {
    try {
      await User.updateMyUserData({ current_organization_id: orgId });
      window.location.reload(); // Reload to apply the new context everywhere
    } catch (error) {
      console.error("Failed to switch organization:", error);
    }
  };

  if (isLoading || !currentOrg) {
    return (
      <div className="w-full px-3 py-2">
        <div className="h-9 w-full bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="w-4 h-4 flex-shrink-0" />
            <span className="truncate font-medium">{currentOrg.name}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Search organization..." />
            <CommandEmpty>No organization found.</CommandEmpty>
            <CommandGroup heading="Your Organizations">
              {organizations.map((org) => (
                <CommandItem
                  key={org.id}
                  onSelect={() => {
                    if (org.id !== currentOrg.id) {
                      handleSwitch(org.id);
                    }
                    setOpen(false);
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${currentOrg.id === org.id ? 'opacity-100' : 'opacity-0'}`}
                  />
                  {org.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
             <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    // Navigate with force=true to prevent redirect loop on Auth page
                    navigate(createPageUrl("Auth") + "?force=true");
                  }}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Organization
                </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
