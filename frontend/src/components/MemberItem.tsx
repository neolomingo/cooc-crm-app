import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { User, Clock, Check } from 'lucide-react';
import { Member } from '../lib/supabase';
import Button from './Button';

interface MemberItemProps {
  member: Member;
  onClick?: () => void;
  onCheckIn?: () => void;
  isCheckingIn?: boolean;
  compact?: boolean;
}

const MemberItem: React.FC<MemberItemProps> = ({ 
  member, 
  onClick, 
  onCheckIn,
  isCheckingIn = false,
  compact = false 
}) => {
  const lastVisitText = member.last_visit 
    ? formatDistanceToNow(new Date(member.last_visit), { addSuffix: true }) 
    : 'Never';

  const isCheckedInToday = member.last_visit
    ? new Date(member.last_visit).toDateString() === new Date().toDateString()
    : false;

  if (compact) {
    return (
      <div 
        className="flex items-center justify-between p-3 hover:bg-background-elevated rounded-lg cursor-pointer transition-colors"
        onClick={onClick}
      >
        <div className="flex items-center space-x-3">
          <div className="bg-background-elevated p-2 rounded-full">
            <User size={16} className="text-gray-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{member.first_name} {member.last_name}</span>
            <span className="text-xs text-gray-400">{member.email}</span>
          </div>
        </div>
        <div className="flex items-center">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            member.membership_status === 'active' 
              ? 'bg-green-900 text-green-300' 
              : 'bg-red-900 text-red-300'
          }`}>
            {member.membership_status}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-card border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3">
          <div className="bg-background-elevated p-3 rounded-full">
            <User size={20} className="text-gray-300" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{member.first_name} {member.last_name}</h3>
            <div className="flex flex-col mt-1">
              <span className="text-sm text-gray-400">{member.email}</span>
              <span className="text-sm text-gray-400">{member.phone}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            member.membership_status === 'active' 
              ? 'bg-green-900 text-green-300' 
              : 'bg-red-900 text-red-300'
          }`}>
            {member.membership_status}
          </span>
          {member.membership_status === 'inactive' && member.inactive_since && (
            <span className="text-xs text-gray-400 mt-1">
              Since {new Date(member.inactive_since).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center mt-3 text-sm text-gray-400">
        <Clock size={16} className="mr-1" />
        <span>Last visit: {lastVisitText}</span>
      </div>
      
      <div className="flex space-x-2 mt-4">
        <Button 
          variant={isCheckedInToday ? "outline" : "accent"}
          size="sm" 
          onClick={onCheckIn}
          isLoading={isCheckingIn}
          leftIcon={isCheckedInToday ? <Check size={16} /> : undefined}
          fullWidth
          disabled={isCheckedInToday}
        >
          {isCheckedInToday ? 'Checked In' : 'Check In'}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClick}
          fullWidth
        >
          View Details
        </Button>
      </div>
    </div>
  );
};

export default MemberItem;