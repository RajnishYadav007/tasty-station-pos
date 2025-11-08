import { supabase } from './supabaseClient';

// ✅ SUBSCRIBE TO REALTIME TABLE UPDATES
export const subscribeToTableChanges = (callback) => {
  try {
    console.log('📡 Subscribing to table changes...');
    
    const subscription = supabase
      .channel('table-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'Table'
        },
        (payload) => {
          console.log('🔔 REALTIME UPDATE:', payload);
          if (callback) callback(payload);
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
      });

    return subscription;
  } catch (error) {
    console.error('❌ Error subscribing:', error);
    return null;
  }
};

// ✅ UNSUBSCRIBE FROM REALTIME
export const unsubscribeFromTableChanges = (subscription) => {
  try {
    if (subscription) {
      subscription.unsubscribe();
      console.log('✅ Unsubscribed from table changes');
    }
  } catch (error) {
    console.error('❌ Error unsubscribing:', error);
  }
};

// ✅ GET ALL TABLES
export const getTables = async () => {
  try {
    const { data, error } = await supabase
      .from('Table')
      .select('*')
      .order('table_id', { ascending: true });

    if (error) throw error;
    console.log('✅ Tables fetched:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ Error fetching tables:', error.message);
    return [];
  }
};

// ✅ GET SINGLE TABLE
export const getTableById = async (tableId) => {
  try {
    if (!tableId) {
      throw new Error('Table ID is required');
    }

    const { data, error } = await supabase
      .from('Table')
      .select('*')
      .eq('table_id', tableId)
      .single();

    if (error) throw error;
    console.log('✅ Table fetched:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching table:', error.message);
    return null;
  }
};

// ✅ UPDATE TABLE STATUS - CRITICAL FIX
export const updateTableStatus = async (tableId, status, occupiedBy = null) => {
  try {
    if (!tableId) {
      throw new Error('Table ID is required');
    }

    // ✅ VALIDATE STATUS - Must match DB values
    const validStatuses = ['Available', 'Occupied', 'Reserved'];
    let finalStatus = status;
    
    if (typeof status === 'string') {
      finalStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }

    if (!validStatuses.includes(finalStatus)) {
      console.warn(`⚠️ Invalid status "${status}". Using "Available" instead.`);
      finalStatus = 'Available';
    }

    console.log(`🔄 Updating Table ${tableId}: ${finalStatus}`);

    const { data, error } = await supabase
      .from('Table')
      .update({
        table_status: finalStatus,
        occupied_by: occupiedBy,
        updated_at: new Date().toISOString()
      })
      .eq('table_id', tableId)
      .select();

    if (error) {
      console.error('❌ Supabase error:', error.message);
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error(`Table ${tableId} not found`);
    }

    console.log('✅ Table updated:', data[0]);
    return data[0];
  } catch (error) {
    console.error('❌ Error updating table:', error.message);
    throw error;
  }
};

// ✅ CREATE NOTIFICATION
export const createNotification = async (type, tableId, message) => {
  try {
    if (!tableId || !type || !message) {
      throw new Error('Type, Table ID, and message are required');
    }

    console.log(`🔔 Creating notification: ${type} for Table ${tableId}`);

    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          type: type,
          table_id: tableId,
          message: message,
          read: false,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('❌ Notification error:', error.message);
      throw error;
    }

    console.log('✅ Notification created:', data[0]);
    return data[0];
  } catch (error) {
    console.error('❌ Error creating notification:', error.message);
    throw error;
  }
};

// ✅ GET WAITERS
export const getWaiters = async () => {
  try {
    const { data, error } = await supabase
      .from('Waiter')
      .select('*');

    if (error) throw error;
    console.log('✅ Waiters fetched:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ Error fetching waiters:', error.message);
    return [];
  }
};
