export interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  qualifications?: VolunteerQualification;
  volunteerData?: VolunteerData;
}

export interface VolunteerQualification {
  hasFirstAid: boolean;
  hasTransportation: boolean;
  hasDisasterExperience: boolean;
  canProvideFood: boolean;
  canProvideAccommodation: boolean;
}

export interface VolunteerData {
  isVolunteer: boolean;
  examPassed: boolean;
  examScore?: number;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  phoneNumber: string;
  skills?: string;
  availability?: string;
  dateRegistered: string;
  isAvailable: boolean;
}

export interface DisasterReport {
  id: string;
  userId: string;
  type: 'flood' | 'earthquake' | 'cyclone' | 'fire' | 'landslide' | 'tsunami';
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  status: 'active' | 'resolved';
}

export interface Resource {
  id: string;
  userId: string;
  type: 'food' | 'shelter' | 'medicine' | 'clothing' | 'water' | 'transportation';
  title: string;
  description: string;
  location: string;
  available: boolean;
  contact: string;
  timestamp: string;
}

export interface SafetyStatus {
  userId: string;
  status: 'safe' | 'need-help' | 'unknown';
  location: string;
  timestamp: string;
  message?: string;
}

// User Management
export const saveUser = (user: User): void => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem('cdm_users', JSON.stringify(users));
};

export const getUsers = (): User[] => {
  const users = localStorage.getItem('cdm_users');
  return users ? JSON.parse(users) : [];
};

export const authenticateUser = (email: string, password: string): User | null => {
  const users = getUsers();
  return users.find(user => user.email === email && user.password === password) || null;
};

export const updateUserQualifications = (userId: string, qualifications: VolunteerQualification): void => {
  const users = getUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex !== -1) {
    users[userIndex].qualifications = qualifications;
    localStorage.setItem('cdm_users', JSON.stringify(users));
  }
};

// Current User Session
export const setCurrentUser = (user: User): void => {
  localStorage.setItem('cdm_current_user', JSON.stringify(user));
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem('cdm_current_user');
  return user ? JSON.parse(user) : null;
};

export const logout = (): void => {
  localStorage.removeItem('cdm_current_user');
};

// Disaster Reports
export const saveDisasterReport = (report: DisasterReport): void => {
  const reports = getDisasterReports();
  reports.push(report);
  localStorage.setItem('cdm_disaster_reports', JSON.stringify(reports));
};

export const getDisasterReports = (): DisasterReport[] => {
  const reports = localStorage.getItem('cdm_disaster_reports');
  return reports ? JSON.parse(reports) : [];
};

// Resources
export const saveResource = (resource: Resource): void => {
  const resources = getResources();
  resources.push(resource);
  localStorage.setItem('cdm_resources', JSON.stringify(resources));
};

export const getResources = (): Resource[] => {
  const resources = localStorage.getItem('cdm_resources');
  return resources ? JSON.parse(resources) : [];
};

// Safety Status
export const updateSafetyStatus = (status: SafetyStatus): void => {
  const statuses = getSafetyStatuses();
  const existingIndex = statuses.findIndex(s => s.userId === status.userId);
  
  if (existingIndex !== -1) {
    statuses[existingIndex] = status;
  } else {
    statuses.push(status);
  }
  
  localStorage.setItem('cdm_safety_statuses', JSON.stringify(statuses));
};

export const getSafetyStatuses = (): SafetyStatus[] => {
  const statuses = localStorage.getItem('cdm_safety_statuses');
  return statuses ? JSON.parse(statuses) : [];
};

export const getUserSafetyStatus = (userId: string): SafetyStatus | null => {
  const statuses = getSafetyStatuses();
  return statuses.find(status => status.userId === userId) || null;
};

// Emergency Messages
export interface EmergencyMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  type: 'help' | 'info' | 'alert';
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  notifiedVolunteers?: string[];
}

export const saveEmergencyMessage = (message: EmergencyMessage): void => {
  const messages = getEmergencyMessages();
  messages.push(message);
  localStorage.setItem('cdm_emergency_messages', JSON.stringify(messages));
  
  // If it's a help request, notify nearby volunteers
  if (message.type === 'help' && message.location) {
    notifyNearbyVolunteers(message);
  }
};

export const getEmergencyMessages = (): EmergencyMessage[] => {
  const messages = localStorage.getItem('cdm_emergency_messages');
  return messages ? JSON.parse(messages) : [];
};

// Volunteer Management
export const updateUserVolunteerData = (userId: string, volunteerData: VolunteerData): void => {
  const users = getUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex !== -1) {
    users[userIndex].volunteerData = volunteerData;
    localStorage.setItem('cdm_users', JSON.stringify(users));
  }
};

export const getQualifiedVolunteers = (): User[] => {
  const users = getUsers();
  return users.filter(user => 
    user.volunteerData?.isVolunteer && 
    user.volunteerData?.examPassed &&
    user.volunteerData?.isAvailable
  );
};

export const getVolunteerById = (volunteerId: string): User | null => {
  const users = getUsers();
  return users.find(user => user.id === volunteerId) || null;
};

// Calculate distance between two coordinates
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Notify volunteers within 10km radius
const notifyNearbyVolunteers = (message: EmergencyMessage): void => {
  if (!message.location) return;
  
  const volunteers = getQualifiedVolunteers();
  const nearbyVolunteers = volunteers.filter(volunteer => {
    if (!volunteer.volunteerData?.location) return false;
    
    const distance = calculateDistance(
      message.location!.lat,
      message.location!.lng,
      volunteer.volunteerData.location.lat,
      volunteer.volunteerData.location.lng
    );
    
    return distance <= 10; // Within 10km
  });
  
  // In a real app, this would send SMS. For demo, we'll log it
  nearbyVolunteers.forEach(volunteer => {
    console.log(`SMS would be sent to ${volunteer.volunteerData?.phoneNumber}: Emergency at ${message.location?.address} - "${message.message}"`);
    
    // Store notification record
    const notifications = getVolunteerNotifications();
    notifications.push({
      id: Date.now().toString() + volunteer.id,
      volunteerId: volunteer.id,
      messageId: message.id,
      timestamp: new Date().toISOString(),
      sent: true
    });
    localStorage.setItem('cdm_volunteer_notifications', JSON.stringify(notifications));
  });
  
  // Update message with notified volunteers
  message.notifiedVolunteers = nearbyVolunteers.map(v => v.id);
};

export interface VolunteerNotification {
  id: string;
  volunteerId: string;
  messageId: string;
  timestamp: string;
  sent: boolean;
}

export const getVolunteerNotifications = (): VolunteerNotification[] => {
  const notifications = localStorage.getItem('cdm_volunteer_notifications');
  return notifications ? JSON.parse(notifications) : [];
};