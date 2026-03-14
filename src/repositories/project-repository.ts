import { generateOrderKeyBetween, generateInitialOrderKey } from '../domain/order-key';
import type { Project } from '../domain/types';
import { toProject } from './mappers';
import type { DbExecutor } from './repository-types';

export class ProjectRepository {
  constructor(private readonly db: DbExecutor) {}

  async list(input?: { includeArchived?: boolean }): Promise<Project[]> {
    let query = this.db
      .selectFrom('projects')
      .selectAll()
      .where('deleted_at', 'is', null)
      .orderBy('order_key', 'asc');

    if (!input?.includeArchived) {
      query = query.where('status', '!=', 'archived');
    }

    const rows = await query.execute();
    return rows.map(toProject);
  }

  async get(projectId: string): Promise<Project | undefined> {
    const row = await this.db
      .selectFrom('projects')
      .selectAll()
      .where('id', '=', projectId)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    return row ? toProject(row) : undefined;
  }

  async getBySlug(slug: string): Promise<Project | undefined> {
    const row = await this.db
      .selectFrom('projects')
      .selectAll()
      .where('slug', '=', slug)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    return row ? toProject(row) : undefined;
  }

  async nextOrderKey(): Promise<string> {
    const last = await this.db
      .selectFrom('projects')
      .select(['order_key'])
      .where('deleted_at', 'is', null)
      .orderBy('order_key', 'desc')
      .executeTakeFirst();

    return last ? generateOrderKeyBetween(last.order_key, undefined) : generateInitialOrderKey();
  }

  async insert(project: Project): Promise<void> {
    await this.db
      .insertInto('projects')
      .values({
        id: project.id,
        slug: project.slug,
        title: project.title,
        description_md: project.descriptionMd,
        status: project.status,
        color_token: project.colorToken ?? null,
        icon: project.icon ?? null,
        order_key: project.orderKey,
        created_at: project.createdAt,
        updated_at: project.updatedAt,
        archived_at: project.archivedAt ?? null,
        deleted_at: project.deletedAt ?? null
      })
      .execute();
  }

  async update(project: Project): Promise<void> {
    await this.db
      .updateTable('projects')
      .set({
        slug: project.slug,
        title: project.title,
        description_md: project.descriptionMd,
        status: project.status,
        color_token: project.colorToken ?? null,
        icon: project.icon ?? null,
        order_key: project.orderKey,
        updated_at: project.updatedAt,
        archived_at: project.archivedAt ?? null,
        deleted_at: project.deletedAt ?? null
      })
      .where('id', '=', project.id)
      .execute();
  }
}
