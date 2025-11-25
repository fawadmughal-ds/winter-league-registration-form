import { pgTable, text, timestamp, varchar, boolean, integer } from 'drizzle-orm/pg-core';

export const registrations = pgTable('registrations', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  rollNumber: varchar('roll_number', { length: 50 }).notNull(),
  department: varchar('department', { length: 100 }).notNull(),
  semester: varchar('semester', { length: 20 }).notNull(),
  contactNumber: varchar('contact_number', { length: 20 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  sport: varchar('sport', { length: 100 }).notNull(),
  esportsSubcategory: varchar('esports_subcategory', { length: 100 }),
  paymentMethod: varchar('payment_method', { length: 20 }).notNull(), // 'cash' or 'online'
  slipId: varchar('slip_id', { length: 50 }),
  transactionId: varchar('transaction_id', { length: 255 }),
  screenshotUrl: text('screenshot_url'),
  status: varchar('status', { length: 50 }).notNull().default('pending_cash'), // 'pending_cash', 'pending_online', 'paid', 'rejected'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const esportsSettings = pgTable('esports_settings', {
  id: text('id').primaryKey().default('1'),
  isOpen: boolean('is_open').default(true).notNull(),
  openDate: timestamp('open_date'),
  closeDate: timestamp('close_date'),
  announcement: text('announcement'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const adminSessions = pgTable('admin_sessions', {
  id: text('id').primaryKey(),
  sessionToken: text('session_token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Registration = typeof registrations.$inferSelect;
export type NewRegistration = typeof registrations.$inferInsert;
export type EsportsSettings = typeof esportsSettings.$inferSelect;

