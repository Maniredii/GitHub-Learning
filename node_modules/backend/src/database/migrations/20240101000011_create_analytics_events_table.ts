import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('analytics_events', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('event_type', 50).notNullable(); // 'quest_start', 'quest_complete', 'quest_fail', 'command_execute', 'hint_used'
    table.string('quest_id', 100);
    table.jsonb('metadata').defaultTo('{}'); // Store command type, success/failure, error messages, etc.
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.index('user_id');
    table.index('event_type');
    table.index('quest_id');
    table.index('created_at');
    table.index(['user_id', 'event_type']);
    table.index(['quest_id', 'event_type']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('analytics_events');
}
