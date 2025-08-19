import { randomUUID } from 'crypto';
import { scanRepository } from '../services/repositoryScanner.js';

export async function projectRoutes(fastify) {
  // Get all projects
  fastify.get('/projects', async (request, reply) => {
    try {
      const projects = fastify.db.prepare(`
        SELECT * FROM projects ORDER BY updated_at DESC
      `).all();

      return { projects };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Failed to fetch projects' });
    }
  });

  // Get project by ID
  fastify.get('/projects/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      
      const project = fastify.db.prepare(`
        SELECT * FROM projects WHERE id = ?
      `).get(id);

      if (!project) {
        return reply.code(404).send({ error: 'Project not found' });
      }

      return { project };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Failed to fetch project' });
    }
  });

  // Create/scan new project
  fastify.post('/projects/scan', async (request, reply) => {
    try {
      const { path, name, description } = request.body;

      if (!path || !name) {
        return reply.code(400).send({ error: 'Path and name are required' });
      }

      const projectId = randomUUID();
      
      // Insert project
      const insertProject = fastify.db.prepare(`
        INSERT INTO projects (id, name, path, description)
        VALUES (?, ?, ?, ?)
      `);

      insertProject.run(projectId, name, path, description || '');

      // Scan repository in background
      scanRepository(fastify.db, projectId, path)
        .then(() => {
          fastify.log.info(`Repository scan completed for project ${projectId}`);
        })
        .catch((error) => {
          fastify.log.error(`Repository scan failed for project ${projectId}:`, error);
        });

      return { 
        projectId, 
        message: 'Project created and scanning started',
        status: 'scanning'
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Failed to create project' });
    }
  });

  // Delete project
  fastify.delete('/projects/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      
      const deleteProject = fastify.db.prepare(`
        DELETE FROM projects WHERE id = ?
      `);

      const result = deleteProject.run(id);

      if (result.changes === 0) {
        return reply.code(404).send({ error: 'Project not found' });
      }

      return { message: 'Project deleted successfully' };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Failed to delete project' });
    }
  });
}