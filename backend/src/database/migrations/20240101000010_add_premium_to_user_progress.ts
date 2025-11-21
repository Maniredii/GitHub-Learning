import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('user_progress', (table) => {
    table.boolean('is_premium').notNullable().defaultTo(false);
    table.timestamp('premium_expires_at').nullable();
    table.string('subscription_type', 50).nullable(); // 'one_time' or 'monthly'
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('user_progress', (table) => {
    table.dropColumn('is_premium');
    table.dropColumn('premium_expires_at');
    table.dropColumn('subscription_type');
  });
}
