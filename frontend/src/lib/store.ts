import { create } from 'zustand';
import { Member, Guest, Guestlist } from './supabase';

export type Role = 'reception' | 'manager' | 'admin';

interface AuthState {
  user: {
    id: string;
    email: string;
    role: Role;
  } | null;
  isLoading: boolean;
  setUser: (user: { id: string; email: string; role: Role } | null) => void;
  setLoading: (isLoading: boolean) => void;
}

interface MemberState {
  members: Member[];
  selectedMember: Member | null;
  isLoading: boolean;
  setMembers: (members: Member[]) => void;
  selectMember: (member: Member | null) => void;
  setLoading: (isLoading: boolean) => void;
}

interface GuestlistState {
  guestlists: Guestlist[];
  selectedGuestlist: Guestlist | null;
  guestlistGuests: Guest[];
  isLoading: boolean;
  setGuestlists: (guestlists: Guestlist[]) => void;
  selectGuestlist: (guestlist: Guestlist | null) => void;
  setGuestlistGuests: (guests: Guest[]) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}));

export const useMemberStore = create<MemberState>()((set) => ({
  members: [],
  selectedMember: null,
  isLoading: false,
  setMembers: (members) => set({ members }),
  selectMember: (member) => set({ selectedMember: member }),
  setLoading: (isLoading) => set({ isLoading }),
}));

export const useGuestlistStore = create<GuestlistState>()((set) => ({
  guestlists: [],
  selectedGuestlist: null,
  guestlistGuests: [],
  isLoading: false,
  setGuestlists: (guestlists) => set({ guestlists }),
  selectGuestlist: (guestlist) => set({ selectedGuestlist: guestlist }),
  setGuestlistGuests: (guestlistGuests) => set({ guestlistGuests }),
  setLoading: (isLoading) => set({ isLoading }),
}));
