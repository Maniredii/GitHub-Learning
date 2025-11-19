import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('quest_completions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('quest_id', 100).notNullable();
    table.timestamp('completed_at').defaultTo(knex.fn.now());
    table.integer('xp_earned').notNullable().defaultTo(0);
    
    table.unique(['user_id', 'quest_id']);
    table.index('user_id');
    table.index('quest_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('quest_completions');
}
