import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('quests', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('chapter_id').notNullable().references('id').inTable('chapters').onDelete('CASCADE');
    table.string('title', 255).notNullable();
    table.text('narrative').notNullable();
    table.text('objective').notNullable();
    table.jsonb('hints').notNullable().defaultTo('[]');
    table.integer('xp_reward').notNullable().defaultTo(0);
    table.integer('order').notNullable();
    table.jsonb('validation_criteria').notNullable();
    table.jsonb('initial_repository_state').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('chapter_id');
    table.index(['chapter_id', 'order']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('quests');
}
