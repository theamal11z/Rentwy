const { createClient } = require('@supabase/supabase-js');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing required Supabase environment variables');
}

// Supabase client configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create client for general use (with anon key)
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false
  }
});

// Create admin client for service operations (with service role key if available)
const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase;

// Database helper functions
const db = {
  // Users
  users: {
    async findByEmail(email) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    async findById(id) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    async create(userData) {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async update(id, updates) {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // Categories
  categories: {
    async findAll() {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },

    async findById(id) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  },

  // Items
  items: {
    async findAll(filters = {}) {
      let query = supabase
        .from('items')
        .select(`
          *,
          categories(name, icon, color),
          users(full_name, profile_image_url, average_rating)
        `)
        .is('deleted_at', null);

      // Apply filters
      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.search) {
        query = query.textSearch('title,description', filters.search);
      }
      if (filters.min_price) {
        query = query.gte('price_per_day', filters.min_price);
      }
      if (filters.max_price) {
        query = query.lte('price_per_day', filters.max_price);
      }
      if (filters.city) {
        query = query.eq('city', filters.city);
      }

      // Pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
      }

      // Sorting
      const sortBy = filters.sort_by || 'created_at';
      const order = filters.order === 'asc' ? { ascending: true } : { ascending: false };
      query = query.order(sortBy, order);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async findById(id) {
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          categories(name, icon, color),
          users(full_name, profile_image_url, average_rating, city, state)
        `)
        .eq('id', id)
        .is('deleted_at', null)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    async create(itemData) {
      const { data, error } = await supabase
        .from('items')
        .insert([itemData])
        .select(`
          *,
          categories(name, icon, color),
          users(full_name, profile_image_url, average_rating)
        `)
        .single();
      
      if (error) throw error;
      return data;
    },

    async update(id, updates) {
      const { data, error } = await supabase
        .from('items')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          categories(name, icon, color),
          users(full_name, profile_image_url, average_rating)
        `)
        .single();
      
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { data, error } = await supabase
        .from('items')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // Bookings
  bookings: {
    async findAll(filters = {}) {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          items(title, images, price_per_day),
          renter:users!renter_id(full_name, profile_image_url),
          owner:users!owner_id(full_name, profile_image_url)
        `);

      if (filters.user_id) {
        query = query.or(`renter_id.eq.${filters.user_id},owner_id.eq.${filters.user_id}`);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async findById(id) {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          items(*),
          renter:users!renter_id(*),
          owner:users!owner_id(*)
        `)
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    async create(bookingData) {
      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select(`
          *,
          items(title, images, price_per_day),
          renter:users!renter_id(full_name, profile_image_url),
          owner:users!owner_id(full_name, profile_image_url)
        `)
        .single();
      
      if (error) throw error;
      return data;
    },

    async update(id, updates) {
      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          items(title, images, price_per_day),
          renter:users!renter_id(full_name, profile_image_url),
          owner:users!owner_id(full_name, profile_image_url)
        `)
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // Reviews
  reviews: {
    async findAll(filters = {}) {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          reviewer:users!reviewer_id(full_name, profile_image_url),
          reviewee:users!reviewee_id(full_name, profile_image_url),
          items(title)
        `);

      if (filters.reviewee_id) {
        query = query.eq('reviewee_id', filters.reviewee_id);
      }
      if (filters.item_id) {
        query = query.eq('item_id', filters.item_id);
      }
      if (filters.review_type) {
        query = query.eq('review_type', filters.review_type);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async create(reviewData) {
      const { data, error } = await supabase
        .from('reviews')
        .insert([reviewData])
        .select(`
          *,
          reviewer:users!reviewer_id(full_name, profile_image_url),
          reviewee:users!reviewee_id(full_name, profile_image_url),
          items(title)
        `)
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // Generic query function
  async query(sql, params = []) {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sql,
      params: params
    });
    
    if (error) throw error;
    return data;
  }
};

module.exports = {
  supabase,
  supabaseAdmin,
  db
};
