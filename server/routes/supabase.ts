import { RequestHandler } from "express";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://ouyhlzbaexjkttoyymii.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91eWhsemJhZXhqa3R0b3l5bWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1OTg0ODksImV4cCI6MjA2NTE3NDQ4OX0.VXs_4nBM8lvsseakuNtwfEarVNQrLmSyaKkPqi2gfk8";

const supabase = createClient(supabaseUrl, supabaseKey);

// Get all TV channels
export const getChannels: RequestHandler = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tv_channels')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
};

// Get all live TV streams
export const getLiveTV: RequestHandler = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('live_tv')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching live TV:', error);
    res.status(500).json({ error: 'Failed to fetch live TV streams' });
  }
};

// Get all radio stations
export const getRadio: RequestHandler = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('radio')
      .select('*')
      .order('title');
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching radio stations:', error);
    res.status(500).json({ error: 'Failed to fetch radio stations' });
  }
};

// Get all updates
export const getUpdates: RequestHandler = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('updates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching updates:', error);
    res.status(500).json({ error: 'Failed to fetch updates' });
  }
};

// Create a new update (for future admin functionality)
export const createUpdate: RequestHandler = async (req, res) => {
  try {
    const { title, message } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }
    
    const { data, error } = await supabase
      .from('updates')
      .insert([{ title, message }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating update:', error);
    res.status(500).json({ error: 'Failed to create update' });
  }
};
