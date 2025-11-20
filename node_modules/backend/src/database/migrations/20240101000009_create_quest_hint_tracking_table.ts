import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('quest_hint_tracking', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable();
    table.uuid('quest_id').notNullable();
    table.integer('incorrect_attempts').defaultTo(0);
    table.integer('hints_shown').defaultTo(0);
    table.jsonb('shown_hint_indices').defaultTo('[]');
    table.timestamp('last_attempt_at').defaultTo(knex.fn.now());
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Foreign keys
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('quest_id').references('id').inTable('quests').onDelete('CASCADE');

    // Unique constraint: one tracking record per user per quest
    table.unique(['user_id', 'quest_id']);

    // Indexes
    table.index('user_id');
    table.index('quest_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('quest_hint_tracking');
}
