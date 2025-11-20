import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Delete existing achievements
  await knex('user_achievements').del();
  await knex('achievements').del();

  // Insert achievement definitions
  await knex('achievements').insert([
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'First Blood',
      description: 'Create your first commit and seal your first moment in time',
      badge_icon: '🩸',
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Branch Master',
      description: 'Successfully merge your first branch and unite parallel timelines',
      badge_icon: '🌿',
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Conflict Resolver',
      description: 'Resolve your first merge conflict and restore harmony to the codebase',
      badge_icon: '⚔️',
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Collaborator',
      description: 'Submit your first pull request and join the Council of Coders',
      badge_icon: '🤝',
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Time Lord',
      description: 'Master the art of rebase and rewrite history itself',
      badge_icon: '⏰',
    },
  ]);
}
