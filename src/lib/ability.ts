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

export function defineAbilityFor(user: UserSession) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  can('read', 'Content');

  if (user.role === 'ANONYMOUS') return build();

  can('create', 'Comment');
  can('manage', 'Comment', { authorId: user.id });

  if (user.role === 'USER') return build();

  can('create', 'Content');
  can('manage', 'Content', { authorId: user.id });

  if (user.role === 'CREATOR') return build();

  can('read', 'Reports');
  can('delete', 'Comment');
  can('update', 'Content', { status: 'flagged' });

  if (user.role === 'MODERATOR') return build();

  can('manage', 'Content');
  can('manage', 'User');
  cannot('manage', 'Billing');

  if (user.role === 'ADMIN') return build();

  if (user.role === 'SUPERADMIN') {
    can('manage', 'all');
  }

  return build();
}