/**
 * PropFinder — role permissions (industry-style real estate platform)
 *
 * BUYER   → search, save, inquire, visit, pay (seeker / tenant journey)
 * OWNER   → list property + same seeker tools (many owners also rent/buy elsewhere)
 * AGENT   → professional: listings + leads + visits (no personal buyer dashboard)
 * ADMIN   → platform moderation + all listings (no personal shopping)
 * SUPPORT → customer support tickets only
 */

export const ROLES = Object.freeze({
  BUYER: 'BUYER',
  OWNER: 'OWNER',
  AGENT: 'AGENT',
  ADMIN: 'ADMIN',
  SUPPORT: 'SUPPORT',
});

export const ROLE_META = {
  BUYER: {
    icon: '🛒',
    color: '#10b981',
    label: 'Buyer / Tenant',
    tagline: 'Find & rent or buy properties',
  },
  OWNER: {
    icon: '🏠',
    color: '#f59e0b',
    label: 'Property Owner',
    tagline: 'List properties & manage leads',
  },
  AGENT: {
    icon: '🤝',
    color: '#3b82f6',
    label: 'Real Estate Agent',
    tagline: 'Broker dashboard — listings & clients',
  },
  ADMIN: {
    icon: '👑',
    color: '#8b5cf6',
    label: 'Platform Admin',
    tagline: 'Approve listings & manage users',
  },
  SUPPORT: {
    icon: '🎫',
    color: '#6b7280',
    label: 'Support Staff',
    tagline: 'Help desk & ticket resolution',
  },
};

/** Single source of truth for what each role can do */
export function getPermissions(role) {
  const r = role || ROLES.BUYER;
  const isBuyer = r === ROLES.BUYER;
  const isOwner = r === ROLES.OWNER;
  const isAgent = r === ROLES.AGENT;
  const isAdmin = r === ROLES.ADMIN;
  const isSupport = r === ROLES.SUPPORT;

  const canUseBuyerJourney = isBuyer || isOwner;
  const canListProperty = isOwner || isAgent || isAdmin;
  const canManageLeads = isOwner || isAgent || isAdmin;

  return {
    role: r,
    isBuyer,
    isOwner,
    isAgent,
    isAdmin,
    isSupport,
    canUseBuyerJourney,
    canListProperty,
    canManageLeads,
    canManageListings: canListProperty,
    canSaveFavorites: canUseBuyerJourney,
    canSendInquiries: canUseBuyerJourney,
    canScheduleVisits: canUseBuyerJourney,
    canMakePayments: canUseBuyerJourney,
    canReceiveInquiries: canManageLeads,
    canManageVisitRequests: canManageLeads,
    canAccessAdmin: isAdmin,
    canManageSupport: isAdmin || isSupport,
  };
}

/** Dashboard sidebar — grouped like MagicBricks / 99acres portals */
export function getDashboardNav(perms) {
  const common = [
    { to: '/dashboard', label: '📊 Overview', exact: true },
    { to: '/dashboard/profile', label: '👤 My Profile' },
  ];

  if (perms.isSupport) {
    return [
      ...common,
      { section: 'Customer Support' },
      { to: '/dashboard/support', label: '🎫 All Support Tickets' },
    ];
  }

  if (perms.isAdmin) {
    return [
      ...common,
      { section: 'Platform Management' },
      { to: '/dashboard/my-properties', label: '🏘️ All Listings' },
      { to: '/dashboard/list-property', label: '➕ List Property' },
      { to: '/dashboard/owner-inquiries', label: '💬 All Inquiries' },
      { to: '/dashboard/owner-visits', label: '📋 All Visit Requests' },
      { section: 'Support' },
      { to: '/dashboard/support', label: '🎫 Support Tickets' },
      { section: 'Administration' },
      { to: '/admin', label: '⚙️ Admin Panel', adminLink: true },
    ];
  }

  if (perms.isAgent) {
    return [
      ...common,
      { section: 'Agent Workspace' },
      { to: '/dashboard/my-properties', label: '🏘️ My Listings' },
      { to: '/dashboard/list-property', label: '➕ List Property' },
      { to: '/dashboard/owner-inquiries', label: '💬 Client Inquiries' },
      { to: '/dashboard/owner-visits', label: '📋 Visit Requests' },
      { section: 'Help' },
      { to: '/dashboard/support', label: '🎫 Support Tickets' },
    ];
  }

  if (perms.isOwner) {
    return [
      ...common,
      { section: 'Property Search' },
      { to: '/dashboard/favorites', label: '❤️ Saved Properties' },
      { to: '/dashboard/inquiries', label: '💬 My Inquiries' },
      { to: '/dashboard/visits', label: '📅 My Visits' },
      { to: '/dashboard/payments', label: '💳 Payments' },
      { section: 'My Listings' },
      { to: '/dashboard/my-properties', label: '🏘️ My Properties' },
      { to: '/dashboard/list-property', label: '➕ List Property' },
      { to: '/dashboard/owner-inquiries', label: '💬 Received Inquiries' },
      { to: '/dashboard/owner-visits', label: '📋 Visit Requests' },
      { section: 'Help' },
      { to: '/dashboard/support', label: '🎫 Support Tickets' },
    ];
  }

  // BUYER (default)
  return [
    ...common,
    { section: 'Property Search' },
    { to: '/dashboard/favorites', label: '❤️ Saved Properties' },
    { to: '/dashboard/inquiries', label: '💬 My Inquiries' },
    { to: '/dashboard/visits', label: '📅 My Visits' },
    { to: '/dashboard/payments', label: '💳 Payments' },
    { section: 'Help' },
    { to: '/dashboard/support', label: '🎫 Support Tickets' },
  ];
}

/** Navbar user dropdown */
export function getNavbarMenu(perms) {
  const items = [
    { to: '/dashboard', label: '⊞  Dashboard' },
    { to: '/dashboard/profile', label: '○  My Profile' },
  ];

  if (perms.canUseBuyerJourney) {
    items.push(
      { divider: true },
      { to: '/dashboard/favorites', label: '♡  Saved Properties' },
      { to: '/dashboard/inquiries', label: '◈  My Inquiries' },
      { to: '/dashboard/visits', label: '⊡  My Visits' },
    );
  }

  if (perms.canManageLeads) {
    items.push(
      { divider: true },
      { to: '/dashboard/my-properties', label: '⊟  My Listings' },
      { to: '/dashboard/list-property', label: '+  List Property' },
      { to: '/dashboard/owner-inquiries', label: '◈  Received Inquiries' },
      { to: '/dashboard/owner-visits', label: '⊡  Visit Requests' },
    );
  }

  if (perms.canManageSupport) {
    items.push(
      { divider: true },
      { to: '/dashboard/support', label: '⊙  Support Desk' },
    );
  } else if (perms.canUseBuyerJourney || perms.isAgent) {
    items.push(
      { divider: true },
      { to: '/dashboard/support', label: '⊙  Support' },
    );
  }

  if (perms.canAccessAdmin) {
    items.push(
      { divider: true },
      { to: '/admin', label: '⚙  Admin Panel', adminLink: true },
    );
  }

  return items;
}
