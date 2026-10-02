"use client"

import { useRouter } from 'next/navigation'
import { User } from 'lucide-react';

export const OrganizerCard = ({ organizer, userId }) => {
  const router = useRouter();

  if (!organizer) return null;

  const handleClick = () => {
    router.push(`/organizer/${userId}`);
  };

  return (
    <div className="glass rounded-xl p-4 sm:p-6 h-full flex items-center">
      {/* Single line layout with Posted by on left, name and avatar on right */}
      <button
        onClick={handleClick}
        className="w-full flex items-center justify-between gap-3 p-2 rounded-lg"
      >
        <span className="text-sm font-semibold text-white flex-shrink-0">Posted by</span>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-sm font-semibold text-white">
            {organizer.name}
          </span>
          {organizer.profile_photo_url ? (
            <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center border-2 border-white/10 overflow-hidden flex-shrink-0">
              <img
                src={organizer.profile_photo_url}
                alt={organizer.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center border-2 border-white/10 flex-shrink-0">
              <User className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      </button>
    </div>
  );
};
