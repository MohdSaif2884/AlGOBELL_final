/**
 * Contest Service - Unified API for contest operations
 * Connects to backend API instead of Supabase
 */

import { API_ENDPOINTS, getAuthHeaders } from '@/config/api';

export interface Contest {
  _id: string;
  externalId: string;
  name: string;
  platform: string;
  startTime: string;
  endTime: string;
  duration: number;
  url: string;
  status: 'upcoming' | 'live' | 'ended';
  timeUntilStart?: number;
  isLive?: boolean;
  isUpcoming?: boolean;
}

export interface ContestFilters {
  platform?: string;
  limit?: number;
  startAfter?: string;
}

class ContestService {
  /**
   * Fetch all upcoming contests
   */
  async fetchAllContests(filters: ContestFilters = {}): Promise<Contest[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters.platform) params.append('platform', filters.platform);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.startAfter) params.append('startAfter', filters.startAfter);
      
      const url = `${API_ENDPOINTS.CONTESTS.BASE}?${params.toString()}`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch contests');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch contests');
      }
      
      return data.data.contests;
    } catch (error) {
      console.error('Error fetching contests:', error);
      throw error;
    }
  }
  
  /**
   * Fetch live contests
   */
  async fetchLiveContests(): Promise<Contest[]> {
    try {
      const response = await fetch(API_ENDPOINTS.CONTESTS.LIVE);
      
      if (!response.ok) {
        throw new Error('Failed to fetch live contests');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch live contests');
      }
      
      return data.data.contests;
    } catch (error) {
      console.error('Error fetching live contests:', error);
      throw error;
    }
  }
  
  /**
   * Get contest by ID
   */
  async getContest(contestId: string): Promise<Contest> {
    try {
      const response = await fetch(API_ENDPOINTS.CONTESTS.BY_ID(contestId));
      
      if (!response.ok) {
        throw new Error('Failed to fetch contest');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Contest not found');
      }
      
      return data.data.contest;
    } catch (error) {
      console.error('Error fetching contest:', error);
      throw error;
    }
  }
  
  /**
   * Subscribe to contest reminders
   */
  async subscribeToContest(contestId: string, customOffsets?: number[]): Promise<any> {
    try {
      const response = await fetch(API_ENDPOINTS.CONTESTS.SUBSCRIBE(contestId), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ customOffsets }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to subscribe');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error subscribing to contest:', error);
      throw error;
    }
  }
  
  /**
   * Unsubscribe from contest reminders
   */
  async unsubscribeFromContest(contestId: string): Promise<void> {
    try {
      const response = await fetch(API_ENDPOINTS.CONTESTS.UNSUBSCRIBE(contestId), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to unsubscribe');
      }
    } catch (error) {
      console.error('Error unsubscribing from contest:', error);
      throw error;
    }
  }
  
  /**
   * Get user's contest subscriptions
   */
  async getUserSubscriptions(): Promise<any[]> {
    try {
      const response = await fetch(API_ENDPOINTS.CONTESTS.USER_SUBSCRIPTIONS, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch subscriptions');
      }
      
      return data.data.reminders;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  }
  
  /**
   * Get platform statistics
   */
  async getPlatformStats(): Promise<any> {
    try {
      const response = await fetch(API_ENDPOINTS.CONTESTS.STATS);
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const data = await response.json();
      return data.data.stats;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }
  
  /**
   * Calculate time until contest starts
   */
  getTimeUntilStart(contest: Contest): string {
    const now = new Date();
    const start = new Date(contest.startTime);
    const diffMs = start.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 0) return 'Started';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours < 24) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }
}

export const contestService = new ContestService();
export default contestService;
