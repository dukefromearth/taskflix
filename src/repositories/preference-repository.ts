import { ulid } from 'ulid';
import type { UserPreference } from '../domain/types';
import { toUserPreference } from './mappers';
import type { DbExecutor } from './repository-types';

export class PreferenceRepository {
  constructor(private readonly db: DbExecutor) {}

  async getOrCreateDefault(timezone: string): Promise<UserPreference> {
    const existing = await this.db.selectFrom('user_preferences').selectAll().limit(1).executeTakeFirst();
    if (existing) return toUserPreference(existing);

    const now = Date.now();
    await this.db
      .insertInto('user_preferences')
      .values({
        id: ulid(),
        timezone,
        theme: 'system',
        density: 'comfortable',
        week_starts_on: 1,
        default_project_id: null,
        today_shows_done: 0,
        reduce_motion: 0,
        created_at: now,
        updated_at: now
      })
      .execute();

    const created = await this.db.selectFrom('user_preferences').selectAll().limit(1).executeTakeFirstOrThrow();
    return toUserPreference(created);
  }
}
