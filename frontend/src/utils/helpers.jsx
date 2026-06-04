export const formatPrice = (price) => {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price?.toLocaleString('en-IN')}`;
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const truncate = (str, len = 100) => {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
};

export const PROPERTY_TYPES = ['House', 'Apartment', 'Land', 'Commercial', 'Villa', 'Studio'];
export const LISTING_TYPES = ['Sale', 'Rent'];
export const FURNISHING_TYPES = ['Furnished', 'Semi-Furnished', 'Unfurnished'];
export const AMENITIES_LIST = ['Gym', 'Pool', 'Garden', 'Security', 'Lift', 'Power Backup', 'Club House', 'Children Play Area', 'Intercom', 'Rain Water Harvesting', 'Parking'];

export const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Ahmedabad', 'Kolkata', 'Gurugram', 'Noida', 'Nashik', 'Jaipur', 'Surat', 'Lucknow'];

export const STATES_OF_INDIA = [
  'Andhra Pradesh', 'Delhi', 'Gujarat', 'Haryana', 'Karnataka', 
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan',
  'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
];

export const getPropertyIcon = (type) => {
  const icons = { House: '🏠', Apartment: '🏢', Land: '🌿', Commercial: '🏪', Villa: '🏰', Studio: '🏗️' };
  return icons[type] || '🏠';
};

export const getRoleColor = (role) => {
  const colors = { ADMIN: '#8b5cf6', AGENT: '#3b82f6', OWNER: '#f59e0b', BUYER: '#10b981', SUPPORT: '#6b7280' };
  return colors[role] || '#6b7280';
};
