import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('achievements', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 100).notNullable().unique();
    table.text('description').notNullable();
    table.string('badge_icon', 255).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.index('name');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('achievements');
}
