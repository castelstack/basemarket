import { Badge } from '@/components/ui/badge';
import { Activity, Clock, Trophy, XCircle } from 'lucide-react';
import { POLL_CATEGORIES } from '@/constants/categories';

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return (
        <Badge className=' text-emerald-400 border border-emerald-500/30'>
          <Activity className='w-3 h-3 mr-1' />
          Live
        </Badge>
      );
    case 'closed':
      return (
        <Badge className=' text-amber-400 border border-amber-500/30'>
          <Clock className='w-3 h-3 mr-1' />
          Closed
        </Badge>
      );
    case 'resolved':
      return (
        <Badge className='!bg-teal-500/5 text-emerald-400 border border-emerald-500/30'>
          <Trophy className='w-3 h-3 mr-1' />
          Winner Declared
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge className='bg-gray-500/20 text-gray-400 border border-gray-500/30'>
          <XCircle className='w-3 h-3 mr-1' />
          Cancelled
        </Badge>
      );
    default:
      return null;
  }
};

export const getCategoryBadge = (category: string) => {
  // Find category from POLL_CATEGORIES
  const cat = POLL_CATEGORIES.find((c) => c.value === category);
  if (!cat) return null;

  return (
    <Badge className='!bg-purple-500/5 text-violet-400 border border-violet-500/30 text-xs font-semibold'>
      {cat.label}
    </Badge>
  );
};