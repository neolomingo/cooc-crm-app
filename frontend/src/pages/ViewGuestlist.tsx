import React, { useEffect, useState } from 'react';
import { ArrowLeft, UserCheck, Search, Check, Plus, RotateCw, X, AlertTriangle } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import { supabase, Guest } from '../lib/supabase';
import { useGuestlistStore } from '../lib/store';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface ViewGuestlistProps {
  onNavigate: (page: string) => void;
}

const ViewGuestlist: React.FC<ViewGuestlistProps> = ({ onNavigate }) => {
  const { selectedGuestlist, guestlistGuests, setGuestlistGuests, selectGuestlist } = useGuestlistStore();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([]);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  
  useEffect(() => {
    if (selectedGuestlist) {
      loadGuests();
    } else {
      onNavigate('home');
    }
  }, [selectedGuestlist]);
  
  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredGuests(
        guestlistGuests.filter(guest => 
          `${guest.first_name} ${guest.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredGuests(guestlistGuests);
    }
  }, [searchQuery, guestlistGuests]);
  
  const loadGuests = async () => {
    if (!selectedGuestlist) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('guestlist_id', selectedGuestlist.id)
        .order('last_name', { ascending: true });
      
      if (error) throw error;
      setGuestlistGuests(data as Guest[]);
      setFilteredGuests(data as Guest[]);
    } catch (error) {
      console.error('Error loading guests:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCheckIn = async (guest: Guest) => {
    setCheckingInId(guest.id);
    try {
      const now = new Date().toISOString();
      
      // Update guest check-in status
      const { error: guestError } = await supabase
        .from('guests')
        .update({
          checked_in: !guest.checked_in,
          checked_in_time: !guest.checked_in ? now : null
        })
        .eq('id', guest.id);
      
      if (guestError) throw guestError;
      
      // If checking in and guest is a member, create check-in record and update last visit
      if (!guest.checked_in && guest.member_id) {
        // Create check-in record
        const { error: checkInError } = await supabase
          .from('check_ins')
          .insert({
            member_id: guest.member_id,
            guestlist_id: selectedGuestlist?.id,
            check_in_time: now
          });
        
        if (checkInError) throw checkInError;
        
        // Update member's last visit
        const { error: memberError } = await supabase
          .from('members')
          .update({ last_visit: now })
          .eq('id', guest.member_id);
        
        if (memberError) throw memberError;
      }
      
      // If checking out and guest is a member, update check-in record
      if (guest.checked_in && guest.member_id) {
        const { error: checkOutError } = await supabase
          .from('check_ins')
          .update({ check_out_time: now })
          .eq('member_id', guest.member_id)
          .is('check_out_time', null)
          .single();
        
        if (checkOutError) throw checkOutError;
      }
      
      // Update local state
      setGuestlistGuests(prev => 
        prev.map(g => g.id === guest.id ? {
          ...g,
          checked_in: !guest.checked_in,
          checked_in_time: !guest.checked_in ? now : null
        } : g)
      );
    } catch (error) {
      console.error('Error updating check-in status:', error);
    } finally {
      setCheckingInId(null);
    }
  };
  
  const handleCancelGuestlist = async () => {
    if (!selectedGuestlist || !cancelReason.trim()) return;
    
    setIsCancelling(true);
    try {
      // Update guestlist status and add cancellation note
      const { error: updateError } = await supabase
        .from('guestlists')
        .update({
          status: 'cancelled',
          notes: cancelReason
        })
        .eq('id', selectedGuestlist.id);
      
      if (updateError) throw updateError;
      
      // Check out all checked-in guests
      const { error: guestsError } = await supabase
        .from('guests')
        .update({
          checked_in: false,
          checked_in_time: null
        })
        .eq('guestlist_id', selectedGuestlist.id)
        .eq('checked_in', true);
      
      if (guestsError) throw guestsError;
      
      // Update check-in records
      const now = new Date().toISOString();
      const { error: checkInsError } = await supabase
        .from('check_ins')
        .update({ check_out_time: now })
        .eq('guestlist_id', selectedGuestlist.id)
        .is('check_out_time', null);
      
      if (checkInsError) throw checkInsError;
      
      toast.success('Guestlist cancelled successfully');
      
      // Update local state
      selectGuestlist({
        ...selectedGuestlist,
        status: 'cancelled',
        notes: cancelReason
      });
      
      setShowCancelModal(false);
    } catch (error) {
      console.error('Error cancelling guestlist:', error);
      toast.error('Failed to cancel guestlist');
    } finally {
      setIsCancelling(false);
    }
  };
  
  if (!selectedGuestlist) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button
            variant="text"
            leftIcon={<ArrowLeft size={18} />}
            onClick={() => onNavigate('home')}
            className="mr-4"
          >
            Back
          </Button>
          <h1 className="text-2xl font-bold">Guestlist not found</h1>
        </div>
      </div>
    );
  }
  
  const checkedInCount = filteredGuests.filter(g => g.checked_in).length;
  
  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center mb-6">
        <Button
          variant="text"
          leftIcon={<ArrowLeft size={18} />}
          onClick={() => onNavigate('home')}
          className="mr-4"
        >
          Back
        </Button>
        <h1 className="text-2xl font-bold">{selectedGuestlist.name}</h1>
      </div>
      
      <div className="bg-background-card rounded-lg p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-gray-400">Date:</span>
            <span className="font-medium">
              {format(new Date(selectedGuestlist.date), 'MMMM d, yyyy')}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm text-gray-400">Status:</span>
            <span className={`font-medium ${
              selectedGuestlist.status === 'active' 
                ? 'text-green-400' 
                : selectedGuestlist.status === 'completed'
                ? 'text-blue-400'
                : selectedGuestlist.status === 'cancelled'
                ? 'text-red-400'
                : 'text-gray-400'
            }`}>
              {selectedGuestlist.status.charAt(0).toUpperCase() + selectedGuestlist.status.slice(1)}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm text-gray-400">Checked In:</span>
            <span className="font-medium">{checkedInCount} / {filteredGuests.length}</span>
          </div>
          
          {selectedGuestlist.notes && (
            <div className="flex flex-col w-full mt-2">
              <span className="text-sm text-gray-400">Notes:</span>
              <span>{selectedGuestlist.notes}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search guests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-5 w-5" />}
          />
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            leftIcon={<RotateCw size={18} className={isLoading ? 'animate-spin' : ''} />}
            onClick={loadGuests}
            disabled={isLoading}
          >
            Refresh
          </Button>
          
          {selectedGuestlist.status === 'active' && (
            <Button
              variant="danger"
              leftIcon={<AlertTriangle size={18} />}
              onClick={() => setShowCancelModal(true)}
            >
              Cancel Guestlist
            </Button>
          )}
          
          <Button
            variant="primary"
            leftIcon={<Plus size={18} />}
            onClick={() => onNavigate('createGuestlist')}
          >
            New Guestlist
          </Button>
        </div>
      </div>
      
      <div className="overflow-hidden bg-background-card rounded-lg border border-gray-800">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-background-elevated">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                  </div>
                </td>
              </tr>
            ) : filteredGuests.length > 0 ? (
              filteredGuests.map((guest) => (
                <tr 
                  key={guest.id} 
                  className={`${guest.checked_in ? 'bg-green-900/20' : 'hover:bg-background-elevated'}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{guest.first_name} {guest.last_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{guest.email || 'N/A'}</div>
                    <div className="text-sm text-gray-400">{guest.phone || 'No phone'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {guest.checked_in ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-900 text-green-200">
                        Checked In
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-300">
                        Not Checked In
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-300">
                      {guest.member_id ? 'Member' : 'Guest'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button
                      variant={guest.checked_in ? 'outline' : 'accent'}
                      size="sm"
                      leftIcon={guest.checked_in ? <Check size={16} /> : <UserCheck size={16} />}
                      onClick={() => handleCheckIn(guest)}
                      isLoading={checkingInId === guest.id}
                      disabled={selectedGuestlist.status !== 'active'}
                    >
                      {guest.checked_in ? 'Check Out' : 'Check In'}
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                  No guests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Cancel Guestlist Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background-card rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Cancel Guestlist</h2>
            <p className="text-gray-400 mb-4">
              Are you sure you want to cancel this guestlist? This will check out all guests and mark the guestlist as cancelled.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Cancellation Reason
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="input-field min-h-[80px]"
                placeholder="Please provide a reason for cancellation..."
                required
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleCancelGuestlist}
                isLoading={isCancelling}
                disabled={!cancelReason.trim()}
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewGuestlist;