import { AbilityBuilder, createMongoAbility } from '@casl/ability';

export type UserRole =
  | 'ANONYMOUS'
  | 'USER'
  | 'CREATOR'
  | 'MODERATOR'
  | 'ADMIN'
  | 'SUPERADMIN';

interface UserSession {
  id: string;
  role: UserRole;
}

// Define role hierarchy order (higher index = higher privileges)
const ROLES_HIERARCHY: UserRole[] = [
  'ANONYMOUS',
  'USER',
  'CREATOR',
  'MODERATOR',
  'ADMIN',
  'SUPERADMIN',
];

export function defineAbilityFor(user: UserSession) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);
  
  // Helper to check if user's role meets or exceeds a target tier
  const hasRole = (targetRole: UserRole) => {
    return ROLES_HIERARCHY.indexOf(user.role) >= ROLES_HIERARCHY.indexOf(targetRole);
  };

  // 1. ANONYMOUS permissions (Everyone gets this)
  can('read', 'Video');
  can('read', 'Comment');

  // 2. USER permissions
  if (hasRole('USER')) {
    can('create', 'Comment');
    can('manage', 'Comment', { commentedBy: user.id }); // Fixed: authorId -> commentedBy

    // Likes & Follows management for standard users
    can('create', 'Like');
    can('manage', 'Like', { userLiked: user.id });
    
    can('create', 'Follow');
    can('manage', 'Follow', { follower: user.id });
  }

  // 3. CREATOR permissions
  if (hasRole('CREATOR')) {
    can('create', 'Video');
    can('manage', 'Video', { owner: user.id }); 
  }

  // 4. MODERATOR permissions
  if (hasRole('MODERATOR')) {
    can('read', 'Reports');
    can('delete', 'Comment');
    can('update', 'Video', { status: 'flagged' }); 
  }

  // 5. ADMIN permissions
  if (hasRole('ADMIN')) {
    can('manage', 'Video');
    can('manage', 'User');
    cannot('manage', 'Billing'); // Explicitly block Admin from billing
  }

  // 6. SUPERADMIN permissions
  if (hasRole('SUPERADMIN')) {
    can('manage', 'all');
  }

  return build();
}