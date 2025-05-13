import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { supabase, Guestlist, Guest } from '../../lib/supabase';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Download, Loader } from 'lucide-react';

const ViewGuestlists: React.FC = () => {
  const { id } = useParams();
  const [guestlists, setGuestlists] = useState<Guestlist[]>([]);
  const [guestlist, setGuestlist] = useState<Guestlist | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchGuestlists = async () => {
      const { data, error } = await supabase
        .from('guestlists')
        .select('id, name, date, notes, status, created_at')
        .order('date', { ascending: false });

      if (!error && data) setGuestlists(data);
    };

    fetchGuestlists();
  }, []);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchGuestlistData = async () => {
      try {
        const { data: guestlistData, error: guestlistError } = await supabase
          .from('guestlists')
          .select('*')
          .eq('id', id)
          .single();

        if (guestlistError) throw guestlistError;
        setGuestlist(guestlistData);

        const { data: guestData, error: guestError } = await supabase
          .from('guests')
          .select('*')
          .eq('guestlist_id', id);

        if (guestError) throw guestError;
        setGuests(guestData || []);
      } catch (error) {
        console.error('Error loading guestlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuestlistData();
  }, [id]);

  const events = guestlists.map(g => ({
    id: g.id,
    title: g.name,
    date: g.date,
  }));

  const visibleGuestlists = guestlists.slice(currentIndex, currentIndex + 3);

  const nextPage = () => {
    if (currentIndex + 3 < guestlists.length) setCurrentIndex(prev => prev + 3);
  };

  const prevPage = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 3);
  };

  const exportToCSV = () => {
    const csvRows = [
      ['First Name', 'Last Name', 'Email', 'Phone', 'Checked In'],
      ...guests.map(g => [
        g.first_name,
        g.last_name,
        g.email ?? '',
        g.phone ?? '',
        g.checked_in ? 'Yes' : 'No'
      ])
    ];
    const blob = new Blob([csvRows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${guestlist?.name}-guests.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleCheckIn = async (guestId: string, checkedIn: boolean) => {
    const { error } = await supabase
      .from('guests')
      .update({ checked_in: !checkedIn })
      .eq('id', guestId);

    if (!error) {
      setGuests(prev =>
        prev.map(g => (g.id === guestId ? { ...g, checked_in: !checkedIn } : g))
      );
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-400 flex items-center gap-2">
        <Loader className="animate-spin" size={18} />
        Loading guestlist...
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full p-6 gap-6">
      <div className="lg:w-2/3 bg-background rounded-lg p-4 shadow overflow-auto">
        {!id || !guestlist ? (
          <>
            <h2 className="text-xl font-bold mb-4">Guestlist Calendar</h2>
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              height="auto"
              events={events}
              headerToolbar={{
                start: 'prev,next today',
                center: 'title',
                end: '',
              }}
            />
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{guestlist.name}</h2>
              <Link to="/reception/view-guestlists" className="text-blue-400 hover:underline">📅 View Calendar</Link>
            </div>
            <p className="text-gray-400">Date: {guestlist.date}</p>
            <p className="text-gray-400">Status: {guestlist.status}</p>
            <p className="text-gray-400 mb-2">Notes: {guestlist.notes || 'None'}</p>

            <div className="flex items-center justify-between my-4">
              <p className="font-semibold text-sm">
                Total Guests: {guests.length} | Checked-in: {guests.filter(g => g.checked_in).length}
              </p>
              <button
                onClick={exportToCSV}
                className="bg-accent-red hover:bg-accent-pink text-white px-4 py-2 rounded flex items-center gap-2 text-sm"
              >
                <Download size={16} /> Export to CSV
              </button>
            </div>

            <div className="bg-background-elevated p-4 rounded shadow overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-300">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-700">
                    <th className="py-2">Name</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Phone</th>
                    <th className="py-2">Checked In</th>
                    <th className="py-2">Toggle</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map(guest => (
                    <tr key={guest.id} className="border-b border-gray-800 hover:bg-gray-800">
                      <td className="py-2">
                        {guest.first_name} {guest.last_name}
                      </td>
                      <td>{guest.email ?? '-'}</td>
                      <td>{guest.phone ?? '-'}</td>
                      <td>{guest.checked_in ? 'Yes' : 'No'}</td>
                      <td>
                        <button
                          onClick={() => toggleCheckIn(guest.id, guest.checked_in)}
                          className={`text-xs px-2 py-1 rounded ${
                            guest.checked_in
                              ? 'bg-green-700 text-white'
                              : 'bg-gray-700 text-gray-200'
                          }`}
                        >
                          {guest.checked_in ? 'Undo' : 'Check In'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {guests.length === 0 && (
                <p className="text-center text-gray-500 py-6">No guests added to this guestlist.</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Side Scroll Panel */}
      <div className="lg:w-1/3 bg-background-elevated rounded-lg p-4 shadow flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Guestlists</h2>
          <div className="flex gap-2">
            <button onClick={prevPage}><ChevronLeft size={18} /></button>
            <button onClick={nextPage}><ChevronRight size={18} /></button>
          </div>
        </div>

        <div className="overflow-y-auto space-y-3">
          {visibleGuestlists.map(g => (
            <Link
              key={g.id}
              to={`/reception/view-guestlist/${g.id}`}
              className="block border border-gray-600 p-3 rounded hover:bg-gray-800"
            >
              <p className="text-md font-medium">{g.name}</p>
              <p className="text-sm text-muted">{format(new Date(g.date), 'PPP')}</p>
              <p className="text-sm text-gray-400">{g.notes || 'No notes'}</p>
              <span className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full ${
                g.status === 'active'
                  ? 'bg-green-900 text-green-300'
                  : g.status === 'completed'
                  ? 'bg-blue-900 text-blue-300'
                  : 'bg-gray-800 text-gray-300'
              }`}>
                {g.status}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewGuestlists;




