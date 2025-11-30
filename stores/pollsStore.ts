import { create } from 'zustand';
import { Poll, CreatePollData } from '@/types';

interface PollsState {
  polls: Poll[];
  selectedPoll: Poll | null;
  searchQuery: string;
  selectedCategory: string;
  isLoading: boolean;
  setPolls: (polls: Poll[]) => void;
  setSelectedPoll: (poll: Poll | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  placeStake: (
    pollId: number,
    option: string,
    amount: number,
    userId: string
  ) => void;
  resolvePoll: (pollId: number, winner: string) => void;
  createPoll: (pollData: CreatePollData) => void;
  closePoll: (pollId: number, winner?: string) => void;
  cancelPoll: (pollId: number) => void;
  deletePoll: (pollId: number) => void;
  getFilteredPolls: () => Poll[];
}

const samplePolls: Poll[] = [
  {
    id: 1,
    title: 'Who will be evicted this Sunday?',
    description:
      'Vote for which housemate you think will be evicted in the next eviction show.',
    category: 'eviction',
    options: ['Mercy', 'Tacha', 'Mike', 'Seyi'],
    stakes: { Mercy: 15000, Tacha: 25000, Mike: 8000, Seyi: 12000 },
    userStakes: {},
    status: 'active',
    endTime: new Date('2024-01-20T20:00:00'),
    totalPool: 60000,
    participants: 45,
  },
  {
    id: 2,
    title: 'Head of House Winner - Week 8',
    description:
      'Predict who will become the Head of House in the upcoming HOH challenge.',
    category: 'hoh',
    options: ['Frodd', 'Omashola', 'Elozonam', 'Khafi'],
    stakes: { Frodd: 10000, Omashola: 18000, Elozonam: 7000, Khafi: 15000 },
    userStakes: {},
    status: 'active',
    endTime: new Date('2024-01-18T19:00:00'),
    totalPool: 50000,
    participants: 32,
  },
  {
    id: 3,
    title: 'Best Task Performance',
    description:
      "Which team will perform best in this week's Friday night task?",
    category: 'task',
    options: ['Team A', 'Team B', 'Team C'],
    stakes: { 'Team A': 20000, 'Team B': 15000, 'Team C': 5000 },
    userStakes: {},
    status: 'closed',
    endTime: new Date('2024-01-15T22:00:00'),
    correctAnswer: 'Team A',
    totalPool: 40000,
    participants: 28,
  },
];

export const usePollsStore = create<PollsState>((set, get) => ({
  polls: samplePolls,
  selectedPoll: null,
  searchQuery: '',
  selectedCategory: 'all',
  isLoading: false,

  setPolls: (polls) => set({ polls }),
  setSelectedPoll: (poll) => set({ selectedPoll: poll }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  placeStake: (pollId, option, amount, userId) => {
    const { polls } = get();
    const updatedPolls = polls.map((q) => {
      if (q.id === pollId) {
        const newStakes = { ...q.stakes };
        newStakes[option] = (newStakes[option] || 0) + amount;

        const newUserStakes = { ...q.userStakes };
        if (!newUserStakes[option]) {
          newUserStakes[option] = [];
        }
        newUserStakes[option].push({
          userId,
          amount,
          timestamp: new Date(),
        });

        return {
          ...q,
          stakes: newStakes,
          userStakes: newUserStakes,
          totalPool: q.totalPool + amount,
          participants: q.participants + 1,
        };
      }
      return q;
    });

    set({ polls: updatedPolls });
  },

  resolvePoll: (pollId, winner) => {
    const { polls } = get();
    const updatedPolls = polls.map((q) => {
      if (q.id === pollId) {
        return {
          ...q,
          status: 'resolved' as const,
          correctAnswer: winner,
        };
      }
      return q;
    });

    set({ polls: updatedPolls });
  },

  createPoll: (pollData) => {
    const { polls } = get();
    const newPoll: Poll = {
      id: Date.now(),
      ...pollData,
      stakes: {},
      userStakes: {},
      status: 'active',
      totalPool: 0,
      participants: 0,
    };

    set({ polls: [...polls, newPoll] });
  },

  closePoll: (pollId, winner) => {
    const { polls } = get();
    const updatedPolls = polls.map((q) => {
      if (q.id === pollId) {
        return {
          ...q,
          status: winner ? ('resolved' as const) : ('closed' as const),
          correctAnswer: winner,
        };
      }
      return q;
    });
    set({ polls: updatedPolls });
  },

  cancelPoll: (pollId) => {
    const { polls } = get();
    const updatedPolls = polls.map((q) => {
      if (q.id === pollId) {
        return {
          ...q,
          status: 'closed' as const,
          correctAnswer: 'cancelled',
        };
      }
      return q;
    });
    set({ polls: updatedPolls });
  },

  deletePoll: (pollId) => {
    const { polls } = get();
    const updatedPolls = polls.filter((q) => q.id !== pollId);
    set({ polls: updatedPolls });
  },
  getFilteredPolls: () => {
    const { polls, searchQuery, selectedCategory } = get();
    return polls.filter((q) => {
      const matchesSearch =
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || q.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  },
}));
