import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('chapters', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title', 255).notNullable();
    table.text('description').notNullable();
    table.string('theme_region', 255).notNullable();
    table.integer('order').notNullable();
    table.boolean('is_premium').notNullable().defaultTo(false);
    table.jsonb('unlock_requirements').notNullable().defaultTo('{}');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.unique('order');
    table.index('order');
    table.index('is_premium');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('chapters');
}
