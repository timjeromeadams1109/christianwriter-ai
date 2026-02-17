import { pgTable, text, timestamp, uuid, json, pgEnum, boolean, integer, primaryKey } from 'drizzle-orm/pg-core';

// Enums
export const contentTypeEnum = pgEnum('content_type', ['devotional', 'sermon', 'social']);
export const contentStatusEnum = pgEnum('content_status', ['draft', 'generated', 'expanded', 'published']);
export const socialPlatformEnum = pgEnum('social_platform', ['twitter', 'facebook', 'instagram', 'linkedin']);
export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'pro', 'ministry']);

// Users table - compatible with NextAuth Drizzle adapter
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  hashedPassword: text('hashed_password'),
  preferredBibleVersion: text('preferred_bible_version').default('NIV'),
  // Stripe subscription fields
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  subscriptionTier: subscriptionTierEnum('subscription_tier').default('free').notNull(),
  subscriptionStatus: text('subscription_status'), // 'active', 'canceled', 'past_due', etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Auth accounts table (for OAuth providers) - compatible with NextAuth Drizzle adapter
export const accounts = pgTable('accounts', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (account) => [
  primaryKey({ columns: [account.provider, account.providerAccountId] }),
]);

// Sessions table - compatible with NextAuth Drizzle adapter
export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

// Verification tokens table - compatible with NextAuth Drizzle adapter
export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (vt) => [
  primaryKey({ columns: [vt.identifier, vt.token] }),
]);

// Author voice profiles
export const authorVoiceProfiles = pgTable('author_voice_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  sampleText: text('sample_text'),
  voiceCharacteristics: json('voice_characteristics').$type<{
    tone: string[];
    style: string[];
    vocabulary: string[];
    sentenceStructure: string;
    rhetoricalDevices: string[];
    summary: string;
  }>(),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Content table
export const content = pgTable('content', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: contentTypeEnum('type').notNull(),
  status: contentStatusEnum('status').default('draft').notNull(),
  title: text('title').notNull(),
  inputParams: json('input_params').$type<{
    topic?: string;
    scripture?: string;
    bibleVersion?: string;
    tone?: string;
    audience?: string;
    style?: string;
    platform?: string;
    length?: string;
    additionalInstructions?: string;
  }>(),
  outline: json('outline').$type<{
    sections: Array<{
      title: string;
      content: string;
      scripture?: string;
    }>;
  }>(),
  generatedContent: text('generated_content'),
  expandedContent: text('expanded_content'),
  scriptureReferences: json('scripture_references').$type<Array<{
    reference: string;
    text: string;
    version: string;
  }>>(),
  authorVoiceId: uuid('author_voice_id').references(() => authorVoiceProfiles.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Scripture bookmarks
export const scriptureBookmarks = pgTable('scripture_bookmarks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  reference: text('reference').notNull(),
  text: text('text').notNull(),
  version: text('version').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AuthorVoiceProfile = typeof authorVoiceProfiles.$inferSelect;
export type NewAuthorVoiceProfile = typeof authorVoiceProfiles.$inferInsert;
export type Content = typeof content.$inferSelect;
export type NewContent = typeof content.$inferInsert;
export type ScriptureBookmark = typeof scriptureBookmarks.$inferSelect;
