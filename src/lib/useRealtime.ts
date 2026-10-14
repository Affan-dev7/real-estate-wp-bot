'use client';

import { useEffect } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';

export function useRealtimeSubscription(
  agencyId: string,
  onLeadChange?: () => void,
  onMessageChange?: () => void
) {
  useEffect(() => {
    if (!agencyId) return;

    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured()) {
      const channel = supabase
        .channel(`agency-realtime-${agencyId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'leads',
            filter: `agency_id=eq.${agencyId}`,
          },
          () => {
            onLeadChange?.();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `agency_id=eq.${agencyId}`,
          },
          () => {
            onMessageChange?.();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    // Fallback: Listen to window custom events or storage events for cross-tab realtime sync in demo mode
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'property_desk_leads' && onLeadChange) {
        onLeadChange();
      }
      if (e.key === 'property_desk_messages' && onMessageChange) {
        onMessageChange();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [agencyId, onLeadChange, onMessageChange]);
}
