import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('quest_sessions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('quest_id', 100).notNullable();
    table.timestamp('started_at').defaultTo(knex.fn.now());
    table.timestamp('ended_at');
    table.integer('time_spent_seconds'); // Calculated when ended_at is set
    table.boolean('completed').defaultTo(false);
    
    table.index('user_id');
    table.index('quest_id');
    table.index('started_at');
    table.index(['user_id', 'quest_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('quest_sessions');
}
