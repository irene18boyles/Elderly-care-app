export const checkPermissions = () => {
  // Force a fresh read of permissions from localStorage each time
  const isContributor = localStorage.getItem('isContributor') === 'true';
  const isViewOnly = localStorage.getItem('isViewOnly') === 'true';
  const userRole = localStorage.getItem('userRole');
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  // Admin has all permissions
  if (userRole === 'admin' || userInfo.role === 'admin') {
    return {
      canEdit: true,
      canAdd: true,
      canDelete: true,
      canView: true
    };
  }

  // For family members, action permissions depend on contributor status
  if (userRole === 'family') {
    if (isContributor && !isViewOnly) {
      return {
        canEdit: true,
        canAdd: true,
        canDelete: true,
        canView: true
      };
    } else if (isViewOnly) {
      return {
        canEdit: false,
        canAdd: false,
        canDelete: false,
        canView: true
      };
    } else {
      return {
        canEdit: false,
        canAdd: false,
        canDelete: false,
        canView: true
      };
    }
  }

  // For caregivers, they need to be contributors to see most features
  if (userRole === 'caregiver') {
    if (isContributor && !isViewOnly) {
      return {
        canEdit: true,
        canAdd: true,
        canDelete: true,
        canView: true
      };
    } else {
      return {
        canEdit: false,
        canAdd: false,
        canDelete: false,
        canView: true
      };
    }
  }

  // Default permissions
  return {
    canEdit: false,
    canAdd: false,
    canDelete: false,
    canView: true
  };
};

// Add a function to force permission refresh
export const refreshPermissions = () => {
  const event = new CustomEvent('permissionsChanged', {
    detail: { timestamp: Date.now() }
  });
  window.dispatchEvent(event);
}; 